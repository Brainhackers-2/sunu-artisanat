import Link from "next/link";
import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/221771234567?text=Bonjour%20Sunu%20Artisanat%2C%20j'ai%20une%20question...";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#131622] text-stone-400 mt-16">
      {/* Footer principal */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Mission */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🇸🇳</span>
            <p className="font-extrabold text-white text-lg">Sunu Artisanat</p>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed mb-4">
            Marketplace de valorisation, de numérisation et de traçabilité de l'artisanat d'art sénégalais.
          </p>
          <p className="text-xs text-stone-500">
            Thiès · Dakar · Casamance · Saint-Louis
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#25D366]/25 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Nous écrire sur WhatsApp
          </a>
        </div>

        {/* Découvrir */}
        <div>
          <p className="font-semibold text-white mb-4">Découvrir</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/boutique" className="hover:text-white transition">Boutique</Link></li>
            <li><Link href="/artisans" className="hover:text-white transition">Artisans &amp; Ateliers</Link></li>
            <li><Link href="/categories" className="hover:text-white transition">Catégories</Link></li>
            <li><Link href="/recherche" className="hover:text-white transition">Recherche</Link></li>
            <li><Link href="/assistant" className="hover:text-white transition">Sunu Bot (IA)</Link></li>
            <li><Link href="/avis" className="hover:text-white transition">Avis clients</Link></li>
          </ul>
        </div>

        {/* Notre histoire */}
        <div>
          <p className="font-semibold text-white mb-4">La plateforme</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/histoire" className="hover:text-white transition">Notre histoire</Link></li>
            <li><Link href="/a-propos" className="hover:text-white transition">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Nous contacter</Link></li>
            <li><Link href="/atelier/inscription" className="hover:text-white transition">Ouvrir un atelier</Link></li>
          </ul>
          <p className="font-semibold text-white mb-4 mt-6">Votre compte</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/connexion" className="hover:text-white transition">Connexion</Link></li>
            <li><Link href="/inscription" className="hover:text-white transition">Inscription</Link></li>
            <li><Link href="/compte" className="hover:text-white transition">Mon compte</Link></li>
          </ul>
        </div>

        {/* Légal & Contact */}
        <div>
          <p className="font-semibold text-white mb-4">Informations légales</p>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><Link href="/cgv" className="hover:text-white transition">CGV</Link></li>
            <li><Link href="/confidentialite" className="hover:text-white transition">Confidentialité</Link></li>
            <li><Link href="/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
          </ul>

          <div className="mt-6">
            <p className="font-semibold text-white mb-3">Contact</p>
            <address className="not-italic text-sm space-y-1.5">
              <p>📍 Plateau, Dakar, Sénégal</p>
              <p>✉️ contact@sunu-artisanat.sn</p>
              <p>🕐 Lun–Sam, 8h–20h (Dakar)</p>
            </address>
          </div>
        </div>
      </div>

      {/* Barre de conformité / badges */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-stone-600 text-center sm:text-left">
            © {year} Sunu Artisanat — Projet CPS · Paiements sécurisés · QR Code de traçabilité · HTTPS
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="bg-stone-800 px-2.5 py-1 rounded-full">🇸🇳 Sénégal</span>
            <span className="bg-stone-800 px-2.5 py-1 rounded-full">PWA installable</span>
            <span className="bg-stone-800 px-2.5 py-1 rounded-full">Artisans vérifiés</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
