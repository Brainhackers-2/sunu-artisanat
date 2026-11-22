import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales | Sunu Artisanat",
  description: "Mentions légales de la marketplace Sunu Artisanat, plateforme de valorisation de l'artisanat d'art sénégalais.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Mentions légales</span>
      </nav>
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Mentions légales</h1>
        <p className="text-sm text-stone-500 mb-8">Dernière mise à jour : novembre 2026</p>
        <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Éditeur du site</h2>
            <p><strong>Sunu Artisanat</strong> — Projet pédagogique CPS</p>
            <p>Adresse : Plateau, Dakar, Sénégal</p>
            <p>Email : contact@sunu-artisanat.sn</p>
            <p className="mt-2 text-orange-600 text-xs">
              ⚠️ Ce site est une démonstration pédagogique. Les mentions légales complètes (NINEA, TVA, numéro d'enregistrement) devront être complétées avant tout lancement commercial.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Hébergement</h2>
            <p>Le site est hébergé par <strong>Vercel Inc.</strong> (340 Pine Street, Suite 701, San Francisco, CA 94104, USA). La base de données est hébergée par <strong>Supabase Inc.</strong> sur des serveurs situés en Europe de l'Ouest (AWS eu-west-1).</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Propriété intellectuelle</h2>
            <p>Les contenus du site (textes, images, code source) sont la propriété de leurs auteurs respectifs. Les créations artisanales présentées restent la propriété exclusive des artisans partenaires. Toute reproduction sans autorisation est interdite.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Données de démonstration</h2>
            <p>Les données d'artisans, produits, commandes et avis marquées « Démo » (badge 🎭) sont des données fictives créées à des fins pédagogiques. Elles ne représentent pas des transactions commerciales réelles et ne peuvent être présentées comme telles.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">Responsabilité</h2>
            <p>Sunu Artisanat agit en qualité d'intermédiaire entre acheteurs et artisans. La plateforme ne peut être tenue responsable des informations déclarées par les artisans concernant l'origine ou les matériaux de leurs créations.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
