import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Store,
  ShoppingBag,
  Coins,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AtelierDashboardPage() {
  const user = await getSessionUser();
  if (!user || !user.roles.includes("ARTISAN")) {
    redirect("/atelier/connexion?error=ArtisanAccessRequired");
  }

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: user.id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: {
          inventory: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      },
      subOrders: {
        orderBy: { createdAt: "desc" },
        include: {
          order: true,
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!artisan) {
    redirect("/atelier/inscription");
  }

  const isPending = artisan.status === "PENDING";
  const isApproved = artisan.status === "APPROVED";

  // Statistiques atelier
  const totalRevenueFCFA = artisan.subOrders
    .filter((s) => s.status !== "REJECTED" && s.status !== "CANCELLED")
    .reduce((acc, s) => acc + s.artisanPartFCFA, 0);

  const urgentOrders = artisan.subOrders.filter(
    (s) => s.status === "PAID" || s.status === "ACCEPTED"
  );

  const lowStockProducts = artisan.products.filter(
    (p) => (p.inventory?.quantity ?? 0) <= 2
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      {/* Header Artisan */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative w-36 h-10">
              <Image
                src="/images/logo.png"
                alt="SUNU ARTISANAT"
                fill
                className="object-contain"
              />
            </Link>
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-[#125B3E]/10 text-[#125B3E]">
              Espace Atelier
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/artisans/${artisan.slug}`}
              className="text-xs font-semibold text-stone-600 hover:text-[#125B3E] hidden md:inline-flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" /> Voir ma vitrine publique
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Statut de validation de l'atelier */}
        {isPending && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">
                Atelier en attente de validation administrative
              </p>
              <p className="text-amber-800 mt-0.5">
                Conformément à la règle de validation obligatoire (Section 7 du
                CDC), votre atelier et vos créations doivent être validés par
                l&apos;administrateur avant publication dans la boutique
                publique.
              </p>
            </div>
          </div>
        )}

        {isApproved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-bold">Atelier vérifié et approuvé</p>
              <p className="text-emerald-800 mt-0.5">
                Votre atelier porte le badge officiel « Atelier vérifié ». Vos
                œuvres validées sont visibles et commandables par les clients.
              </p>
            </div>
          </div>
        )}

        {/* Header Atelier */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#131622]">
                {artisan.workshopName}
              </h1>
              {artisan.verified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E] text-white">
                  ✓ Atelier vérifié
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>
                {artisan.city}, Région de {artisan.region}
              </span>
              <span>•</span>
              <span>Spécialité : {artisan.specialty}</span>
              <span>•</span>
              <span>{artisan.experienceYears} ans d&apos;expérience</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/atelier/produits/nouveau"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#125B3E] text-white hover:bg-[#0E4831] transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouveau produit</span>
            </Link>
            <Link
              href="/atelier/produits"
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
            >
              Gérer mes produits
            </Link>
          </div>
        </div>

        {/* Section CDC 8.4 : Carte "À traiter" en premier si urgente */}
        {urgentOrders.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <Clock className="w-5 h-5 text-blue-700 animate-pulse" />
                <span>
                  {urgentOrders.length} commande(s) urgente(s) à traiter
                </span>
              </div>
              <Link
                href="/atelier/commandes"
                className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
              >
                <span>Voir toutes les commandes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {urgentOrders.slice(0, 2).map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-3.5 rounded-xl border border-blue-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono font-bold text-xs text-stone-800">
                      {order.subOrderNumber}
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Client : {order.order.customerName}
                    </p>
                  </div>
                  <Link
                    href={`/atelier/commandes/${order.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#125B3E] text-white text-xs font-semibold hover:bg-[#0E4831]"
                  >
                    Traiter →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats de l'atelier CDC 8.4 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/atelier/commandes"
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#125B3E] transition-all group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#125B3E]/10 text-[#125B3E]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium">
                    Chiffre d&apos;affaires généré
                  </span>
                  <p className="text-lg font-bold text-[#131622]">
                    {totalRevenueFCFA.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#125B3E] transition-colors" />
            </div>
          </Link>

          <Link
            href="/atelier/commandes"
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#125B3E] transition-all group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C2410C]/10 text-[#C2410C]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium">
                    Commandes reçues
                  </span>
                  <p className="text-lg font-bold text-[#131622]">
                    {artisan.subOrders.length}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#C2410C] transition-colors" />
            </div>
          </Link>

          <Link
            href="/atelier/produits"
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#125B3E] transition-all group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFB800]/20 text-[#8C6400]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium">
                    Créations au catalogue
                  </span>
                  <p className="text-lg font-bold text-[#131622]">
                    {artisan.products.length}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#FFB800] transition-colors" />
            </div>
          </Link>
        </div>

        {/* Alertes de stock faible (CDC 8.4) */}
        {lowStockProducts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>
                Alerte de stock faible sur {lowStockProducts.length} création(s)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {lowStockProducts.map((p) => (
                <span
                  key={p.id}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs text-amber-900 font-medium"
                >
                  {p.title} : <strong>{p.inventory?.quantity ?? 0} restant(s)</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Règle #2 : Isolation stricte */}
        <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#125B3E] shrink-0 mt-0.5" />
          <div>
            <strong>Règle de confidentialité garantie (Section 3) :</strong> En tant
            qu&apos;artisan, vous ne voyez que les créations, stocks et
            sous-commandes de votre atelier ({artisan.workshopName}). Les données
            des autres ateliers vous sont strictement invisibles.
          </div>
        </div>
      </main>
    </div>
  );
}
