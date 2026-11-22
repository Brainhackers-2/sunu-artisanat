"use client";

import { useState } from "react";
import { updateThemeAction } from "@/actions/admin";
import { Palette, CheckCircle2, AlertCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";

interface Props {
  initialTheme: {
    colorForest: string;
    colorGold: string;
    colorTerracotta: string;
    colorEbony: string;
    colorIvory: string;
    fontSans: string;
    fontHeading: string;
  };
}

export function ThemeEditorForm({ initialTheme }: Props) {
  const [colors, setColors] = useState(initialTheme);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(key: string, value: string) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  function resetToSenegalDefaults() {
    setColors({
      colorForest: "#125B3E",
      colorGold: "#FFB800",
      colorTerracotta: "#C2410C",
      colorEbony: "#131622",
      colorIvory: "#FAF8F5",
      fontSans: "Inter",
      fontHeading: "Playfair Display",
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const formData = new FormData();
    Object.entries(colors).forEach(([k, v]) => formData.append(k, v));

    const res = await updateThemeAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || "Erreur de mise à jour du thème.");
      return;
    }

    setMessage(res.message || "Thème mis à jour avec succès !");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Aperçu interactif des 5 couleurs */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFB800]" /> Palette active en base
          </h2>
          <button
            type="button"
            onClick={resetToSenegalDefaults}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Réinitialiser charte officielle
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            style={{ backgroundColor: colors.colorForest }}
            className="p-3 rounded-xl text-white shadow-sm flex flex-col justify-between min-h-[80px]"
          >
            <span className="text-xs font-semibold">Vert Forêt</span>
            <span className="text-xs font-mono font-bold mt-2">{colors.colorForest}</span>
          </div>

          <div
            style={{ backgroundColor: colors.colorGold }}
            className="p-3 rounded-xl text-stone-900 shadow-sm flex flex-col justify-between min-h-[80px]"
          >
            <span className="text-xs font-semibold">Or d&apos;Afrique</span>
            <span className="text-xs font-mono font-bold mt-2">{colors.colorGold}</span>
          </div>

          <div
            style={{ backgroundColor: colors.colorTerracotta }}
            className="p-3 rounded-xl text-white shadow-sm flex flex-col justify-between min-h-[80px]"
          >
            <span className="text-xs font-semibold">Terre Cuite</span>
            <span className="text-xs font-mono font-bold mt-2">{colors.colorTerracotta}</span>
          </div>

          <div
            style={{ backgroundColor: colors.colorEbony }}
            className="p-3 rounded-xl text-white shadow-sm flex flex-col justify-between min-h-[80px]"
          >
            <span className="text-xs font-semibold">Noir Ébène</span>
            <span className="text-xs font-mono font-bold mt-2">{colors.colorEbony}</span>
          </div>

          <div
            style={{ backgroundColor: colors.colorIvory }}
            className="p-3 rounded-xl text-stone-900 border border-stone-300 shadow-sm flex flex-col justify-between min-h-[80px]"
          >
            <span className="text-xs font-semibold">Ivoire / Écru</span>
            <span className="text-xs font-mono font-bold mt-2">{colors.colorIvory}</span>
          </div>
        </div>
      </div>

      {/* Inputs des couleurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-stone-200">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Vert Forêt (Boutons clés &amp; Badges)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.colorForest}
              onChange={(e) => handleChange("colorForest", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
            />
            <input
              type="text"
              value={colors.colorForest}
              onChange={(e) => handleChange("colorForest", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Or d&apos;Afrique (Accents &amp; Étoiles)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.colorGold}
              onChange={(e) => handleChange("colorGold", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
            />
            <input
              type="text"
              value={colors.colorGold}
              onChange={(e) => handleChange("colorGold", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Terre Cuite (Boutons d&apos;achat &amp; Argile)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.colorTerracotta}
              onChange={(e) => handleChange("colorTerracotta", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
            />
            <input
              type="text"
              value={colors.colorTerracotta}
              onChange={(e) => handleChange("colorTerracotta", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Noir Ébène (Titres &amp; Textes)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.colorEbony}
              onChange={(e) => handleChange("colorEbony", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
            />
            <input
              type="text"
              value={colors.colorEbony}
              onChange={(e) => handleChange("colorEbony", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Ivoire / Écru (Fond de page)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.colorIvory}
              onChange={(e) => handleChange("colorIvory", e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-stone-200"
            />
            <input
              type="text"
              value={colors.colorIvory}
              onChange={(e) => handleChange("colorIvory", e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Police Principale
          </label>
          <select
            value={colors.fontSans}
            onChange={(e) => handleChange("fontSans", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
          >
            <option value="Inter">Inter (Sans-serif Moderne)</option>
            <option value="Roboto">Roboto</option>
            <option value="System">Système natif</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="h-11 px-6 bg-[#125B3E] hover:bg-[#0E4831] text-white font-medium rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            <>
              <Palette className="w-4 h-4" /> Appliquer le thème en base (Sans redéploiement)
            </>
          )}
        </button>
      </div>
    </form>
  );
}
