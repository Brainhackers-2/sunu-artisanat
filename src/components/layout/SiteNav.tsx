"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import SignOutButton from "@/components/auth/SignOutButton";

const NAV_LINKS = [
  { href: "/boutique", label: "Boutique" },
  { href: "/artisans", label: "Artisans" },
  { href: "/panier", label: "Panier 🛒" },
];

export default function SiteNav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/images/logo.png" alt="Sunu Artisanat" width={36} height={36} className="rounded-lg" />
          <span className="font-extrabold text-[var(--color-primary)] text-lg hidden sm:block leading-tight">
            Sunu Artisanat
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 hover:text-[var(--color-primary)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {session.user.roles?.includes("ADMIN") && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  Admin
                </Link>
              )}
              {(session.user.roles?.includes("ARTISAN") || session.user.roles?.includes("ADMIN")) && (
                <Link
                  href="/atelier"
                  className="hidden sm:inline-flex text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
                >
                  Mon atelier
                </Link>
              )}
              <Link href="/compte" className="text-xs font-semibold text-gray-600 hover:underline hidden sm:block">
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-700 py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link href="/compte" className="text-sm py-2 text-gray-600" onClick={() => setOpen(false)}>
                Mon compte
              </Link>
              {(session.user.roles?.includes("ARTISAN") || session.user.roles?.includes("ADMIN")) && (
                <Link href="/atelier" className="text-sm py-2 text-amber-700" onClick={() => setOpen(false)}>
                  Mon atelier
                </Link>
              )}
              {session.user.roles?.includes("ADMIN") && (
                <Link href="/admin" className="text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>
                  Administration
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm py-2 text-gray-700" onClick={() => setOpen(false)}>
                Connexion
              </Link>
              <Link href="/inscription" className="text-sm py-2 text-[var(--color-primary)] font-semibold" onClick={() => setOpen(false)}>
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
