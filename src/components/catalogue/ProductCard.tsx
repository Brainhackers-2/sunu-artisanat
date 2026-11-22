import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/ui/RatingStars";

interface ProductCardProps {
  slug: string;
  title: string;
  priceFCFA: number;
  imageUrl?: string | null;
  workshopName: string;
  artisanSlug: string;
  region: string;
  avgRating?: number;
  reviewCount?: number;
  isDemo?: boolean;
  isVerified?: boolean;
}

export default function ProductCard({
  slug,
  title,
  priceFCFA,
  imageUrl,
  workshopName,
  artisanSlug,
  region,
  avgRating,
  reviewCount,
  isDemo,
  isVerified,
}: ProductCardProps) {
  return (
    <article className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <Link href={`/boutique/${slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">🧵</div>
        )}
        {isDemo && (
          <span className="absolute top-2 left-2 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Démo
          </span>
        )}
        {isVerified && (
          <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            ✓ Atelier vérifié
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/boutique/${slug}`} className="font-semibold text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 leading-snug">
          {title}
        </Link>

        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>📍</span>
          <span>{region}</span>
          <span className="mx-1">·</span>
          <Link href={`/artisans/${artisanSlug}`} className="hover:underline truncate">
            {workshopName}
          </Link>
        </div>

        {avgRating !== undefined && (
          <RatingStars rating={avgRating} count={reviewCount} size="sm" />
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--color-primary)]">
            {priceFCFA.toLocaleString("fr-FR")} FCFA
          </span>
          <Link
            href={`/boutique/${slug}`}
            className="text-sm bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition min-h-[44px] flex items-center"
          >
            Voir
          </Link>
        </div>
      </div>
    </article>
  );
}
