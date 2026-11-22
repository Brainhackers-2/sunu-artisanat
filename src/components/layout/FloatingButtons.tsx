"use client";

import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/221771234567?text=Bonjour%20Sunu%20Artisanat%2C%20j'ai%20une%20question%20concernant%20une%20création%20artisanale.";

export default function FloatingButtons() {
  return (
    <aside
      aria-label="Assistance et Support Rapide"
      className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-3.5"
    >
      {/* Bouton Sunu Bot IA Vocal : Bouton rond compact jaune or (w-12 h-12 bg-[#FFB800] text-[#131622] shadow-xl hover:scale-110 transition) avec icône étincelles */}
      <Link
        href="/diagnostic-ia"
        aria-label="Ouvrir Sunu Bot — Assistant IA Vocal"
        title="Sunu Bot IA — Diagnostic & Découverte Vocale"
        className="w-12 h-12 rounded-full bg-[#FFB800] text-[#131622] shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/60 group"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
      </Link>

      {/* Bouton WhatsApp : Bouton rond compact vert officiel (w-12 h-12 bg-[#25D366] text-white shadow-xl hover:scale-110 transition) */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discussion directe WhatsApp Support Dakar"
        title="Contacter le support SUNU ARTISANAT sur WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center border-2 border-white/60"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </aside>
  );
}
