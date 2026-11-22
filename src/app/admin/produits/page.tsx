import { requireAuthWithRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import ProductModerationCard from "@/components/admin/ProductModerationCard";

export const dynamic = "force-dynamic";

export default async function AdminProduitsPage() {
  await requireAuthWithRole(["ADMIN", "SUPERADMIN"]);

  const pendingProducts = await prisma.product.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      artisan: { select: { workshopName: true, region: true } },
      category: { select: { name: true } },
      materials: true,
      images: { where: { isPrimary: true }, take: 1 },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modération des Produits</h1>
        <p className="text-sm text-gray-500">
          Validation admin obligatoire avant publication (Règle non négociable 7).
        </p>
      </div>

      {pendingProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
          <span className="text-4xl block mb-2">🎉</span>
          Aucun produit en attente de validation.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingProducts.map((p) => (
            <ProductModerationCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                priceFCFA: p.priceFCFA,
                originRegion: p.originRegion,
                technique: p.technique,
                description: p.description,
                status: p.status,
                imageUrl: p.images[0]?.url,
                artisan: p.artisan,
                category: p.category,
                materials: p.materials,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
