import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CGV — Conditions générales de vente | Sunu Artisanat",
  description: "Conditions générales de vente de la marketplace Sunu Artisanat. Commandes, paiements, livraisons, retours et remboursements.",
};

export default function CGVPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Conditions générales de vente</span>
      </nav>

      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm prose prose-stone max-w-none">
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">
          Conditions générales de vente
        </h1>
        <p className="text-sm text-stone-500 mb-8">
          Dernière mise à jour : novembre 2026 — Document éditable depuis Admin &gt; Contenus
        </p>

        <div className="space-y-8 text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-stone-900">1. Identification du vendeur</h2>
            <p>
              Sunu Artisanat est une marketplace de mise en relation entre acheteurs et artisans sénégalais indépendants. La plateforme est opérée dans le cadre d'un projet pédagogique — toutes les transactions commerciales en mode de démonstration sont simulées et n'engagent aucune obligation de livraison réelle.
            </p>
            <p className="mt-2">
              Contact : contact@sunu-artisanat.sn — Dakar, Sénégal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">2. Produits et artisans</h2>
            <p>
              Les produits proposés sur Sunu Artisanat sont créés par des artisans indépendants validés par la plateforme. Chaque produit porte son certificat de traçabilité (origine déclarée par l'artisan, non garantie par expertise indépendante). Les données de démonstration sont clairement identifiées par un badge et ne peuvent être présentées comme preuves de vente réelles.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">3. Prix et paiement</h2>
            <p>
              Tous les prix sont indiqués en FCFA (Franc CFA, code XOF), avec un indicatif en euros à titre informatif. Les prix comprennent les frais de l'artisan et la commission de la plateforme, fixes à l'achat. Les moyens de paiement acceptés sont Wave, Orange Money, carte bancaire internationale et paiement simulé (clairement identifié « Simulation »). Le paiement à la livraison est disponible pour les commandes au Sénégal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">4. Commandes multi-artisans</h2>
            <p>
              Une commande peut regrouper des articles de plusieurs ateliers. Elle est divisée en sous-commandes par artisan, chacune avec son propre statut, ses frais de livraison et son délai de traitement. Si un artisan refuse ou annule sa partie, seule sa sous-commande est annulée et remboursée — les autres sous-commandes continuent leur traitement. Le client est notifié par email ou WhatsApp selon son choix.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">5. Livraison</h2>
            <p>
              La livraison est disponible à domicile, en point relais, ou en retrait chez l'artisan. Les tarifs dépendent de la zone géographique (Dakar, régions du Sénégal, international) selon la grille tarifaire affichée au moment de la commande. Pour la livraison à domicile ou en point relais, un livreur est désigné par l'artisan ou l'administrateur avant l'expédition.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">6. Retours et remboursements</h2>
            <p>
              Compte tenu de la nature artisanale et faite-main des produits, les retours sont acceptés uniquement si le produit reçu n'est pas conforme à la description ou présente un défaut de fabrication. La demande de retour doit être effectuée dans les 7 jours suivant la réception, en contactant notre équipe. Le remboursement est effectué par le même moyen de paiement que l'achat initial, dans un délai de 15 jours ouvrés.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">7. Données personnelles</h2>
            <p>
              Les données personnelles collectées lors d'une commande (nom, email, téléphone, adresse de livraison) sont utilisées uniquement pour le traitement de la commande et les notifications associées. Aucune donnée personnelle n'est intégrée dans les QR Codes de traçabilité. Pour plus d'informations, consultez notre{" "}
              <Link href="/p/confidentialite" className="text-[#125B3E] underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">8. Traçabilité et certification</h2>
            <p>
              Les QR Codes de traçabilité attestent l'origine et les matériaux <strong>déclarés</strong> par l'artisan. Ils ne constituent pas une expertise indépendante. La plateforme ne peut être tenue responsable d'une éventuelle inexactitude des informations déclarées par l'artisan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900">9. Droit applicable</h2>
            <p>
              Les présentes conditions générales de vente sont soumises au droit sénégalais. Tout litige sera soumis à la juridiction compétente de Dakar, Sénégal. Ces CGV sont modifiables depuis l'interface d'administration (Admin &gt; Contenus &gt; Pages) sans redéploiement technique.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
