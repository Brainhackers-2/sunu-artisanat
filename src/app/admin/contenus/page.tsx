import { prisma } from "@/lib/prisma";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";
import { Sliders } from "lucide-react";

export default async function AdminContenusPage() {
  const blocks = await prisma.contentBlock.findMany({
    orderBy: { key: "asc" },
  });

  const blockDescriptions: Record<string, string> = {
    "home.hero.title": "Titre principal de l'accueil (Hero)",
    "home.hero.subtitle": "Sous-titre et message d'accroche de l'accueil",
    "home.reassurance.shipping": "Bandeau réassurance - Expédition & Livraison",
    "home.reassurance.traceability": "Bandeau réassurance - Traçabilité & Ateliers vérifiés",
    "home.reassurance.payment": "Bandeau réassurance - Moyens de paiement acceptés",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#125B3E]" /> Gestion des Contenus &amp; Textes Publics
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Chaque texte public est lu dans la table <code>ContentBlock</code> par clé stable, avec le texte par défaut du code en repli. Modifiez les messages sans toucher au code.
        </p>
      </div>

      <div className="space-y-4">
        {blocks.map((b) => (
          <ContentBlockEditor
            key={b.id}
            blockKey={b.key}
            initialValue={b.value}
            label={blockDescriptions[b.key] || b.key}
          />
        ))}
      </div>
    </div>
  );
}
