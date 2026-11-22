"use client";

import { useState } from "react";
import { createEditorUserAction } from "@/actions/admin";
import { UserPlus, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export function CreateEditorForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await createEditorUserAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Erreur lors de la création du compte.");
      return;
    }

    setMessage(res.message || "Compte Éditeur créé !");
    form.reset();
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#131622] flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#125B3E]" /> Créer un nouveau compte Éditeur (CR4)
        </h2>
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
          Rôle Restreint
        </span>
      </div>

      <p className="text-xs text-stone-500">
        L&apos;éditeur peut modifier les textes, bannières, pages et modérer les avis. Il n&apos;a aucun accès aux paiements, reversements, réglages techniques ni modules.
      </p>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nom complet de l&apos;éditeur *
            </label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="ex: Babacar Sène"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email professionnel *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="editeur@sunuartisanat.sn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Numéro de téléphone *
            </label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+221 77 000 00 00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mot de passe provisoire *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Au moins 8 caractères"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-[#131622] hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Créer le compte Éditeur</span>
          </button>
        </div>
      </form>
    </div>
  );
}
