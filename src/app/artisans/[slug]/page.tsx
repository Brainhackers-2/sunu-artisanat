import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  ArrowLeft,
  Calendar,
  Sparkles,
  ShoppingBag,
  Award,
  Layers,
} from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import RatingStars from "@/components/ui/RatingStars";

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
    title: `${artisan.workshopName} — Atelier d'Art ${artisan.region} | SUNU ARTISANAT`,
    description: artisan.specialty
      ? `${artisan.specialty} — Atelier d'excellence à ${artisan.region}, Sénégal.`
      : `Atelier artisanal d'excellence à ${artisan.region}, Sénégal.`,
  };
}

export default async function ArtisanVitrinePage({ params }: Props) {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { slug: params.slug, status: "APPROVED" },
    include: {
      products: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          inventory: { select: { quantity: true } },
          reviews: { select: { rating: true }, where: { isApproved: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
  });

  if (!artisan) notFound();

  const coverImg =
    artisan.coverUrl ||
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80";
  const logoImg =
    artisan.logoUrl ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* 1. Bouton de retour : Lien "← Retour à l'annuaire des artisans" */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <Link
          href="/artisans"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#125B3E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Retour à l&apos;annuaire des artisans</span>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Grande Bannière d'Atelier (h-64) avec filtre assombri */}
        <div className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden bg-stone-300 shadow-md">
          <Image
            src={coverImg}
            alt={artisan.workshopName}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {artisan.isDemo && (
            <span className="absolute top-4 right-4 bg-amber-100/90 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-xs">
              🎭 Atelier Démonstration
            </span>
          )}
        </div>

        {/* Fiche d'Identité de l'Artisan avec Médaillon Géant (w-28 h-28 rounded-3xl) en saillie */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm relative -mt-20 z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Médaillon Géant de l'Artisan */}
              <div className="relative w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0 -mt-16 sm:-mt-20">
                <Image
                  src={logoImg}
                  alt={artisan.workshopName}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#131622] tracking-tight">
                    {artisan.workshopName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[#125B3E]/10 text-[#125B3E] border border-[#125B3E]/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#125B3E]" />
                    <span>Certifié SUNU</span>
                  </span>
                </div>

                <p className="text-sm font-bold text-[#C2410C] mt-1">
                  {artisan.specialty}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {artisan.city}, Région de {artisan.region}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{artisan.experienceYears} ans d&apos;expérience</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-200/60 text-right">
              <span className="text-[11px] text-stone-500 block">Catalogue</span>
              <span className="text-lg font-black text-[#125B3E]">
                {artisan.products.length} œuvre{artisan.products.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Récit de l'Atelier : Histoire complète de la transmission du savoir-faire */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#131622] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFB800]" />
              <span>Récit &amp; Savoir-Faire de l&apos;Atelier</span>
            </h2>
            <div className="prose text-xs sm:text-sm text-stone-700 leading-relaxed max-w-none">
              <p>
                {artisan.bio ||
                  `L'atelier ${artisan.workshopName} perpétue avec passion l'artisanat traditionnel de ${artisan.region}. Chaque pièce est façonnée entièrement à la main, dans le respect des gestes transmis de génération en génération. L'atelier utilise exclusivement des matières premières sélectionnées avec soin, valorisant la richesse du terroir sénégalais.`}
              </p>
            </div>
          </div>
        </div>

        {/* Catalogue de l'Atelier : Toutes les créations fabriquées par cet artisan */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#131622]">
                Créations de l&apos;Atelier ({artisan.products.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pièces originales avec passeport digital et traçabilité certifiée
              </p>
            </div>
          </div>

          {artisan.products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-2">
              <p className="text-sm font-bold text-stone-700">
                Cet atelier n&apos;a pas encore de créations publiées en ligne.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisan.products.map((p) => {
                const stock = p.inventory?.quantity ?? 0;
                const avgRating =
                  p.reviews.length > 0
                    ? p.reviews.reduce((s, r) => s + r.rating, 0) /
                      p.reviews.length
                    : undefined;

                return (
                  <article
                    key={p.id}
                    className="group bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    <Link
                      href={`/produits/${p.slug}`}
                      className="block relative aspect-square bg-stone-100 overflow-hidden"
                    >
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🧵
                        </div>
                      )}
                    </Link>

                    <div className="p-5 flex flex-col flex-1 gap-2">
                      <Link
                        href={`/produits/${p.slug}`}
                        className="font-bold text-sm text-[#131622] hover:text-[#125B3E] line-clamp-2 leading-snug transition-colors"
                      >
                        {p.title}
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs">
                        <RatingStars rating={avgRating || 5} count={p._count.reviews} size="sm" />
                      </div>

                      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-base font-black text-[#C2410C]">
                          {p.priceFCFA.toLocaleString("fr-FR")} FCFA
                        </span>

                        <AddToCartButton
                          productId={p.id}
                          stock={stock}
                          compact={true}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
