import bcrypt from "bcryptjs";
import { checkRateLimit } from "../src/lib/ratelimit";
import { hasAnyRole } from "../src/lib/permissions";
import { Role } from "@prisma/client";

async function runTests() {
  console.log("🧪 Démarrage des tests automatiques : Comptes, Rôles et Permissions...\n");

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

  // 1. Test du Hachage de Mots de Passe
  console.log("1. Test de Sécurité (Bcrypt Password Hashing) :");
  const password = "SunuArtisanat2026!";
  const hash = await bcrypt.hash(password, 10);
  assert(hash.startsWith("$2"), "Le hash bcrypt est correctement formaté ($2a/$2b)");
  const isMatch = await bcrypt.compare(password, hash);
  assert(isMatch === true, "La vérification du mot de passe avec le bon mot de passe réussit");
  const isWrongMatch = await bcrypt.compare("MauvaisMotDePasse", hash);
  assert(isWrongMatch === false, "La vérification du mot de passe avec un mauvais mot de passe échoue");

  // 2. Test du Contrôle des Rôles
  console.log("\n2. Test de la Matrice des Rôles (Section 4 du Cahier des Charges) :");
  const clientRoles: Role[] = ["CLIENT"];
  const artisanRoles: Role[] = ["ARTISAN", "CLIENT"];
  const editorRoles: Role[] = ["EDITOR"];
  const adminRoles: Role[] = ["ADMIN", "SUPERADMIN"];

  assert(hasAnyRole(clientRoles, ["CLIENT"]), "Le client possède le rôle CLIENT");
  assert(!hasAnyRole(clientRoles, ["ADMIN", "ARTISAN"]), "Le client ne peut pas accéder aux rôles ADMIN ou ARTISAN");
  assert(hasAnyRole(artisanRoles, ["ARTISAN"]), "L'artisan possède le rôle ARTISAN");
  assert(hasAnyRole(artisanRoles, ["CLIENT"]), "L'artisan possède également le rôle CLIENT");
  assert(hasAnyRole(editorRoles, ["EDITOR"]), "L'éditeur possède le rôle EDITOR");
  assert(!hasAnyRole(editorRoles, ["ADMIN", "SUPERADMIN"]), "L'éditeur n'est ni ADMIN ni SUPERADMIN");
  assert(hasAnyRole(adminRoles, ["ADMIN"]), "L'administrateur possède le rôle ADMIN");
  assert(hasAnyRole(adminRoles, ["SUPERADMIN"]), "L'administrateur possède le rôle SUPERADMIN");

  // 3. Test du Rate Limiter PostgreSQL (Table RateLimit)
  console.log("\n3. Test du Rate Limiting (Protection Brute-Force) :");
  const testKey = `test_ip_${Date.now()}`;
  const r1 = await checkRateLimit(testKey, 3, 60);
  assert(r1.success === true && r1.remaining === 2, "Tentative 1 autorisée (2 restantes)");

  const r2 = await checkRateLimit(testKey, 3, 60);
  assert(r2.success === true && r2.remaining === 1, "Tentative 2 autorisée (1 restante)");

  const r3 = await checkRateLimit(testKey, 3, 60);
  assert(r3.success === true && r3.remaining === 0, "Tentative 3 autorisée (0 restante)");

  const r4 = await checkRateLimit(testKey, 3, 60);
  assert(r4.success === false, "Tentative 4 bloquée par le Rate Limiter");

  console.log(`\n========================================`);
  console.log(`Résultats : ${passed} passés, ${failed} échoués.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Erreur critique pendant les tests :", e);
  process.exit(1);
});
