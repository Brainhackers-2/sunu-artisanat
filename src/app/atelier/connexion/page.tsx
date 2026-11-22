"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, AlertCircle, ArrowRight, Loader2, Hammer } from "lucide-react";

function ArtisanConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/atelier";
  const urlError = searchParams.get("error");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError === "ArtisanAccessRequired"
      ? "Cet espace est exclusivement réservé aux artisans d'art."
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

  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80">
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#125B3E]/10 text-[#125B3E] mb-1">
          <Hammer className="w-3.5 h-3.5" /> Espace Atelier Artisan
        </div>
        <h1 className="text-xl font-bold text-[#131622] mt-1">Connexion Atelier</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Gérez vos créations, vos stocks et vos commandes.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Email ou Téléphone de l&apos;artisan
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ex: moussa.fall@sunuartisanat.sn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
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
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
            />
            <div className="absolute right-3 top-3 text-stone-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#125B3E] hover:bg-[#0E4831] text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Accès à l&apos;atelier...
            </>
          ) : (
            <>
              Accéder à mon atelier <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col gap-2 text-center text-xs text-stone-600">
        <p>
          Vous n&apos;avez pas encore d&apos;atelier enregistré ?{" "}
          <Link href="/atelier/inscription" className="font-semibold text-[#125B3E] hover:underline">
            Déposer une candidature d&apos;artisan
          </Link>
        </p>
        <p>
          Vous êtes client ?{" "}
          <Link href="/connexion" className="font-semibold text-[#C2410C] hover:underline">
            Espace client
          </Link>
        </p>
      </div>

      <div className="mt-4 p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 flex items-center justify-between">
        <span>Compte test Artisan Thiès :</span>
        <button
          type="button"
          onClick={() => {
            setIdentifier("moussa.fall@sunuartisanat.sn");
            setPassword("SunuArtisanat2026!");
          }}
          className="px-2 py-1 bg-[#125B3E]/10 text-[#125B3E] rounded font-semibold hover:bg-[#125B3E]/20"
        >
          Remplir
        </button>
      </div>
    </div>
  );
}

export default function ArtisanConnexionPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#FAF8F5]">
      <Suspense fallback={<div className="text-xs text-stone-500">Chargement...</div>}>
        <ArtisanConnexionForm />
      </Suspense>
    </div>
  );
}
