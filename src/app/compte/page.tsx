import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { User, ShoppingBag, Shield, Bell, MapPin, LogOut } from "lucide-react";
import SignOutButton from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/connexion?callbackUrl=/compte");
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: true,
      customerProfile: {
        include: { addresses: true },
      },
      orders: {
        take: 3,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="relative w-36 h-10">
            <Image src="/images/logo.png" alt="SUNU ARTISANAT" fill className="object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-stone-600 hover:text-[#125B3E] hidden sm:inline"
            >
              Retour à la boutique
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#125B3E]/10 text-[#125B3E] flex items-center justify-center font-bold text-xl">
              {profile?.name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[#131622]">{profile?.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#125B3E]/10 text-[#125B3E]">
                  Client Vérifié
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{profile?.email} • {profile?.phone}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.roles.includes("ARTISAN") && (
              <Link
                href="/atelier"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FFB800]/20 text-[#8C6400] hover:bg-[#FFB800]/30 transition-colors"
              >
                Accéder à mon Atelier →
              </Link>
            )}
            {(user.roles.includes("ADMIN") || user.roles.includes("SUPERADMIN") || user.roles.includes("EDITOR")) && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#131622] text-white hover:bg-stone-800 transition-colors"
              >
                Administration →
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats / Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/compte/commandes"
            className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:border-[#125B3E] transition-all group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C2410C]/10 text-[#C2410C] group-hover:bg-[#125B3E]/10 group-hover:text-[#125B3E] transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-stone-500 font-medium">Commandes passées</span>
                  <p className="text-lg font-bold text-[#131622]">{profile?.orders.length || 0}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#125B3E] group-hover:translate-x-0.5 transition-transform">
                Voir tout →
              </span>
            </div>
          </Link>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#125B3E]/10 text-[#125B3E]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">Adresses de livraison</span>
                <p className="text-lg font-bold text-[#131622]">
                  {profile?.customerProfile?.addresses.length || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FFB800]/20 text-[#9A6F00]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">Canal de notification</span>
                <p className="text-sm font-bold text-[#131622] capitalize">
                  {profile?.preferredChannel.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sécurité et rôles */}
        <section className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#131622] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#125B3E]" /> Rôles et Droits Actifs sur le Compte
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile?.roles.map((r) => (
              <span
                key={r.id}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200"
              >
                {r.role}
              </span>
            ))}
          </div>
          <p className="text-xs text-stone-500">
            Les droits d&apos;accès et permissions sont contrôlés côté serveur à chaque requête selon la section 4 du cahier des charges.
          </p>
        </section>
      </main>
    </div>
  );
}
