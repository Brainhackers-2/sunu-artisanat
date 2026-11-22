"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import { Search, ShoppingBag, User, Sparkles, MessageCircle, Menu, X, ShieldCheck } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/artisans", label: "Artisans" },
  { href: "/certification/DEMO-001", label: "Passeport Authenticité" },
  { href: "/histoire", label: "Visites 360°" },
];

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* 1. Bandeau Supérieur d'Annonce */}
      <div className="bg-stone-100/90 backdrop-blur-sm border-b border-stone-200/60 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-stone-600 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="text-[#FFB800]">★</span>
              <span>Livraison express à Dakar et sécurisée dans le monde entier</span>
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1.5 text-stone-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#125B3E]" />
              <span>Authenticité 100% garantie &amp; traçabilité déclarée</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/221771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-[#125B3E] transition-colors font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#125B3E]" />
              <span>Assistance WhatsApp Dakar</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Barre de Navigation Principale */}
      <div className="bg-white border-b border-stone-200/80 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between gap-4">
          {/* À gauche : Logo officiel SUNU ARTISANAT avec emblème or et typographie ébène */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group py-1">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB800]/20 to-amber-100 flex items-center justify-center border border-[#FFB800]/40 overflow-hidden shadow-xs">
              <Image
                src="/images/logo.png"
                alt="SUNU ARTISANAT"
                width={36}
                height={36}
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl text-[#131622] tracking-tight leading-tight group-hover:text-[#125B3E] transition-colors">
                SUNU ARTISANAT
              </span>
              <span className="text-[10px] font-bold text-[#FFB800] uppercase tracking-wider hidden sm:block">
                Artisanat d&apos;Art Sénégalais
              </span>
            </div>
          </Link>

          {/* Au centre : Liens de navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 hover:text-[#131622] hover:bg-stone-50 transition-all whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* À droite : Actions (Recherche -> Panier -> Devenir Artisan -> Connexion) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Loupe de recherche interactive */}
            <Link
              href="/recherche"
              aria-label="Rechercher une œuvre ou un artisan"
              className="p-2.5 rounded-xl text-stone-700 hover:text-[#131622] hover:bg-stone-100/80 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-stone-200"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Bouton Panier avec pastille numérique jaune or */}
            <Link
              href="/panier"
              aria-label="Voir le panier"
              className="relative p-2.5 rounded-xl text-stone-700 hover:text-[#131622] hover:bg-stone-100/80 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-stone-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Pastille numérique jaune or */}
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FFB800] text-[#131622] font-black text-[10px] flex items-center justify-center shadow-xs">
                •
              </span>
            </Link>

            {/* Bouton Devenir Artisan en Jaune Or plein */}
            <Link
              href="/atelier/inscription"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#FFB800] text-[#131622] hover:bg-[#E5A700] shadow-sm hover:shadow transition-all min-h-[44px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Devenir Artisan</span>
            </Link>

            {/* Bouton Connexion / Mon Compte sobre et élégant avec icône utilisateur */}
            {session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/compte"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-stone-800 bg-stone-100/80 hover:bg-stone-200/80 transition-colors border border-stone-200 min-h-[44px]"
                >
                  <User className="w-4 h-4 text-[#125B3E]" />
                  <span className="hidden sm:inline">
                    {session.user.name?.split(" ")[0] ?? "Compte"}
                  </span>
                </Link>
                <div className="hidden sm:block">
                  <SignOutButton />
                </div>
              </div>
            ) : (
              <Link
                href="/connexion"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#131622] bg-stone-100/80 hover:bg-stone-200/80 transition-all border border-stone-200 min-h-[44px]"
              >
                <User className="w-4 h-4 text-stone-600" />
                <span>Connexion</span>
              </Link>
            )}

            {/* Bouton Hamburger Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 min-h-[44px] min-w-[44px] flex items-center justify-center border border-stone-200"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Déroulant Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-5 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            <Link
              href="/atelier/inscription"
              className="w-full text-center py-3 rounded-xl text-xs font-black bg-[#FFB800] text-[#131622] hover:bg-[#E5A700] shadow-xs"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✨ Devenir Artisan Partenaire
            </Link>

            {session ? (
              <div className="space-y-2 pt-1">
                <Link
                  href="/compte"
                  className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mon Compte ({session.user.name})
                </Link>
                {session.user.roles?.includes("ARTISAN") && (
                  <Link
                    href="/atelier"
                    className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Accéder à mon Atelier
                  </Link>
                )}
                {session.user.roles?.includes("ADMIN") && (
                  <Link
                    href="/admin"
                    className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-stone-800 text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panneau d&apos;Administration
                  </Link>
                )}
                <div className="pt-2 text-center">
                  <SignOutButton />
                </div>
              </div>
            ) : (
              <Link
                href="/connexion"
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
