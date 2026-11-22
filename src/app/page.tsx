import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/catalogue/ProductCard";
import CategoryGrid from "@/components/catalogue/CategoryGrid";
import ArtisanCard from "@/components/catalogue/ArtisanCard";
import { ShieldCheck, Truck, Sparkles, QrCode, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, featuredArtisans] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { status: "PUBLISHED" } } } } },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        artisan: { select: { workshopName: true, slug: true, region: true, verified: true, isDemo: true } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ]);

  const catList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    productCount: c._count.products,
  }));

  return (
    <main className="flex-1 flex flex-col items-center w-full">
      {/* 1. Hero Section Immersif (Section 8.2) */}
      <section className="relative w-full bg-gradient-to-b from-stone-900 to-[#125B3E] text-white py-16 sm:py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <span>🇸🇳</span> L'excellence de l'artisanat d'art sénégalais
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Le savoir-faire authentique <br className="hidden sm:block" />
            <span className="text-[#FFB800]">au cœur de votre quotidien</span>
          </h1>

          <p className="text-stone-200 text-sm sm:text-lg max-w-2xl mb-8 leading-relaxed">
            Maroquinerie de Thiès, poteries de Casamance, bijouterie en filigrane de Dakar et tissages Manjak. Chaque pièce porte son certificat de traçabilité officiel.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/boutique"
              className="bg-[#FFB800] hover:bg-[#e5a600] text-[#131622] font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center gap-2 min-h-[48px]"
            >
              <span>Découvrir les créations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/artisans"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm border border-white/20 transition min-h-[48px]"
            >
              Rencontrer nos maîtres artisans
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Bandeau de Réassurance (Section 8.1 & 8.2) */}
      <section className="w-full bg-white border-y border-stone-200 py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#125B3E]/10 text-[#125B3E] shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Traçabilité QR Code</h4>
              <p className="text-[11px] text-stone-500">Origine et matériaux déclarés</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C2410C]/10 text-[#C2410C] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Ateliers Vérifiés</h4>
              <p className="text-[11px] text-stone-500">Maîtres artisans validés</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FFB800]/20 text-[#9A6F00] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Livraison Sécurisée</h4>
              <p className="text-[11px] text-stone-500">Dakar, régions &amp; monde</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#125B3E]/10 text-[#125B3E] shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm">Paiements Locaux</h4>
              <p className="text-[11px] text-stone-500">Wave, OM &amp; Cartes bancaires</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Grille des Catégories (Section 8.2) */}
      <section className="max-w-6xl w-full mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Explorez par savoir-faire</h2>
            <p className="text-xs sm:text-sm text-stone-500">Tissage, sculpture, maroquinerie, céramique et bijouterie</p>
          </div>
          <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#125B3E] hover:underline flex items-center gap-1">
            Tout voir →
          </Link>
        </div>
        <CategoryGrid categories={catList} />
      </section>

      {/* 4. Créations Phares (Section 8.2) */}
      <section className="w-full bg-stone-50 py-12 px-4 border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Créations artisanales phares</h2>
              <p className="text-xs sm:text-sm text-stone-500">Pièces certifiées par nos artisans partenaires</p>
            </div>
            <Link href="/boutique" className="text-xs sm:text-sm font-semibold text-[#125B3E] hover:underline">
              Voir tout le catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => {
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
        </div>
      </section>

      {/* 5. Maîtres Artisans à la Une (Section 8.2) */}
      <section className="max-w-6xl w-full mx-auto px-4 py-14">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">Maîtres Artisans à la une</h2>
            <p className="text-xs sm:text-sm text-stone-500">Découvrez leurs ateliers vérifiés de Dakar, Thiès et Casamance</p>
          </div>
          <Link href="/artisans" className="text-xs sm:text-sm font-semibold text-[#125B3E] hover:underline">
            Tous les ateliers →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {featuredArtisans.map((a) => (
            <ArtisanCard
              key={a.id}
              slug={a.slug}
              workshopName={a.workshopName}
              specialty={a.specialty}
              region={a.region}
              logoUrl={a.logoUrl}
              productCount={a._count.products}
              isVerified={a.verified}
              isDemo={a.isDemo}
            />
          ))}
        </div>
      </section>

      {/* 6. Section Traçabilité & QR Code (Section 8.2 & 2.1) */}
      <section className="w-full bg-[#125B3E] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex-1">
            <span className="text-xs bg-[#FFB800] text-stone-900 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Innovation &amp; Confiance
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 mb-2">
              Vérifiez la traçabilité de votre pièce
            </h3>
            <p className="text-stone-200 text-sm leading-relaxed">
              Chaque création artisanale possède un QR Code unique certifiant son origine déclarée, son artisan créateur et ses matériaux nobles.
            </p>
          </div>
          <Link
            href="/boutique"
            className="bg-white text-[#125B3E] hover:bg-stone-100 font-bold px-6 py-3 rounded-xl transition shrink-0 min-h-[44px] flex items-center justify-center"
          >
            Explorer la boutique
          </Link>
        </div>
      </section>
    </main>
  );
}
