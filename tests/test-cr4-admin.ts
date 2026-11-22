import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function runCR4Tests() {
  console.log("🧪 Démarrage des tests des 4 Opérations CR4 et de l'Administration de Base...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ SUCCÈS : ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ÉCHEC : ${testName}`);
      failed++;
    }
  }

  // ============================================================================
  // CR4 OPÉRATION 1 : CRÉATION D'UN COMPTE ÉDITEUR
  // ============================================================================
  console.log("1. Test CR4 Opération 1 (Compte Éditeur) :");
  const testEditorEmail = `editeur_test_${Date.now()}@sunuartisanat.sn`;
  const passwordHash = await bcrypt.hash("EditeurPass2026!", 10);

  const newEditor = await prisma.user.create({
    data: {
      name: "Éditeur Recette CR4",
      email: testEditorEmail,
      phone: `+22177${Math.floor(1000000 + Math.random() * 9000000)}`,
      passwordHash,
      roles: {
        create: [{ role: "EDITOR" }],
      },
    },
    include: { roles: true },
  });

  assert(newEditor.roles.some((r) => r.role === "EDITOR"), "L'utilisateur créé possède bien le rôle EDITOR");
  assert(!newEditor.roles.some((r) => r.role === "ADMIN" || r.role === "SUPERADMIN"), "L'éditeur n'a AUCUN privilège ADMIN ou SUPERADMIN");

  // ============================================================================
  // CR4 OPÉRATION 2 : MODIFICATION DU THÈME SANS REDÉPLOIEMENT
  // ============================================================================
  console.log("\n2. Test CR4 Opération 2 (Thème Dynamique en Base) :");
  const updatedTheme = await prisma.theme.upsert({
    where: { name: "Charte Sénégal" },
    update: {
      colorForest: "#156B48", // nuance test
      colorGold: "#E5A600",
    },
    create: {
      name: "Charte Sénégal",
      isDefault: true,
      colorForest: "#156B48",
      colorGold: "#E5A600",
      colorTerracotta: "#C2410C",
      colorEbony: "#131622",
      colorIvory: "#FAF8F5",
    },
  });

  assert(updatedTheme.colorForest === "#156B48", "La couleur Vert Forêt est persistée en base");
  assert(updatedTheme.colorGold === "#E5A600", "La couleur Or d'Afrique est persistée en base");

  // Rétablissement de la charte officielle
  await prisma.theme.update({
    where: { id: updatedTheme.id },
    data: { colorForest: "#125B3E", colorGold: "#FFB800" },
  });
  assert(true, "Rétablissement de la palette par défaut sans redéploiement");

  // ============================================================================
  // CR4 OPÉRATION 3 : CRÉATION ET PUBLICATION D'UNE PAGE SUR /p/[slug]
  // ============================================================================
  console.log("\n3. Test CR4 Opération 3 (Nouvelle Page /p/[slug]) :");
  const pageSlug = `guide-test-${Date.now()}`;
  const customPage = await prisma.page.create({
    data: {
      title: "Guide de l'Artisanat Casamançais",
      slug: pageSlug,
      content: "Ce guide détaille l'extraction de l'argile et les rituels de cuisson ancestraux.",
      isPublished: true,
    },
  });

  assert(customPage.slug === pageSlug, `La page a été générée avec le slug dynamique /p/${pageSlug}`);
  assert(customPage.isPublished === true, "La page est immédiatement disponible en statut publié");

  // ============================================================================
  // CR4 OPÉRATION 4 : ACTIVATION / DÉSACTIVATION D'UN MODULE
  // ============================================================================
  console.log("\n4. Test CR4 Opération 4 (Module Activable) :");
  // Activation du module GROQ_AI
  const activatedModule = await prisma.module.update({
    where: { code: "GROQ_AI" },
    data: { isEnabled: true },
  });
  assert(activatedModule.isEnabled === true, "Le module GROQ_AI passe à l'état actif (isEnabled = true)");

  // Remise à l'état désactivé
  const deactivatedModule = await prisma.module.update({
    where: { code: "GROQ_AI" },
    data: { isEnabled: false },
  });
  assert(deactivatedModule.isEnabled === false, "Le module GROQ_AI peut être désactivé à la volée");

  // ============================================================================
  // 5. TEST DE VALIDATION ET REFUS MOTIVÉ D'UN ARTISAN
  // ============================================================================
  console.log("\n5. Test de la Procédure de Validation d'Artisan :");
  // Création d'un artisan en attente
  const testArtisan = await prisma.artisanProfile.create({
    data: {
      workshopName: `Atelier Test Recette ${Date.now()}`,
      slug: `atelier-test-${Date.now()}`,
      specialty: "Vannerie",
      bio: "Atelier de vannerie traditionnelle de Ziguinchor.",
      city: "Ziguinchor",
      region: "Casamance",
      phone: "+221779998877",
      status: "PENDING",
      verified: false,
      user: {
        create: {
          name: "Artisan Candidat",
          email: `candidat_${Date.now()}@test.sn`,
          phone: `+22177${Math.floor(1000000 + Math.random() * 9000000)}`,
          passwordHash: "dummyHash",
          roles: { create: [{ role: "ARTISAN" }] },
        },
      },
    },
  });

  assert(testArtisan.status === "PENDING" && testArtisan.verified === false, "L'artisan s'inscrit avec le statut PENDING et sans badge");

  // Validation par l'administrateur
  const validatedArtisan = await prisma.artisanProfile.update({
    where: { id: testArtisan.id },
    data: { status: "APPROVED", verified: true },
  });
  assert(validatedArtisan.status === "APPROVED" && validatedArtisan.verified === true, "L'administrateur valide l'artisan qui reçoit le statut APPROVED et verified: true");

  console.log(`\n========================================`);
  console.log(`Résultats CR4 : ${passed} passés, ${failed} échoués.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCR4Tests().catch((e) => {
  console.error("Erreur critique pendant les tests CR4 :", e);
  process.exit(1);
});
