import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Sunu Artisanat",
  description: "Politique de confidentialité et de protection des données personnelles de Sunu Artisanat.",
};

export default function ConfidentialitePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-xs text-stone-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:underline">Accueil</Link>
        <span>/</span>
        <span className="text-stone-900">Confidentialité</span>
      </nav>
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-stone-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-stone-500 mb-8">Dernière mise à jour : novembre 2026</p>
        <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">1. Données collectées</h2>
            <p>Sunu Artisanat collecte les données suivantes lors de l'utilisation de la plateforme :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Nom complet, adresse email, numéro de téléphone lors de l'inscription</li>
              <li>Adresse de livraison lors d'une commande</li>
              <li>Historique des commandes et des interactions avec la plateforme</li>
              <li>Pour les artisans : informations d'atelier, photos et descriptions de produits</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Traiter vos commandes et vous envoyer des notifications de statut</li>
              <li>Gérer votre compte et vos préférences</li>
              <li>Améliorer nos services et l'expérience utilisateur</li>
              <li>Respecter nos obligations légales et réglementaires</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">3. QR Codes et traçabilité</h2>
            <p>
              <strong>Aucune donnée personnelle</strong> n'est intégrée dans les QR Codes de traçabilité. Ces codes contiennent uniquement une URL publique renvoyant vers la fiche de certification du produit (origine déclarée, matériaux, atelier).
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">4. Sécurité</h2>
            <p>
              Les mots de passe sont hachés (bcrypt). Les connexions sont protégées par HTTPS. L'accès aux données est limité par rôle. Un journal d'activité enregistre les actions sensibles.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-2">5. Vos droits</h2>
            <p>
              Conformément à la législation en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à l'adresse : <a href="mailto:contact@sunu-artisanat.sn" className="text-[#125B3E] underline">contact@sunu-artisanat.sn</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
