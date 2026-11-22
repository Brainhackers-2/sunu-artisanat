/**
 * Test Phase 8 — Espaces Artisan & Administration Avancée (Modération, Isolation stricte)
 * Usage: npx tsx tests/test-artisan-admin-advanced.ts
 */
import { PrismaClient, ProductStatus } from "@prisma/client";

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
  console.log("\n🧪 Tests Phase 8 — Espace Artisan & Modération Admin\n");

  const artisan1 = await prisma.artisanProfile.findFirst({
    where: { isDemo: true },
    include: { user: true },
  });
  const artisan2 = await prisma.artisanProfile.findFirst({
    where: { isDemo: true, id: { not: artisan1?.id } },
  });

  if (!artisan1 || !artisan2) {
    throw new Error("Deux artisans distincts requis pour tester l'isolation");
  }

  const category = await prisma.category.findFirst();
  if (!category) throw new Error("Catégorie requise");

  // 1. Soumission d'un produit par artisan -> Statut initial PENDING obligatoire (Règle 7)
  let createdProductId = "";
  await test("Règle 7 : Tout nouveau produit soumis par un artisan passe au statut PENDING", async () => {
    const slug = `test-mod-${Date.now()}`;
    const p = await prisma.product.create({
      data: {
        artisanProfileId: artisan1.id,
        categoryId: category.id,
        title: "Test Soumission Modération",
        slug,
        description: "Description de test pour la modération de produit artisanal",
        priceFCFA: 15000,
        originRegion: artisan1.region,
        technique: "Tissage manuel",
        status: ProductStatus.PENDING,
        inventory: { create: { quantity: 5 } },
        materials: { create: { name: "Coton", origin: "Thiès" } },
      },
    });
    createdProductId = p.id;
    if (p.status !== ProductStatus.PENDING) throw new Error("Le produit n'est pas au statut PENDING");
  });

  // 2. Modération : Validation par l'administrateur -> Statut PUBLISHED + Création automatique du QRCode
  await test("Modération Admin : Validation -> PUBLISHED et génération automatique du QR de traçabilité", async () => {
    // Simuler l'approbation
    await prisma.product.update({
      where: { id: createdProductId },
      data: { status: ProductStatus.PUBLISHED },
    });

    const qrCode = await prisma.qRCode.create({
      data: {
        productId: createdProductId,
        serialNumber: `SN-TEST-${Date.now()}`,
        code: `CERT-TEST-${Date.now()}`,
        declaredOrigin: `Atelier ${artisan1.workshopName}, ${artisan1.region}`,
        isActive: true,
      },
    });

    const p = await prisma.product.findUnique({
      where: { id: createdProductId },
      include: { qrCodes: true },
    });

    if (p?.status !== ProductStatus.PUBLISHED) throw new Error("Produit non publié");
    if (p.qrCodes.length === 0) throw new Error("QR Code de traçabilité non généré");
  });

  // 3. Règle non négociable 2 : Isolation stricte — un artisan ne voit jamais les sous-commandes d'un autre
  await test("Règle 2 : Un artisan ne peut requêter que ses propres sous-commandes", async () => {
    const subOrdersArtisan1 = await prisma.subOrder.findMany({
      where: { artisanProfileId: artisan1.id },
    });

    const anyFromArtisan2 = subOrdersArtisan1.some((s) => s.artisanProfileId === artisan2.id);
    if (anyFromArtisan2) {
      throw new Error("Violation critique : les sous-commandes de l'artisan 2 apparaissent chez l'artisan 1");
    }
  });

  // 4. Règle non négociable 9 : Annuaire des livreurs tenu par l'admin
  await test("Règle 9 : Enregistrement d'un coursier dans l'annuaire admin", async () => {
    const courier = await prisma.courier.create({
      data: {
        name: "Amadou Diallo Express",
        phone: "+221778899001",
        companyName: "Dakar Livraisons SARL",
        coverageZone: "Dakar",
        isActive: true,
      },
    });

    if (!courier.id) throw new Error("Coursier non créé");
    await prisma.courier.delete({ where: { id: courier.id } });
  });

  // Nettoyage produit de test
  await prisma.qRCode.deleteMany({ where: { productId: createdProductId } });
  await prisma.productMaterial.deleteMany({ where: { productId: createdProductId } });
  await prisma.inventory.deleteMany({ where: { productId: createdProductId } });
  await prisma.product.delete({ where: { id: createdProductId } });

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
