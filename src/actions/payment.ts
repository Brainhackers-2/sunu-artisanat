"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAuthWithRole } from "@/lib/permissions";
import { PaymentStatus, SubOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Traiter et valider un paiement (Mode Simulation ou retour Passerelle)
 */
export async function confirmPaymentAction(orderId: string, transactionRef?: string) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId },
      include: {
        order: {
          include: {
            subOrders: {
              include: {
                items: {
                  include: { product: true },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Paiement introuvable pour cette commande" };
    }

    if (payment.status === PaymentStatus.PAID) {
      return { success: true, message: "Ce paiement est déjà validé" };
    }

    // Mise à jour atomique : Payment -> PAID, SubOrders -> PAID, Stock réservé -> libéré définitivement
    await prisma.$transaction(async (tx) => {
      // 1. Marquer le paiement comme payé
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: payment.isSimulated ? PaymentStatus.SIMULATED : PaymentStatus.PAID,
          transactionRef: transactionRef ?? `SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        },
      });

      // 2. Mettre à jour toutes les sous-commandes à l'état PAID
      await tx.subOrder.updateMany({
        where: { orderId },
        data: {
          status: SubOrderStatus.PAID,
        },
      });

      // 3. Déduire définitivement les stocks réservés
      for (const sub of payment.order.subOrders) {
        for (const item of sub.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              reservedQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      // 4. Créer la facture provisoire plateforme
      const countInvoices = await tx.invoice.count();
      const invoiceNumber = `FACT-${new Date().getFullYear()}-${String(countInvoices + 1).padStart(5, "0")}`;

      await tx.invoice.create({
        data: {
          orderId,
          invoiceNumber,
          legalNote: "Émise par SUNU ARTISANAT. Mentions légales (NINEA, TVA) à confirmer avant usage commercial définitif.",
        },
      });

      // 5. Créer des notifications pour chaque artisan
      for (const sub of payment.order.subOrders) {
        const artisanUser = await tx.artisanProfile.findUnique({
          where: { id: sub.artisanProfileId },
          select: { userId: true, workshopName: true },
        });

        if (artisanUser) {
          await tx.notification.create({
            data: {
              userId: artisanUser.userId,
              type: "ORDER_PAID",
              title: "Nouvelle commande payée !",
              message: `La sous-commande ${sub.subOrderNumber} d'un montant de ${sub.artisanPartFCFA.toLocaleString("fr-FR")} FCFA a été réglée. Veuillez préparer le colis.`,
            },
          });
        }
      }
    });

    try {
      revalidatePath(`/suivi/${payment.order.trackingToken}`);
    } catch {
      // Ignorer si appelé hors du contexte de requête Next.js (ex: tests)
    }
    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur confirmPaymentAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la validation du paiement";
    return { success: false, error: msg };
  }
}

/**
 * Libérer le stock réservé à la demande si échec de paiement ou annulation
 * (Règle non négociable 5 : sans tâche planifiée)
 */
export async function cancelOrExpirePaymentAction(orderId: string) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { orderId, status: PaymentStatus.PENDING },
      include: {
        order: {
          include: {
            subOrders: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: "Paiement introuvable ou déjà traité" };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Passer le paiement en FAILED
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      // 2. Annuler les sous-commandes
      await tx.subOrder.updateMany({
        where: { orderId },
        data: { status: SubOrderStatus.CANCELLED },
      });

      // 3. Libérer le stock réservé et le remettre en disponible
      for (const sub of payment.order.subOrders) {
        for (const item of sub.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              quantity: { increment: item.quantity },
              reservedQuantity: { decrement: item.quantity },
            },
          });
        }
      }
    });

    try {
      revalidatePath(`/suivi/${payment.order.trackingToken}`);
    } catch {
      // Ignorer si appelé hors du contexte de requête Next.js (ex: tests)
    }
    return { success: true, message: "Stock libéré et commande annulée avec succès." };
  } catch (error: unknown) {
    console.error("Erreur cancelOrExpirePaymentAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de l'annulation";
    return { success: false, error: msg };
  }
}

/**
 * Enregistrer un reversement (Payout) à un artisan (Réservé Admin)
 */
export async function createArtisanPayoutAction(data: {
  artisanProfileId: string;
  amountFCFA: number;
  method: string;
  recipientPhone: string;
  reference?: string;
}) {
  try {
    await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

    if (data.amountFCFA <= 0) {
      return { success: false, error: "Le montant du reversement doit être supérieur à 0 FCFA" };
    }

    const payout = await prisma.payout.create({
      data: {
        artisanProfileId: data.artisanProfileId,
        amountFCFA: Math.round(data.amountFCFA),
        method: data.method,
        recipientPhone: data.recipientPhone,
        reference: data.reference ?? null,
        isCompleted: true,
        processedAt: new Date(),
      },
    });

    // Notifier l'artisan
    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: data.artisanProfileId },
      select: { userId: true },
    });

    if (artisan) {
      await prisma.notification.create({
        data: {
          userId: artisan.userId,
          type: "SYSTEM_ALERT",
          title: "Reversement effectué",
          message: `Un reversement de ${data.amountFCFA.toLocaleString("fr-FR")} FCFA via ${data.method} vient de vous être envoyé.`,
        },
      });
    }

    revalidatePath("/admin/reversements");
    return { success: true, payoutId: payout.id };
  } catch (error: unknown) {
    console.error("Erreur createArtisanPayoutAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la création du reversement";
    return { success: false, error: msg };
  }
}
