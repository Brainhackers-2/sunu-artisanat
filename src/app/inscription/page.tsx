"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { registerClient } from "@/actions/auth";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function InscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerClient(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Une erreur est survenue.");
      return;
    }

    setSuccess(result.message || "Compte créé avec succès !");
    setTimeout(() => {
      router.push("/connexion");
    }, 2000);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="relative w-44 h-14 mb-2">
            <Image
              src="/images/logo.png"
              alt="SUNU ARTISANAT"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-xl font-bold text-[#131622] mt-1">Créer un compte client</h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Commandez chez nos artisans d&apos;art et suivez vos livraisons facilement.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nom complet
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                placeholder="ex: Aminata Diallo"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
              />
              <div className="absolute right-3 top-3 text-stone-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="ex: aminata@exemple.sn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
              />
              <div className="absolute right-3 top-3 text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Numéro de téléphone (Sénégal)
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                required
                placeholder="ex: +221 77 123 45 67"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
              />
              <div className="absolute right-3 top-3 text-stone-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Ville de résidence
            </label>
            <select
              name="city"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
            >
              <option value="Dakar">Dakar</option>
              <option value="Thiès">Thiès</option>
              <option value="Saint-Louis">Saint-Louis</option>
              <option value="Ziguinchor">Ziguinchor (Casamance)</option>
              <option value="Mbour">Mbour</option>
              <option value="Autre région">Autre région du Sénégal</option>
              <option value="International">International</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="Au moins 8 caractères"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
              />
              <div className="absolute right-3 top-3 text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Canal de notification préféré
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                <input type="radio" name="preferredChannel" value="EMAIL" defaultChecked />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                <input type="radio" name="preferredChannel" value="WHATSAPP" />
                <span>WhatsApp</span>
              </label>
              <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                <input type="radio" name="preferredChannel" value="BOTH" />
                <span>Les deux</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#C2410C] hover:bg-[#9A3412] text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm mt-4 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Inscription en cours...
              </>
            ) : (
              <>
                Créer mon compte <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-[#125B3E] hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
