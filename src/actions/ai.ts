"use server";

import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `Tu es Sunu Bot, l'assistant d'artisanat d'art sénégalais de la marketplace SUNU ARTISANAT.
Tu valorises le travail des artisans de Thiès (tissage, vannerie), de Casamance (bois, vannerie), de Dakar (cuir, bijouterie) et de Saint-Louis (broderie, verre).
Règles strictes :
1. Tu parles de "traçabilité", "origine déclarée", "atelier vérifié". Tu n'utilises JAMAIS "authenticité garantie" ni "infalsifiable".
2. Tu t'exprimes en français clair, avec des salutations ou expressions courantes en wolof (Nanga def, Jërejëf, Dalal ak jamm) si approprié.
3. Réponds de façon concise et chaleureuse, en guidant le visiteur vers les créations et artisans.`;

interface AssistantResponse {
  reply: string;
  isSimulated: boolean;
}

/**
 * Assistant Sunu Bot (Groq avec fallback local / simulation si hors ligne)
 */
export async function askSunuBotAction(userQuery: string): Promise<AssistantResponse> {
  const query = userQuery.trim();
  if (!query) return { reply: "Nanga def ! Comment puis-je vous aider aujourd'hui ?", isSimulated: false };

  // Vérifier si le module IA est activé dans la table Module (CR4)
  const aiModule = await prisma.module.findFirst({
    where: {
      code: { in: ["GROQ_AI", "VOICE_ASSISTANT"] },
      isEnabled: true,
    },
  });
  if (!aiModule) {
    return {
      reply: "L'assistant Sunu Bot est actuellement désactivé par l'administration de la plateforme.",
      isSimulated: false,
    };
  }

  const groqApiKey = process.env.GROQ_API_KEY;

  // Si Groq configuré, appel direct
  if (groqApiKey && !groqApiKey.startsWith("gsk_your_groq")) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices[0]?.message?.content;
        if (reply) return { reply, isSimulated: false };
      }
    } catch (err) {
      console.warn("Groq indisponible, bascule sur réponse locale:", err);
    }
  }

  // Fallback intelligent en local (Règle 4 : Afficher l'état réel et proposer un mode identifié)
  const qLower = query.toLowerCase();
  let localReply = "Dalal ak jamm ! Sur Sunu Artisanat, chaque pièce raconte une histoire liée à nos terroirs de Thiès, de Casamance ou de Dakar. Vous pouvez découvrir les ateliers vérifiés dans l'onglet Artisans ou explorer le catalogue.";

  if (qLower.includes("tissage") || qLower.includes("thies") || qLower.includes("thiès")) {
    localReply = "Le tissage traditionnel de Thiès est réputé pour sa précision et ses motifs géométriques mandingues. Découvrez les pièces certifiées dans notre catégorie Tissage !";
  } else if (qLower.includes("cuir") || qLower.includes("maroquinerie")) {
    localReply = "Nos maroquiniers travaillent le cuir tanné de façon artisanale. Chaque sac ou accessoire porte une traçabilité d'origine déclarée par l'atelier.";
  } else if (qLower.includes("tracabilite") || qLower.includes("qr") || qLower.includes("origine")) {
    localReply = "Chaque produit publié sur Sunu Artisanat possède un QR Code unique certifiant l'atelier de fabrication et les matériaux déclarés. Vous pouvez vérifier n'importe quelle pièce sans compte.";
  }

  return {
    reply: localReply,
    isSimulated: true, // Badge simulation si Groq n'est pas branché
  };
}
