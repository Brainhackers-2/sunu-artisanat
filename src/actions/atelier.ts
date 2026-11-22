"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, assertArtisanAccess, requireAuthWithRole } from "@/lib/permissions";
import { ProductStatus, SubOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(3, "Titre obligatoire (au moins 3 caractères)"),
  description: z.string().min(10, "Description détaillée requise"),
  categoryId: z.string().min(1, "Catégorie requise"),
  priceFCFA: z.number().int().positive("Le prix doit être un entier positif en FCFA"),
  quantity: z.number().int().min(0, "Stock initial requis"),
  originRegion: z.string().min(2, "Région d'origine requise"),
  technique: z.string().min(2, "Technique artisanale requise"),
  materials: z.array(z.object({
    name: z.string().min(1),
    origin: z.string().optional(),
  })).min(1, "Au moins un matériau déclaré requis"),
  imageUrl: z.string().url("URL de photo principale requise"),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Créer un produit (Artisan) -> passe automatiquement en status: PENDING
 * (Règle non négociable 7 : validation admin obligatoire avant publication)
 */
export async function createArtisanProductAction(rawInput: ProductInput) {
  try {
    const user = await getSessionUser();
    if (!user || !user.artisanProfileId) {
      return { success: false, error: "Compte artisan requis" };
    }

    const parseRes = productSchema.safeParse(rawInput);
    if (!parseRes.success) {
      return { success: false, error: parseRes.error.issues[0]?.message ?? "Données invalides" };
    }

    const input = parseRes.data;
    const slugBase = input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: user.artisanProfileId },
    });

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          artisanProfileId: user.artisanProfileId!,
          categoryId: input.categoryId,
          title: input.title,
          slug,
          description: input.description,
          priceFCFA: input.priceFCFA,
          status: ProductStatus.PENDING, // Toujours PENDING en attente admin
          originRegion: input.originRegion,
          technique: input.technique,
          isDemo: artisan?.isDemo ?? false,
          images: {
            create: {
              url: input.imageUrl,
              isPrimary: true,
              altText: input.title,
            },
          },
          inventory: {
            create: {
              quantity: input.quantity,
              reservedQuantity: 0,
            },
          },
          materials: {
            createMany: {
              data: input.materials.map((m) => ({
                name: m.name,
                origin: m.origin ?? input.originRegion,
              })),
            },
          },
        },
      });

      // Notification admin pour la modération
      const admins = await tx.userRole.findMany({
        where: { role: "ADMIN" },
        select: { userId: true },
      });

      for (const adm of admins) {
        await tx.notification.create({
          data: {
            userId: adm.userId,
            type: "SYSTEM_ALERT",
            title: "Nouveau produit à valider",
            message: `L'artisan ${artisan?.workshopName} a soumis le produit "${input.title}".`,
          },
        });
      }

      return p;
    });

    try {
      revalidatePath("/atelier/produits");
      revalidatePath("/admin/produits");
    } catch {}

    return { success: true, productId: product.id };
  } catch (error: unknown) {
    console.error("Erreur createArtisanProductAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la création du produit";
    return { success: false, error: msg };
  }
}

/**
 * Mise à jour du stock d'un produit par l'artisan
 */
export async function updateArtisanStockAction(productId: string, newQuantity: number) {
  try {
    const user = await getSessionUser();
    if (!user || !user.artisanProfileId) {
      return { success: false, error: "Compte artisan requis" };
    }

    // Vérifier l'isolation stricte (Règle non négociable 2)
    await assertArtisanAccess(user.artisanProfileId);

    const product = await prisma.product.findFirst({
      where: { id: productId, artisanProfileId: user.artisanProfileId },
    });

    if (!product) {
      return { success: false, error: "Produit non trouvé ou non autorisé" };
    }

    if (newQuantity < 0) {
      return { success: false, error: "Le stock ne peut être négatif" };
    }

    await prisma.inventory.update({
      where: { productId },
      data: { quantity: newQuantity },
    });

    try {
      revalidatePath("/atelier/produits");
      revalidatePath(`/boutique/${product.slug}`);
    } catch {}

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur updateArtisanStockAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour du stock";
    return { success: false, error: msg };
  }
}

/**
 * Mettre à jour le statut d'une sous-commande propre à l'artisan
 * PENDING_PAYMENT -> PAID -> ACCEPTED -> IN_PREPARATION -> SHIPPED -> DELIVERED
 */
export async function updateSubOrderStatusAction(
  subOrderId: string,
  newStatus: SubOrderStatus,
  rejectionReason?: string
) {
  try {
    const user = await getSessionUser();
    if (!user || !user.artisanProfileId) {
      return { success: false, error: "Compte artisan requis" };
    }

    // Vérifier propriétaire de la sous-commande (Règle non négociable 2)
    const subOrder = await prisma.subOrder.findFirst({
      where: { id: subOrderId, artisanProfileId: user.artisanProfileId },
      include: { order: true, delivery: true },
    });

    if (!subOrder) {
      return { success: false, error: "Sous-commande introuvable ou accès refusé" };
    }

    // Règle 9 : Livraison sans compte livreur — pas de passage à "Expédiée" (SHIPPED)
    // sans livreur assigné pour une livraison à domicile
    if (newStatus === SubOrderStatus.SHIPPED) {
      if (subOrder.delivery?.deliveryType === "HOME" && !subOrder.delivery?.courierId) {
        return {
          success: false,
          error: "Impossible d'expédier : un livreur doit être assigné par l'administrateur.",
        };
      }
    }

    await prisma.subOrder.update({
      where: { id: subOrderId },
      data: {
        status: newStatus,
        rejectionReason: rejectionReason ?? subOrder.rejectionReason,
      },
    });

    try {
      revalidatePath("/atelier/commandes");
      revalidatePath(`/suivi/${subOrder.order.trackingToken}`);
    } catch {}

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur updateSubOrderStatusAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return { success: false, error: msg };
  }
}

/**
 * Modération Admin : Valider ou Refuser un produit
 * Règle 7 : Si refus, motif obligatoire.
 */
export async function moderateProductAction(
  productId: string,
  decision: "APPROVE" | "REJECT",
  rejectionReason?: string
) {
  try {
    await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

    if (decision === "REJECT" && (!rejectionReason || rejectionReason.trim().length < 5)) {
      return { success: false, error: "Un motif explicite est obligatoire pour refuser un produit" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { artisan: true },
    });

    if (!product) return { success: false, error: "Produit introuvable" };

    if (decision === "APPROVE") {
      // 1. Publier le produit
      await prisma.product.update({
        where: { id: productId },
        data: {
          status: ProductStatus.PUBLISHED,
          rejectionReason: null,
        },
      });

      // 2. Générer le QR Code de traçabilité officiel si inexistant
      const existingQr = await prisma.qRCode.findFirst({ where: { productId } });
      if (!existingQr) {
        const serial = `SN-ART-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await prisma.qRCode.create({
          data: {
            productId,
            serialNumber: serial,
            code,
            declaredOrigin: `Atelier ${product.artisan.workshopName}, ${product.originRegion}`,
            isActive: true,
          },
        });
      }

      // Notifier l'artisan
      await prisma.notification.create({
        data: {
          userId: product.artisan.userId,
          type: "PRODUCT_APPROVED",
          title: "Produit validé et publié !",
          message: `Votre création "${product.title}" est désormais visible sur la boutique avec son QR Code de traçabilité.`,
        },
      });
    } else {
      // Refus
      await prisma.product.update({
        where: { id: productId },
        data: {
          status: ProductStatus.REJECTED,
          rejectionReason,
        },
      });

      // Notifier l'artisan avec le motif
      await prisma.notification.create({
        data: {
          userId: product.artisan.userId,
          type: "PRODUCT_REJECTED",
          title: "Création à réviser",
          message: `Votre produit "${product.title}" a été refusé pour le motif suivant : ${rejectionReason}`,
        },
      });
    }

    try {
      revalidatePath("/admin/produits");
      revalidatePath("/boutique");
    } catch {}

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur moderateProductAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la modération";
    return { success: false, error: msg };
  }
}

/**
 * Gestion Admin des Livreurs (Annuaire tenu par l'admin - Règle 9)
 */
export async function createCourierAction(data: {
  name: string;
  phone: string;
  companyName?: string;
  coverageZone: string;
}) {
  try {
    await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

    const courier = await prisma.courier.create({
      data: {
        name: data.name,
        phone: data.phone,
        companyName: data.companyName ?? null,
        coverageZone: data.coverageZone,
        isActive: true,
      },
    });

    try {
      revalidatePath("/admin/livraisons");
    } catch {}

    return { success: true, courierId: courier.id };
  } catch (error: unknown) {
    console.error("Erreur createCourierAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de l'ajout du livreur";
    return { success: false, error: msg };
  }
}

/**
 * Assigner un livreur à une livraison
 */
export async function assignCourierToDeliveryAction(deliveryId: string, courierId: string) {
  try {
    await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { courierId },
    });

    try {
      revalidatePath("/admin/livraisons");
    } catch {}

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur assignCourierToDeliveryAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de l'assignation";
    return { success: false, error: msg };
  }
}

/**
 * Mise à jour du profil d'atelier par l'artisan (logoUrl, coverUrl, bio, etc.)
 */
export async function updateArtisanProfileAction(data: {
  workshopName: string;
  specialty: string;
  city: string;
  region: string;
  experienceYears: number;
  bio: string;
  logoUrl?: string;
  coverUrl?: string;
}) {
  try {
    const user = await getSessionUser();
    if (!user || !user.artisanProfileId) {
      return { success: false, error: "Compte artisan requis" };
    }

    const updated = await prisma.artisanProfile.update({
      where: { id: user.artisanProfileId },
      data: {
        workshopName: data.workshopName,
        specialty: data.specialty,
        city: data.city,
        region: data.region,
        experienceYears: data.experienceYears,
        bio: data.bio,
        logoUrl: data.logoUrl || null,
        coverUrl: data.coverUrl || null,
      },
    });

    try {
      revalidatePath("/atelier");
      revalidatePath("/artisan/dashboard");
      revalidatePath(`/artisans/${updated.slug}`);
      revalidatePath(`/artisan/${updated.slug}`);
    } catch {}

    return { success: true };
  } catch (error: unknown) {
    console.error("Erreur updateArtisanProfileAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
    return { success: false, error: msg };
  }
}
