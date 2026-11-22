import { prisma } from "@/lib/prisma";
import { ArtisanActionButtons } from "@/components/admin/ArtisanActionButtons";
import { MapPin, Phone, CheckCircle2, Clock, XCircle, PauseCircle } from "lucide-react";

export default async function AdminArtisansPage() {
  const artisans = await prisma.artisanProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      products: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#131622]">Validation &amp; Gestion des Ateliers</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Validation administrative obligatoire avant publication des œuvres dans la marketplace.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
          Total : {artisans.length} atelier(s)
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-4">Atelier &amp; Responsable</th>
                <th className="p-4">Localisation &amp; Spécialité</th>
                <th className="p-4">Statut &amp; Badge</th>
                <th className="p-4">Créations</th>
                <th className="p-4 text-right">Actions (Valider / Refuser / Œil)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {artisans.map((artisan) => {
                const isApproved = artisan.status === "APPROVED";
                const isPending = artisan.status === "PENDING";
                const isRejected = artisan.status === "REJECTED";
                const isSuspended = artisan.status === "SUSPENDED";

                return (
                  <tr key={artisan.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#131622]">{artisan.workshopName}</div>
                      <div className="text-stone-500 mt-0.5">{artisan.user.name}</div>
                      <div className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {artisan.phone}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-stone-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" /> {artisan.city} ({artisan.region})
                      </div>
                      <div className="text-stone-500 mt-0.5">{artisan.specialty}</div>
                      <div className="text-stone-400 text-[11px]">{artisan.experienceYears} ans d&apos;expérience</div>
                    </td>

                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validé &amp; Vérifié
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> En attente
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-red-800 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5 text-red-600" /> Refusé
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center gap-1 text-stone-800 bg-stone-200 px-2 py-0.5 rounded-full">
                            <PauseCircle className="w-3.5 h-3.5 text-stone-600" /> Suspendu
                          </span>
                        )}
                      </div>
                      {artisan.isDemo && (
                        <span className="block mt-1 text-[10px] text-stone-400 font-mono">isDemo: true</span>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-stone-700">
                      {artisan.products.length} œuvre(s)
                    </td>

                    <td className="p-4 text-right">
                      <ArtisanActionButtons
                        artisanId={artisan.id}
                        artisanSlug={artisan.slug}
                        currentStatus={artisan.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
