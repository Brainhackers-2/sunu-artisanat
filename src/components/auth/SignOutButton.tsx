"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-stone-200"
      }
    >
      <LogOut className="w-3.5 h-3.5" /> Déconnexion
    </button>
  );
}
