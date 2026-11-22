import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Store, Sparkles, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ArtisansDirectoryPage() {
  const artisans = await prisma.artisanProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          products: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* 1. En-tête de page : Fond pierre clair, grand titre ébène, surtitre vert forêt */}
      <section className="bg-stone-100/80 border-b border-stone-200/80 py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#125B3E]/10 text-[#125B3E] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maîtres d&apos;Art &amp; Ateliers Partenaires</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#131622] tracking-tight">
            Rencontrez les Créateurs du Sénégal
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Potiers de Casamance, maroquiniers de Thiès, orfèvres de Saint-Louis et sculpteurs de Dakar. Découvrez des ateliers certifiés, dépositaires d&apos;un patrimoine vivant unique.
          </p>
        </div>
      </section>

      {/* 2. Grille des Ateliers */}
      <main className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-xs sm:text-sm font-semibold text-stone-600">
            <strong>{artisans.length}</strong> atelier{artisans.length > 1 ? "s" : ""} agréé{artisans.length > 1 ? "s" : ""}
          </p>
          <span className="text-xs font-semibold text-[#125B3E] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#125B3E]" />
            <span>Contrôle qualité &amp; traçabilité déclarée</span>
          </span>
        </div>

        {artisans.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80 space-y-4">
            <Store className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-lg font-bold text-[#131622]">
              Aucun atelier disponible pour le moment
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Les ateliers partenaires sont actuellement en cours d&apos;audit administratif. Revenez très prochainement !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artisans.map((artisan) => {
              const coverImg =
                artisan.coverUrl ||
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80";
              const logoImg =
                artisan.logoUrl ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";

              return (
                <article
                  key={artisan.id}
                  className="group bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Couverture de l'atelier (coverUrl) : Bannière panoramique hauteur 176px (h-44) avec voile noir léger */}
                  <div className="relative h-44 w-full bg-stone-200 overflow-hidden">
                    <Image
                      src={coverImg}
                      alt={`Couverture atelier ${artisan.workshopName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/25" />

                    {artisan.isDemo && (
                      <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        🎭 Démo
                      </span>
                    )}
                  </div>

                  {/* Zone de contenu avec avatar superposé */}
                  <div className="px-6 pt-0 pb-6 flex flex-col flex-1 relative">
                    {/* Photo de profil / Logo (logoUrl) : Médaillon carré arrondi (w-20 h-20 rounded-2xl) superposé en bas à gauche de la couverture avec bordure blanche de 4px et ombre portée */}
                    <div className="relative -mt-10 mb-3 w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden shrink-0">
                      <Image
                        src={logoImg}
                        alt={artisan.workshopName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Badges : Ville, région et badge "Certifié SUNU" avec icône bouclier vert forêt */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#125B3E]/10 text-[#125B3E] border border-[#125B3E]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#125B3E]" />
                        <span>Certifié SUNU</span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          {artisan.city}, {artisan.region}
                        </span>
                      </span>
                    </div>

                    {/* Informations : Nom de l'atelier, spécialité, extrait de biographie et compteur d'œuvres en ligne */}
                    <h2 className="text-lg font-black text-[#131622] group-hover:text-[#125B3E] transition-colors line-clamp-1">
                      {artisan.workshopName}
                    </h2>

                    <span className="text-xs font-bold text-[#C2410C] mt-0.5 mb-2">
                      {artisan.specialty}
                    </span>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {artisan.bio ||
                        "Artisan sénégalais perpétuant un savoir-faire d'excellence dans le respect des traditions."}
                    </p>

                    <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-stone-700">
                        {artisan._count.products} œuvre
                        {artisan._count.products > 1 ? "s" : ""} en ligne
                      </span>

                      {/* Bouton d'action : Bouton terracotta sombre intitulé "Visiter l'atelier →" */}
                      <Link
                        href={`/artisans/${artisan.slug}`}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5"
                      >
                        <span>Visiter l&apos;atelier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
