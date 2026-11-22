import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Hammer, Package, AlertTriangle, CheckCircle2, Clock, MapPin, Store } from "lucide-react";
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
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      subOrders: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!artisan) {
    redirect("/atelier/inscription");
  }

  const isPending = artisan.status === "PENDING";
  const isApproved = artisan.status === "APPROVED";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      {/* Header Artisan */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative w-36 h-10">
              <Image src="/images/logo.png" alt="SUNU ARTISANAT" fill className="object-contain" />
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
              <p className="font-bold">Atelier en attente de validation administrative</p>
              <p className="text-amber-800 mt-0.5">
                Conformément à la règle de validation obligatoire, votre atelier et vos futures créations doivent être validés par l&apos;administrateur avant publication dans la boutique publique.
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
                Votre atelier porte le badge officiel « Atelier vérifié ». Vos œuvres validées sont visibles et commandables par les clients.
              </p>
            </div>
          </div>
        )}

        {/* Header Atelier */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#131622]">{artisan.workshopName}</h1>
              {artisan.verified && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E] text-white">
                  ✓ Atelier vérifié
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{artisan.city}, Région de {artisan.region}</span>
              <span>•</span>
              <span>Spécialité : {artisan.specialty}</span>
              <span>•</span>
              <span>{artisan.experienceYears} ans d&apos;expérience</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/atelier/produits/nouveau"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#125B3E] text-white hover:bg-[#0E4831] transition-colors"
            >
              + Nouveau produit
            </Link>
          </div>
        </div>

        {/* Règle #2 : Isolation stricte */}
        <div className="p-4 rounded-xl bg-stone-100/70 border border-stone-200 text-xs text-stone-600">
          <strong>Règle de confidentialité garantie :</strong> En tant qu&apos;artisan, vous ne voyez que les créations, stocks et sous-commandes de votre atelier ({artisan.workshopName}). Les données des autres ateliers vous sont strictement invisibles.
        </div>
      </main>
    </div>
  );
}
