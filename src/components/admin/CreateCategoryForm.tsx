"use client";

import { useState } from "react";
import { createCategoryAction } from "@/actions/admin";
import { Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function CreateCategoryForm() {
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

    const res = await createCategoryAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Erreur lors de la création.");
      return;
    }

    setMessage(res.message || "Catégorie créée !");
    form.reset();
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-[#131622] flex items-center gap-2">
        <Plus className="w-4 h-4 text-[#125B3E]" /> Ajouter une catégorie d&apos;artisanat
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
              Nom de la catégorie *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="ex: Vannerie & Tressage de jonc"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              URL de l&apos;image d&apos;illustration
            </label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            placeholder="Courte présentation de la spécialité et des régions phares..."
            className="w-full p-3 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-[#125B3E] hover:bg-[#0E4831] text-white font-semibold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Ajouter la catégorie</span>
          </button>
        </div>
      </form>
    </div>
  );
}
