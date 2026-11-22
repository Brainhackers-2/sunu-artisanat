import Image from "next/image";
import Link from "next/link";

interface ArtisanCardProps {
  slug: string;
  workshopName: string;
  specialty?: string | null;
  region: string;
  logoUrl?: string | null;
  productCount?: number;
  isVerified?: boolean; // mapped from verified
  isDemo?: boolean;
}

export default function ArtisanCard({
  slug,
  workshopName,
  specialty,
  region,
  logoUrl,
  productCount,
  isVerified,
  isDemo,
}: ArtisanCardProps) {
  return (
    <Link
      href={`/artisans/${slug}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col items-center p-6 gap-3 text-center"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-[var(--color-primary)]">
        {logoUrl ? (
          <Image src={logoUrl} alt={workshopName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">👨‍🎨</div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
          {workshopName}
        </h3>
        {specialty && <p className="text-sm text-gray-500 line-clamp-1">{specialty}</p>}
        <p className="text-xs text-gray-400 mt-1">📍 {region}</p>
      </div>

      <div className="flex items-center gap-2 text-xs mt-auto">
        {isVerified && (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
            ✓ Vérifié
          </span>
        )}
        {isDemo && (
          <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
            Démo
          </span>
        )}
        {productCount !== undefined && (
          <span className="text-gray-500">{productCount} produit{productCount !== 1 ? "s" : ""}</span>
        )}
      </div>
    </Link>
  );
}
