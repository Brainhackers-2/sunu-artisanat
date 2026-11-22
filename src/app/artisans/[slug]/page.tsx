import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/catalogue/ProductCard";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { slug: params.slug },
    select: { workshopName: true, specialty: true, region: true },
  });
  if (!artisan) return { title: "Artisan introuvable" };
  return {
    title: `${artisan.workshopName} — Atelier ${artisan.region} | Sunu Artisanat`,
    description: artisan.specialty
      ? `${artisan.specialty} — Artisan de ${artisan.region}, Sénégal.`
      : `Atelier artisanal de ${artisan.region}, Sénégal.`,
  };
}

export default async function ArtisanPage({ params }: Props) {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { slug: params.slug, status: "APPROVED" },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          reviews: { select: { rating: true }, where: { isApproved: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  if (!artisan) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: artisan.workshopName,
    description: artisan.specialty ?? undefined,
    address: { "@type": "PostalAddress", addressRegion: artisan.region, addressCountry: "SN" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête atelier */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--color-primary)] flex-shrink-0 bg-gray-100">
            {artisan.logoUrl ? (
              <Image src={artisan.logoUrl} alt={artisan.workshopName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">👨‍🎨</div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{artisan.workshopName}</h1>
              {artisan.verified && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  ✓ Atelier vérifié
                </span>
              )}
              {artisan.isDemo && (
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  🎭 Démo
                </span>
              )}
            </div>

            <p className="text-gray-600 font-medium">{artisan.specialty}</p>
            <p className="text-gray-400 text-sm mt-1">📍 {artisan.city}, {artisan.region}, Sénégal</p>

            {artisan.bio && (
              <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-xl">{artisan.bio}</p>
            )}

            {artisan.isDemo && (
              <p className="mt-2 text-xs text-orange-600 italic">
                Cet atelier est une donnée de démonstration. Ne pas présenter comme réel.
              </p>
            )}
          </div>
        </div>

        {/* Produits de l'atelier */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Collection ({artisan.products.length} produit{artisan.products.length !== 1 ? "s" : ""})
          </h2>

          {artisan.products.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <p className="text-4xl mb-3">📦</p>
              <p>Aucun produit publié pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisan.products.map((p) => {
                const avgRating =
                  p.reviews.length > 0
                    ? p.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / p.reviews.length
                    : undefined;
                return (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    title={p.title}
                    priceFCFA={p.priceFCFA}
                    imageUrl={p.images[0]?.url ?? null}
                    workshopName={artisan.workshopName}
                    artisanSlug={artisan.slug}
                    region={artisan.region}
                    avgRating={avgRating}
                    reviewCount={p._count.reviews}
                    isVerified={artisan.verified}
                    isDemo={artisan.isDemo}
                  />
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-10">
          <Link href="/artisans" className="text-sm text-gray-500 hover:underline">
            ← Retour à tous les artisans
          </Link>
        </div>
      </main>
    </>
  );
}
