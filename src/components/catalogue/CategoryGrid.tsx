import Link from "next/link";

interface CategoryGridProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string | null;
    productCount?: number;
  }[];
}

const DEFAULT_ICONS: Record<string, string> = {
  tissage: "🧶",
  ceramique: "🏺",
  maroquinerie: "👜",
  bijouterie: "💍",
  sculpture: "🗿",
};

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {categories.map((cat) => {
        const icon = DEFAULT_ICONS[cat.slug] ?? "🎨";
        return (
          <Link
            key={cat.id}
            href={`/boutique?categorie=${cat.slug}`}
            className="group flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-[var(--color-primary)] transition-all text-center"
          >
            <span className="text-4xl">{icon}</span>
            <span className="font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors text-sm">
              {cat.name}
            </span>
            {cat.productCount !== undefined && (
              <span className="text-xs text-gray-400">{cat.productCount} produits</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
