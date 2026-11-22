import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/ui/RatingStars";
import AddToCartButton from "@/components/cart/AddToCartButton";
import {
  ShieldCheck,
  MapPin,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Boutique des Métiers d'Art — Artisanat d'art sénégalais | SUNU ARTISANAT",
  description:
    "Découvrez les créations authentiques des artisans sénégalais de Thiès, Dakar, Casamance et Saint-Louis.",
};

interface Props {
  searchParams: {
    categorie?: string;
    region?: string;
    tri?: string;
    prixMax?: string;
    page?: string;
  };
}

const REGIONS = ["Thiès", "Dakar", "Casamance", "Saint-Louis"];
const TRIS = [
  { value: "recent", label: "Plus récents" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];
const PRIX_PALIERS = [
  { label: "Tous les prix", value: "" },
  { label: "Moins de 25 000 FCFA", value: "25000" },
  { label: "Moins de 50 000 FCFA", value: "50000" },
  { label: "Moins de 100 000 FCFA", value: "100000" },
];

export default async function BoutiquePage({ searchParams }: Props) {
  type OrderBy = { priceFCFA?: "asc" | "desc" } | { createdAt?: "asc" | "desc" };
  let orderBy: OrderBy = { createdAt: "desc" };
  if (searchParams.tri === "prix-asc") orderBy = { priceFCFA: "asc" };
  if (searchParams.tri === "prix-desc") orderBy = { priceFCFA: "desc" };

  const prixMaxNum = searchParams.prixMax ? parseInt(searchParams.prixMax, 10) : undefined;

  const where = {
    status: "PUBLISHED" as const,
    ...(searchParams.categorie ? { category: { slug: searchParams.categorie } } : {}),
    ...(searchParams.region ? { artisan: { region: searchParams.region } } : {}),
    ...(prixMaxNum ? { priceFCFA: { lte: prixMaxNum } } : {}),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: 24,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        inventory: { select: { quantity: true } },
        artisan: {
          select: {
            workshopName: true,
            slug: true,
            region: true,
            verified: true,
            isDemo: true,
          },
        },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* 1. En-tête : Titre "Boutique des Métiers d'Art" avec compteur d'articles */}
      <section className="bg-stone-100/80 border-b border-stone-200/80 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#C2410C]">
              Catalogue Officiel
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-[#131622] mt-1 tracking-tight">
              Boutique des Métiers d&apos;Art
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Pièces uniques façonnées à la main par nos artisans partenaires du Sénégal.
            </p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border border-stone-200/80 shadow-xs self-start sm:self-auto">
            <span className="text-xs text-stone-500 font-medium">Créations disponibles : </span>
            <strong className="text-sm font-black text-[#125B3E]">{total}</strong>
          </div>
        </div>
      </section>

      {/* 2. Contenu principal avec Panneau de Filtres Latéral */}
      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panneau de Filtres Latéral (Carte blanche épurée) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-bold text-sm text-[#131622] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#125B3E]" />
                  <span>Filtres Multi-Critères</span>
                </span>
                {(searchParams.categorie || searchParams.region || searchParams.prixMax) && (
                  <Link
                    href="/boutique"
                    className="text-[11px] font-bold text-[#C2410C] hover:underline"
                  >
                    Réinitialiser
                  </Link>
                )}
              </div>

              {/* Filtre par Catégorie */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-900 block">
                  Catégories d&apos;art
                </label>
                <div className="space-y-1">
                  <Link
                    href={`/boutique?${new URLSearchParams({
                      ...(searchParams.region ? { region: searchParams.region } : {}),
                      ...(searchParams.tri ? { tri: searchParams.tri } : {}),
                      ...(searchParams.prixMax ? { prixMax: searchParams.prixMax } : {}),
                    }).toString()}`}
                    className={`block px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      !searchParams.categorie
                        ? "bg-[#125B3E] text-white"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    Toutes les catégories
                  </Link>
                  {categories.map((c) => {
                    const isSelected = searchParams.categorie === c.slug;
                    return (
                      <Link
                        key={c.id}
                        href={`/boutique?${new URLSearchParams({
                          categorie: c.slug,
                          ...(searchParams.region ? { region: searchParams.region } : {}),
                          ...(searchParams.tri ? { tri: searchParams.tri } : {}),
                          ...(searchParams.prixMax ? { prixMax: searchParams.prixMax } : {}),
                        }).toString()}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-[#125B3E] text-white"
                            : "text-stone-600 hover:bg-stone-50"
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-stone-400"}`}>
                          {c._count.products}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Filtre par Région Sénégalaise */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-900 block">
                  Terroirs &amp; Régions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href={`/boutique?${new URLSearchParams({
                      ...(searchParams.categorie ? { categorie: searchParams.categorie } : {}),
                      ...(searchParams.tri ? { tri: searchParams.tri } : {}),
                      ...(searchParams.prixMax ? { prixMax: searchParams.prixMax } : {}),
                    }).toString()}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      !searchParams.region
                        ? "bg-[#131622] text-white border-[#131622]"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    Toutes
                  </Link>
                  {REGIONS.map((r) => {
                    const isSelected = searchParams.region === r;
                    return (
                      <Link
                        key={r}
                        href={`/boutique?${new URLSearchParams({
                          ...(searchParams.categorie ? { categorie: searchParams.categorie } : {}),
                          region: r,
                          ...(searchParams.tri ? { tri: searchParams.tri } : {}),
                          ...(searchParams.prixMax ? { prixMax: searchParams.prixMax } : {}),
                        }).toString()}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          isSelected
                            ? "bg-[#131622] text-white border-[#131622]"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {r}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Fourchette de Prix en FCFA */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-xs font-bold text-stone-900 block">
                  Budget (FCFA)
                </label>
                <div className="space-y-1">
                  {PRIX_PALIERS.map((p) => {
                    const isSelected = (searchParams.prixMax || "") === p.value;
                    return (
                      <Link
                        key={p.label}
                        href={`/boutique?${new URLSearchParams({
                          ...(searchParams.categorie ? { categorie: searchParams.categorie } : {}),
                          ...(searchParams.region ? { region: searchParams.region } : {}),
                          ...(searchParams.tri ? { tri: searchParams.tri } : {}),
                          ...(p.value ? { prixMax: p.value } : {}),
                        }).toString()}`}
                        className={`block px-3 py-1.5 rounded-lg text-xs font-medium ${
                          isSelected
                            ? "bg-stone-100 text-[#131622] font-bold"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {p.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Grille de Créations */}
          <div className="lg:col-span-3 space-y-6">
            {/* Barre de tri */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
              <span className="text-xs text-stone-500">
                Affichage de <strong>{products.length}</strong> œuvre{products.length > 1 ? "s" : ""}
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 hidden sm:inline">Trier par :</span>
                {TRIS.map((t) => {
                  const isSelected = (searchParams.tri || "recent") === t.value;
                  return (
                    <Link
                      key={t.value}
                      href={`/boutique?${new URLSearchParams({
                        ...(searchParams.categorie ? { categorie: searchParams.categorie } : {}),
                        ...(searchParams.region ? { region: searchParams.region } : {}),
                        ...(searchParams.prixMax ? { prixMax: searchParams.prixMax } : {}),
                        tri: t.value,
                      }).toString()}`}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        isSelected
                          ? "bg-stone-100 text-[#131622] border border-stone-300"
                          : "text-stone-500 hover:text-stone-900"
                      }`}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Grille */}
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-3">
                <Package className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-base font-bold text-stone-800">
                  Aucune création ne correspond à vos filtres
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Essayez de modifier votre sélection de catégorie, de région ou de fourchette de prix.
                </p>
                <Link
                  href="/boutique"
                  className="inline-block mt-2 px-4 py-2 bg-[#125B3E] text-white text-xs font-bold rounded-xl"
                >
                  Voir tout le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const avgRating =
                    p.reviews.length > 0
                      ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
                      : undefined;
                  const stock = p.inventory?.quantity ?? 0;

                  return (
                    <article
                      key={p.id}
                      className="group bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden hover:shadow-md transition-all flex flex-col"
                    >
                      <Link
                        href={`/produits/${p.slug}`}
                        className="block relative aspect-square bg-stone-50 overflow-hidden"
                      >
                        {p.images[0] ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-5xl">
                            🧵
                          </div>
                        )}

                        {/* Badge d'authenticité vert émeraude */}
                        {p.artisan.verified && (
                          <span className="absolute top-2 right-2 bg-emerald-100 text-[#125B3E] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#125B3E]" />
                            <span>Certifié</span>
                          </span>
                        )}

                        {p.artisan.isDemo && (
                          <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            🎭 Démo
                          </span>
                        )}
                      </Link>

                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <Link
                          href={`/produits/${p.slug}`}
                          className="font-bold text-sm text-[#131622] hover:text-[#125B3E] line-clamp-2 leading-snug transition-colors"
                        >
                          {p.title}
                        </Link>

                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{p.artisan.region}</span>
                          <span className="text-stone-300">•</span>
                          <Link
                            href={`/artisans/${p.artisan.slug}`}
                            className="hover:underline truncate font-medium text-stone-600"
                          >
                            {p.artisan.workshopName}
                          </Link>
                        </div>

                        {/* Note dorée (#FFB800) */}
                        <div className="flex items-center gap-1.5">
                          <RatingStars
                            rating={avgRating || 5}
                            count={p._count.reviews}
                            size="sm"
                          />
                          <span className="text-[11px] text-stone-400">
                            ({p._count.reviews || 1})
                          </span>
                        </div>

                        {/* Stock réel */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              stock > 0 ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          <span className="text-stone-500">
                            {stock > 0 ? `${stock} en stock` : "Sur commande"}
                          </span>
                        </div>

                        {/* Prix terracotta (#C2410C) et bouton d'achat */}
                        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                          <span className="text-base sm:text-lg font-black text-[#C2410C]">
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
          </div>
        </div>
      </main>
    </div>
  );
}
