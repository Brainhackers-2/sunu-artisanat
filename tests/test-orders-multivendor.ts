/**
 * Test Phase 6 — Panier, Commandes multi-artisans, Réservation de stock & Suivi invité
 * Usage: npx tsx tests/test-orders-multivendor.ts
 */
import { PrismaClient, PaymentMethod, PaymentStatus, SubOrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

type TestResult = { name: string; passed: boolean; detail?: string };
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
  } catch (e: unknown) {
    results.push({ name, passed: false, detail: String(e) });
  }
}

async function main() {
  console.log("\n🧪 Tests Phase 6 — Commandes Multi-Artisans, Stocks & Suivi\n");

  // 1. Deux produits d'artisans distincts disponibles
  let product1: any = null;
  let product2: any = null;

  await test("Trouver au moins 2 produits avec stock issus de 2 artisans distincts", async () => {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { artisan: true, inventory: true },
    });

    if (products.length < 2) throw new Error("Moins de 2 produits publiés");

    product1 = products[0];
    product2 = products.find((p) => p.artisanProfileId !== product1.artisanProfileId);

    if (!product2) throw new Error("Impossible de trouver 2 artisans distincts pour le test multi-vendeur");
  });

  // 2. Création et vérification d'un panier
  let testCartId = "";
  await test("Création d'un panier avec sessionId invité", async () => {
    const testSession = `test_session_${Date.now()}`;
    const cart = await prisma.cart.create({
      data: { sessionId: testSession },
    });
    testCartId = cart.id;

    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product1.id, quantity: 1 },
    });
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product2.id, quantity: 2 },
    });

    const check = await prisma.cart.findUnique({
      where: { id: testCartId },
      include: { items: true },
    });

    if (check?.items.length !== 2) throw new Error("Les articles n'ont pas été enregistrés dans le panier");
  });

  // 3. Réservation de stock et création de commande multi-artisans
  let createdOrder: any = null;
  const initialStockP1 = product1?.inventory?.quantity ?? 0;
  const initialReservedP1 = product1?.inventory?.reservedQuantity ?? 0;

  await test("Création d'une commande mère Order + SubOrders avec réservation de stock atomique", async () => {
    const orderNumber = `TEST-${Date.now()}`;
    const commissionRate = 0.10;

    // Simulation de la transaction
    createdOrder = await prisma.$transaction(async (tx) => {
      // Réserver stock
      await tx.inventory.update({
        where: { productId: product1.id },
        data: {
          quantity: { decrement: 1 },
          reservedQuantity: { increment: 1 },
        },
      });

      // Commande globale
      const subTotalP1 = product1.priceFCFA * 1;
      const subTotalP2 = product2.priceFCFA * 2;
      const totalAmount = subTotalP1 + subTotalP2 + 2000 + 4000;

      const ord = await tx.order.create({
        data: {
          orderNumber,
          customerName: "Awa Ndiaye",
          customerEmail: "awa@example.sn",
          customerPhone: "+221770000000",
          totalAmountFCFA: totalAmount,
          isDemo: true,
        },
      });

      // SubOrder 1
      const commission1 = Math.round(subTotalP1 * commissionRate);
      await tx.subOrder.create({
        data: {
          orderId: ord.id,
          artisanProfileId: product1.artisanProfileId,
          subOrderNumber: `${orderNumber}-A1`,
          status: SubOrderStatus.PENDING_PAYMENT,
          subTotalFCFA: subTotalP1,
          deliveryFeeFCFA: 2000,
          commissionFCFA: commission1,
          artisanPartFCFA: subTotalP1 - commission1,
          items: {
            create: {
              productId: product1.id,
              unitPriceFCFA: product1.priceFCFA,
              quantity: 1,
              totalPriceFCFA: subTotalP1,
              commissionRate,
              commissionFCFA: commission1,
              artisanPartFCFA: subTotalP1 - commission1,
            },
          },
        },
      });

      // SubOrder 2
      const commission2 = Math.round(subTotalP2 * commissionRate);
      await tx.subOrder.create({
        data: {
          orderId: ord.id,
          artisanProfileId: product2.artisanProfileId,
          subOrderNumber: `${orderNumber}-A2`,
          status: SubOrderStatus.PENDING_PAYMENT,
          subTotalFCFA: subTotalP2,
          deliveryFeeFCFA: 4000,
          commissionFCFA: commission2,
          artisanPartFCFA: subTotalP2 - commission2,
          items: {
            create: {
              productId: product2.id,
              unitPriceFCFA: product2.priceFCFA,
              quantity: 2,
              totalPriceFCFA: subTotalP2,
              commissionRate,
              commissionFCFA: commission2,
              artisanPartFCFA: subTotalP2 - commission2,
            },
          },
        },
      });

      // Paiement simulation
      await tx.payment.create({
        data: {
          orderId: ord.id,
          amountFCFA: totalAmount,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.SIMULATION,
          isSimulated: true,
        },
      });

      return ord;
    });

    if (!createdOrder?.id) throw new Error("Order non créée");
  });

  // 4. Vérifier que la commande a exactement 2 sous-commandes distinctes
  await test("La commande contient exactement 2 sous-commandes (une par artisan)", async () => {
    const subs = await prisma.subOrder.findMany({
      where: { orderId: createdOrder.id },
    });
    if (subs.length !== 2) throw new Error(`Attendu 2 SubOrders, obtenu: ${subs.length}`);
  });

  // 5. Vérifier que les montants sont en entiers FCFA
  await test("Tous les montants (total, part artisan, commission) sont des entiers FCFA stricts", async () => {
    const subs = await prisma.subOrder.findMany({
      where: { orderId: createdOrder.id },
      include: { items: true },
    });

    for (const sub of subs) {
      if (sub.subTotalFCFA !== Math.floor(sub.subTotalFCFA)) throw new Error("subTotalFCFA non entier");
      if (sub.deliveryFeeFCFA !== Math.floor(sub.deliveryFeeFCFA)) throw new Error("deliveryFee non entier");
      if (sub.commissionFCFA !== Math.floor(sub.commissionFCFA)) throw new Error("commissionFCFA non entier");
      if (sub.artisanPartFCFA !== Math.floor(sub.artisanPartFCFA)) throw new Error("artisanPartFCFA non entier");
      if (sub.subTotalFCFA !== sub.commissionFCFA + sub.artisanPartFCFA) {
        throw new Error("subTotal != commission + partArtisan");
      }
    }
  });

  // 6. Vérifier la réservation du stock
  await test("Le stock du produit 1 a bien été décrémenté et réservé", async () => {
    const updatedInv = await prisma.inventory.findUnique({
      where: { productId: product1.id },
    });
    if ((updatedInv?.quantity ?? 0) !== initialStockP1 - 1) {
      throw new Error(`Stock non décrémenté: était ${initialStockP1}, maintenant ${updatedInv?.quantity}`);
    }
    if ((updatedInv?.reservedQuantity ?? 0) !== initialReservedP1 + 1) {
      throw new Error(`Stock réservé incorrect`);
    }
  });

  // 7. Vérifier le lien de suivi anonyme par trackingToken
  await test("Accès à la commande invité via trackingToken", async () => {
    const check = await prisma.order.findUnique({
      where: { trackingToken: createdOrder.trackingToken },
      include: { subOrders: true },
    });
    if (!check) throw new Error("Commande introuvable par trackingToken");
    if (check.subOrders.length !== 2) throw new Error("Sous-commandes manquantes lors du suivi");
  });

  // Nettoyage après test
  await prisma.order.delete({ where: { id: createdOrder.id } });
  await prisma.cart.delete({ where: { id: testCartId } });
  // Rétablir le stock
  await prisma.inventory.update({
    where: { productId: product1.id },
    data: {
      quantity: { increment: 1 },
      reservedQuantity: { decrement: 1 },
    },
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed);

  console.log("─".repeat(55));
  results.forEach((r) => {
    const icon = r.passed ? "✅" : "❌";
    console.log(`${icon} ${r.name}${r.detail ? `\n   → ${r.detail}` : ""}`);
  });
  console.log("─".repeat(55));
  console.log(`\n🏁 ${passed}/${results.length} tests réussis\n`);

  if (failed.length > 0) process.exit(1);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
