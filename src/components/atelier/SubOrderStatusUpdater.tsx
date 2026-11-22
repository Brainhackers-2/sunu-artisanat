"use client";

import { useState } from "react";
import { updateSubOrderStatusAction } from "@/actions/atelier";
import { SubOrderStatus } from "@prisma/client";
import { Loader2, Check, X, Truck, PackageCheck } from "lucide-react";

interface Props {
  subOrderId: string;
  currentStatus: SubOrderStatus;
}

export default function SubOrderStatusUpdater({
  subOrderId,
  currentStatus,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  const handleStatusChange = async (
    newStatus: SubOrderStatus,
    rejectionReason?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateSubOrderStatusAction(
        subOrderId,
        newStatus,
        rejectionReason
      );
      if (!res.success) {
        setError(res.error || "Une erreur est survenue");
      } else {
        setRejectMode(false);
        setReason("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
          {error}
        </div>
      )}

      {rejectMode ? (
        <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-200">
          <label className="block text-xs font-semibold text-rose-900">
            Motif du refus de votre part :
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex : Rupture exceptionnelle de matière première, pièce endommagée..."
            className="w-full text-xs p-2.5 rounded-lg border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleStatusChange(SubOrderStatus.REJECTED, reason)
              }
              disabled={loading || reason.trim().length < 5}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirmer le refus
            </button>
            <button
              onClick={() => setRejectMode(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {(currentStatus === SubOrderStatus.PAID || currentStatus === SubOrderStatus.ACCEPTED) && (
            <>
              <button
                onClick={() =>
                  handleStatusChange(SubOrderStatus.IN_PREPARATION)
                }
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-[#125B3E] text-white text-xs font-semibold hover:bg-[#0E4831] inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Accepter & Commencer la préparation
              </button>

              <button
                onClick={() => setRejectMode(true)}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
                Refuser
              </button>
            </>
          )}

          {currentStatus === SubOrderStatus.IN_PREPARATION && (
            <button
              onClick={() => handleStatusChange(SubOrderStatus.SHIPPED)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Truck className="w-3.5 h-3.5" />
              )}
              Marquer comme Expédiée (Colis remis)
            </button>
          )}

          {currentStatus === SubOrderStatus.SHIPPED && (
            <button
              onClick={() => handleStatusChange(SubOrderStatus.DELIVERED)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PackageCheck className="w-3.5 h-3.5" />
              )}
              Confirmer la livraison finale
            </button>
          )}
        </div>
      )}
    </div>
  );
}
