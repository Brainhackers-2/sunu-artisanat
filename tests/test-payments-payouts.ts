/**
 * Test Phase 7 — Paiements, Libération du stock & Reversements (Payouts)
 * Usage: npx tsx tests/test-payments-payouts.ts
 */
import { PrismaClient, PaymentMethod, PaymentStatus, SubOrderStatus } from "@prisma/client";
import { confirmPaymentAction, cancelOrExpirePaymentAction } from "../src/actions/payment";

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
  console.log("\n🧪 Tests Phase 7 — Paiements & Reversements\n");

  const product = await prisma.product.findFirst({
    where: { status: "PUBLISHED" },
    include: { artisan: true, inventory: true },
  });

  if (!product) throw new Error("Aucun produit publié pour les tests");

  const initialStock = product.inventory?.quantity ?? 0;
  const initialReserved = product.inventory?.reservedQuantity ?? 0;

  // 1. Création d'une commande test
  let testOrder: any = null;
  await test("Créer une commande avec paiement PENDING et stock réservé", async () => {
    // Réserver 1 unité
    await prisma.inventory.update({
      where: { productId: product.id },
      data: {
        quantity: { decrement: 1 },
        reservedQuantity: { increment: 1 },
      },
    });

    testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-PAY-${Date.now()}`,
        customerName: "Modou Fall",
        customerEmail: "modou@example.sn",
        customerPhone: "+221780000000",
        totalAmountFCFA: product.priceFCFA + 2000,
        isDemo: true,
        subOrders: {
          create: {
            artisanProfileId: product.artisanProfileId,
            subOrderNumber: `TEST-PAY-${Date.now()}-A1`,
            status: SubOrderStatus.PENDING_PAYMENT,
            subTotalFCFA: product.priceFCFA,
            deliveryFeeFCFA: 2000,
            commissionFCFA: Math.round(product.priceFCFA * 0.1),
            artisanPartFCFA: product.priceFCFA - Math.round(product.priceFCFA * 0.1),
            items: {
              create: {
                productId: product.id,
                unitPriceFCFA: product.priceFCFA,
                quantity: 1,
                totalPriceFCFA: product.priceFCFA,
                commissionRate: 0.1,
                commissionFCFA: Math.round(product.priceFCFA * 0.1),
                artisanPartFCFA: product.priceFCFA - Math.round(product.priceFCFA * 0.1),
              },
            },
          },
        },
        payments: {
          create: {
            amountFCFA: product.priceFCFA + 2000,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.SIMULATION,
            isSimulated: true,
          },
        },
      },
      include: { subOrders: true, payments: true },
    });

    if (!testOrder.id) throw new Error("Échec création commande");
  });

  // 2. Validation du paiement via confirmPaymentAction
  await test("Confirmation de paiement -> Payment SIMULATED/PAID, SubOrder PAID, Facture générée", async () => {
    const res = await confirmPaymentAction(testOrder.id);
    if (!res.success) throw new Error(res.error);

    const payment = await prisma.payment.findFirst({ where: { orderId: testOrder.id } });
    if (payment?.status !== PaymentStatus.SIMULATED && payment?.status !== PaymentStatus.PAID) {
      throw new Error(`Statut de paiement inattendu: ${payment?.status}`);
    }

    const subOrder = await prisma.subOrder.findFirst({ where: { orderId: testOrder.id } });
    if (subOrder?.status !== SubOrderStatus.PAID) {
      throw new Error(`Statut sous-commande inattendu: ${subOrder?.status}`);
    }

    const invoice = await prisma.invoice.findFirst({ where: { orderId: testOrder.id } });
    if (!invoice) throw new Error("Facture non créée après le paiement");
  });

  // 3. Libération du stock réservé après paiement réussi
  await test("Stock réservé correctement décrémenté après validation du paiement", async () => {
    const inv = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if ((inv?.reservedQuantity ?? 0) !== initialReserved) {
      throw new Error(`reservedQuantity inattendu: attendu ${initialReserved}, obtenu ${inv?.reservedQuantity}`);
    }
  });

  // 4. Test d'annulation et libération du stock à la demande (Règle non négociable 5)
  await test("Annulation de commande PENDING -> Libération du stock réservé vers disponible", async () => {
    // Réserver à nouveau 1 unité pour un test d'annulation
    await prisma.inventory.update({
      where: { productId: product.id },
      data: {
        quantity: { decrement: 1 },
        reservedQuantity: { increment: 1 },
      },
    });

    const cancelOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-CANCEL-${Date.now()}`,
        customerName: "Ibrahima Sow",
        customerEmail: "ibrahima@example.sn",
        customerPhone: "+221760000000",
        totalAmountFCFA: 10000,
        isDemo: true,
        subOrders: {
          create: {
            artisanProfileId: product.artisanProfileId,
            subOrderNumber: `TEST-CANCEL-${Date.now()}-A1`,
            status: SubOrderStatus.PENDING_PAYMENT,
            subTotalFCFA: 8000,
            deliveryFeeFCFA: 2000,
            commissionFCFA: 800,
            artisanPartFCFA: 7200,
            items: {
              create: {
                productId: product.id,
                unitPriceFCFA: 8000,
                quantity: 1,
                totalPriceFCFA: 8000,
                commissionRate: 0.1,
                commissionFCFA: 800,
                artisanPartFCFA: 7200,
              },
            },
          },
        },
        payments: {
          create: {
            amountFCFA: 10000,
            status: PaymentStatus.PENDING,
            method: PaymentMethod.SIMULATION,
            isSimulated: true,
          },
        },
      },
    });

    // Annuler
    const cancelRes = await cancelOrExpirePaymentAction(cancelOrder.id);
    if (!cancelRes.success) throw new Error(cancelRes.error);

    // Vérifier stock
    const inv = await prisma.inventory.findUnique({ where: { productId: product.id } });
    if ((inv?.quantity ?? 0) !== initialStock - 1) { // 1 unité achetée définitivement au test 2
      throw new Error("Stock non restitué");
    }

    await prisma.order.delete({ where: { id: cancelOrder.id } });
  });

  // 5. Test de création d'un reversement Payout artisan
  await test("Enregistrement d'un Payout pour un artisan avec montant entier FCFA", async () => {
    const payout = await prisma.payout.create({
      data: {
        artisanProfileId: product.artisanProfileId,
        amountFCFA: 35000,
        method: "Wave",
        recipientPhone: "+221770001122",
        reference: "WAVE-REF-TEST-001",
        isCompleted: true,
      },
    });

    if (!payout.id) throw new Error("Payout non créé");
    if (payout.amountFCFA !== 35000) throw new Error("Montant non conforme");

    await prisma.payout.delete({ where: { id: payout.id } });
  });

  // Nettoyage commande de test 1
  await prisma.invoice.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  // Rétablir le stock initial
  await prisma.inventory.update({
    where: { productId: product.id },
    data: {
      quantity: initialStock,
      reservedQuantity: initialReserved,
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
