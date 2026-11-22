import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import SunuVoiceBot from "@/components/ai/SunuVoiceBot";
import ProductCard from "@/components/catalogue/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sunu Bot — Assistant IA vocal | Sunu Artisanat",
  description: "Posez votre question à Sunu Bot, votre guide IA pour découvrir l'artisanat sénégalais. Réponses en texte et en voix.",
  robots: "noindex",
};

interface Props {
  searchParams: { q?: string };
}

export default async function AssistantPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() || "";

  // Recherche textuelle de repli si Groq indisponible
  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { technique: { contains: query, mode: "insensitive" } },
            { artisan: { workshopName: { contains: query, mode: "insensitive" } } },
          ],
        },
        take: 6,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          artisan: { select: { workshopName: true, slug: true, region: true, verified: true, isDemo: true } },
          reviews: { select: { rating: true }, where: { isApproved: true } },
          _count: { select: { reviews: true } },
        },
      })
    : [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Assistant Sunu Bot</span>
      </nav>

      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 rounded-2xl bg-[#125B3E] text-white flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
          🤖
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
          Sunu Bot — Votre guide artisanal
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Posez votre question sur les créations artisanales sénégalaises : matières, régions d'origine, techniques, artisans, prix. Sunu Bot vous guide par voix et par texte.
        </p>
      </div>

      {/* Composant assistant IA vocal */}
      <div className="mb-10">
        <SunuVoiceBot />
      </div>

      {/* Recherche textuelle de repli */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <span>🔍</span> Recherche textuelle directe
          <span className="text-xs font-normal text-stone-400 ml-2">(repli si l'assistant IA est indisponible)</span>
        </h2>
        <form method="GET" action="/assistant" className="flex gap-2 mb-6">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Ex: sac cuir Thiès, poterie Casamance, bijou filigrane..."
            className="flex-1 border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E]"
            style={{ fontSize: "16px" }}
          />
          <button
            type="submit"
            className="bg-[#125B3E] text-white px-5 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition min-h-[48px]"
          >
            Chercher
          </button>
        </form>

        {query && (
          <div>
            <p className="text-sm text-stone-600 mb-4">
              <strong>{products.length}</strong> création{products.length > 1 ? "s" : ""} trouvée{products.length > 1 ? "s" : ""} pour « {query} »
            </p>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-stone-400 text-sm mb-4">Aucun résultat. Essayez des mots-clés différents.</p>
                <Link href="/boutique" className="text-sm text-[#125B3E] hover:underline font-semibold">
                  Parcourir toute la boutique →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((p) => {
                  const avgRating =
                    p.reviews.length > 0
                      ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
                      : undefined;
                  return (
                    <ProductCard
                      key={p.id}
                      slug={p.slug}
                      title={p.title}
                      priceFCFA={p.priceFCFA}
                      imageUrl={p.images[0]?.url}
                      workshopName={p.artisan.workshopName}
                      artisanSlug={p.artisan.slug}
                      region={p.originRegion || p.artisan.region}
                      avgRating={avgRating}
                      reviewCount={p._count.reviews}
                      isDemo={p.isDemo}
                      isVerified={p.artisan.verified}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center text-stone-400 text-sm py-4">
            Entrez un mot-clé pour lancer une recherche directe dans le catalogue.
          </div>
        )}
      </div>
    </main>
  );
}
