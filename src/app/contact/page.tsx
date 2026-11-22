import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Nous contacter | Sunu Artisanat",
  description:
    "Contactez l'équipe Sunu Artisanat à Dakar. Questions sur vos commandes, les artisans partenaires ou les certifications QR Code.",
};

export default function ContactPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Contact</span>
      </nav>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#125B3E] bg-[#125B3E]/10 px-3 py-1 rounded-full">
          À votre écoute
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-4 mb-4">
          Contactez notre équipe
        </h1>
        <p className="text-stone-600">
          Nous répondons du lundi au samedi, de 8h à 20h (heure de Dakar). En dehors de ces horaires, laissez-nous un message et nous vous répondrons le lendemain matin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations de contact */}
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-stone-900 mb-5">Coordonnées</h2>
            <ul className="space-y-4">
              {[
                {
                  icon: <MapPin className="w-5 h-5" />,
                  label: "Adresse",
                  value: "Plateau, Dakar, Sénégal",
                  sub: "Siège social et espace artisans",
                  color: "text-[#C2410C]",
                  bg: "bg-[#C2410C]/10",
                },
                {
                  icon: <Phone className="w-5 h-5" />,
                  label: "Téléphone",
                  value: "+221 77 XXX XX XX",
                  sub: "Appel ou WhatsApp",
                  color: "text-[#125B3E]",
                  bg: "bg-[#125B3E]/10",
                },
                {
                  icon: <Mail className="w-5 h-5" />,
                  label: "Email",
                  value: "contact@sunu-artisanat.sn",
                  sub: "Réponse sous 24h ouvrées",
                  color: "text-[#FFB800]",
                  bg: "bg-[#FFB800]/20",
                },
                {
                  icon: <Clock className="w-5 h-5" />,
                  label: "Horaires",
                  value: "Lun – Sam, 8h – 20h",
                  sub: "Heure de Dakar (GMT+0)",
                  color: "text-stone-600",
                  bg: "bg-stone-100",
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-medium">{item.label}</p>
                    <p className="font-semibold text-stone-900">{item.value}</p>
                    <p className="text-xs text-stone-400">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* WhatsApp */}
          <a
            href="https://wa.me/221771234567?text=Bonjour%20Sunu%20Artisanat%2C%20j'ai%20une%20question%20concernant..."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#25D366] text-white rounded-2xl p-5 hover:bg-[#1ebe59] transition shadow-sm"
          >
            <MessageCircle className="w-7 h-7 shrink-0" />
            <div>
              <p className="font-bold">Contacter sur WhatsApp</p>
              <p className="text-sm text-green-100">Réponse rapide par message</p>
            </div>
          </a>

          {/* Artisans */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
            <h3 className="font-bold text-stone-900 mb-2">Vous êtes artisan ?</h3>
            <p className="text-sm text-stone-600 mb-4">
              Pour rejoindre la plateforme et ouvrir votre vitrine digitale, utilisez le formulaire d'inscription dédié aux artisans.
            </p>
            <Link
              href="/atelier/inscription"
              className="inline-flex items-center gap-2 bg-[#125B3E] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition min-h-[44px]"
            >
              Devenir partenaire →
            </Link>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-5">Envoyer un message</h2>
          <form className="space-y-4" action="#" method="POST">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-stone-700 mb-1">
                Votre nom complet
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                required
                placeholder="Amadou Diallo"
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E]"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-stone-700 mb-1">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                placeholder="votre@email.com"
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E]"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-stone-700 mb-1">
                Sujet
              </label>
              <select
                id="contact-subject"
                name="subject"
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E] bg-white"
                style={{ fontSize: "16px" }}
              >
                <option value="">Choisir un sujet...</option>
                <option value="commande">Question sur une commande</option>
                <option value="artisan">Devenir artisan partenaire</option>
                <option value="certification">Vérification QR Code</option>
                <option value="paiement">Problème de paiement</option>
                <option value="livraison">Suivi de livraison</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-stone-700 mb-1">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                placeholder="Décrivez votre demande..."
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#125B3E] resize-none"
                style={{ fontSize: "16px" }}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#125B3E] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition min-h-[48px]"
            >
              Envoyer le message
            </button>

            <p className="text-xs text-stone-400 text-center">
              En soumettant ce formulaire, vous acceptez notre{" "}
              <Link href="/p/confidentialite" className="underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
