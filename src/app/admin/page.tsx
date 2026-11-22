import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Palette,
  Layers,
  ShoppingBag,
  CreditCard,
  FileText,
  Activity,
  CheckCircle,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/connexion?callbackUrl=/admin");
  }

  const isSuperAdmin = user.roles.includes("SUPERADMIN");
  const isAdmin = user.roles.includes("ADMIN");
  const isEditor = user.roles.includes("EDITOR");

  if (!isSuperAdmin && !isAdmin && !isEditor) {
    redirect("/connexion?error=AdminAccessDenied");
  }

  // Statistiques d'administration
  const [pendingArtisansCount, pendingProductsCount, ordersCount, totalUsersCount] =
    await Promise.all([
      prisma.artisanProfile.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.user.count(),
    ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      {/* Header Admin */}
      <header className="bg-[#131622] text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative w-36 h-10 brightness-0 invert">
              <Image src="/images/logo.png" alt="SUNU ARTISANAT" fill className="object-contain" />
            </Link>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFB800] text-[#131622]">
              {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "Éditeur"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-300 hidden sm:inline">{user.name}</span>
            <SignOutButton className="text-stone-300 hover:text-white border-stone-700 hover:bg-stone-800 text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Titre */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#131622]">Tableau de Bord d&apos;Administration</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Supervision de la marketplace, validation des ateliers et gouvernance de la plateforme.
            </p>
          </div>

          {isEditor && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
              Rôle Éditeur : accès restreint aux contenus et avis (CR4)
            </span>
          )}
        </div>

        {/* 4 Indicateurs Clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Artisans en attente</span>
            <p className="text-2xl font-bold text-[#C2410C] mt-1">{pendingArtisansCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Produits à valider</span>
            <p className="text-2xl font-bold text-[#125B3E] mt-1">{pendingProductsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Commandes</span>
            <p className="text-2xl font-bold text-[#131622] mt-1">
              {isEditor ? "Masqué" : ordersCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-semibold text-stone-500">Comptes utilisateurs</span>
            <p className="text-2xl font-bold text-[#131622] mt-1">{totalUsersCount}</p>
          </div>
        </div>

        {/* Grille des 4 Opérations CR4 & Modules */}
        <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#131622] uppercase tracking-wider">
            Gouvernance &amp; Opérations de Démonstration (CR4)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-xs text-[#131622] mb-1">1. Compte Éditeur</div>
              <p className="text-[11px] text-stone-600">
                L&apos;éditeur peut modifier textes et images, mais n&apos;a aucun accès aux paiements ni réglages.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-xs text-[#131622] mb-1">2. Thème Dynamique</div>
              <p className="text-[11px] text-stone-600">
                Changement des 5 couleurs du Sénégal en base sans aucun redéploiement.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-xs text-[#131622] mb-1">3. Nouvelle Page</div>
              <p className="text-[11px] text-stone-600">
                Création et publication instantanée sur /p/[slug] et ajout au menu.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-xs text-[#131622] mb-1">4. Module Activable</div>
              <p className="text-[11px] text-stone-600">
                Activation ou désactivation du module Assistant IA sans recompilation.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
