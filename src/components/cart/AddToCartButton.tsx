"use client";

import { useState } from "react";
import { addToCartAction } from "@/actions/cart";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-200 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed min-h-[52px] text-base"
      >
        Rupture de stock
      </button>
    );
  }

  const handleAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await addToCartAction(productId, 1);
      if (!res.success) {
        setError(res.error ?? "Erreur lors de l'ajout au panier");
      } else {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 2500);
      }
    } catch {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading}
          className={`flex-1 font-bold py-3 px-6 rounded-xl transition min-h-[52px] text-base flex items-center justify-center gap-2 ${
            added
              ? "bg-green-600 text-white"
              : "bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-[0.99]"
          } disabled:opacity-50`}
        >
          {loading ? (
            <span className="inline-block animate-spin mr-2">⏳</span>
          ) : added ? (
            <>✓ Ajouté au panier !</>
          ) : (
            <>Ajouter au panier</>
          )}
        </button>

        <button
          onClick={async () => {
            await handleAdd();
            router.push("/panier");
          }}
          disabled={loading}
          className="bg-amber-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-amber-700 transition min-h-[52px] text-sm whitespace-nowrap"
        >
          Commander
        </button>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
