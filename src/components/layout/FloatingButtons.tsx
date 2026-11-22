"use client";

import Link from "next/link";
import { MessageCircle, Bot } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/221771234567?text=Bonjour%20Sunu%20Artisanat%2C%20j'ai%20une%20question%20concernant%20une%20création%20artisanale.";

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3">
      {/* Bouton Sunu Bot */}
      <Link
        href="/assistant"
        aria-label="Sunu Bot — Assistant IA"
        title="Sunu Bot — Découvrez nos créations par la voix"
        className="group flex items-center gap-2 bg-[#131622] text-white pl-3 pr-4 py-2.5 rounded-2xl shadow-xl hover:bg-stone-800 transition-all min-h-[48px]"
      >
        <Bot className="w-5 h-5 text-[#FFB800] shrink-0" />
        <span className="text-xs font-semibold hidden sm:block whitespace-nowrap">Sunu Bot</span>
      </Link>

      {/* Bouton WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous contacter sur WhatsApp"
        title="Contacter l'équipe Sunu Artisanat sur WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] text-white pl-3 pr-4 py-2.5 rounded-2xl shadow-xl hover:bg-[#1ebe59] transition-all min-h-[48px]"
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="text-xs font-semibold hidden sm:block whitespace-nowrap">WhatsApp Dakar</span>
      </a>
    </div>
  );
}
