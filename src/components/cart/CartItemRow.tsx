"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { updateCartItemQuantityAction, removeCartItemAction } from "@/actions/cart";
import { useRouter } from "next/navigation";

interface CartItemProps {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    slug: string;
    priceFCFA: number;
    images: { url: string }[];
    artisan: {
      workshopName: string;
      region: string;
      slug: string;
      isDemo: boolean;
    };
    inventory: {
      quantity: number;
    } | null;
  };
}

export default function CartItemRow({ item }: { item: CartItemProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const maxStock = item.product.inventory?.quantity ?? 0;

  const handleUpdate = async (qty: number) => {
    setLoading(true);
    await updateCartItemQuantityAction(item.id, qty);
    router.refresh();
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeCartItemAction(item.id);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 items-center">
      {/* Image */}
      <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
        {item.product.images[0] ? (
          <Image
            src={item.product.images[0].url}
            alt={item.product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🧵</div>
        )}
      </div>

      {/* Détails */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/boutique/${item.product.slug}`}
          className="font-bold text-gray-900 text-sm hover:text-[var(--color-primary)] truncate block"
        >
          {item.product.title}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">
          Atelier :{" "}
          <Link href={`/artisans/${item.product.artisan.slug}`} className="hover:underline">
            {item.product.artisan.workshopName} ({item.product.artisan.region})
          </Link>
        </p>
        <p className="font-bold text-[var(--color-primary)] text-sm mt-1">
          {item.product.priceFCFA.toLocaleString("fr-FR")} FCFA
        </p>
      </div>

      {/* Quantité & Supprimer */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => handleUpdate(item.quantity - 1)}
            disabled={loading}
            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 min-h-[36px] min-w-[36px] text-sm font-bold"
          >
            -
          </button>
          <span className="px-3 text-sm font-semibold text-gray-800">{item.quantity}</span>
          <button
            onClick={() => handleUpdate(item.quantity + 1)}
            disabled={loading || item.quantity >= maxStock}
            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 min-h-[36px] min-w-[36px] text-sm font-bold"
          >
            +
          </button>
        </div>

        <button
          onClick={handleRemove}
          disabled={loading}
          className="text-xs text-red-500 hover:text-red-700 transition"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
