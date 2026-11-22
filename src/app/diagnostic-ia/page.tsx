"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Send,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { askSunuBotAction } from "@/actions/ai";

interface ProductRecommendation {
  id: string;
  title: string;
  slug: string;
  priceFCFA: number;
  imageUrl: string;
  region: string;
  artisanName: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  recommendations?: ProductRecommendation[];
}

const SAMPLE_PRODUCTS: ProductRecommendation[] = [
  {
    id: "rec-1",
    title: "Sac Cabas en Cuir de Thiès",
    slug: "sac-cabas-cuir-thies",
    priceFCFA: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80",
    region: "Thiès",
    artisanName: "Atelier Cuir Thiès",
  },
  {
    id: "rec-2",
    title: "Collier Filigrane d'Argent Signare",
    slug: "collier-filigrane-argent-signare",
    priceFCFA: 65000,
    imageUrl:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    region: "Saint-Louis",
    artisanName: "Bijouterie Baobab d'Or",
  },
  {
    id: "rec-3",
    title: "Vase Céramique d'Oussouye",
    slug: "vase-ceramique-oussouye",
    priceFCFA: 28000,
    imageUrl:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
    region: "Casamance",
    artisanName: "Poterie Diola Casamance",
  },
];

const SUGGESTIONS = [
  "Quel cadeau traditionnel pour un mariage ?",
  "Je cherche un sac en cuir artisanal de Thiès",
  "Avez-vous des bijoux en argent de Saint-Louis ?",
  "Quelles sont les poteries authentiques de Casamance ?",
  "Expliquez-moi le passeport digital de traçabilité",
];

export default function DiagnosticIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-0",
      sender: "bot",
      text: "Nanga def ! Je suis votre conseiller en artisanat d'art sénégalais. Dites-moi ce que vous recherchez ou l'ambiance désirée, et je vous guiderai vers les pièces d'exception certifiées de nos maîtres artisans.",
      recommendations: [SAMPLE_PRODUCTS[0], SAMPLE_PRODUCTS[1]],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setLoading(true);

    try {
      const res = await askSunuBotAction(textToSend);
      // Sélection de recommandations contextuelles
      let recs: ProductRecommendation[] | undefined = undefined;
      const lower = textToSend.toLowerCase();
      if (lower.includes("cuir") || lower.includes("sac") || lower.includes("thiès")) {
        recs = [SAMPLE_PRODUCTS[0]];
      } else if (lower.includes("bijou") || lower.includes("collier") || lower.includes("argent")) {
        recs = [SAMPLE_PRODUCTS[1]];
      } else if (lower.includes("poterie") || lower.includes("vase") || lower.includes("casamance")) {
        recs = [SAMPLE_PRODUCTS[2]];
      } else {
        recs = SAMPLE_PRODUCTS.slice(0, 2);
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: res.reply,
        recommendations: recs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Jërejëf pour votre question. Pour vous guider immédiatement, voici nos pièces emblématiques vérifiées :",
          recommendations: SAMPLE_PRODUCTS,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 flex flex-col">
      {/* En-tête */}
      <section className="bg-stone-100/90 border-b border-stone-200/80 py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB800] text-[#131622] flex items-center justify-center font-black shadow-md shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#131622]">
                  Conseiller &amp; Diagnostic IA
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#125B3E]/10 text-[#125B3E]">
                  En direct
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Recommandations personnalisées parmi nos créations artisanales certifiées
              </p>
            </div>
          </div>

          <Link
            href="/boutique"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#125B3E] hover:underline"
          >
            <span>Boutique complète</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Zone de Discussion Interactive */}
      <main className="max-w-4xl w-full mx-auto px-4 flex-1 flex flex-col py-6 space-y-6">
        {/* Suggestions rapides en pilules blanches bordées d'or */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Suggestions de recherche rapide :</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSend(sug)}
                className="px-3.5 py-1.5 rounded-full bg-white border border-[#FFB800] text-xs font-semibold text-stone-800 hover:bg-[#FFB800]/15 transition-all shadow-xs"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Historique des messages */}
        <div className="flex-1 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Bulle utilisateur : vert forêt sombre | Bulle IA : blanche avec bordure dorée */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#0A3524] text-white rounded-br-xs shadow-md"
                    : "bg-white text-[#131622] border-2 border-[#FFB800]/50 rounded-bl-xs shadow-md"
                }`}
              >
                {m.sender === "bot" && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-black text-[#FFB800]">
                    <Sparkles className="w-3 h-3" />
                    <span>SUNU BOT</span>
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>
              </div>

              {/* Recommandations de produits intégrées dans le chat avec prix et visuels cliquables */}
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="w-full max-w-xl mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-4">
                  {m.recommendations.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/produits/${prod.slug}`}
                      className="group bg-white p-3 rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex items-center gap-3"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        <Image
                          src={prod.imageUrl}
                          alt={prod.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-[#131622] group-hover:text-[#125B3E] transition-colors truncate">
                          {prod.title}
                        </h4>
                        <p className="text-[10px] text-stone-500 truncate">
                          {prod.artisanName} • {prod.region}
                        </p>
                        <p className="text-xs font-black text-[#C2410C] mt-0.5">
                          {prod.priceFCFA.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start">
              <div className="bg-white p-4 rounded-3xl border-2 border-[#FFB800]/50 shadow-md flex items-center gap-2 text-xs text-stone-600">
                <Loader2 className="w-4 h-4 animate-spin text-[#FFB800]" />
                <span>Sunu Bot consulte les ateliers et prépare vos recommandations...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Champ de saisie interactif */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="sticky bottom-4 z-20 bg-white p-2 sm:p-2.5 rounded-2xl border-2 border-stone-300 shadow-xl flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question (ex: sac en cuir de Thiès pour offrir)..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-[#131622] placeholder:text-stone-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#125B3E] hover:bg-[#0E4831] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
          >
            <span>Envoyer</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </main>
    </div>
  );
}
