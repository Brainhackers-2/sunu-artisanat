"use client";

import { useState } from "react";
import { createArtisanPayoutAction } from "@/actions/payment";
import { useRouter } from "next/navigation";

interface PayoutFormProps {
  artisans: {
    id: string;
    workshopName: string;
    region: string;
    phone: string;
  }[];
}

export default function PayoutForm({ artisans }: PayoutFormProps) {
  const [selectedArtisanId, setSelectedArtisanId] = useState(artisans[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Wave");
  const [phone, setPhone] = useState(artisans[0]?.phone ?? "");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleArtisanChange = (id: string) => {
    setSelectedArtisanId(id);
    const art = artisans.find((a) => a.id === id);
    if (art) setPhone(art.phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const res = await createArtisanPayoutAction({
      artisanProfileId: selectedArtisanId,
      amountFCFA: parseInt(amount, 10),
      method,
      recipientPhone: phone,
      reference: reference.trim() || undefined,
    });

    if (!res.success) {
      setError(res.error ?? "Erreur lors de l'enregistrement");
    } else {
      setMsg("Reversement enregistré et notifié à l'artisan !");
      setAmount("");
      setReference("");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
      <h2 className="font-bold text-gray-900 text-sm">Effectuer un reversement manuel</h2>

      {msg && <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-lg">{msg}</p>}
      {error && <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Artisan bénéficiaire *</label>
          <select
            value={selectedArtisanId}
            onChange={(e) => handleArtisanChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
          >
            {artisans.map((a) => (
              <option key={a.id} value={a.id}>
                {a.workshopName} ({a.region})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Montant net (FCFA) *</label>
          <input
            type="number"
            required
            min="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex: 45000"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Canal de paiement *</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white"
          >
            <option value="Wave">Wave</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Virement bancaire">Virement bancaire</option>
            <option value="Espèces">Espèces / Remise directe</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro du destinataire *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Référence transaction (ex: ID Wave / Virement)</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ex: WV-2026-981248"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto self-start bg-[var(--color-primary)] text-white font-bold py-2.5 px-6 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Enregistrement..." : "Valider le reversement"}
      </button>
    </form>
  );
}
