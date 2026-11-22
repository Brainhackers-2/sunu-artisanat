import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/catalogue/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recherche de créations et artisans | Sunu Artisanat",
  description: "Recherchez parmi l'artisanat d'art sénégalais : cuir de Thiès, bijoux filigrane de Dakar, poterie de Casamance, tissage Manjak.",
};

interface Props {
  searchParams: { q?: string; region?: string; categorie?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() || "";
  const region = searchParams.region?.trim() || "";
  const categorySlug = searchParams.categorie?.trim() || "";

  // Conditions de recherche
  const whereClause: any = {
    status: "PUBLISHED",
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { technique: { contains: query, mode: "insensitive" } },
      { artisan: { workshopName: { contains: query, mode: "insensitive" } } },
    ];
  }

  if (region) {
    whereClause.originRegion = { contains: region, mode: "insensitive" };
  }

  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artisan: { select: { workshopName: true, slug: true, region: true, verified: true, isDemo: true } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.category.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-4">
          Recherche d'œuvres &amp; Ateliers
        </h1>
        <p className="text-sm text-stone-600 mb-6">
          Trouvez une création par matière, région sénégalaise, technique ou nom d'atelier.
        </p>

        {/* Formulaire de recherche */}
        <form method="GET" action="/recherche" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Ex: Sac cuir Thiès, filigrane argent, poterie..."
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#125B3E] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition min-h-[44px]"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Filtres rapides */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <span className="text-xs font-semibold text-stone-500 mr-2">Savoir-faire :</span>
        <Link
          href="/recherche"
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            !categorySlug ? "bg-[#125B3E] text-white border-[#125B3E]" : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
          }`}
        >
          Tous
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/recherche?categorie=${c.slug}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              categorySlug === c.slug
                ? "bg-[#125B3E] text-white border-[#125B3E]"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Résultats */}
      <div className="mb-4 flex items-center justify-between text-sm text-stone-600 border-b border-stone-200 pb-3">
        <span>
          <strong>{products.length}</strong> résultat{products.length > 1 ? "s" : ""}{" "}
          {query ? `pour « ${query} »` : ""}
        </span>
        {(query || categorySlug || region) && (
          <Link href="/recherche" className="text-xs text-[#C2410C] hover:underline">
            Réinitialiser la recherche
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-600 mb-2 font-medium">Aucune création ne correspond à votre recherche.</p>
          <p className="text-stone-400 text-xs mb-6">Essayez avec des termes plus généraux ou découvrez l'ensemble de notre catalogue.</p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#125B3E] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90"
          >
            Parcourir toute la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
    </main>
  );
}
