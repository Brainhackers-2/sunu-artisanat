import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Notre Histoire | Sunu Artisanat — Valorisation de l'artisanat sénégalais",
  description:
    "Découvrez l'histoire de Sunu Artisanat, plateforme née à Thiès pour connecter les maîtres artisans sénégalais au monde entier.",
};

export default function HistoirePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Notre Histoire</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#125B3E] to-stone-900 text-white rounded-3xl px-8 py-14 sm:py-20 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <span className="text-[#FFB800] text-sm font-bold uppercase tracking-wider">Notre mission</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-3 mb-6">
            L'artisanat sénégalais mérite le monde entier
          </h1>
          <p className="text-stone-200 leading-relaxed">
            Sunu Artisanat est née d'un constat simple : les maîtres artisans de Thiès, Dakar, Casamance et Saint-Louis créent des œuvres d'une qualité exceptionnelle, mais leur marché reste limité à leur quartier ou à leur marché local.
          </p>
        </div>
      </div>

      {/* Corps du texte */}
      <div className="space-y-10 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">🧵 Une richesse culturelle à préserver</h2>
          <p className="mb-4">
            Le Sénégal possède un patrimoine artisanal d'une richesse exceptionnelle. Les tisserands Manjak perpétuent des motifs géométriques chargés de symboles d'honneur et de protection. Les maroquiniers de Thiès travaillent le cuir pleine fleur de zébu selon des méthodes de tannage végétal héritées de générations. Les orfèvres de Dakar cisèlent en filigrane d'argent et d'or des bijoux d'une finesse incomparable.
          </p>
          <p>
            Face à l'industrialisation et aux imitations bon marché, ces savoir-faire ancestraux sont menacés. Les artisans peinent à se distinguer, à prouver l'origine de leurs œuvres et à atteindre une clientèle nationale et internationale prête à valoriser l'authenticité de leur travail.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">💡 L'idée fondatrice</h2>
          <p className="mb-4">
            Sunu Artisanat a été conçue pour répondre à trois besoins fondamentaux des artisans sénégalais :
          </p>
          <ul className="list-none space-y-3">
            {[
              { icon: "🏠", text: "Une vitrine professionnelle pour chaque atelier, avec son histoire, ses photos et son catalogue complet." },
              { icon: "🔒", text: "Un certificat de traçabilité par QR Code pour chaque création : région d'origine déclarée, matériaux, technique et numéro de série." },
              { icon: "💳", text: "Un parcours d'achat adapté au Sénégal (Wave, Orange Money, paiement à la livraison) comme à l'international (carte bancaire)." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-stone-50 rounded-xl p-4">
                <span className="text-2xl">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">🌍 Notre engagement envers la transparence</h2>
          <p className="mb-4">
            Chez Sunu Artisanat, nous croyons en une communication honnête. Nos certificats QR Code attestent l'<strong>origine déclarée</strong> et les <strong>matériaux déclarés</strong> par l'artisan lui-même — pas une expertise indépendante. Le site dit « traçabilité », « origine déclarée », « atelier vérifié ». Jamais « authenticité garantie » ni « infalsifiable ».
          </p>
          <p>
            Chaque atelier partenaire est validé manuellement par notre équipe avant d'apparaître sur la plateforme. Les données de démonstration sont clairement identifiées par un badge et ne sont jamais présentées comme preuves réelles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-stone-900 mb-4">📍 Nos régions partenaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { region: "Thiès", icon: "👜", savoir: "Maroquinerie, cuir végétal, bourse et sacs", detail: "Héritière des maîtres tanneurs, Thiès produit certains des cuirs les plus fins d'Afrique de l'Ouest." },
              { region: "Dakar", icon: "💍", savoir: "Bijouterie, filigrane d'or et d'argent, textile", detail: "Capitale de l'orfèvrerie sénégalaise, Dakar réunit les maîtres bijoutiers wolofs et lébous." },
              { region: "Casamance", icon: "🏺", savoir: "Poterie, vannerie, bois de rônier et herbes", detail: "La Casamance, grenier naturel du Sénégal, offre des argiles et fibres d'une richesse incomparable." },
              { region: "Saint-Louis", icon: "🧶", savoir: "Tissage, broderie, coton biologique", detail: "Ville classée UNESCO, Saint-Louis perpétue l'art du tissage et de la broderie raffinée." },
            ].map((r) => (
              <div key={r.region} className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{r.icon}</span>
                  <div>
                    <h3 className="font-bold text-stone-900">{r.region}</h3>
                    <p className="text-xs text-[#125B3E] font-medium">{r.savoir}</p>
                  </div>
                </div>
                <p className="text-sm text-stone-600">{r.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-8 text-center">
          <h3 className="text-xl font-bold text-stone-900 mb-3">Rejoignez la communauté Sunu Artisanat</h3>
          <p className="text-stone-600 text-sm mb-6">
            Que vous soyez artisan souhaitant ouvrir votre vitrine digitale, ou client passionné par l'artisanat d'art sénégalais, bienvenue chez vous.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/boutique"
              className="bg-[#125B3E] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition min-h-[48px] flex items-center justify-center"
            >
              Explorer la boutique
            </Link>
            <Link
              href="/atelier/inscription"
              className="bg-white border border-stone-300 text-stone-900 px-6 py-3 rounded-xl font-bold text-sm hover:border-[#125B3E] hover:text-[#125B3E] transition min-h-[48px] flex items-center justify-center"
            >
              Ouvrir mon atelier
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
