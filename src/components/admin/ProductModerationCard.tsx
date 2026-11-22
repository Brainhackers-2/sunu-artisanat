"use client";

import { useState } from "react";
import { moderateProductAction } from "@/actions/atelier";
import { useRouter } from "next/navigation";

interface ProductModerationCardProps {
  product: {
    id: string;
    title: string;
    priceFCFA: number;
    originRegion: string;
    technique: string;
    description: string;
    status: string;
    imageUrl?: string | null;
    artisan: {
      workshopName: string;
      region: string;
    };
    category: {
      name: string;
    };
    materials: {
      name: string;
      origin?: string | null;
    }[];
  };
}

export default function ProductModerationCard({ product }: ProductModerationCardProps) {
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    const res = await moderateProductAction(product.id, "APPROVE");
    if (!res.success) setError(res.error ?? "Erreur");
    else router.refresh();
    setLoading(false);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await moderateProductAction(product.id, "REJECT", reason);
    if (!res.success) setError(res.error ?? "Erreur");
    else {
      setRejecting(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex gap-4">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-24 h-24 object-cover rounded-xl border border-gray-100 flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-gray-900 text-base truncate">{product.title}</h3>
            <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">
              {product.status}
            </span>
          </div>

          <p className="text-xs text-gray-500 mt-0.5">
            Atelier : <strong>{product.artisan.workshopName}</strong> ({product.artisan.region}) · Catégorie : {product.category.name}
          </p>

          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
              📍 {product.originRegion}
            </span>
            <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">
              🛠 {product.technique}
            </span>
            {product.materials.map((m, idx) => (
              <span key={idx} className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">
                {m.name} ({m.origin || "Sénégal"})
              </span>
            ))}
          </div>

          <p className="font-bold text-[var(--color-primary)] text-sm mt-3">
            {product.priceFCFA.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg">{error}</p>}

      {!rejecting ? (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-green-700 transition disabled:opacity-50 min-h-[40px]"
          >
            ✓ Valider & Générer le QR Code officiel
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={loading}
            className="px-4 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-xs hover:bg-red-100 transition min-h-[40px]"
          >
            Refuser avec motif
          </button>
        </div>
      ) : (
        <form onSubmit={handleReject} className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-700">
            Motif du refus obligatoire (Règle non négociable 7) :
          </label>
          <input
            type="text"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="ex: Description trop succincte, photo floue ou origine imprécise"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || reason.trim().length < 5}
              className="bg-red-600 text-white font-bold py-1.5 px-4 rounded-xl text-xs hover:bg-red-700 disabled:opacity-50 min-h-[36px]"
            >
              Confirmer le refus
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="bg-gray-100 text-gray-600 py-1.5 px-3 rounded-xl text-xs hover:bg-gray-200 min-h-[36px]"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
