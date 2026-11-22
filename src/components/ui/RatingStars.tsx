"use client";

interface RatingStarsProps {
  rating: number; // 1–5
  count?: number;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({ rating, count, size = "md" }: RatingStarsProps) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-xl" };
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <span className={`inline-flex items-center gap-1 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= full
              ? "text-yellow-400"
              : i === full + 1 && half
              ? "text-yellow-300"
              : "text-gray-300"
          }
        >
          ★
        </span>
      ))}
      {count !== undefined && (
        <span className="text-gray-500 text-sm ml-1">({count})</span>
      )}
    </span>
  );
}
