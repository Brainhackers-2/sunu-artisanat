import { prisma } from "@/lib/prisma";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate Limiter basé sur la table PostgreSQL RateLimit
 * Conforme à la règle : sans processus permanent, sans Redis.
 * Nettoyage automatique des enregistrements expirés à la volée.
 */
export async function checkRateLimit(
  key: string,
  maxPoints: number = 5,
  windowSeconds: number = 300 // 5 minutes
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    // 1. Nettoyage des anciennes clés expirées pour cet identifiant
    await prisma.rateLimit.deleteMany({
      where: {
        key,
        expireAt: { lt: now },
      },
    });

    // 2. Recherche d'une entrée active
    const activeLimit = await prisma.rateLimit.findFirst({
      where: {
        key,
        expireAt: { gte: now },
      },
    });

    if (!activeLimit) {
      // Nouvelle entrée
      await prisma.rateLimit.create({
        data: {
          key,
          points: 1,
          expireAt: resetAt,
        },
      });
      return { success: true, remaining: maxPoints - 1, resetAt };
    }

    if (activeLimit.points >= maxPoints) {
      // Seuil dépassé
      return { success: false, remaining: 0, resetAt: activeLimit.expireAt };
    }

    // Incrémentation des points
    const updated = await prisma.rateLimit.update({
      where: { id: activeLimit.id },
      data: { points: activeLimit.points + 1 },
    });

    return {
      success: true,
      remaining: Math.max(0, maxPoints - updated.points),
      resetAt: activeLimit.expireAt,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    // En cas d'erreur ponctuelle de base de données, autoriser pour ne pas bloquer complètement l'utilisateur
    return { success: true, remaining: 1, resetAt };
  }
}
