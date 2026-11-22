import { prisma } from "@/lib/prisma";
import { NotificationType, NotificationChannel } from "@prisma/client";

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Dispatcher central de notifications (Règle non négociable 8)
 * 1. Crée une notification interne en base
 * 2. Envoie par le canal choisi (Email, WhatsApp ou les deux)
 * 3. L'email est le repli automatique si WhatsApp n'est pas configuré ou échoue.
 */
export async function sendNotification(payload: NotificationPayload) {
  try {
    // 1. Notification interne obligatoire
    const notif = await prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
      },
    });

    // Récupérer les préférences et coordonnées de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        email: true,
        phone: true,
        preferredChannel: true,
      },
    });

    if (!user) return notif;

    const channel = user.preferredChannel;
    let whatsappSuccess = false;

    // Tentative WhatsApp si configuré
    if ((channel === NotificationChannel.WHATSAPP || channel === NotificationChannel.BOTH) && user.phone) {
      whatsappSuccess = await sendWhatsAppMessage(user.phone, `${payload.title}\n\n${payload.message}`);
    }

    // Envoi par email : si demandé explicitement OU en repli obligatoire si WhatsApp n'a pas pu être envoyé
    const shouldSendEmail =
      channel === NotificationChannel.EMAIL ||
      channel === NotificationChannel.BOTH ||
      (!whatsappSuccess && (channel === NotificationChannel.WHATSAPP));

    if (shouldSendEmail && user.email) {
      await sendEmailMessage(user.email, payload.title, payload.message);
    }

    return notif;
  } catch (error) {
    console.error("Erreur sendNotification:", error);
    return null;
  }
}

/**
 * Envoi d'email via Resend avec mode test / simulation si non configuré (Règle 4)
 */
async function sendEmailMessage(to: string, subject: string, content: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith("re_your_api_key")) {
    console.log(`[SIMULATION EMAIL Resend] Vers: ${to} | Objet: ${subject} | Message: ${content}`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "SUNU ARTISANAT <onboarding@resend.dev>",
        to: [to],
        subject,
        text: content,
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Échec appel Resend:", err);
    return false;
  }
}

/**
 * Envoi de message WhatsApp via Meta Cloud API avec mode test / simulation (Règle 4)
 */
async function sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    console.log(`[SIMULATION WHATSAPP] Vers: ${phone} | Contenu: ${text}`);
    return false; // Repli vers email déclenché si non configuré
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone.replace(/[^0-9]/g, ""),
        type: "text",
        text: { preview_url: false, body: text },
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Échec envoi WhatsApp:", err);
    return false;
  }
}
