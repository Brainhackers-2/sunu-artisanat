/**
 * Test Phase 5 — Catalogue & Boutique publique
 * Usage: npx tsx tests/test-catalogue.ts
 */
import { PrismaClient } from "@prisma/client";

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
  console.log("\n🧪 Tests Phase 5 — Catalogue & Boutique publique\n");

  // 1. Produits publiés accessibles
  await test("Au moins 1 produit PUBLISHED en base", async () => {
    const count = await prisma.product.count({ where: { status: "PUBLISHED" } });
    if (count === 0) throw new Error("Aucun produit publié");
  });

  // 2. Slug unique par produit
  await test("Slugs de produits uniques", async () => {
    const slugs = await prisma.product.findMany({ select: { slug: true } });
    const unique = new Set(slugs.map((s) => s.slug));
    if (unique.size !== slugs.length) throw new Error("Slugs dupliqués détectés");
  });

  // 3. Artisans approuvés présents
  await test("Au moins 1 artisan APPROVED en base", async () => {
    const count = await prisma.artisanProfile.count({ where: { status: "APPROVED" } });
    if (count === 0) throw new Error("Aucun artisan approuvé");
  });

  // 4. Slug unique par artisan
  await test("Slugs d'artisans uniques", async () => {
    const slugs = await prisma.artisanProfile.findMany({ select: { slug: true } });
    const unique = new Set(slugs.map((s) => s.slug));
    if (unique.size !== slugs.length) throw new Error("Slugs artisans dupliqués");
  });

  // 5. Chaque produit publié a au moins 1 image
  await test("Produits publiés ont au moins 1 image", async () => {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { _count: { select: { images: true } } },
    });
    const noImg = products.filter((p) => p._count.images === 0);
    if (noImg.length > 0)
      throw new Error(`${noImg.length} produit(s) sans image : ${noImg.map((p) => p.title).join(", ")}`);
  });

  // 6. QR codes liés aux produits demo
  await test("Produits démo ont un QR code", async () => {
    const demos = await prisma.product.findMany({
      where: { isDemo: true },
      include: { _count: { select: { qrCodes: true } } },
    });
    const noQr = demos.filter((p) => p._count.qrCodes === 0);
    if (noQr.length > 0)
      throw new Error(`${noQr.length} produit(s) démo sans QR : ${noQr.map((p) => p.title).join(", ")}`);
  });

  // 7. Avis approuvés présents
  await test("Avis approuvés (isApproved=true) présents", async () => {
    const count = await prisma.review.count({ where: { isApproved: true } });
    if (count === 0) throw new Error("Aucun avis approuvé en base");
  });

  // 8. Catégories avec slug
  await test("Catégories ont des slugs non vides", async () => {
    const cats = await prisma.category.findMany();
    const noSlug = cats.filter((c) => !c.slug);
    if (noSlug.length > 0) throw new Error(`${noSlug.length} catégorie(s) sans slug`);
  });

  // 9. Inventaire associé à chaque produit publié
  await test("Chaque produit publié a un inventaire", async () => {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { inventory: true },
    });
    const noInv = products.filter((p) => !p.inventory);
    if (noInv.length > 0)
      throw new Error(`${noInv.length} produit(s) sans inventaire : ${noInv.map((p) => p.title).join(", ")}`);
  });

  // 10. Prix en entiers FCFA (priceFCFA est Int dans Prisma → toujours entier)
  await test("Prix des produits sont des entiers FCFA (priceFCFA > 0)", async () => {
    const products = await prisma.product.findMany({ select: { title: true, priceFCFA: true } });
    const invalid = products.filter((p) => p.priceFCFA <= 0);
    if (invalid.length > 0)
      throw new Error(`Prix invalides : ${invalid.map((p) => `${p.title}=${p.priceFCFA}`).join(", ")}`);
  });

  // 11. Artisans isDemo bien marqués
  await test("Artisans démo ont isDemo=true", async () => {
    const demos = await prisma.artisanProfile.findMany({ where: { isDemo: true } });
    if (demos.length === 0) throw new Error("Aucun artisan démo trouvé");
  });

  // 12. QR codes actifs ont un code non vide
  await test("QR codes actifs ont un code non vide", async () => {
    const qrs = await prisma.qRCode.findMany({ where: { isActive: true } });
    const noCode = qrs.filter((q) => !q.code || q.code.trim() === "");
    if (noCode.length > 0) throw new Error(`${noCode.length} QR sans code`);
  });

  // Résumé
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
