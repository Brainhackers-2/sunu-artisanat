import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ProductCard from "@/components/catalogue/ProductCard";
import CategoryGrid from "@/components/catalogue/CategoryGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique — Artisanat d'art sénégalais | Sunu Artisanat",
  description:
    "Découvrez les créations authentiques des artisans sénégalais de Thiès, Dakar, Casamance et Saint-Louis.",
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: {
    categorie?: string;
    region?: string;
    tri?: string;
    page?: string;
  };
}

const REGIONS = ["Thiès", "Dakar", "Casamance", "Saint-Louis", "Autre"];
const TRIS = [
  { value: "recent", label: "Plus récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

export default async function BoutiquePage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  type OrderBy = { priceFCFA?: "asc" | "desc" } | { createdAt?: "asc" | "desc" };
  let orderBy: OrderBy = { createdAt: "desc" };
  if (searchParams.tri === "prix-asc") orderBy = { priceFCFA: "asc" };
  if (searchParams.tri === "prix-desc") orderBy = { priceFCFA: "desc" };

  const where = {
    status: "PUBLISHED" as const,
    ...(searchParams.categorie
      ? { category: { slug: searchParams.categorie } }
      : {}),
    ...(searchParams.region
      ? { artisan: { region: searchParams.region } }
      : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artisan: { select: { workshopName: true, slug: true, region: true, verified: true, isDemo: true } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const catList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    productCount: c._count.products,
  }));

  const buildQuery = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(searchParams.categorie ? { categorie: searchParams.categorie } : {}),
      ...(searchParams.region ? { region: searchParams.region } : {}),
      ...(searchParams.tri ? { tri: searchParams.tri } : {}),
      page: "1",
      ...overrides,
    });
    return `/boutique?${params.toString()}`;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Boutique</h1>
      <p className="text-gray-500 mb-8">
        {total} produit{total !== 1 ? "s" : ""} d'artisanat d'art sénégalais
      </p>

      {/* Catégories */}
      {!searchParams.categorie && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Catégories</h2>
          <CategoryGrid categories={catList} />
        </section>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {searchParams.categorie && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Catégorie :</span>
            <span className="bg-[var(--color-primary)] text-white text-sm px-3 py-1 rounded-full">
              {catList.find((c) => c.slug === searchParams.categorie)?.name ?? searchParams.categorie}
            </span>
            <Link href={buildQuery({ categorie: "" })} className="text-xs text-red-500 hover:underline">
              ✕ Retirer
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Région :</span>
          {["", ...REGIONS].map((r) => (
            <Link
              key={r}
              href={buildQuery({ region: r })}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                (searchParams.region ?? "") === r
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "border-gray-200 hover:border-gray-400 text-gray-600"
              }`}
            >
              {r || "Toutes"}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Trier :</span>
          {TRIS.map((t) => (
            <Link
              key={t.value}
              href={buildQuery({ tri: t.value })}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                (searchParams.tri ?? "recent") === t.value
                  ? "bg-gray-900 text-white border-transparent"
                  : "border-gray-200 hover:border-gray-400 text-gray-600"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg">Aucun produit trouvé pour ces filtres.</p>
          <Link href="/boutique" className="mt-4 inline-block text-[var(--color-primary)] hover:underline">
            Voir tous les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => {
            const avgRating =
              p.reviews.length > 0
                ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                : undefined;
            return (
              <ProductCard
                key={p.id}
                slug={p.slug}
                title={p.title}
                priceFCFA={p.priceFCFA}
                imageUrl={p.images[0]?.url ?? null}
                workshopName={p.artisan.workshopName}
                artisanSlug={p.artisan.slug}
                region={p.artisan.region}
                avgRating={avgRating}
                reviewCount={p._count.reviews}
                isVerified={p.artisan.verified}
                isDemo={p.artisan.isDemo}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2 mt-10" aria-label="Pagination">
          {page > 1 && (
            <Link href={buildQuery({ page: String(page - 1) })} className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm">
              ← Précédent
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildQuery({ page: String(p) })}
              className={`px-4 py-2 rounded-lg border text-sm transition ${
                p === page ? "bg-[var(--color-primary)] text-white border-transparent" : "hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={buildQuery({ page: String(page + 1) })} className="px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm">
              Suivant →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}
