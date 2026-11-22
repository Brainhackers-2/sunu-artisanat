"use client";

import { useState } from "react";
import { updateArtisanStatusAction } from "@/actions/admin";
import { Check, X, Eye, PauseCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  artisanId: string;
  artisanSlug: string;
  currentStatus: string;
}

export function ArtisanActionButtons({ artisanId, artisanSlug, currentStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleStatusChange(newStatus: any, reason?: string) {
    setLoading(true);
    const res = await updateArtisanStatusAction(artisanId, newStatus, reason);
    setLoading(false);
    if (!res.success) {
      alert(res.error || "Une erreur est survenue.");
      return;
    }
    setShowRejectModal(false);
    setRejectionReason("");
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* Bouton Œil pour contrôle qualité visuel */}
      <Link
        href={`/artisans/${artisanSlug}`}
        target="_blank"
        title="Ouvrir la vitrine publique (Contrôle qualité)"
        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
      >
        <Eye className="w-4 h-4" />
      </Link>

      {/* Bouton Valider */}
      {currentStatus !== "APPROVED" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleStatusChange("APPROVED")}
          title="Valider l'artisan (Atelier vérifié)"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#125B3E] hover:bg-[#0E4831] text-white transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          <span>Valider</span>
        </button>
      )}

      {/* Bouton Refuser (avec motif obligatoire) */}
      {currentStatus === "PENDING" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setShowRejectModal(true)}
          title="Refuser avec motif obligatoire"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
          <span>Refuser</span>
        </button>
      )}

      {/* Bouton Suspendre */}
      {currentStatus === "APPROVED" && (
        <button
          type="button"
          disabled={loading}
          onClick={() => handleStatusChange("SUSPENDED")}
          title="Suspendre l'atelier"
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          <span>Suspendre</span>
        </button>
      )}

      {/* Modal de refus avec motif obligatoire */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-[#131622]">
              Motif du refus de candidature
            </h3>
            <p className="text-xs text-stone-500">
              Conformément au cahier des charges, un motif clair et constructif est obligatoirement transmis à l&apos;artisan par notification.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="ex: Justificatifs d'atelier insuffisants ou photos non conformes..."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={loading || rejectionReason.trim().length < 5}
                onClick={() => handleStatusChange("REJECTED", rejectionReason)}
                className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
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
