import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Journalise les actions sensibles dans la table AuditLog
 * Vérifiable par les administrateurs dans Admin > Journal d'activité
 */
export async function logAudit({
  userId,
  action,
  targetType,
  targetId,
  metadata,
  ipAddress,
}: LogAuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        targetType,
        targetId: targetId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
    return null;
  }
}
