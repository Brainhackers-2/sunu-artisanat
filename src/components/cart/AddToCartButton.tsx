"use client";

import { useState } from "react";
import { addToCartAction } from "@/actions/cart";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Loader2 } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  compact?: boolean;
}

export default function AddToCartButton({
  productId,
  stock,
  compact = false,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (stock <= 0) {
    return (
      <button
        disabled
        className={`${
          compact
            ? "px-3 py-1.5 text-xs rounded-xl"
            : "w-full py-3 px-6 text-base rounded-xl min-h-[52px]"
        } bg-stone-100 text-stone-400 font-bold cursor-not-allowed`}
      >
        Épuisé
      </button>
    );
  }

  const handleAdd = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await addToCartAction(productId, 1);
      if (!res.success) {
        setError(res.error ?? "Erreur lors de l'ajout au panier");
      } else {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 2000);
      }
    } catch {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div>
        <button
          onClick={handleAdd}
          disabled={loading}
          aria-label="Ajouter au panier"
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] flex items-center gap-1.5 shadow-xs ${
            added
              ? "bg-[#125B3E] text-white"
              : "bg-[#FFB800] text-[#131622] hover:bg-[#E5A700] active:scale-95"
          } disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : added ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Ajouté !</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </>
          )}
        </button>
        {error && <p className="text-[10px] text-rose-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleAdd()}
          disabled={loading}
          className={`flex-1 font-bold py-3 px-6 rounded-xl transition min-h-[52px] text-base flex items-center justify-center gap-2 ${
            added
              ? "bg-[#125B3E] text-white"
              : "bg-[#125B3E] text-white hover:bg-[#0E4831] active:scale-[0.99]"
          } disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
          className="bg-[#C2410C] text-white font-bold py-3 px-5 rounded-xl hover:bg-[#9A3412] transition min-h-[52px] text-sm whitespace-nowrap"
        >
          Commander
        </button>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
