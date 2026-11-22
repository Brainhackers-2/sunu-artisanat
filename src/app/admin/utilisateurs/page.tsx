import { prisma } from "@/lib/prisma";
import { CreateEditorForm } from "@/components/admin/CreateEditorForm";
import { Users, Shield, Calendar } from "lucide-react";

export default async function AdminUtilisateursPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      roles: true,
      artisanProfile: { select: { workshopName: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#8C6400] mb-2">
          Opération CR4 #1
        </div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Users className="w-5 h-5 text-[#125B3E]" /> Gestion des Utilisateurs &amp; Création de Compte Éditeur
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Attribuez les rôles selon la section 4. L&apos;administrateur crée des comptes Éditeur pour la gestion éditoriale sans accès financier.
        </p>
      </div>

      <CreateEditorForm />

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Comptes existants ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase text-[11px]">
                <th className="p-3.5">Nom &amp; Coordonnées</th>
                <th className="p-3.5">Rôles attribués</th>
                <th className="p-3.5">Atelier associé</th>
                <th className="p-3.5">Date d&apos;inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50/60">
                  <td className="p-3.5">
                    <div className="font-bold text-stone-900">{u.name || "Sans nom"}</div>
                    <div className="text-stone-500 mt-0.5">{u.email}</div>
                    <div className="text-stone-400 text-[11px]">{u.phone}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => (
                        <span
                          key={r.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.role === "SUPERADMIN"
                              ? "bg-purple-100 text-purple-900"
                              : r.role === "ADMIN"
                              ? "bg-blue-100 text-blue-900"
                              : r.role === "EDITOR"
                              ? "bg-amber-100 text-amber-900"
                              : r.role === "ARTISAN"
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {r.role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 text-stone-600">
                    {u.artisanProfile?.workshopName ? (
                      <span className="font-semibold text-stone-900">
                        {u.artisanProfile.workshopName}
                      </span>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                  <td className="p-3.5 text-stone-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString("fr-FR")}
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
