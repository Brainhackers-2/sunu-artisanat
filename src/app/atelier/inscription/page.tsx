"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { registerArtisan } from "@/actions/auth";
import {
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Hammer,
} from "lucide-react";

export default function ArtisanInscriptionPage() {
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
    const result = await registerArtisan(formData);

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Une erreur est survenue.");
      return;
    }

    setSuccess(result.message || "Demande d'atelier envoyée !");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-10 bg-[#FAF8F5]">
      <div className="w-full max-w-xl bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-stone-200/80">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="relative w-48 h-16 mb-2">
            <Image
              src="/images/logo.png"
              alt="SUNU ARTISANAT"
              fill
              className="object-contain"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#125B3E]/10 text-[#125B3E] mb-2">
            <Hammer className="w-3.5 h-3.5" /> Espace Artisans d&apos;Art
          </div>
          <h1 className="text-2xl font-bold text-[#131622]">Devenir Artisan Partenaire</h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-md">
            Ouvrez votre vitrine numérique officielle, bénéficiez de la traçabilité par QR Code et vendez vos créations au Sénégal et à l&apos;international.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold">Candidature reçue avec succès !</h2>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed max-w-md mx-auto">
              {success}
            </p>
            <div className="pt-2">
              <Link
                href="/atelier/connexion"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#125B3E] text-white rounded-xl text-xs font-semibold hover:bg-[#0E4831]"
              >
                Aller à la connexion atelier <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1 : Informations de l'Atelier */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#131622] uppercase tracking-wider pb-1.5 border-b border-stone-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFB800]" /> 1. Votre Atelier d&apos;Art
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom de l&apos;atelier *
                  </label>
                  <input
                    type="text"
                    name="workshopName"
                    required
                    placeholder="ex: Atelier du Cuir Noble"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Spécialité artisanale *
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    required
                    placeholder="ex: Maroquinerie, Poterie, Filigrane"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="ex: Thiès"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Région *
                  </label>
                  <select
                    name="region"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  >
                    <option value="Dakar">Dakar</option>
                    <option value="Thiès">Thiès</option>
                    <option value="Ziguinchor">Ziguinchor (Casamance)</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Fatick">Fatick</option>
                    <option value="Kaolack">Kaolack</option>
                    <option value="Kédougou">Kédougou</option>
                    <option value="Autre">Autre région</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expérience (années) *
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    min="0"
                    defaultValue="5"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Récit et savoir-faire de l&apos;atelier *
                </label>
                <textarea
                  name="bio"
                  required
                  rows={3}
                  placeholder="Racontez votre histoire, les techniques utilisées, l'héritage de votre atelier..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                ></textarea>
              </div>
            </div>

            {/* Section 2 : Coordonnées de l'Artisan */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-[#131622] uppercase tracking-wider pb-1.5 border-b border-stone-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#125B3E]" /> 2. Coordonnées &amp; Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom du responsable *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="ex: Moussa Fall"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Adresse email professionnelle *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="ex: atelier@exemple.sn"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Téléphone direct *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Numéro WhatsApp (commandes) *
                  </label>
                  <input
                    type="tel"
                    name="whatsappPhone"
                    required
                    placeholder="+221 77 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mot de passe de connexion *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  placeholder="Au moins 8 caractères"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#125B3E] text-sm bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Canal de notification souhaité
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input type="radio" name="preferredChannel" value="EMAIL" />
                    <span>Email</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input type="radio" name="preferredChannel" value="WHATSAPP" />
                    <span>WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-1.5 p-2 rounded-lg border border-stone-200 text-xs cursor-pointer hover:bg-stone-50">
                    <input type="radio" name="preferredChannel" value="BOTH" defaultChecked />
                    <span>Les deux</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Note de réassurance */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#125B3E] shrink-0 mt-0.5" />
              <span>
                <strong>Procédure de vérification :</strong> Chaque atelier fait l&apos;objet d&apos;une validation par notre équipe d&apos;administration afin de garantir l&apos;origine déclarée et l&apos;authenticité des œuvres. Vous serez notifié dès confirmation.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#125B3E] hover:bg-[#0E4831] text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Envoi de votre candidature...
                </>
              ) : (
                <>
                  Soumettre ma candidature d&apos;artisan <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-600">
          Vous avez déjà un atelier enregistré ?{" "}
          <Link href="/atelier/connexion" className="font-semibold text-[#125B3E] hover:underline">
            Se connecter à l&apos;espace atelier
          </Link>
        </div>
      </div>
    </div>
  );
}
