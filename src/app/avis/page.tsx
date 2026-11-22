import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RatingStars from "@/components/ui/RatingStars";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Avis clients — Ce que pensent nos acheteurs | Sunu Artisanat",
  description:
    "Lisez les avis authentiques de nos clients sur les créations artisanales sénégalaises de Sunu Artisanat.",
};

export default async function AvisPage() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true } },
      product: {
        select: {
          title: true,
          slug: true,
          images: { where: { isPrimary: true }, take: 1 },
          artisan: { select: { workshopName: true, slug: true } },
        },
      },
    },
  });

  // Stats
  const totalReviews = reviews.length;
  const avgGlobal =
    totalReviews > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      totalReviews > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / totalReviews) *
              100
          )
        : 0,
  }));

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Avis clients</span>
      </nav>

      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FFB800] bg-[#FFB800]/15 px-3 py-1 rounded-full">
          Achats vérifiés
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-4 mb-4">
          Avis de nos clients
        </h1>
        <p className="text-stone-600">
          Chaque avis est lié à une commande réellement livrée. Nous ne publions aucun avis non vérifié.
        </p>
      </div>

      {/* Résumé statistiques */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="text-center">
            <p className="text-6xl font-extrabold text-[#FFB800]">
              {avgGlobal.toFixed(1)}
            </p>
            <RatingStars rating={avgGlobal} size="lg" />
            <p className="text-sm text-stone-500 mt-2">
              Basé sur {totalReviews} avis vérifié{totalReviews > 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-2">
            {dist.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-sm">
                <span className="text-xs text-stone-600 w-10 shrink-0">
                  {d.star} ★
                </span>
                <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FFB800] h-2 rounded-full transition-all"
                    style={{ width: `${d.pct}%` }}
                  ></div>
                </div>
                <span className="text-xs text-stone-500 w-8 text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <p className="text-stone-500 text-sm">Aucun avis publié pour le moment.</p>
          <Link
            href="/boutique"
            className="mt-4 inline-flex items-center gap-2 bg-[#125B3E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90"
          >
            Acheter et laisser un avis
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
            >
              {/* Produit */}
              <Link
                href={`/boutique/${review.product.slug}`}
                className="flex items-center gap-3 hover:opacity-80 transition"
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {review.product.images[0]?.url ? (
                    <Image
                      src={review.product.images[0].url}
                      alt={review.product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🧵</div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900 line-clamp-1">
                    {review.product.title}
                  </p>
                  <p className="text-xs text-[#125B3E]">
                    {review.product.artisan.workshopName}
                  </p>
                </div>
              </Link>

              {/* Note et commentaire */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <RatingStars rating={review.rating} size="sm" />
                  <span className="text-xs text-stone-400">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>

              {/* Auteur */}
              <div className="flex items-center gap-2 mt-auto">
                <div className="w-7 h-7 rounded-full bg-[#125B3E]/10 text-[#125B3E] flex items-center justify-center text-xs font-bold">
                  {review.user.name?.charAt(0) ?? "C"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-700">
                    {review.user.name}
                  </p>
                  <p className="text-xs text-[#125B3E]">✓ Achat vérifié</p>
                </div>
                {review.isDemo && (
                  <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    🎭 Démo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center bg-stone-50 border border-stone-200 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-stone-900 mb-3">
          Achetez et laissez votre avis
        </h3>
        <p className="text-stone-600 text-sm mb-6">
          Votre avis aide les artisans sénégalais à se faire connaître et guide les futurs acheteurs.
        </p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 bg-[#C2410C] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition min-h-[48px]"
        >
          Découvrir les créations
        </Link>
      </div>
    </main>
  );
}
