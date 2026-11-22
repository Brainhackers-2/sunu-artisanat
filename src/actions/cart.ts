"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

const CART_COOKIE_NAME = "sunu_cart_session";

export async function getOrCreateCartId(): Promise<string> {
  const user = await getSessionUser();
  const cookieStore = cookies();

  if (user) {
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Si on a un cookie anonyme résiduel, migrer les items vers le panier utilisateur
    const anonSessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
    if (anonSessionId) {
      const anonCart = await prisma.cart.findUnique({
        where: { sessionId: anonSessionId },
        include: { items: true },
      });
      if (anonCart && anonCart.items.length > 0) {
        for (const item of anonCart.items) {
          await prisma.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId: item.productId,
              },
            },
            update: { quantity: { increment: item.quantity } },
            create: {
              cartId: cart.id,
              productId: item.productId,
              quantity: item.quantity,
            },
          });
        }
        await prisma.cart.delete({ where: { id: anonCart.id } });
      }
      cookieStore.delete(CART_COOKIE_NAME);
    }

    return cart.id;
  }

  // Visiteur non connecté (invité)
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    cookieStore.set(CART_COOKIE_NAME, sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  }

  let cart = await prisma.cart.findUnique({
    where: { sessionId },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId },
    });
  }

  return cart.id;
}

export async function getCart() {
  const cartId = await getOrCreateCartId();
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              artisan: {
                select: {
                  id: true,
                  workshopName: true,
                  region: true,
                  slug: true,
                  verified: true,
                  isDemo: true,
                },
              },
              inventory: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) return { items: [], totalAmountFCFA: 0, itemsCount: 0 };

  const totalAmountFCFA = cart.items.reduce(
    (sum, item) => sum + item.product.priceFCFA * item.quantity,
    0
  );
  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    items: cart.items,
    totalAmountFCFA,
    itemsCount,
  };
}

export async function addToCartAction(productId: string, quantity = 1) {
  try {
    if (quantity < 1) {
      return { success: false, error: "La quantité doit être supérieure ou égale à 1" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId, status: "PUBLISHED" },
      include: { inventory: true },
    });

    if (!product) {
      return { success: false, error: "Produit non disponible ou introuvable" };
    }

    const currentStock = product.inventory?.quantity ?? 0;
    if (currentStock < quantity) {
      return {
        success: false,
        error: `Stock insuffisant (${currentStock} disponible${currentStock > 1 ? "s" : ""})`,
      };
    }

    const cartId = await getOrCreateCartId();

    // Vérifier quantité déjà présente dans le panier
    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > currentStock) {
      return {
        success: false,
        error: `Impossible d'ajouter plus que le stock disponible (${currentStock})`,
      };
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: { quantity: newQuantity },
      create: {
        cartId,
        productId,
        quantity,
      },
    });

    revalidatePath("/panier");
    revalidatePath("/boutique");
    return { success: true };
  } catch (error) {
    console.error("Erreur addToCartAction:", error);
    return { success: false, error: "Une erreur est survenue lors de l'ajout au panier" };
  }
}

export async function updateCartItemQuantityAction(itemId: string, newQuantity: number) {
  try {
    const cartId = await getOrCreateCartId();

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
      include: { product: { include: { inventory: true } } },
    });

    if (!item) {
      return { success: false, error: "Article non trouvé dans votre panier" };
    }

    if (newQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      revalidatePath("/panier");
      return { success: true };
    }

    const currentStock = item.product.inventory?.quantity ?? 0;
    if (newQuantity > currentStock) {
      return {
        success: false,
        error: `Stock insuffisant (${currentStock} disponible${currentStock > 1 ? "s" : ""})`,
      };
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    revalidatePath("/panier");
    return { success: true };
  } catch (error) {
    console.error("Erreur updateCartItemQuantityAction:", error);
    return { success: false, error: "Erreur lors de la mise à jour de la quantité" };
  }
}

export async function removeCartItemAction(itemId: string) {
  try {
    const cartId = await getOrCreateCartId();
    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId },
    });

    revalidatePath("/panier");
    return { success: true };
  } catch (error) {
    console.error("Erreur removeCartItemAction:", error);
    return { success: false, error: "Erreur lors de la suppression de l'article" };
  }
}
