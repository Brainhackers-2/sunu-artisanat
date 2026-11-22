import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Package2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Artisans vérifiés — Ateliers du Sénégal | Sunu Artisanat",
  description:
    "Rencontrez les maîtres artisans vérifiés de Sunu Artisanat : tisserands, céramistes, maroquiniers, bijoutiers et sculpteurs de Thiès, Dakar, Casamance et Saint-Louis.",
};

const REGIONS = ["Thiès", "Dakar", "Casamance", "Saint-Louis", "Autre"];

interface Props {
  searchParams: { region?: string };
}

export default async function ArtisansPage({ searchParams }: Props) {
  const where = {
    status: "APPROVED" as const,
    ...(searchParams.region ? { region: searchParams.region } : {}),
  };

  const artisans = await prisma.artisanProfile.findMany({
    where,
    orderBy: { workshopName: "asc" },
    include: {
      _count: { select: { products: { where: { status: "PUBLISHED" } } } },
    },
  });

  return (
    <main className="w-full">
      {/* Bannière hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-[#131622] to-[#125B3E] text-white py-14 sm:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#FFB800] bg-white/10 px-3 py-1 rounded-full mb-4">
            Ateliers Vérifiés
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
            Les maîtres artisans du Sénégal
          </h1>
          <p className="text-stone-200 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Chaque atelier est validé manuellement par notre équipe. Leurs créations portent un certificat de traçabilité QR Code garantissant l'origine déclarée et les matériaux.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-[#FFB800]">{artisans.length}+</p>
              <p className="text-xs text-stone-300">Ateliers actifs</p>
            </div>
            <div className="border-l border-white/20"></div>
            <div>
              <p className="text-2xl font-extrabold text-[#FFB800]">4</p>
              <p className="text-xs text-stone-300">Régions couvertes</p>
            </div>
            <div className="border-l border-white/20"></div>
            <div>
              <p className="text-2xl font-extrabold text-[#FFB800]">100%</p>
              <p className="text-xs text-stone-300">Validés manuellement</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filtre région */}
        <div className="flex flex-wrap gap-2 mb-10 items-center">
          <span className="text-sm font-semibold text-stone-600 mr-2">Région :</span>
          {["", ...REGIONS].map((r) => {
            const href = r ? `/artisans?region=${encodeURIComponent(r)}` : "/artisans";
            const active = (searchParams.region ?? "") === r;
            return (
              <a
                key={r}
                href={href}
                className={`text-sm px-4 py-2 rounded-full border transition min-h-[44px] flex items-center ${
                  active
                    ? "bg-[#125B3E] text-white border-transparent"
                    : "border-stone-200 hover:border-stone-400 text-stone-600 bg-white"
                }`}
              >
                {r || "Toutes les régions"}
              </a>
            );
          })}
        </div>

        {artisans.length === 0 ? (
          <div className="text-center bg-white rounded-2xl border border-stone-200 py-20 px-4">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-stone-700 font-medium mb-2">Aucun artisan dans cette région pour l'instant.</p>
            <Link href="/artisans" className="text-sm text-[#125B3E] hover:underline font-semibold">
              Voir tous les artisans
            </Link>
          </div>
        ) : (
          /* Grille avec bannière + médaillon (Section 8.2 CDC) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artisans.map((artisan) => (
              <Link
                key={artisan.id}
                href={`/artisans/${artisan.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col"
              >
                {/* Bannière panoramique */}
                <div className="relative h-32 bg-gradient-to-br from-stone-200 to-stone-300 overflow-hidden">
                  {artisan.coverUrl ? (
                    <Image
                      src={artisan.coverUrl}
                      alt={`Atelier ${artisan.workshopName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#125B3E]/20 to-[#FFB800]/20">
                      <span className="text-4xl opacity-50">🏺</span>
                    </div>
                  )}
                  {/* Overlay dégradé */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                  {/* Badge démo */}
                  {artisan.isDemo && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      🎭 Démo
                    </span>
                  )}
                </div>

                {/* Médaillon de profil */}
                <div className="relative px-5 pb-5 flex-1 flex flex-col">
                  <div className="relative -mt-8 mb-3 flex items-end justify-between">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-white bg-stone-100 shadow-md">
                      {artisan.logoUrl ? (
                        <Image
                          src={artisan.logoUrl}
                          alt={artisan.workshopName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-[#125B3E]/10">
                          👨‍🎨
                        </div>
                      )}
                    </div>
                    {artisan.verified && (
                      <div className="flex items-center gap-1 bg-[#125B3E] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                        <ShieldCheck className="w-3 h-3" />
                        Atelier vérifié
                      </div>
                    )}
                  </div>

                  <h2 className="font-extrabold text-stone-900 group-hover:text-[#125B3E] transition-colors leading-snug mb-1">
                    {artisan.workshopName}
                  </h2>

                  {artisan.specialty && (
                    <p className="text-xs text-stone-500 mb-2 line-clamp-1">{artisan.specialty}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-auto pt-3 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {artisan.city ? `${artisan.city}, ` : ""}{artisan.region}
                    </span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Package2 className="w-3 h-3" />
                      {artisan._count.products} création{artisan._count.products !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA devenir artisan */}
        <div className="mt-14 bg-gradient-to-r from-[#125B3E] to-emerald-700 rounded-3xl p-8 sm:p-12 text-white text-center">
          <span className="text-4xl block mb-4">🏺</span>
          <h2 className="text-2xl font-extrabold mb-3">Vous êtes artisan sénégalais ?</h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto mb-6">
            Ouvrez votre vitrine digitale gratuitement. Publiez vos créations avec leur certificat de traçabilité QR Code et atteignez des clients du monde entier.
          </p>
          <Link
            href="/atelier/inscription"
            className="inline-flex items-center gap-2 bg-[#FFB800] text-[#131622] px-8 py-3.5 rounded-xl font-extrabold text-sm hover:opacity-90 transition min-h-[48px]"
          >
            Ouvrir mon atelier gratuitement →
          </Link>
        </div>
      </div>
    </main>
  );
}
