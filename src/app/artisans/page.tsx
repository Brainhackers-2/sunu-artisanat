import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import ArtisanCard from "@/components/catalogue/ArtisanCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ateliers vérifiés — Artisans sénégalais | Sunu Artisanat",
  description:
    "Rencontrez les artisans vérifiés de Sunu Artisanat : tisserands, céramistes, maroquiniers, bijoutiers et sculpteurs de Thiès, Dakar, Casamance et Saint-Louis.",
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
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Nos artisans</h1>
      <p className="text-gray-500 mb-8">
        {artisans.length} atelier{artisans.length !== 1 ? "s" : ""} vérifié{artisans.length !== 1 ? "s" : ""}
      </p>

      {/* Filtre région */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["", ...REGIONS].map((r) => {
          const href = r ? `/artisans?region=${encodeURIComponent(r)}` : "/artisans";
          const active = (searchParams.region ?? "") === r;
          return (
            <a
              key={r}
              href={href}
              className={`text-sm px-4 py-2 rounded-full border transition ${
                active
                  ? "bg-[var(--color-primary)] text-white border-transparent"
                  : "border-gray-200 hover:border-gray-400 text-gray-600"
              }`}
            >
              {r || "Toutes les régions"}
            </a>
          );
        })}
      </div>

      {artisans.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p>Aucun artisan dans cette région pour l'instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {artisans.map((a) => (
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
      )}
    </main>
  );
}
