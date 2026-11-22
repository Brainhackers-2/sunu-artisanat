import { prisma } from "@/lib/prisma";
import { requireAuthWithRole } from "@/lib/permissions";
import PayoutForm from "@/components/admin/PayoutForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminReversementsPage() {
  await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

  const [payouts, artisans] = await Promise.all([
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        artisan: {
          select: {
            workshopName: true,
            city: true,
            region: true,
            slug: true,
          },
        },
      },
      take: 50,
    }),
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        workshopName: true,
        region: true,
        phone: true,
      },
      orderBy: { workshopName: "asc" },
    }),
  ]);

  const totalReverse = payouts.reduce((acc, p) => acc + p.amountFCFA, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reversements Artisans</h1>
          <p className="text-sm text-gray-500">
            Gestion des versements des parts nettes aux artisans partenaires.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-green-700">Total reversé</p>
          <p className="text-lg font-black text-green-900">{totalReverse.toLocaleString("fr-FR")} FCFA</p>
        </div>
      </div>

      {/* Formulaire de création */}
      <PayoutForm artisans={artisans} />

      {/* Historique des versements */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-sm">Historique des versements</h2>
        </div>

        {payouts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Aucun reversement enregistré pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Artisan</th>
                  <th className="py-3 px-4">Montant</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Destinataire</th>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <Link href={`/artisans/${p.artisan.slug}`} className="hover:underline">
                        {p.artisan.workshopName}
                      </Link>
                      <span className="text-xs text-gray-400 block">{p.artisan.region}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {p.amountFCFA.toLocaleString("fr-FR")} FCFA
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{p.method}</td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-600">{p.recipientPhone}</td>
                    <td className="py-3 px-4 text-xs font-mono text-gray-400">
                      {p.reference ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-green-100 text-green-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        Effectué
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
