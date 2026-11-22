import { getCart } from "@/actions/cart";
import { getSessionUser } from "@/lib/permissions";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finaliser ma commande | Sunu Artisanat",
  description: "Livraison d'artisanat d'art sénégalais et paiement sécurisé.",
};

export default async function CommandePage() {
  const [cart, user] = await Promise.all([getCart(), getSessionUser()]);

  if (cart.items.length === 0) {
    redirect("/panier");
  }

  // Nombre d'artisans distincts
  const uniqueArtisans = new Set(cart.items.map((i) => i.product.artisanProfileId));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Validation de la commande</h1>
      <p className="text-sm text-gray-500 mb-8">
        Renseignez vos coordonnées de livraison pour recevoir vos créations sénégalaises.
      </p>

      <CheckoutForm
        totalSubTotalFCFA={cart.totalAmountFCFA}
        artisansCount={uniqueArtisans.size}
        initialData={{
          name: user?.name ?? undefined,
          email: user?.email ?? undefined,
          phone: user?.phone ?? undefined,
        }}
      />
    </main>
  );
}
