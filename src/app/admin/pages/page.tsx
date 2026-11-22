import { prisma } from "@/lib/prisma";
import { CreatePageForm } from "@/components/admin/CreatePageForm";
import Link from "next/link";
import { FileText, ExternalLink, Calendar } from "lucide-react";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#8C6400] mb-2">
          Opération CR4 #3
        </div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#125B3E]" /> Gestion des Pages Administrées
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Créez de nouvelles pages de contenu publiées sur <code>/p/[slug]</code> et intégrées au site sans redéploiement.
        </p>
      </div>

      <CreatePageForm />

      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Pages actuellement publiées ({pages.length})
          </h2>
        </div>

        <div className="divide-y divide-stone-100">
          {pages.length === 0 ? (
            <p className="p-6 text-center text-xs text-stone-500">Aucune page personnalisée créée.</p>
          ) : (
            pages.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-stone-50/60">
                <div>
                  <h3 className="font-bold text-sm text-[#131622]">{p.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                    <span className="font-mono text-stone-500">/p/{p.slug}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(p.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      p.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {p.isPublished ? "Publié" : "Brouillon"}
                  </span>
                  <Link
                    href={`/p/${p.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors inline-flex items-center gap-1 text-xs"
                    title="Voir la page publique"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Voir
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
