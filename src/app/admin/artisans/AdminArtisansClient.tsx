"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Check,
  X,
  PauseCircle,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  AlertOctagon,
} from "lucide-react";
import { updateArtisanStatusAction } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface ArtisanItem {
  id: string;
  workshopName: string;
  slug: string;
  specialty: string;
  city: string;
  region: string;
  phone: string;
  status: string;
  isDemo: boolean;
  user: {
    name: string | null;
    email: string | null;
  };
  products: { id: string }[];
}

export default function AdminArtisansClient({
  artisans,
}: {
  artisans: ArtisanItem[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleStatusChange = async (
    artisanId: string,
    newStatus: "APPROVED" | "REJECTED" | "SUSPENDED",
    reason?: string
  ) => {
    setLoadingId(artisanId);
    try {
      const res = await updateArtisanStatusAction(
        artisanId,
        newStatus,
        reason
      );
      if (!res.success) {
        alert(res.error || "Une erreur est survenue");
      } else {
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#131622]">
            Tableau d&apos;Homologation des Ateliers
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Validation administrative obligatoire avant publication des œuvres dans la marketplace (Règle non négociable 7).
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-200">
          Total : {artisans.length} atelier(s)
        </span>
      </div>

      {/* Tableau d'Homologation des Ateliers */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Atelier</th>
                <th className="p-4">Maître Artisan</th>
                <th className="p-4">Localisation</th>
                <th className="p-4">Savoir-faire</th>
                <th className="p-4 text-center">Créations</th>
                <th className="p-4">Statut Certification</th>
                <th className="p-4 text-right">Décision Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {artisans.map((artisan) => {
                const isApproved = artisan.status === "APPROVED";
                const isPending = artisan.status === "PENDING";
                const isSuspended = artisan.status === "SUSPENDED";
                const isBusy = loadingId === artisan.id;

                return (
                  <tr key={artisan.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* 1. Atelier */}
                    <td className="p-4">
                      <div className="font-bold text-sm text-[#131622]">
                        {artisan.workshopName}
                      </div>
                      {artisan.isDemo && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
                          Démo
                        </span>
                      )}
                    </td>

                    {/* 2. Maître Artisan */}
                    <td className="p-4">
                      <div className="font-bold text-stone-800">
                        {artisan.user.name || "Artisan Partenaire"}
                      </div>
                      <div className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{artisan.phone}</span>
                      </div>
                    </td>

                    {/* 3. Localisation */}
                    <td className="p-4">
                      <div className="font-medium text-stone-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {artisan.city} ({artisan.region})
                        </span>
                      </div>
                    </td>

                    {/* 4. Savoir-faire */}
                    <td className="p-4">
                      <span className="font-semibold text-[#C2410C]">
                        {artisan.specialty}
                      </span>
                    </td>

                    {/* 5. Nombre de créations */}
                    <td className="p-4 text-center font-bold text-stone-800">
                      {artisan.products.length}
                    </td>

                    {/* 6. Statut de certification avec badges officiels */}
                    <td className="p-4">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>✓ Certifié &amp; Validé</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>⏳ En attente d&apos;examen</span>
                        </span>
                      )}
                      {isSuspended && (
                        <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                          <span>Suspendu</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Décision Admin (Bouton vert "Valider", gris "Refuser", rouge "Suspendre", Œil) */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Bouton Œil : Ouvre directement la vitrine officielle de l'artisan dans un nouvel onglet sans 404 */}
                        <Link
                          href={`/artisan/${artisan.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Ouvrir la vitrine officielle de l'artisan dans un nouvel onglet"
                          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Bouton vert "Valider" */}
                        {!isApproved && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleStatusChange(artisan.id, "APPROVED")
                            }
                            title="Valider et certifier l'atelier"
                            className="px-3 py-1.5 rounded-xl bg-[#125B3E] hover:bg-[#0E4831] text-white font-bold text-xs inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            {isBusy ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Valider</span>
                          </button>
                        )}

                        {/* Bouton gris "Refuser" */}
                        {isPending && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setRejectingId(artisan.id)}
                            title="Refuser avec motif obligatoire"
                            className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Refuser</span>
                          </button>
                        )}

                        {/* Bouton rouge "Suspendre" */}
                        {isApproved && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleStatusChange(artisan.id, "SUSPENDED")
                            }
                            title="Suspendre l'atelier"
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Suspendre</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de motif obligatoire lors d'un refus */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-black text-base text-[#131622]">
              Motif du Refus d&apos;Homologation
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Conformément à la règle n°7 du cahier des charges, un motif clair est obligatoirement communiqué à l&apos;artisan pour lui permettre d&apos;ajuster sa candidature.
            </p>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="ex: Justificatifs d'atelier incomplets ou photos non conformes..."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#125B3E]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={rejectReason.trim().length < 5 || loadingId !== null}
                onClick={() =>
                  handleStatusChange(rejectingId, "REJECTED", rejectReason)
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
