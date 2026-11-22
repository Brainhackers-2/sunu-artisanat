import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Savoir-faire et Catégories artisanales | Sunu Artisanat",
  description: "Explorez les filières d'artisanat d'art sénégalais : tissage Manjak, maroquinerie de Thiès, poteries de Casamance, bijouterie en filigrane de Dakar et sculptures sur bois.",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  tissage: "Le tissage traditionnel Manjak et le travail du coton biologique sénégalais, perpétuant des motifs géométriques ancestraux porteurs de symboles d'honneur et de protection.",
  maroquinerie: "Héritière des maîtres tanneurs de Thiès, travaillant le cuir pleine fleur de zébu et de chèvre selon des méthodes de tannage végétal végétales et durables.",
  ceramique: "Façonnée à la main en Casamance et dans le Sine Saloum, chaque pièce en terre cuite raconte l'argile des fleuves et la cuisson traditionnelle au feu de bois.",
  bijouterie: "L'art délicat du filigrane d'or et d'argent de Dakar et Saint-Louis, hérité des orfèvres wolofs réputés pour leur finesse incomparable.",
  sculpture: "La noblesse de l'ébène, du caïlcédrat et du bois de rônerie sculptés à la gouge et au ciseau par les maîtres sculpteurs de Ziguinchor et de Dakar.",
  vannerie: "Le tressage minutieux des fibres de rônier et d'herbes des savanes, créant des pièces décoratives et utilitaires alliant robustesse et élégance naturelle.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          products: { where: { status: "PUBLISHED" } },
        },
      },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 w-full">
      {/* En-tête de page */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] bg-[#C2410C]/10 px-3 py-1 rounded-full">
          Patrimoine &amp; Savoir-Faire
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-4 mb-4">
          Les métiers d'art du Sénégal
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Chaque catégorie rassemble des maîtres artisans certifiés, dépositaires de techniques séculaires transmises de génération en génération.
        </p>
      </div>

      {/* Grille des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const desc = CATEGORY_DESCRIPTIONS[cat.slug] ?? cat.description ?? "Découvrez les créations de nos ateliers partenaires.";
          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 bg-stone-100 overflow-hidden">
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-stone-100 text-stone-400">
                    🏺
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                  <h2 className="text-xl font-bold">{cat.name}</h2>
                  <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold">
                    {cat._count.products} création{cat._count.products > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                <p className="text-sm text-stone-600 leading-relaxed">
                  {desc}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm font-bold text-[#125B3E] hover:underline flex items-center gap-1 min-h-[44px]"
                  >
                    Voir la collection →
                  </Link>
                  <Link
                    href={`/boutique?categorie=${cat.slug}`}
                    className="text-xs text-stone-500 hover:text-stone-800"
                  >
                    Filtrer dans la boutique
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
