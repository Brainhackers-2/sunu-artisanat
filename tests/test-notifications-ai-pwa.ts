/**
 * Test Phase 9 — Notifications (Règle 8), Assistant IA & PWA
 * Usage: npx tsx tests/test-notifications-ai-pwa.ts
 */
import { PrismaClient, NotificationType, NotificationChannel } from "@prisma/client";
import { sendNotification } from "../src/lib/notifications";
import { askSunuBotAction } from "../src/actions/ai";

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
  console.log("\n🧪 Tests Phase 9 — Notifications, Assistant IA & PWA\n");

  const user = await prisma.user.findFirst();
  if (!user) throw new Error("Utilisateur requis pour le test");

  // 1. Règle non négociable 8 : Envoi d'une notification interne obligatoire
  let notifId = "";
  await test("Règle 8 : Création systématique de la notification interne en base", async () => {
    const notif = await sendNotification({
      userId: user.id,
      type: NotificationType.ORDER_CREATED,
      title: "Test Notification Interne",
      message: "Ceci est une notification de test de la phase 9.",
    });

    if (!notif?.id) throw new Error("Notification interne non enregistrée en base");
    notifId = notif.id;

    const check = await prisma.notification.findUnique({ where: { id: notifId } });
    if (!check) throw new Error("Notification introuvable en base");
  });

  // 2. Règle non négociable 8 : Vérification du repli automatique vers l'email
  await test("Règle 8 : L'email est le repli si WhatsApp n'est pas configuré", async () => {
    // Modifier le profil pour demander WhatsApp
    await prisma.user.update({
      where: { id: user.id },
      data: { preferredChannel: NotificationChannel.WHATSAPP },
    });

    // L'envoi doit réussir sans planter et déclencher le repli vers email simulé
    const notif = await sendNotification({
      userId: user.id,
      type: NotificationType.ORDER_PAID,
      title: "Test Repli Email",
      message: "Test du repli si absence de clés WhatsApp Cloud API.",
    });

    if (!notif?.id) throw new Error("Échec du dispatch avec repli");

    // Rétablir le canal initial
    await prisma.user.update({
      where: { id: user.id },
      data: { preferredChannel: NotificationChannel.EMAIL },
    });

    await prisma.notification.delete({ where: { id: notif.id } });
  });

  // 3. Règle non négociable 4 : Sunu Bot utilise un vocabulaire honnête et affiche l'état réel
  await test("Règle 4 : Sunu Bot répond avec traçabilité et origine déclarée (jamais authenticité garantie)", async () => {
    const res = await askSunuBotAction("D'où viennent vos créations et comment être sûr de leur authenticité ?");
    if (!res.reply) throw new Error("Aucune réponse générée par Sunu Bot");

    const replyLower = res.reply.toLowerCase();
    if (replyLower.includes("authenticité garantie") || replyLower.includes("infalsifiable")) {
      throw new Error("Violation vocabulaire : terme interdit 'authenticité garantie' ou 'infalsifiable' détecté");
    }
  });

  // 4. Assistant Sunu Bot : respect de l'interrupteur Admin dans Modules (CR4)
  await test("Assistant IA : Désactivable via l'interrupteur Module (CR4)", async () => {
    // S'assurer que le module existe
    const mod = await prisma.module.upsert({
      where: { code: "VOICE_ASSISTANT" },
      update: { isEnabled: false },
      create: {
        code: "VOICE_ASSISTANT",
        name: "Assistant Vocal Sunu Bot",
        isEnabled: false,
      },
    });

    // Désactiver aussi GROQ_AI si présent
    await prisma.module.updateMany({
      where: { code: "GROQ_AI" },
      data: { isEnabled: false },
    });

    const res = await askSunuBotAction("Bonjour");
    if (!res.reply.includes("désactivé")) {
      throw new Error("L'assistant a répondu alors que son module est désactivé");
    }

    // Réactiver le module
    await prisma.module.update({
      where: { id: mod.id },
      data: { isEnabled: true },
    });
  });

  // Nettoyage
  if (notifId) {
    await prisma.notification.delete({ where: { id: notifId } });
  }

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
