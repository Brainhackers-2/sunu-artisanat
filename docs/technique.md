# SUNU ARTISANAT — Documentation Technique & Architecture

> **Plateforme e-commerce multi-artisans de valorisation, numérisation et traçabilité de l'artisanat d'art sénégalais** (Thiès, Casamance, Dakar, Saint-Louis).

---

## 1. Stack Technique Imposée & Choix d'Architecture

- **Framework Web & API** : Next.js 14 (App Router), React 18, TypeScript strict (`strict: true`).
- **Styling & Design System** : Tailwind CSS 3.4, variables CSS dynamiques pour la charte officielle Sénégal (`--color-primary`, `--color-secondary`, etc.).
- **Base de Données & ORM** : PostgreSQL hébergé sur Supabase, manipulé avec Prisma ORM 5.22.
  - *Mode transactionnel* via Supabase Pooler (`aws-1-eu-west-1.pooler.supabase.com:6543`, transaction mode pgbouncer).
  - *Mode session* pour les migrations et le push de schéma (port 5432).
- **Authentification & Sessions** : NextAuth.js v4 avec adaptateur Credentials (email ou téléphone standard Sénégal), sessions JWT enrichies des rôles (`CLIENT`, `ARTISAN`, `EDITOR`, `ADMIN`, `SUPERADMIN`).
- **Stockage & Médias** : Supabase Storage pour les photos d'ateliers et créations.
- **Moteur d'IA & Assistant Vocal** : Groq API (`llama-3.1-70b-versatile`) avec fallback local intelligent et Web Speech API (reconnaissance vocale et synthèse vocale côté navigateur).
- **Notifications** : Dispatcher unifié avec intégration Resend (email) et Meta Cloud API (WhatsApp).
- **Contrainte Cloud** : Déploiement sans processus d'arrière-plan permanent (ni Redis, ni Celery, ni worker Cron permanent).

---

## 2. Règles Métier Non Négociables Implémentées

1. **Vérification Côté Serveur Exhaustive** :
   Chaque Server Action valide les rôles, les droits de propriété (`userId`, `artisanProfileId`), les stocks et les montants avant toute écriture en base.
2. **Isolation Stricte Inter-Artisans** :
   Un artisan ne peut accéder qu'aux données, commandes et statistiques de son propre atelier (`assertArtisanAccess`).
3. **Commande Multi-Artisans Atomique** :
   Une commande mère (`Order`) est systématiquement découpée en autant de sous-commandes (`SubOrder`) qu'il y a d'ateliers distincts dans le panier. Le refus d'une pièce par un artisan n'annule que sa sous-commande.
4. **Réservation de Stock & Libération à la Demande** :
   Le stock disponible est décrémenté et placé en `reservedQuantity` dès la création de la commande. En cas d'annulation ou d'échec de paiement, le stock est immédiatement restitué à la demande (`cancelOrExpirePaymentAction`), sans besoin de cron de nettoyage.
5. **Montants Stricts en Entiers FCFA** :
   Tous les prix (`priceFCFA`), frais de port (`deliveryFeeFCFA`), commissions de plateforme et parts nettes artisans sont arrondis à l'entier.
6. **Validation Administrative Obligatoire (Modération)** :
   Tout nouveau produit est créé au statut `PENDING`. Seul un administrateur peut le publier (`PUBLISHED`), ce qui déclenche la génération automatique de son QR Code de traçabilité officiel (`QRCode`). Tout refus exige un motif textuel explicite.
7. **Dispatcher de Notification avec Repli Obligatoire** :
   Chaque événement crée une entrée dans la table `Notification`. L'email est le repli automatique garanti si WhatsApp n'est pas configuré ou échoue.
8. **Gestion des Livraisons Sans Compte Livreur** :
   Annuaire centralisé de coursiers (`Courier`) administré par l'équipe plateforme. Une sous-commande à domicile ne peut passer à l'état `SHIPPED` sans qu'un livreur soit assigné.
9. **Achat Sans Compte & Suivi Sécurisé** :
   Toute commande génère un `trackingToken` unique permettant au client invité de suivre ses colis en direct sur `/suivi/[trackingToken]`.
10. **CMS Dynamique & Opérations CR4** :
    Modification en temps réel du thème graphique (couleurs, polices, logo), des pages libres (`/p/[slug]`), des blocs de contenus (`ContentBlock`) et des interrupteurs de modules tiers (`Module`).

---

## 3. Structure des Dossiers du Projet

```text
├── docs/                      # Documentation technique, utilisateur, déploiement, matrice
├── prisma/                    # Schéma de base de données unifié et script de seed
│   ├── schema.prisma          # 23 modèles de données et 8 enums
│   └── seed.js                # Initialisation des données démo, artisans et thème
├── public/                    # Fichiers statiques, logos, manifest PWA et service worker
│   ├── sw.js                  # Service Worker PWA (mise en cache statique)
│   └── manifest.json          # Manifeste application mobile
├── src/
│   ├── actions/               # Server Actions Next.js (sécurité et mutations serveur)
│   │   ├── admin.ts           # Actions CR4 (thème, pages, modules, éditeurs)
│   │   ├── ai.ts              # Action Sunu Bot (Groq + fallback)
│   │   ├── atelier.ts         # Actions artisan (créations, stocks, sous-commandes, modération)
│   │   ├── auth.ts            # Inscriptions clients et artisans (Zod)
│   │   ├── cart.ts            # Gestion du panier serveur avec persistance invité
│   │   ├── order.ts           # Création atomique de commande multi-vendeurs
│   │   └── payment.ts         # Validation paiements, factures et reversements
│   ├── app/                   # App Router Next.js 14
│   │   ├── admin/             # Espace d'administration complet
│   │   ├── artisans/          # Vitrines et annuaires des ateliers
│   │   ├── atelier/           # Espace dédié aux artisans partenaires
│   │   ├── boutique/          # Catalogue public filtrable et fiches produits
│   │   ├── certification/     # Page publique de contrôle du QR Code de traçabilité
│   │   ├── commande/          # Tunnel de paiement et livraison
│   │   ├── panier/            # Gestion du panier multi-artisans
│   │   ├── suivi/             # Suivi de commande en temps réel
│   │   └── p/[slug]/          # Pages de contenu dynamique (CGV, Mentions, etc.)
│   ├── components/            # Composants React modulaires (UI, Catalogue, Cart, etc.)
│   ├── lib/                   # Utilitaires (prisma singleton, auth, notifications, ratelimit)
│   └── types/                 # Typages TypeScript stricts
└── tests/                     # Suite de tests unitaires et d'intégration automatisés
```

---

## 4. Jeu de Données de Démonstration (`seed.js`)

Pour tester l'ensemble de la plateforme en environnement local ou staging :

| Rôle | Identifiant (Email / Tél) | Mot de passe universel démo |
| :--- | :--- | :--- |
| **SuperAdmin** | `admin@sunuartisanat.sn` | `SunuArtisanat2026!` |
| **Éditeur Contenu** | `editeur@sunuartisanat.sn` | `SunuArtisanat2026!` |
| **Artisan Thiès** (Tissage) | `artisan.thies@sunuartisanat.sn` | `SunuArtisanat2026!` |
| **Artisan Casamance** (Bois) | `artisan.casa@sunuartisanat.sn` | `SunuArtisanat2026!` |
| **Client Test** | `client@sunuartisanat.sn` | `SunuArtisanat2026!` |
