"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Search, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CertificationSearchPage() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode) {
      router.push(`/certification/${cleanCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/90 shadow-xl p-8 sm:p-10 text-center space-y-6">
        {/* Icône centrale QR code vert forêt (bg-forest-50 text-forest-700 / bg-[#125B3E]/10 text-[#125B3E]) */}
        <div className="w-20 h-20 rounded-3xl bg-[#125B3E]/10 text-[#125B3E] flex items-center justify-center mx-auto shadow-inner">
          <QrCode className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#125B3E] inline-flex items-center gap-1.5 justify-center mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Passeport Digital Officiel</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#131622] tracking-tight">
            Vérifier un Certificat
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 leading-relaxed">
            Entrez le code unique gravé sur le scellé de votre création pour afficher son passeport de traçabilité officiel.
          </p>
        </div>

        {/* Champ de saisie blanc avec bouton de validation doré pour entrer le code de traçabilité */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: DEMO-001 ou SUNU-..."
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 focus:border-[#125B3E] focus:outline-none font-mono text-center text-sm font-bold tracking-wider text-[#131622] uppercase placeholder:font-sans placeholder:normal-case placeholder:text-stone-400 shadow-xs"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#FFB800] hover:bg-[#E5A700] text-[#131622] font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Consulter le Passeport</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-xs text-stone-500">
          <span>Vous n&apos;avez pas de code sous la main ? </span>
          <Link
            href="/certification/DEMO-001"
            className="font-bold text-[#125B3E] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Tester avec DEMO-001</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
