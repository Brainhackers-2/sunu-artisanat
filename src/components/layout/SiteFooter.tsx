import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
        <div>
          <p className="font-extrabold text-white text-lg mb-2">Sunu Artisanat</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Marketplace de valorisation et de traçabilité de l'artisanat d'art sénégalais.
            Thiès · Dakar · Casamance · Saint-Louis.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Découvrir</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/boutique" className="hover:text-white transition">Boutique</Link></li>
            <li><Link href="/artisans" className="hover:text-white transition">Artisans</Link></li>
            <li><Link href="/inscription" className="hover:text-white transition">Ouvrir un atelier</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-3">Information</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/p/mentions-legales" className="hover:text-white transition">Mentions légales</Link></li>
            <li><Link href="/p/cgv" className="hover:text-white transition">CGV</Link></li>
            <li><Link href="/p/confidentialite" className="hover:text-white transition">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {year} Sunu Artisanat — Plateforme en cours de développement
      </div>
    </footer>
  );
}
