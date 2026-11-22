import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateProductForm from "@/components/atelier/CreateProductForm";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AtelierNouveauProduitPage() {
  const user = await getSessionUser();
  if (!user || !user.artisanProfileId) {
    redirect("/atelier/connexion?error=ArtisanAccessRequired");
  }

  const [categories, artisan] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.artisanProfile.findUnique({ where: { id: user.artisanProfileId } }),
  ]);

  if (!artisan) {
    redirect("/atelier/inscription");
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/atelier"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#125B3E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#125B3E]/10 text-[#125B3E]">
            {artisan.workshopName}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131622]">
            Soumettre une nouvelle création
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Remplissez les détails techniques et photographies de votre œuvre d&apos;art. Elle sera soumise à l&apos;approbation de l&apos;administrateur avant sa mise en ligne.
          </p>
        </div>

        {/* Rappel règle CDC validation */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Processus de vérification et traçabilité :</p>
            <p className="text-blue-800 mt-0.5">
              Conformément à la règle n°7 du cahier des charges, chaque création est d&apos;abord enregistrée en statut de vérification. Dès validation par l&apos;équipe administrative, un passeport digital avec QR Code unique sera généré pour votre pièce.
            </p>
          </div>
        </div>

        <CreateProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          defaultRegion={artisan.region ?? "Thiès"}
        />
      </main>
    </div>
  );
}
