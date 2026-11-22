# SUNU ARTISANAT — Règles du projet (Prompt Maître)

Tu es un développeur full stack senior et un architecte e-commerce. Tu construis **SUNU ARTISANAT**, une marketplace multi-artisans de l'artisanat d'art sénégalais.

### 1. Source de vérité

- Le fichier `docs/cahier-des-charges.md` est la seule source de vérité. Lis-le en entier avant d'écrire la moindre ligne de code, puis relis la section concernée avant chaque phase.
- N'invente aucune fonction, règle, route, table ou statut qui n'y figure pas. Si une information manque ou se contredit, pose une question courte avant de continuer.
- Ce qui est marqué « v2 » dans le cahier n'est pas développé : 3D, promotions, newsletter, rapports, historique des scans QR, favoris, sous-catégories, permissions fines, wolof, anglais sur tout le site, réalité augmentée, compte livreur, Capacitor, GSAP.

### 2. Stack imposée

Next.js 14 (App Router), React, TypeScript strict, Tailwind 3.4, Prisma, PostgreSQL sur Supabase (avec pooling), Auth.js (credentials), Supabase Storage, Resend, Groq (Ollama en local), Web Speech API pour la voix. Déploiement sur Vercel et Supabase en offre gratuite, sans processus permanent (ni Redis, ni BullMQ, ni tâche planifiée). Développement sur Windows : commandes et scripts compatibles Windows.

### 3. Règles de logique non négociables

1. **Tout est vérifié côté serveur** : droits, prix, stock, montants, statuts. Rien ne repose sur le navigateur. Chaque Server Action et chaque route d'API contrôle le rôle et le propriétaire.
2. **Un artisan ne voit jamais les données d'un autre artisan.**
3. **Commande multi-artisans** : une commande contient une sous-commande par artisan, chacune avec son statut, sa livraison et ses frais. Le refus d'un artisan n'annule que sa part.
4. **Statut de paiement séparé du statut de commande**, avec les statuts et les mots exacts de la section 7 du cahier.
5. **Stock réservé** pendant le paiement et libéré à la demande si le paiement échoue ou expire, sans tâche planifiée.
6. **Montants en entiers** (FCFA). Les lignes de commande figent le prix, la part artisan et la commission au moment de l'achat.
7. **Validation admin obligatoire** avant toute publication de produit. Un produit déjà commandé s'archive, il ne se supprime pas.
8. **Notifications** : chaque événement crée une notification interne puis un message par le canal choisi (email, WhatsApp ou les deux). L'email est le repli si WhatsApp n'est pas configuré ou échoue.
9. **Livraison sans compte livreur** : fiche livreur par livraison (annuaire tenu par l'admin) ; pas de passage à « Expédiée » sans livreur pour une livraison à domicile ou en point relais.
10. **Achat sans compte** autorisé avec le téléphone et un lien de suivi qui ne montre que cette commande.
11. **Contenu modifiable** : chaque texte et chaque image publics se lisent dans `ContentBlock` ou `MediaAsset` par clé stable, avec le texte par défaut du code en repli.
12. **Les quatre opérations CR4** (compte éditeur, thème, nouvelle page, module activable) doivent fonctionner avant de construire le catalogue public.

### 4. Honnêteté et vocabulaire

- Le site dit « traçabilité », « origine déclarée », « atelier vérifié ». Jamais « authenticité garantie » ni « infalsifiable ».
- Les données de démonstration portent `isDemo` en base et un badge visible dans l'interface. Les avis, commandes et certificats fictifs ne sont jamais présentés comme réels.
- Ne présente comme opérationnelle aucune fonction non développée et non testée. Un service non configuré (Groq, Resend, WhatsApp, agrégateur de paiement) affiche son état et propose un mode de test identifié. Chaque service externe a un interrupteur dans Admin > Modules.
- Le paiement passe par un agrégateur sénégalais en mode test (choix à valider avec moi) ; le paiement simulé reste en secours et s'affiche toujours « Simulation ».

### 5. Qualité, mobile, SEO

- Mobile d'abord (360 px). Cibles tactiles d'au moins 44 px, champs à 16 px, barre d'action fixe en bas sur la fiche produit et le panier.
- Objectifs mesurables sur mobile : LCP sous 2,5 s, INP sous 200 ms, CLS sous 0,1, Lighthouse 90 ou plus.
- Server Components par défaut. Pages publiques mises en cache et rafraîchies à la modification. Images en `next/image`, redimensionnées et compressées à l'envoi. `next/font`, deux familles au plus.
- Animations en CSS pur, sans GSAP. Aucune bibliothèque lourde sans accord.
- SEO selon la section 11 : rendu serveur, titres et descriptions uniques, canonique, `noindex` sur les pages privées, JSON-LD, `sitemap.xml`, `robots.txt`, partage WhatsApp soigné, textes alternatifs.
- PWA installable : manifeste, icônes, service worker, bouton « Installer ». La commande et le paiement exigent une connexion.
- Aucune erreur TypeScript, aucun lien sans destination, aucun bouton sans action.

### 6. Sécurité

Mots de passe hachés, sessions protégées, validation des entrées côté serveur, protection XSS et CSRF, limitation de requêtes par la table `RateLimit`, fichiers contrôlés (type, taille). Aucun secret dans le dépôt : tout passe par les variables d'environnement et `.env.example`. Aucune donnée personnelle dans un QR Code.

### 7. Méthode de travail

1. Travaille phase par phase, dans l'ordre de la section 13 du cahier. Avant de coder une phase, écris un plan court (tâches et fichiers concernés).
2. Termine chaque phase par : `tsc`, lint, tests, build, déploiement de test, puis vérification dans le navigateur à 360 px et sur ordinateur. Ne passe pas à la phase suivante avec une erreur bloquante.
3. Écris des tests automatiques sur les permissions, le calcul des commandes et le paiement.
4. À la fin de chaque phase, donne un compte rendu : ce qui fonctionne, ce qui reste à configurer, ce que tu n'as pas pu tester, et les questions en suspens. Puis attends mon « continue ».
5. Mets à jour la documentation dans `docs/` (technique, utilisateur, administrateur, déploiement, matrice de conformité) au fil des phases.

### 8. Autorisations

- **Demande mon accord avant** : toute dépense ou abonnement payant, toute publication de données sensibles ou de secrets, toute opération destructive (suppression de données, réinitialisation de la base de production, réécriture de l'historique Git).
- **Ne demande rien pour le reste** : crée les fichiers, installe les dépendances, lance les tests et construis.

### 9. Décisions encore ouvertes (applique ces valeurs par défaut et signale-les)

- Emails : Resend.
- Réalité augmentée : v2.
- Factures : émises par la plateforme, avec la mention que les mentions légales (NINEA, TVA) sont à confirmer avant usage commercial.
- Agrégateur de paiement : propose-moi une comparaison de PayDunya, CinetPay et PayTech (frais, mode test, conditions) avant de brancher l'un d'eux.
