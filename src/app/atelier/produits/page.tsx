import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateProductForm from "@/components/atelier/CreateProductForm";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AtelierProduitsPage() {
  const user = await getSessionUser();
  if (!user || !user.artisanProfileId) {
    redirect("/atelier/connexion");
  }

  const [products, categories, artisan] = await Promise.all([
    prisma.product.findMany({
      where: { artisanProfileId: user.artisanProfileId },
      orderBy: { createdAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        inventory: true,
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.artisanProfile.findUnique({ where: { id: user.artisanProfileId } }),
  ]);

  const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Brouillon", cls: "bg-gray-100 text-gray-700" },
    PENDING: { label: "En attente modération", cls: "bg-yellow-100 text-yellow-800" },
    PUBLISHED: { label: "En ligne / Publié", cls: "bg-green-100 text-green-800" },
    REJECTED: { label: "Refusé", cls: "bg-red-100 text-red-800" },
    ARCHIVED: { label: "Archivé", cls: "bg-stone-100 text-stone-600" },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mes Créations</h1>
        <p className="text-sm text-gray-500">
          Atelier {artisan?.workshopName} — Ajoutez vos créations et suivez leur état de validation.
        </p>
      </div>

      {/* Formulaire création */}
      <CreateProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultRegion={artisan?.region ?? "Thiès"}
      />

      {/* Liste des créations */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 text-base mb-4">
          Catalogue de l'atelier ({products.length} produit{products.length > 1 ? "s" : ""})
        </h2>

        {products.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            Vous n'avez pas encore soumis de création.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {products.map((p) => {
              const badge = STATUS_BADGES[p.status] || { label: p.status, cls: "bg-gray-100" };
              return (
                <div key={p.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                      {p.images[0] ? (
                        <Image src={p.images[0].url} alt={p.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🧵
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{p.title}</h3>
                      <p className="text-xs text-gray-500">
                        {p.category.name} · {p.technique} · Stock :{" "}
                        <strong>{p.inventory?.quantity ?? 0}</strong>
                      </p>
                      {p.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">Motif refus : {p.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                      {p.priceFCFA.toLocaleString("fr-FR")} FCFA
                    </span>

                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>

                    {p.status === "PUBLISHED" && (
                      <Link
                        href={`/boutique/${p.slug}`}
                        target="_blank"
                        className="text-xs text-[var(--color-primary)] hover:underline"
                      >
                        Voir la fiche ↗
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
