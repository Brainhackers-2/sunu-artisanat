"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/permissions";
import { getOrCreateCartId } from "@/actions/cart";
import { z } from "zod";
import { DeliveryType, PaymentMethod, PaymentStatus, SubOrderStatus } from "@prisma/client";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Nom obligatoire (au moins 2 caractères)"),
  customerEmail: z.string().email("Adresse email valide requise"),
  customerPhone: z.string().min(8, "Numéro de téléphone obligatoire au Sénégal"),
  streetAddress: z.string().min(5, "Adresse de livraison détaillée obligatoire"),
  city: z.string().min(2, "Ville obligatoire"),
  region: z.string().min(2, "Région obligatoire"),
  deliveryType: z.nativeEnum(DeliveryType).default(DeliveryType.HOME),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.SIMULATION),
  deliveryNotes: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// Frais de livraison par artisan (forfait indicatif selon la région de l'artisan et du client)
// Dakar vers Dakar : 2000 FCFA, Inter-régions : 4000 FCFA, etc.
function calculateArtisanDeliveryFee(artisanRegion: string, customerRegion: string): number {
  if (artisanRegion.toLowerCase() === customerRegion.toLowerCase()) {
    return 2000;
  }
  return 4000;
}

export async function createOrderAction(rawInput: CheckoutInput) {
  try {
    const parseRes = checkoutSchema.safeParse(rawInput);
    if (!parseRes.success) {
      return { success: false, error: parseRes.error.issues[0]?.message ?? "Données invalides" };
    }

    const input = parseRes.data;
    const user = await getSessionUser();
    const cartId = await getOrCreateCartId();

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                artisan: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Votre panier est vide" };
    }

    // Récupérer le taux de commission de la plateforme depuis Setting ou défaut 10%
    const commissionSetting = await prisma.setting.findUnique({
      where: { key: "COMMISSION_RATE_DEFAULT" },
    });
    const commissionRate = commissionSetting ? parseFloat(commissionSetting.value) : 0.10;

    // 1. Regrouper les articles par artisan
    const itemsByArtisan = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const artisanId = item.product.artisanProfileId;
      const list = itemsByArtisan.get(artisanId) || [];
      list.push(item);
      itemsByArtisan.set(artisanId, list);
    }

    // 2. Transaction atomique Prisma : Vérifier stocks + Réserver stock + Créer Order + SubOrders + OrderItems + Delivery + Payment
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // AAAAMMJJ
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 chiffres
    const orderNumber = `SUNU-${dateStr}-${randomSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      // A. Vérification et réservation du stock pour chaque produit
      for (const item of cart.items) {
        const inv = await tx.inventory.findUnique({
          where: { productId: item.productId },
        });

        const currentStock = inv?.quantity ?? 0;
        if (currentStock < item.quantity) {
          throw new Error(
            `Le produit "${item.product.title}" n'a plus assez de stock (disponible: ${currentStock}).`
          );
        }

        // Réserver le stock
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: { decrement: item.quantity },
            reservedQuantity: { increment: item.quantity },
          },
        });
      }

      // B. Calcul des totaux globaux et par artisan
      let orderTotalFCFA = 0;
      let hasDemoProduct = false;

      // Calcul préalable pour connaître le total
      Array.from(itemsByArtisan.entries()).forEach(([, artisanItems]) => {
        const artisan = artisanItems[0].product.artisan;
        if (artisan.isDemo) hasDemoProduct = true;

        const subTotal = artisanItems.reduce(
          (sum: number, i) => sum + i.product.priceFCFA * i.quantity,
          0
        );
        const deliveryFee = calculateArtisanDeliveryFee(artisan.region, input.region);
        orderTotalFCFA += subTotal + deliveryFee;
      });

      // C. Créer la commande principale
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          totalAmountFCFA: orderTotalFCFA,
          isDemo: hasDemoProduct,
        },
      });

      // D. Créer l'adresse de livraison pour référence
      const address = await tx.address.create({
        data: {
          fullName: input.customerName,
          phone: input.customerPhone,
          streetAddress: input.streetAddress,
          city: input.city,
          region: input.region,
          deliveryNotes: input.deliveryNotes ?? null,
          customerProfileId: user ? (await tx.customerProfile.findUnique({ where: { userId: user.id } }))?.id : null,
        },
      });

      // E. Créer chaque sous-commande (SubOrder)
      let artisanIndex = 1;
      for (const [artisanId, artisanItems] of Array.from(itemsByArtisan.entries())) {
        const artisan = artisanItems[0].product.artisan;
        const subOrderNumber = `${orderNumber}-A${artisanIndex++}`;

        const subTotal = artisanItems.reduce(
          (sum: number, i) => sum + i.product.priceFCFA * i.quantity,
          0
        );
        const deliveryFee = calculateArtisanDeliveryFee(artisan.region, input.region);
        const commissionTotal = Math.round(subTotal * commissionRate);
        const artisanPartTotal = subTotal - commissionTotal;

        const subOrder = await tx.subOrder.create({
          data: {
            orderId: order.id,
            artisanProfileId: artisanId,
            subOrderNumber,
            status: SubOrderStatus.PENDING_PAYMENT,
            subTotalFCFA: subTotal,
            deliveryFeeFCFA: deliveryFee,
            commissionFCFA: commissionTotal,
            artisanPartFCFA: artisanPartTotal,
          },
        });

        // F. Créer les lignes de commande (OrderItem)
        for (const item of artisanItems) {
          const itemTotal = item.product.priceFCFA * item.quantity;
          const itemCommission = Math.round(itemTotal * commissionRate);
          const itemArtisanPart = itemTotal - itemCommission;

          await tx.orderItem.create({
            data: {
              subOrderId: subOrder.id,
              productId: item.productId,
              unitPriceFCFA: item.product.priceFCFA,
              quantity: item.quantity,
              totalPriceFCFA: itemTotal,
              commissionRate,
              commissionFCFA: itemCommission,
              artisanPartFCFA: itemArtisanPart,
            },
          });
        }

        // G. Créer la fiche livraison associée
        await tx.delivery.create({
          data: {
            subOrderId: subOrder.id,
            addressId: address.id,
            deliveryType: input.deliveryType,
            amountToCollectFCFA: input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ? (subTotal + deliveryFee) : 0,
          },
        });
      }

      // H. Créer l'enregistrement de paiement initial
      const isSimulated = input.paymentMethod === PaymentMethod.SIMULATION;
      await tx.payment.create({
        data: {
          orderId: order.id,
          amountFCFA: orderTotalFCFA,
          status: PaymentStatus.PENDING,
          method: input.paymentMethod,
          isSimulated,
        },
      });

      // I. Vider le panier
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
      trackingToken: result.trackingToken,
    };
  } catch (error: unknown) {
    console.error("Erreur createOrderAction:", error);
    const msg = error instanceof Error ? error.message : "Erreur lors de la création de la commande";
    return { success: false, error: msg };
  }
}

export async function getOrderByTrackingToken(trackingToken: string) {
  return await prisma.order.findUnique({
    where: { trackingToken },
    include: {
      payments: true,
      subOrders: {
        include: {
          artisan: {
            select: {
              workshopName: true,
              city: true,
              region: true,
              phone: true,
              whatsappPhone: true,
              slug: true,
              isDemo: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  slug: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          delivery: {
            include: {
              address: true,
              courier: {
                select: {
                  name: true,
                  phone: true,
                  companyName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
