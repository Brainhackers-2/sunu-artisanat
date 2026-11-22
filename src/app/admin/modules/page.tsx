import { prisma } from "@/lib/prisma";
import { ModuleToggleCard } from "@/components/admin/ModuleToggleCard";
import { Boxes, ShieldAlert } from "lucide-react";

export default async function AdminModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/20 text-[#8C6400] mb-2">
          Opération CR4 #4
        </div>
        <h1 className="text-xl font-bold text-[#131622] flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[#125B3E]" /> Gestion des Modules Activables
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Chaque service externe ou fonctionnalité innovante (Groq AI, Resend, WhatsApp, Paiement réel) est livré dans le code et piloté par un interrupteur en base. Action réservée au Super-Administrateur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <ModuleToggleCard key={m.id} module={m} />
        ))}
      </div>
    </div>
  );
}
