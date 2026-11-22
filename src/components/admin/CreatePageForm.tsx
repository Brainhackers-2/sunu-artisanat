"use client";

import { useState } from "react";
import { createPageAction } from "@/actions/admin";
import { FilePlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function CreatePageForm() {
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

    const res = await createPageAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Erreur lors de la création de la page.");
      return;
    }

    setMessage(res.message || "Page créée avec succès !");
    form.reset();
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4 shadow-sm">
      <h2 className="text-sm font-bold text-[#131622] flex items-center gap-2">
        <FilePlus className="w-4 h-4 text-[#125B3E]" /> Créer et publier une nouvelle page
      </h2>

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
              Titre de la page *
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="ex: Guide d'entretien du cuir de Thiès"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Identifiant URL (slug) *
            </label>
            <div className="flex items-center">
              <span className="px-2.5 py-2.5 bg-stone-100 border border-r-0 border-stone-300 rounded-l-xl text-stone-500 text-xs">
                /p/
              </span>
              <input
                type="text"
                name="slug"
                required
                placeholder="guide-entretien-cuir"
                className="w-full px-3.5 py-2.5 rounded-r-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Contenu éditorial (Texte ou Markdown) *
          </label>
          <textarea
            name="content"
            required
            rows={5}
            placeholder="Rédigez le contenu complet de la page ici..."
            className="w-full p-3.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none leading-relaxed"
          ></textarea>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-stone-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              defaultChecked
              className="w-4 h-4 rounded text-[#125B3E] focus:ring-[#125B3E]"
            />
            <span>Publier immédiatement sur la marketplace</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-[#125B3E] hover:bg-[#0E4831] text-white font-semibold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
            <span>Publier la page</span>
          </button>
        </div>
      </form>
    </div>
  );
}
