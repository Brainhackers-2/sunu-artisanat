import { prisma } from "@/lib/prisma";
import { ThemeEditorForm } from "@/components/admin/ThemeEditorForm";
import { Palette, Info } from "lucide-react";

export default async function AdminThemePage() {
  const currentTheme = await prisma.theme.findFirst({
    where: { isDefault: true },
  });

  const initialTheme = {
    colorForest: currentTheme?.colorForest || "#125B3E",
    colorGold: currentTheme?.colorGold || "#FFB800",
    colorTerracotta: currentTheme?.colorTerracotta || "#C2410C",
    colorEbony: currentTheme?.colorEbony || "#131622",
    colorIvory: currentTheme?.colorIvory || "#FAF8F5",
    fontSans: currentTheme?.fontSans || "Inter",
    fontHeading: currentTheme?.fontHeading || "Playfair Display",
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#8C6400] mb-2">
          Opération CR4 #2
        </div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#125B3E]" /> Gestion du Thème en Direct
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Modifiez les couleurs et polices de la marketplace. Les changements sont enregistrés dans la table PostgreSQL <code>Theme</code> et s&apos;appliquent instantanément à tout le site sans redéploiement.
        </p>
      </div>

      <ThemeEditorForm initialTheme={initialTheme} />
    </div>
  );
}
