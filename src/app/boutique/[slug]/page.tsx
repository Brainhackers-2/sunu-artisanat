import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductGallery from "@/components/catalogue/ProductGallery";
import ReviewsList from "@/components/catalogue/ReviewsList";
import RatingStars from "@/components/ui/RatingStars";
import QRBadge from "@/components/ui/QRBadge";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  Store,
  CreditCard,
  Ruler,
  Layers,
} from "lucide-react";

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
    title: `${product.title} — ${product.artisan.workshopName} | SUNU ARTISANAT`,
    description:
      product.description?.slice(0, 160) ??
      `Création d'artisanat d'art sénégalais par ${product.artisan.workshopName}, ${product.artisan.region}.`,
    openGraph: {
      title: `${product.title} | SUNU ARTISANAT`,
      description: product.description?.slice(0, 160) ?? "",
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
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

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-[#125B3E]">Accueil</Link>
          <span>/</span>
          <Link href="/boutique" className="hover:text-[#125B3E]">Boutique</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-[#125B3E]"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#131622] font-bold truncate max-w-xs">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Galerie Visuelle : Grande photo principale sur fond blanc avec vignettes secondaires */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-xs">
            <ProductGallery images={product.images} productTitle={product.title} />
          </div>

          {/* Fiche d'informations & Achat */}
          <div className="flex flex-col gap-6">
            {/* Badges de certification */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#125B3E]/10 text-[#125B3E] border border-[#125B3E]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certifié SUNU</span>
              </span>

              {product.originRegion && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>Terroir : {product.originRegion}</span>
                </span>
              )}

              {product.artisan.isDemo && (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  🎭 Démo
                </span>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#131622] leading-tight">
              {product.title}
            </h1>

            {/* Avis */}
            <div className="flex items-center gap-2">
              <RatingStars rating={avgRating || 5} count={reviews.length} size="md" />
              <span className="text-xs text-stone-500 font-medium">
                ({reviews.length} avis vérifié{reviews.length > 1 ? "s" : ""})
              </span>
            </div>

            {/* Bloc Commande & Prix : Prix en grand format terracotta (#C2410C), mention paiements Wave & OM */}
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 font-semibold uppercase tracking-wider block">
                    Prix de l&apos;œuvre
                  </span>
                  <span className="text-3xl sm:text-4xl font-black text-[#C2410C]">
                    {product.priceFCFA.toLocaleString("fr-FR")} FCFA
                  </span>
                  <span className="text-xs text-stone-400 block mt-0.5 font-medium">
                    (soit ~ {Math.round(product.priceFCFA / 655.957)} € indicatif)
                  </span>
                </div>

                <div className="text-right">
                  {stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {stock} disponible{stock > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                      Sur commande
                    </span>
                  )}
                </div>
              </div>

              {/* Mentions paiements sécurisés */}
              <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2 text-xs text-stone-600">
                <CreditCard className="w-4 h-4 text-[#125B3E]" />
                <span>Paiement sécurisé par <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>Carte Bancaire</strong></span>
              </div>
            </div>

            {/* Bouton d'Action & Ajout au Panier */}
            <div className="space-y-3 pt-2">
              <AddToCartButton productId={product.id} stock={stock} />
            </div>

            {/* Fiche Technique : Matériaux naturels certifiés, dimensions, origine géographique, façonnage main */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-[#131622] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#125B3E]" />
                <span>Fiche Technique &amp; Matériaux</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Technique</span>
                  <strong className="text-stone-800">{product.technique || "Façonnage traditionnel à la main"}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Terroir d&apos;origine</span>
                  <strong className="text-stone-800">{product.originRegion || product.artisan.region}</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Façonnage</span>
                  <strong className="text-stone-800">100% fait main</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Disponibilité</span>
                  <strong className="text-stone-800">{stock > 0 ? "En stock atelier" : "À la commande"}</strong>
                </div>
              </div>

              {product.materials.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Matériaux nobles déclarés :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.materials.map((m) => (
                      <span
                        key={m.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {m.name} {m.origin && `(${m.origin})`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Passeport Digital SUNU : Encart dédié avec numéro de certificat d'authenticité */}
            {qr && (
              <div className="bg-[#131622] text-white p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFB800] uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    <span>Passeport Digital SUNU</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E] text-white">
                    Actif &amp; Scellé
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shrink-0">
                    <QRBadge code={qr.code} size={72} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-stone-300">
                      Certificat officiel de traçabilité n° :
                    </p>
                    <p className="font-mono text-sm font-bold text-[#FFB800]">
                      {qr.code}
                    </p>
                    <Link
                      href={`/certification/${qr.code}`}
                      className="text-xs text-stone-300 hover:text-white underline inline-flex items-center gap-1 pt-1"
                    >
                      <span>Vérifier en ligne le passeport</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Carte Créateur : Photo de profil de l'artisan, nom de son atelier et lien vers sa vitrine */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-2xl bg-stone-100 border-2 border-stone-200 overflow-hidden shrink-0">
                  <Image
                    src={
                      product.artisan.logoUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={product.artisan.workshopName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 font-semibold">Créé par l&apos;artisan</span>
                  <h4 className="font-bold text-sm text-[#131622]">{product.artisan.workshopName}</h4>
                  <p className="text-xs text-[#C2410C] font-semibold">{product.artisan.specialty}</p>
                </div>
              </div>

              <Link
                href={`/artisans/${product.artisan.slug}`}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-[#125B3E] hover:text-white text-stone-800 transition-colors shrink-0"
              >
                Voir l&apos;atelier →
              </Link>
            </div>
          </div>
        </div>

        {/* Description détaillée */}
        {product.description && (
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs space-y-3">
            <h3 className="text-lg font-bold text-[#131622]">Histoire &amp; Récit de la Création</h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-none whitespace-pre-line">
              {product.description}
            </p>
          </section>
        )}

        {/* Avis clients */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-xs">
          <h3 className="text-lg font-bold text-[#131622] mb-6">Avis Clients &amp; Témoignages</h3>
          <ReviewsList reviews={reviews} avgRating={avgRating} />
        </section>
      </main>
    </div>
  );
}
