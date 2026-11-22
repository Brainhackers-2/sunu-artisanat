import { prisma } from "@/lib/prisma";
import { Activity, ShieldCheck, User } from "lucide-react";

export default async function AdminAuditPage() {
  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#125B3E]" /> Journal d&apos;Activité &amp; Traçabilité (Audit)
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Historique immuable de toutes les actions sensibles effectuées sur la plateforme (validations d&apos;artisans, créations de comptes éditeur, modifications de thèmes, activation de modules).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Dernières actions enregistrées ({logs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[11px]">
                <th className="p-3.5">Horodatage</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Auteur</th>
                <th className="p-3.5">Cible &amp; Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/60 font-sans">
                  <td className="p-3.5 text-stone-500 whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-[#125B3E] font-mono text-xs">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-stone-800 text-xs">{log.user?.name || "Système"}</div>
                    <div className="text-[11px] text-stone-400">{log.user?.email || "-"}</div>
                  </td>
                  <td className="p-3.5 text-stone-600">
                    <div className="text-xs font-semibold text-stone-800">
                      {log.targetType} {log.targetId ? `(ID: ${log.targetId.slice(-6)})` : ""}
                    </div>
                    {log.metadata && (
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5 line-clamp-1">
                        {log.metadata}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
