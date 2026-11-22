import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/catalogue/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });
  if (!category) return { title: "Catégorie introuvable" };
  return {
    title: `${category.name} — Créations artisanales du Sénégal | Sunu Artisanat`,
    description: category.description ?? `Découvrez les créations artisanales de la catégorie ${category.name} au Sénégal.`,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          artisan: { select: { workshopName: true, slug: true, region: true, verified: true, isDemo: true } },
          reviews: { select: { rating: true }, where: { isApproved: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 w-full">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <Link href="/categories" className="hover:underline">Catégories</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">{category.name}</span>
      </nav>

      {/* Bannière de la catégorie */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#125B3E] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFB800] bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
            Filière artisanale
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-4">{category.name}</h1>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
            {category.description ?? "Découvrez notre sélection de créations artisanales certifiées par des maîtres artisans d'exception."}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <span className="text-xs bg-white/20 text-white px-3 py-1.5 rounded-full font-medium">
              {category.products.length} création{category.products.length > 1 ? "s" : ""} disponible{category.products.length > 1 ? "s" : ""}
            </span>
            <Link
              href={`/boutique?categorie=${category.slug}`}
              className="text-xs text-[#FFB800] hover:underline font-semibold"
            >
              Voir avec tous les filtres avancés →
            </Link>
          </div>
        </div>
      </div>

      {/* Grille des produits de la catégorie */}
      {category.products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-base mb-4">
            Aucun produit n'est actuellement publié dans la catégorie {category.name}.
          </p>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 bg-[#125B3E] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90"
          >
            Explorer toute la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.products.map((p) => {
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
