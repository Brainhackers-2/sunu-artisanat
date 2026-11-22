"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlError = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "AdminAccessDenied"
      ? "Accès administration refusé : rôle insuffisant."
      : urlError === "ArtisanAccessRequired"
      ? "Accès réservé aux artisans vérifiés."
      : urlError === "LoginRequired"
      ? "Veuillez vous connecter pour accéder à votre espace."
      : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  }

  function fillDemoAccount(demoIdentifier: string) {
    setIdentifier(demoIdentifier);
    setPassword("SunuArtisanat2026!");
    setError(null);
  }

  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80">
      {/* Logo */}
      <div className="flex flex-col items-center text-center mb-6">
        <Link href="/" className="relative w-48 h-16 mb-2">
          <Image
            src="/images/logo.png"
            alt="SUNU ARTISANAT"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <h1 className="text-xl font-bold text-[#131622] mt-2">Connexion à votre espace</h1>
        <p className="text-xs text-stone-500 mt-1">
          Connectez-vous avec votre adresse email ou votre numéro de téléphone.
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire de connexion */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Email ou Numéro de téléphone
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ex: amadou@sunu.sn ou +221 77 123 45 67"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] focus:border-transparent text-sm bg-stone-50/50"
            />
            <div className="absolute right-3 top-3 text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-stone-700">
              Mot de passe
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-xs text-[#125B3E] hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] focus:border-transparent text-sm bg-stone-50/50"
            />
            <div className="absolute right-3 top-3 text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#125B3E] hover:bg-[#0E4831] text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm mt-2 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours...
            </>
          ) : (
            <>
              Se connecter <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Liens d'inscription */}
      <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col gap-2 text-center text-xs text-stone-600">
        <p>
          Nouveau sur SUNU ARTISANAT ?{" "}
          <Link href="/inscription" className="font-semibold text-[#C2410C] hover:underline">
            Créer un compte client
          </Link>
        </p>
        <p>
          Vous êtes artisan d&apos;art ?{" "}
          <Link href="/atelier/inscription" className="font-semibold text-[#125B3E] hover:underline">
            Rejoindre les ateliers vérifiés
          </Link>
        </p>
      </div>

      {/* Badge Démonstration rapide pour jury & testeurs */}
      <div className="mt-6 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900">
        <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-950">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Comptes de Démonstration (Rôles &amp; Jury)
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => fillDemoAccount("admin@sunuartisanat.sn")}
            className="p-1.5 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 font-medium truncate"
          >
            👑 Super Admin
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("editeur@sunuartisanat.sn")}
            className="p-1.5 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 font-medium truncate"
          >
            ✍️ Éditeur (CR4)
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("moussa.fall@sunuartisanat.sn")}
            className="p-1.5 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 font-medium truncate"
          >
            🪡 Artisan Thiès
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("client@sunuartisanat.sn")}
            className="p-1.5 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 font-medium truncate"
          >
            🛍️ Client Test
          </button>
        </div>
        <p className="mt-2 text-[10px] text-amber-800 text-center">
          Mot de passe : <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">SunuArtisanat2026!</code>
        </p>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#FAF8F5]">
      <Suspense fallback={<div className="text-xs text-stone-500">Chargement...</div>}>
        <ConnexionForm />
      </Suspense>
    </div>
  );
}
