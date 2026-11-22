"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#FAF8F5]">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <Image src="/images/logo.png" alt="Sunu Artisanat" width={48} height={48} className="rounded-xl mx-auto" />
          </Link>
          <h1 className="text-xl font-extrabold text-stone-900">Mot de passe oublié</h1>
          <p className="text-sm text-stone-500 mt-1">
            Renseignez votre email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="font-bold text-stone-900 mb-2">Email envoyé !</p>
            <p className="text-sm text-stone-500 mb-6">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans les prochaines minutes.
            </p>
            <p className="text-xs text-stone-400 mb-6">
              Vérifiez également vos spams.
            </p>
            <Link
              href="/connexion"
              className="text-sm font-semibold text-[#125B3E] hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm font-medium text-stone-700 mb-1">
                Adresse email
              </label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E]"
                style={{ fontSize: "16px" }}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#125B3E] text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition min-h-[48px]"
            >
              Envoyer le lien de réinitialisation
            </button>

            <p className="text-center text-xs text-stone-500">
              <Link href="/connexion" className="text-[#125B3E] hover:underline font-semibold">
                ← Retour à la connexion
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
