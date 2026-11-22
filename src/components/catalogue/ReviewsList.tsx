import RatingStars from "@/components/ui/RatingStars";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  isDemo?: boolean;
  author: { name?: string | null };
}

interface ReviewsListProps {
  reviews: Review[];
  avgRating: number;
}

export default function ReviewsList({ reviews, avgRating }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-gray-400 text-sm py-6 text-center">
        Aucun avis pour ce produit pour l'instant.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
        <div>
          <RatingStars rating={avgRating} size="lg" />
          <p className="text-sm text-gray-500">{reviews.length} avis</p>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-800">
                  {r.author.name ?? "Client anonyme"}
                </span>
                {r.isDemo && (
                  <span className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
                    Démo
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: fr })}
              </span>
            </div>
            <RatingStars rating={r.rating} size="sm" />
            {r.comment && <p className="mt-1 text-sm text-gray-600">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
