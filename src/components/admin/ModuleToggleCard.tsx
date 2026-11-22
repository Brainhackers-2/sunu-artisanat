"use client";

import { useState } from "react";
import { toggleModuleAction } from "@/actions/admin";
import { Loader2, Power, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  module: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isEnabled: boolean;
  };
}

export function ModuleToggleCard({ module: mod }: Props) {
  const [enabled, setEnabled] = useState(mod.isEnabled);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const nextState = !enabled;
    setLoading(true);
    const res = await toggleModuleAction(mod.code, nextState);
    setLoading(false);

    if (!res.success) {
      alert(res.error || "Action non autorisée.");
      return;
    }

    setEnabled(nextState);
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-sm text-[#131622]">{mod.name}</h3>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              enabled ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
            }`}
          >
            {enabled ? "Actif" : "Désactivé"}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed">{mod.description}</p>
        <div className="mt-2 text-[10px] font-mono text-stone-400">Code : {mod.code}</div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-600 font-medium">État du service</span>
        <button
          type="button"
          disabled={loading}
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            enabled
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              : "bg-[#125B3E] text-white hover:bg-[#0E4831]"
          } disabled:opacity-50`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Power className="w-3.5 h-3.5" />
          )}
          <span>{enabled ? "Désactiver" : "Activer"}</span>
        </button>
      </div>
    </div>
  );
}
