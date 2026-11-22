"use client";

import { useState } from "react";
import { updateContentBlockAction } from "@/actions/admin";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

interface Props {
  blockKey: string;
  initialValue: string;
  label: string;
  description?: string;
}

export function ContentBlockEditor({ blockKey, initialValue, label, description }: Props) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    const res = await updateContentBlockAction(blockKey, value);
    setLoading(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      alert(res.error || "Erreur de sauvegarde.");
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-xs text-[#131622]">{label}</h3>
          {description && <p className="text-[11px] text-stone-500">{description}</p>}
          <span className="text-[10px] font-mono text-stone-400">Clé : {blockKey}</span>
        </div>
        {saved && (
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré !
          </span>
        )}
      </div>

      <textarea
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2.5 rounded-lg border border-stone-300 text-xs bg-stone-50/50 focus:ring-2 focus:ring-[#125B3E] focus:outline-none"
      />

      <div className="flex justify-end">
        <button
          type="button"
          disabled={loading || value === initialValue}
          onClick={handleSave}
          className="px-3 py-1.5 rounded-lg bg-[#125B3E] text-white text-xs font-semibold hover:bg-[#0E4831] flex items-center gap-1.5 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Enregistrer</span>
        </button>
      </div>
    </div>
  );
}
