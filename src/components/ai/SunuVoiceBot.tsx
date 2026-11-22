"use client";

import { useState, useRef, useEffect } from "react";
import { askSunuBotAction } from "@/actions/ai";

export default function SunuVoiceBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string; isSimulated?: boolean }[]
  >([
    {
      role: "bot",
      text: "Nanga def ! Je suis Sunu Bot. Posez-moi une question sur nos artisans, nos techniques ou notre traçabilité.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Web Speech API : Reconnaissance vocale
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown; webkitSpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Synthèse vocale (Web Speech Synthesis)
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "fr-FR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    setLoading(true);

    try {
      const res = await askSunuBotAction(textToSend);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.reply, isSimulated: res.isSimulated },
      ]);
      speak(res.reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Désolé, une erreur est survenue lors de la communication." },
      ]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Bouton Flottant Déclencheur */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="bg-[var(--color-primary)] text-white p-3.5 rounded-full shadow-lg hover:opacity-95 transition-all flex items-center gap-2 border-2 border-white min-h-[50px] min-w-[50px] justify-center"
          title="Ouvrir Sunu Bot (Assistant Vocal)"
          aria-label="Assistant Vocal"
        >
          <span className="text-xl">🎙️</span>
          <span className="text-xs font-bold hidden sm:inline">Sunu Bot</span>
        </button>
      </div>

      {/* Fenêtre Modale / Drawer */}
      {open && (
        <div className="fixed bottom-36 md:bottom-20 right-4 sm:right-6 w-[92vw] sm:w-96 max-h-[520px] bg-white rounded-3xl border border-gray-100 shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--color-primary)] text-white px-5 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <div>
                <h3 className="font-bold text-sm leading-tight">Sunu Bot</h3>
                <p className="text-[10px] text-green-100">Assistant d'artisanat d'art</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200 text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* Liste des échanges */}
          <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl ${
                    m.role === "user"
                      ? "bg-[var(--color-primary)] text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                {m.isSimulated && (
                  <span className="text-[9px] text-orange-600 mt-0.5">
                    Mode simulation locale (Groq non configuré)
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-gray-100 text-gray-400 p-2.5 rounded-2xl rounded-bl-none animate-pulse">
                Sunu Bot réfléchit...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Saisie & Micro */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
            <button
              type="button"
              onClick={startListening}
              className={`p-2.5 rounded-xl border transition min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isListening
                  ? "bg-red-500 text-white border-red-500 animate-pulse"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
              title="Parler à la voix"
            >
              🎤
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Écoute en cours..." : "Posez votre question..."}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[var(--color-primary)] bg-white"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[var(--color-primary)] text-white px-3.5 py-2 rounded-xl font-bold text-xs hover:opacity-90 transition disabled:opacity-50 min-h-[40px]"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
