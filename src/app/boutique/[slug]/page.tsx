import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGallery from "@/components/catalogue/ProductGallery";
import ReviewsList from "@/components/catalogue/ReviewsList";
import RatingStars from "@/components/ui/RatingStars";
import QRBadge from "@/components/ui/QRBadge";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      images: { where: { isPrimary: true }, take: 1 },
      artisan: { select: { workshopName: true, region: true } },
    },
  });
  if (!product) return { title: "Produit introuvable" };

  return {
    title: `${product.title} — ${product.artisan.workshopName} | Sunu Artisanat`,
    description: product.description?.slice(0, 160) ?? `Artisanat d'art sénégalais par ${product.artisan.workshopName}, ${product.artisan.region}.`,
    openGraph: {
      title: `${product.title} | Sunu Artisanat`,
      description: product.description?.slice(0, 160) ?? "",
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug, status: "PUBLISHED" },
    include: {
      images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
      materials: true,
      inventory: true,
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
        take: 20,
      },
      qrCodes: { where: { isActive: true }, take: 1 },
      artisan: true,
      category: true,
    },
  });

  if (!product) notFound();

  const stock = product.inventory?.quantity ?? 0;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  const reviews = product.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    isDemo: r.isDemo,
    author: { name: r.user.name },
  }));

  const qr = product.qrCodes[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images[0]?.url,
    offers: {
      "@type": "Offer",
      price: product.priceFCFA,
      priceCurrency: "XOF",
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
    brand: {
      "@type": "LocalBusiness",
      name: product.artisan.workshopName,
      address: { "@type": "PostalAddress", addressRegion: product.artisan.region, addressCountry: "SN" },
    },
    ...(avgRating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex flex-wrap gap-1">
          <Link href="/" className="hover:underline">Accueil</Link>
          <span>/</span>
          <Link href="/boutique" className="hover:underline">Boutique</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:underline">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galerie */}
          <div>
            <ProductGallery images={product.images} productTitle={product.title} />
          </div>

          {/* Infos */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.artisan.isDemo && (
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                  🎭 Données de démonstration
                </span>
              )}
              {product.artisan.verified && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  ✓ Atelier vérifié
                </span>
              )}
              {product.category && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.title}</h1>

            {/* Artisan */}
            <Link href={`/artisans/${product.artisan.slug}`} className="flex items-center gap-2 hover:underline w-fit">
              <span className="text-sm text-gray-600">Par</span>
              <span className="font-semibold text-[var(--color-primary)]">{product.artisan.workshopName}</span>
              <span className="text-sm text-gray-400">· {product.artisan.region}</span>
            </Link>

            {/* Note */}
            {avgRating > 0 && (
              <RatingStars rating={avgRating} count={reviews.length} size="md" />
            )}

            {/* Prix */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[var(--color-primary)]">
                {product.priceFCFA.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Stock */}
            <div className="text-sm">
              {stock > 0 ? (
                <span className="text-green-600 font-semibold">✓ En stock ({stock} disponible{stock > 1 ? "s" : ""})</span>
              ) : (
                <span className="text-red-500 font-semibold">✗ Rupture de stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            )}

            {/* Origine / Technique */}
            <div className="flex flex-wrap gap-3 text-sm">
              {product.originRegion && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  📍 {product.originRegion}
                </span>
              )}
              {product.technique && (
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  🛠 {product.technique}
                </span>
              )}
            </div>

            {/* Matériaux */}
            {product.materials.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-1">Matériaux déclarés</h2>
                <ul className="flex flex-wrap gap-2">
                  {product.materials.map((m) => (
                    <li key={m.id} className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-200">
                      {m.name}
                      {m.origin && ` · ${m.origin}`}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Origine déclarée par l'artisan — traçabilité, non authenticité garantie.
                </p>
              </div>
            )}

            {/* Bouton ajout panier — sticky barre mobile */}
            <div className="fixed bottom-0 left-0 right-0 md:static bg-white md:bg-transparent border-t border-gray-200 md:border-0 p-4 md:p-0 z-30">
              <AddToCartButton productId={product.id} stock={stock} />
            </div>

            {/* QR Code traçabilité */}
            {qr && (
              <div className="mt-2">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Traçabilité</h2>
                <QRBadge code={qr.code} size={96} />
                <p className="text-xs text-gray-400 mt-1">
                  Scannez pour vérifier l'origine déclarée de ce produit.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Avis */}
        <section className="mt-12 pb-24 md:pb-0">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Avis clients</h2>
          <ReviewsList reviews={reviews} avgRating={avgRating} />
        </section>
      </main>
    </>
  );
}
