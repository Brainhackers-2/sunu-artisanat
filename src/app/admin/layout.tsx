import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Palette,
  FileText,
  Boxes,
  Layers,
  Activity,
  LogOut,
  Sliders,
  Store,
  ShieldCheck,
} from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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

  // Navigation filtrée selon les permissions de la section 4
  const navItems = [
    { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { label: "Artisans & Ateliers", href: "/admin/artisans", icon: Store, hiddenForEditor: true },
    { label: "Catégories", href: "/admin/categories", icon: Layers, hiddenForEditor: false },
    { label: "Thème Officiel (CR4)", href: "/admin/theme", icon: Palette, hiddenForEditor: true },
    { label: "Pages /p/[slug] (CR4)", href: "/admin/pages", icon: FileText, hiddenForEditor: false },
    { label: "Contenus & Bannières", href: "/admin/contenus", icon: Sliders, hiddenForEditor: false },
    { label: "Utilisateurs & Éditeur", href: "/admin/utilisateurs", icon: Users, hiddenForEditor: true },
    { label: "Modules Activables (CR4)", href: "/admin/modules", icon: Boxes, superAdminOnly: true },
    { label: "Journal d'activité", href: "/admin/audit", icon: Activity, hiddenForEditor: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row">
      {/* Sidebar Desktop & Mobile */}
      <aside className="w-full md:w-64 bg-[#131622] text-stone-300 shrink-0 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <Link href="/" className="relative w-36 h-10 brightness-0 invert">
              <Image src="/images/logo.png" alt="SUNU ARTISANAT" fill className="object-contain" priority />
            </Link>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold bg-[#FFB800] text-[#131622]">
              {isSuperAdmin ? "SuperAdmin" : isAdmin ? "Admin" : "Éditeur"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              if (item.hiddenForEditor && isEditor) return null;
              if (item.superAdminOnly && !isSuperAdmin) return null;

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-4 h-4 text-[#FFB800]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="text-xs">
            <p className="font-semibold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-stone-400 truncate">{user.email || user.phone}</p>
          </div>
          <SignOutButton className="w-full justify-center text-xs py-2 text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-stone-700" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-stone-200 h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="text-xs text-stone-500 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#125B3E]" />
            <span>Gouvernance &amp; Administration SUNU ARTISANAT</span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-[#125B3E] hover:underline"
            target="_blank"
          >
            Ouvrir la vitrine publique ↗
          </Link>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
