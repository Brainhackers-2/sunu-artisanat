import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import AnimatedHero from "@/components/home/AnimatedHero";
import RatingStars from "@/components/ui/RatingStars";
import AddToCartButton from "@/components/cart/AddToCartButton";
import {
  Handshake,
  QrCode,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Store,
  MapPin,
  Bot,
  Layers,
  Award,
  ChevronRight,
  Package,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, featuredArtisans] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
    prisma.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 8,
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
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ]);

  // Catégories avec images de secours de haute qualité si non renseignées
  const DEFAULT_CAT_IMAGES: Record<string, string> = {
    maroquinerie:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
    poterie:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80",
    sculpture:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    bijouterie:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    tissage:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80",
  };

  const catList = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl:
      c.imageUrl ||
      DEFAULT_CAT_IMAGES[c.slug] ||
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    productCount: c._count.products,
  }));

  // Terroirs régionaux sénégalais
  const TERROIRS = [
    {
      name: "Casamance",
      specialty: "Poterie Diola & Vannerie d'Ébène",
      desc: "Terre argileuse rouge modelée et cuite à l'étouffée dans les villages d'Oussouye et d'Edioungou.",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
      link: "/boutique?region=Casamance",
    },
    {
      name: "Saint-Louis",
      specialty: "Filigrane d'or & d'argent",
      desc: "Héritage des orfèvres signares, finesse absolue du métal précieux étiré en dentelle millimétrée.",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
      link: "/boutique?region=Saint-Louis",
    },
    {
      name: "Dakar",
      specialty: "Ébénisterie d'Art & Souwères",
      desc: "Mobilier en bois de rônier, peintures sous-verre (fixés) et perlage moderne de la presqu'île.",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
      link: "/boutique?region=Dakar",
    },
    {
      name: "Thiès",
      specialty: "Tissage Manjak & Maroquinerie",
      desc: "Tisseurs d'élite aux motifs royaux et tanneurs d'exception façonnant les cuirs de haute qualité.",
      image: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=600&q=80",
      link: "/boutique?region=Thiès",
    },
  ];

  return (
    <main className="flex-1 flex flex-col items-center w-full bg-[#FAF8F5]">
      {/* 1. Carrousel Héro synchronisé sur les catégories réelles */}
      <AnimatedHero categories={catList} />

      {/* 2. Barre de Réassurance (Les 4 Piliers) */}
      <section className="w-full bg-white border-y border-stone-200 py-6 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-stone-800">
          {/* Pilier 1 : Artisans Sélectionnés */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-[#125B3E] shrink-0 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#131622]">
                Artisans Sélectionnés
              </h4>
              <p className="text-[11px] text-stone-500">
                Ateliers audités &amp; savoir-faire vérifié
              </p>
            </div>
          </div>

          {/* Pilier 2 : Créations Authentiques */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-[#B38200] shrink-0 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#131622]">
                Créations Authentiques
              </h4>
              <p className="text-[11px] text-stone-500">
                Passeport digital &amp; QR Code unique
              </p>
            </div>
          </div>

          {/* Pilier 3 : Paiement Sécurisé */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <div className="w-11 h-11 rounded-xl bg-orange-100/70 text-[#C2410C] shrink-0 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#131622]">
                Paiement Sécurisé
              </h4>
              <p className="text-[11px] text-stone-500">
                Wave, Orange Money &amp; CB sans risque
              </p>
            </div>
          </div>

          {/* Pilier 4 : Livraison Partout */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/60">
            <div className="w-11 h-11 rounded-xl bg-teal-100/70 text-[#0E4831] shrink-0 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#131622]">
                Livraison Partout
              </h4>
              <p className="text-[11px] text-stone-500">
                Dakar, 14 régions &amp; international
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section "Explorez par Catégorie" */}
      <section className="max-w-7xl w-full mx-auto px-4 py-14 sm:py-16">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#C2410C]">
              Les Métiers d&apos;Art
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#131622] mt-1 tracking-tight">
              Explorez par Catégorie
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Tissage, sculpture, maroquinerie, céramique et bijouterie fine
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs sm:text-sm font-bold text-[#125B3E] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Toutes les catégories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grille des catégories (cartes photos 4/3 avec dégradé sombre en bas et textes blancs) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {catList.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200 hover:shadow-lg transition-all"
            >
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-bold text-sm sm:text-base leading-tight drop-shadow-sm group-hover:text-[#FFB800] transition-colors">
                  {category.name}
                </h3>
                <span className="text-[11px] text-stone-300 font-medium">
                  {category.productCount} création
                  {category.productCount > 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Section "Créations Exceptionnelles du Moment" */}
      <section className="w-full bg-stone-100/60 py-14 sm:py-16 px-4 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-2">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#C2410C]">
                Sélection d&apos;Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#131622] mt-1 tracking-tight">
                Créations Exceptionnelles du Moment
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                8 pièces phares certifiées, prêtes à être expédiées depuis nos ateliers
              </p>
            </div>
            <Link
              href="/boutique"
              className="text-xs sm:text-sm font-bold text-[#125B3E] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Voir tout le catalogue</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => {
              const avgRating =
                p.reviews.length > 0
                  ? p.reviews.reduce((s, r) => s + r.rating, 0) /
                    p.reviews.length
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
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300 text-5xl">
                        🧵
                      </div>
                    )}

                    {p.artisan.isDemo && (
                      <span className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        🎭 Démo
                      </span>
                    )}

                    {p.artisan.verified && (
                      <span className="absolute top-2 right-2 bg-emerald-100 text-[#125B3E] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        ✓ Vérifié
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

                    {/* Étoiles d'avis dorées (#FFB800) */}
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

                    {/* Stock disponible */}
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

                    {/* Prix en terracotta fort (#C2410C) et bouton d'ajout au panier */}
                    <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-black text-[#C2410C]">
                          {p.priceFCFA.toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
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
        </div>
      </section>

      {/* 5. Section Innovation Technologique & Traçabilité */}
      <section className="w-full bg-[#131622] text-white py-16 px-4 relative overflow-hidden">
        {/* Lignes dorées subtiles en arrière-plan */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFB800] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Innovation Technologique &amp; Confiance</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Traçabilité Numérique &amp; Passeport Digital
            </h2>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Chaque œuvre authentique est munie d&apos;un scellé physique numéroté
              et d&apos;un QR Code gravé. En le scannant, le propriétaire accède à
              l&apos;historique complet : identité du maître artisan, région d&apos;origine
              déclarée et composition des matériaux nobles.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/assistant"
                className="px-6 py-3.5 rounded-xl bg-[#FFB800] hover:bg-[#E5A700] text-[#131622] font-black text-xs sm:text-sm tracking-wider uppercase inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Tester l&apos;Assistant IA</span>
              </Link>

              <Link
                href="/certification/DEMO-001"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wider uppercase border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-[#FFB800]" />
                <span>Voir un Passeport Spécimen</span>
              </Link>
            </div>
          </div>

          {/* Simulation du scellé et certificat digital avec QR Code */}
          <div className="w-full max-w-md bg-stone-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center font-bold">
                  🇸🇳
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Certificat de Traçabilité
                  </h4>
                  <p className="text-[10px] text-stone-400 font-mono">
                    ID: SN-ART-2026-0894
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E] text-white">
                Atelier Audité
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-stone-400 block">Artisan</span>
                <span className="font-bold text-white">Moussa Niang</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-stone-400 block">Terroir</span>
                <span className="font-bold text-white">Thiès (Cuir)</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-stone-400 block">Matériau</span>
                <span className="font-bold text-white">Cuir tanné végétal</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-stone-400 block">Scellé</span>
                <span className="font-bold text-[#FFB800]">QR Actif #894</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <QrCode className="w-6 h-6 text-[#FFB800]" />
                <span className="text-[11px] text-stone-300">
                  Scan smartphone instantané
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                100% Vérifié
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section "Rencontrez Nos Maîtres Artisans" */}
      <section className="max-w-7xl w-full mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-2">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#C2410C]">
              Les Gardiens du Geste
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#131622] mt-1 tracking-tight">
              Rencontrez Nos Maîtres Artisans
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              4 ateliers vérifiés d&apos;exception de Thiès, Casamance, Dakar et Saint-Louis
            </p>
          </div>
          <Link
            href="/artisans"
            className="text-xs sm:text-sm font-bold text-[#125B3E] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Tous les ateliers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 ateliers avec bannières photos d'atelier, médaillons ronds avec bordure blanche épaisse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtisans.map((artisan) => (
            <div
              key={artisan.id}
              className="group bg-white rounded-2xl shadow-sm border border-stone-200/90 overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              {/* Bannière photo de l'atelier */}
              <div className="relative h-28 w-full bg-stone-200 overflow-hidden">
                <Image
                  src={
                    artisan.coverUrl ||
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={`Atelier ${artisan.workshopName}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Médaillon rond avec bordure blanche épaisse */}
              <div className="px-5 pt-0 pb-5 flex flex-col items-center text-center flex-1 -mt-10 relative z-10">
                <div className="relative w-20 h-20 rounded-full bg-white border-4 border-white shadow-md overflow-hidden mb-3">
                  <Image
                    src={
                      artisan.logoUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    }
                    alt={artisan.workshopName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-sm text-[#131622] group-hover:text-[#125B3E] transition-colors">
                    {artisan.workshopName}
                  </h3>
                  {artisan.verified && (
                    <span
                      title="Atelier vérifié"
                      className="text-[#125B3E] text-xs font-bold"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-[#C2410C] mb-1">
                  {artisan.specialty}
                </span>

                <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>
                    {artisan.city}, {artisan.region}
                  </span>
                </p>

                <div className="text-[11px] text-stone-600 font-medium mb-4">
                  {artisan._count.products} création
                  {artisan._count.products > 1 ? "s" : ""} au catalogue
                </div>

                <Link
                  href={`/artisans/${artisan.slug}`}
                  className="mt-auto w-full py-2.5 rounded-xl bg-stone-100 group-hover:bg-[#125B3E] group-hover:text-white text-stone-800 text-xs font-bold transition-all flex items-center justify-center gap-1"
                >
                  <span>Découvrir l&apos;atelier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Section "Les Terroirs Artisanaux du Sénégal" */}
      <section className="w-full bg-stone-100/70 py-16 px-4 border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#C2410C]">
              Géographie Culturelle
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#131622] mt-1 tracking-tight">
              Les Terroirs Artisanaux du Sénégal
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Chaque région incarne un art ancestral façonné par les éléments et les générations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TERROIRS.map((t) => (
              <Link
                key={t.name}
                href={t.link}
                className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-[#131622]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {t.name}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-sm text-[#131622] group-hover:text-[#125B3E] transition-colors mb-1.5">
                    {t.specialty}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-4">
                    {t.desc}
                  </p>
                  <span className="mt-auto text-xs font-bold text-[#125B3E] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explorer le terroir</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
