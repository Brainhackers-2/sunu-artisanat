"use client";

import { useState } from "react";
import { confirmPaymentAction, cancelOrExpirePaymentAction } from "@/actions/payment";
import { useRouter } from "next/navigation";

interface PaymentActionPanelProps {
  orderId: string;
  orderNumber: string;
  totalAmountFCFA: number;
  paymentStatus: string;
  isSimulated: boolean;
}

export default function PaymentActionPanel({
  orderId,
  orderNumber,
  totalAmountFCFA,
  paymentStatus,
  isSimulated,
}: PaymentActionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    const res = await confirmPaymentAction(orderId);
    if (!res.success) {
      setError(res.error ?? "Erreur lors du paiement");
    } else {
      setMsg("Paiement validé avec succès !");
      router.refresh();
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm("Voulez-vous vraiment annuler cette commande et libérer le stock réservé ?")) {
      return;
    }
    setLoading(true);
    setError(null);
    const res = await cancelOrExpirePaymentAction(orderId);
    if (!res.success) {
      setError(res.error ?? "Erreur lors de l'annulation");
    } else {
      setMsg("Commande annulée et stock libéré.");
      router.refresh();
    }
    setLoading(false);
  };

  if (paymentStatus === "PAID" || paymentStatus === "SIMULATED") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold text-green-900 text-sm">Paiement confirmé</p>
            <p className="text-xs text-green-700">
              {isSimulated ? "Règlement en mode SIMULATION" : "Règlement validé par passerelle"} —{" "}
              {totalAmountFCFA.toLocaleString("fr-FR")} FCFA
            </p>
          </div>
        </div>
        {isSimulated && (
          <span className="bg-yellow-100 text-yellow-800 text-[11px] font-bold px-2 py-1 rounded-md uppercase">
            Simulation
          </span>
        )}
      </div>
    );
  }

  if (paymentStatus === "FAILED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-sm">
        <span className="text-2xl">❌</span>
        <div>
          <p className="font-bold">Commande ou paiement annulé</p>
          <p className="text-xs text-red-600">Le stock a été remis en disponible pour les autres clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <span>⏳</span> En attente de règlement
          </h3>
          <p className="text-xs text-amber-700 mt-0.5">
            Votre stock est actuellement <strong>réservé</strong>. Veuillez procéder au paiement pour
            transmettre la commande aux ateliers.
          </p>
        </div>
        {isSimulated && (
          <span className="bg-yellow-200 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
            Mode Simulation
          </span>
        )}
      </div>

      {msg && <p className="text-xs text-green-700 font-semibold">{msg}</p>}
      {error && <p className="text-xs text-red-700 font-semibold">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={handlePay}
          disabled={loading}
          className="flex-1 bg-[var(--color-primary)] text-white font-bold py-2.5 px-4 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 min-h-[44px]"
        >
          {loading ? "Traitement..." : `Payer ${totalAmountFCFA.toLocaleString("fr-FR")} FCFA (Simulation)`}
        </button>

        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-white border border-gray-200 text-red-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-red-50 transition text-sm disabled:opacity-50 min-h-[44px]"
        >
          Annuler & Libérer le stock
        </button>
      </div>
    </div>
  );
}
