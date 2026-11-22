"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";
import InstallPWAButton from "@/components/pwa/InstallPWAButton";
import { Search, ShoppingCart } from "lucide-react";

const NAV_LINKS = [
  { href: "/boutique", label: "Boutique" },
  { href: "/artisans", label: "Artisans" },
  { href: "/categories", label: "Catégories" },
  { href: "/certification/DEMO-001", label: "Vérifier un certificat" },
];

export default function SiteNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      {/* Barre d'annonce (Section 8.1 CDC) */}
      <div className="bg-[#125B3E] text-white text-center text-xs py-1.5 px-4 hidden sm:block">
        <span className="font-medium">🚚 Livraison Dakar, régions &amp; international</span>
        <span className="mx-3 opacity-40">|</span>
        <span>🔒 Traçabilité QR Code sur chaque création</span>
        <span className="mx-3 opacity-40">|</span>
        <a
          href="https://wa.me/221771234567"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          💬 Assistance WhatsApp Dakar
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.png" alt="Sunu Artisanat" width={36} height={36} className="rounded-lg" />
          <span className="font-extrabold text-[var(--color-primary)] text-lg hidden sm:block leading-tight">
            Sunu Artisanat
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          {/* Recherche */}
          <Link
            href="/recherche"
            aria-label="Rechercher"
            className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </Link>

          {/* Panier */}
          <Link
            href="/panier"
            aria-label="Panier"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ShoppingCart className="w-5 h-5" />
          </Link>

          <div className="hidden lg:block">
            <InstallPWAButton />
          </div>

          {session ? (
            <>
              {session.user.roles?.includes("ADMIN") && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition min-h-[44px] items-center"
                >
                  Admin
                </Link>
              )}
              {(session.user.roles?.includes("ARTISAN") || session.user.roles?.includes("ADMIN")) && (
                <Link
                  href="/atelier"
                  className="hidden sm:inline-flex text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition min-h-[44px] items-center"
                >
                  Mon atelier
                </Link>
              )}
              <Link
                href="/compte"
                className="text-xs font-semibold text-gray-600 hover:underline hidden sm:block min-h-[44px] flex items-center"
              >
                {session.user.name?.split(" ")[0] ?? "Mon compte"}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] hidden sm:block"
              >
                Connexion
              </Link>
              <Link
                href="/atelier/inscription"
                className="hidden md:inline-flex text-xs font-semibold bg-[#FFB800] text-[#131622] px-4 py-2 rounded-lg hover:opacity-90 transition min-h-[44px] items-center"
              >
                Devenir artisan
              </Link>
              <Link
                href="/inscription"
                className="text-sm font-semibold bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition min-h-[44px] flex items-center"
              >
                S'inscrire
              </Link>
            </>
          )}

          {/* Hamburger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-2">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50 last:border-0"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/recherche"
            className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50"
            onClick={() => setOpen(false)}
          >
            🔍 Recherche
          </Link>
          <Link
            href="/panier"
            className="text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50"
            onClick={() => setOpen(false)}
          >
            🛒 Panier
          </Link>

          {session ? (
            <>
              <Link href="/compte" className="text-sm py-2.5 text-gray-600" onClick={() => setOpen(false)}>
                👤 Mon compte ({session.user.name?.split(" ")[0]})
              </Link>
              {(session.user.roles?.includes("ARTISAN") || session.user.roles?.includes("ADMIN")) && (
                <Link href="/atelier" className="text-sm py-2.5 text-amber-700 font-semibold" onClick={() => setOpen(false)}>
                  🏺 Mon atelier
                </Link>
              )}
              {session.user.roles?.includes("ADMIN") && (
                <Link href="/admin" className="text-sm py-2.5 text-gray-700 font-semibold" onClick={() => setOpen(false)}>
                  ⚙️ Administration
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm py-2.5 text-gray-700" onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="text-sm py-2.5 text-[var(--color-primary)] font-semibold"
                onClick={() => setOpen(false)}
              >
                S'inscrire
              </Link>
              <Link
                href="/atelier/inscription"
                className="text-sm py-2.5 text-amber-700 font-semibold"
                onClick={() => setOpen(false)}
              >
                Devenir artisan →
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
