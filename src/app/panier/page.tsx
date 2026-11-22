import { getCart } from "@/actions/cart";
import CartItemRow from "@/components/cart/CartItemRow";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mon Panier | Sunu Artisanat",
  description: "Consultez vos articles d'artisanat d'art sénégalais et validez votre commande.",
};

export default async function PanierPage() {
  const cart = await getCart();

  if (cart.items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Explorez nos pièces d'artisanat d'art uniques créées par les maîtres artisans du Sénégal.
        </p>
        <Link
          href="/boutique"
          className="inline-flex items-center justify-center bg-[var(--color-primary)] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition min-h-[48px]"
        >
          Découvrir la boutique
        </Link>
      </main>
    );
  }

  // Grouper les articles par artisan pour montrer la transparence multi-artisans
  const groupedByArtisan = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const key = item.product.artisan.workshopName;
    const list = groupedByArtisan.get(key) || [];
    list.push(item);
    groupedByArtisan.set(key, list);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Mon Panier</h1>
      <p className="text-sm text-gray-500 mb-8">
        {cart.itemsCount} article{cart.itemsCount > 1 ? "s" : ""} dans votre panier
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Liste des articles par artisan */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {Array.from(groupedByArtisan.entries()).map(([workshopName, items]) => {
            const artisan = items[0].product.artisan;
            return (
              <div
                key={workshopName}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">{workshopName}</h2>
                    <p className="text-xs text-gray-400">Atelier situé à {artisan.region}</p>
                  </div>
                  {artisan.isDemo && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      🎭 Démo
                    </span>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Récapitulatif commande */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900 text-base">Récapitulatif</h2>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total articles</span>
              <span className="font-bold text-gray-900">
                {cart.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Livraison</span>
              <span className="text-xs text-gray-500 italic">Calculée à l'étape suivante</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-gray-900">Total estimé</span>
              <span className="text-xl font-extrabold text-[var(--color-primary)]">
                {cart.totalAmountFCFA.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-tight">
              Chaque atelier expédie sa partie de la commande directement. Vous recevrez un suivi
              séparé par artisan.
            </p>

            <Link
              href="/commande"
              className="w-full bg-[var(--color-primary)] text-white font-bold py-3.5 px-4 rounded-xl text-center hover:opacity-90 transition min-h-[48px] flex items-center justify-center"
            >
              Passer la commande
            </Link>

            <Link
              href="/boutique"
              className="text-center text-xs text-gray-500 hover:text-gray-800 transition"
            >
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
