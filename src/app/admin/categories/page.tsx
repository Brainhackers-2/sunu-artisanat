import { prisma } from "@/lib/prisma";
import { CreateCategoryForm } from "@/components/admin/CreateCategoryForm";
import { Layers, Image as ImageIcon } from "lucide-react";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#125B3E]" /> Gestion des Catégories d&apos;Artisanat
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Catégories sur un seul niveau en v1, utilisées pour filtrer la boutique et valoriser les techniques artisanales.
        </p>
      </div>

      <CreateCategoryForm />

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Catégories actives ({categories.length})
          </h2>
        </div>

        <div className="divide-y divide-stone-100">
          {categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center overflow-hidden shrink-0 border border-stone-200">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-stone-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#131622]">{c.name}</h3>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{c.description || "Aucune description"}</p>
                  <span className="text-[10px] font-mono text-stone-400">slug : {c.slug}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#125B3E] px-2.5 py-1 bg-[#125B3E]/10 rounded-full">
                  {c.products.length} produit(s)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
