# SUNU ARTISANAT — Cahier des charges unifié v2.0

Marketplace de valorisation, de numérisation et de traçabilité de l'artisanat d'art sénégalais

*Fusion du cahier v1.0 (identité visuelle et pages) et du cahier v1.1 (logique métier, données, sécurité). Novembre 2026.*

---

## 0. Principe de la fusion

Le cahier v1.0 a produit une interface réussie, mais sa logique était fragile. Le cahier v1.1 a posé une logique solide, mais décrit peu l'expérience visuelle. Ce document garde **la beauté de la v1.0** et **la logique de la v1.1**, et tranche chaque conflit une seule fois.

| Domaine | Retenu de la v1.0 | Retenu de la v1.1 |
| --- | --- | --- |
| Identité visuelle | Charte Sénégal, hero animé, cartes artisans (bannière + médaillon), bandeau de réassurance, header sticky | Couleurs et polices pilotées par le thème en base |
| Pages | Contenu détaillé de chaque écran | Routes sans collision, carte des clics, pages légales éditables |
| Commande | Formulaire de livraison, choix de paiement | Sous-commandes par artisan, statuts séparés, stock réservé |
| Artisan | Tableau de bord avec stats et gestion du stock | Validation obligatoire, cycle produit, upload d'images, étapes guidées |
| Données | Champs du profil artisan | Modèle unique, montants entiers, prix figés à l'achat |
| Technique | Next.js, TypeScript, Tailwind, Prisma | Postgres Supabase, Auth.js, Resend, Groq, rate limit en base |
| Confiance | QR Code, passeport digital | Vocabulaire honnête : « traçabilité » et « origine déclarée » |
| Assistance | Bouton WhatsApp flottant, chatbot vocal | Repli sur la recherche textuelle, interrupteur de module |
| Administration | Boutons Valider, Refuser, Suspendre, Œil | Éditeur, thème, pages, modules, journal d'activité |

**Règle d'or de la logique** : aucune règle (prix, stock, droit, statut) ne dépend du navigateur. Tout est vérifié et recalculé sur le serveur.

---

## 1. Présentation et objectifs

### 1.1 Contexte et vision

Le Sénégal possède un patrimoine artisanal exceptionnel : maroquinerie de Thiès, poterie et vannerie de Casamance, bijouterie et filigrane de Dakar, sculpture sur ébène, tissage Manjak. Les artisans manquent pourtant de visibilité numérique, d'outils de vente en ligne et de moyen de montrer l'origine de leurs œuvres face aux imitations industrielles.

SUNU ARTISANAT est une marketplace multi-artisans qui offre à chaque atelier une vitrine professionnelle, un certificat de traçabilité par QR Code, et un parcours d'achat adapté au Sénégal (Wave, Orange Money, paiement à la livraison) comme à l'international (carte bancaire).

### 1.2 Objectifs de la v1

1. Numériser les ateliers : chaque artisan a sa vitrine (`/artisans/[slug]`) avec son histoire, ses photos et son catalogue.
2. Permettre à un artisan de s'inscrire, d'être validé, de publier ses créations et de suivre ses ventes.
3. Permettre à un client d'acheter chez plusieurs artisans en une seule commande.
4. Garantir la traçabilité de l'origine par QR Code (origine déclarée, pas expertise indépendante).
5. Donner à l'administrateur le contrôle de tout le site : validations, commandes, paiements, chaque texte et chaque image.
6. Servir un public national et international, avec un budget nul ou minimal.

### 1.3 Périmètre

| Dans la v1 | Reporté à la v2 |
| --- | --- |
| Vente en FCFA avec prix indicatif en euros ; livraison Sénégal et international par zone | Multi-devises, calcul douanier automatique |
| Français, avec anglais limité à la boutique, la fiche produit, la commande et les emails | Wolof |
| Wave, Orange Money, carte bancaire, paiement à la livraison ; agrégateur sénégalais en mode test, paiement simulé en secours | Paiements réels en production, reversements automatiques, Free Money |
| Site installable (PWA), assistant IA (texte et voix navigateur), QR Codes | Réalité augmentée (si le temps le permet), visualisation 3D, promotions, newsletter, rapports, historique des scans QR, favoris, sous-catégories, permissions fines, anglais sur tout le site |
| Notifications par email ou WhatsApp au choix, liens WhatsApp contextuels, bouton WhatsApp flottant | Abonnements artisans, mise en avant payante, compte livreur avec écrans dédiés |

---

## 2. Identité visuelle (conservée de la v1.0)

La direction artistique s'inspire des matières et paysages du Sénégal. Ces couleurs sont les **valeurs par défaut du thème** ; l'admin peut les changer depuis Admin > Thème sans redéploiement.

| Rôle | Couleur | Usage |
| --- | --- | --- |
| Vert Forêt (Casamance) | `#125B3E` | Boutons d'action clés, badges « atelier vérifié » |
| Or d'Afrique | `#FFB800` | Étoiles, accents, orfèvrerie |
| Terre Cuite | `#C2410C` | Boutons d'achat, argile, cuir |
| Noir Ébène | `#131622` | Titres, texte principal, en-têtes |
| Ivoire / Coton écru | `#FAF8F5` | Fond de page chaleureux |

**Principes de design**

- Interface pensée d'abord pour téléphone (plus de 75 % du trafic au Sénégal), boutons tactiles larges, connexion lente supposée.
- Photos immersives d'ateliers : bannière panoramique et médaillon de profil sur chaque artisan.
- Animations en CSS pur, légères et jamais bloquantes, sans GSAP en v1 (hero animé compris). Icônes Lucide.
- Contrastes lisibles, navigation clavier, labels de formulaires.
- Données de démonstration signalées par un badge visible (voir section 7).

---

## 3. Architecture technique et hébergement

Tout tient sur Vercel et Supabase en offre gratuite, sans processus permanent.

| Couche | Technologie | Décision |
| --- | --- | --- |
| Interface | Next.js 14 (App Router), React, TypeScript strict, Tailwind 3.4 | Couleurs et polices lues dans des variables CSS issues de la table Theme |
| Serveur | Server Components, Server Actions, Route Handlers | Toutes les règles vérifiées côté serveur |
| Base de données | PostgreSQL (Supabase) avec Prisma | Pooling de connexions obligatoire en serverless. SQLite abandonné |
| Authentification | Auth.js (credentials), table User propre, mots de passe hachés (bcrypt), connexion par email ou par numéro de téléphone | Un compte par personne, un ou plusieurs rôles |
| Images | Supabase Storage | Envoi de fichiers contrôlés (type, taille). Finis les simples champs URL |
| Emails | Resend (offre gratuite) | Confirmations, statuts, réinitialisation du mot de passe |
| Limitation des requêtes | Table PostgreSQL `RateLimit` | Connexion, assistant IA, formulaires publics |
| IA | Groq en production, Ollama en local ; voix par Web Speech API (navigateur) | Repli sur la recherche textuelle si Groq est indisponible |
| 3D | Reporté en v2 (Three.js, React Three Fiber) | Non livré en v1 |
| QR Codes | Génération côté serveur | Le code contient uniquement une URL de vérification |
| Versionnement | Git, GitHub | Aucun secret dans le dépôt, `.env.example` fourni |

**Environnements** : développement (local), test (aperçu Vercel), production. Un déploiement est fait dès la phase 1 et vérifié à chaque phase.

**Limites connues de l'offre gratuite** : Vercel Hobby est réservé à un usage non commercial (suffisant pour la démonstration, à remplacer avant un lancement commercial). Supabase met la base en pause après inactivité : vérifier l'accès la veille et le jour du jury.

**Modules désactivables** : Groq, Resend, WhatsApp, paiements réels et assistant vocal ont chacun un interrupteur dans Admin > Modules. Un service non configuré affiche son état et propose un mode de test identifié.

**Messages WhatsApp** : envoyés via WhatsApp Business (API Meta), module activable ; l'email envoyé par Resend reste le canal de repli.

**Paiement** : un agrégateur de paiement sénégalais (PayDunya, CinetPay ou PayTech, à comparer : frais, mode test, conditions à vérifier) couvre Wave, Orange Money et carte avec un seul branchement ; le paiement simulé reste en secours.

**Qualité** : tests automatiques sur les permissions, le calcul des commandes et le paiement ; suivi d'erreurs gratuit (Sentry) ; sauvegarde de la base avant le jury.

**PWA** : le site est installable comme une application (manifeste, icônes aux couleurs du Sénégal, service worker, bouton « Installer »). Les pages déjà consultées se chargent même avec une connexion faible ; la commande et le paiement demandent une connexion. Sur iPhone, l'installation passe par Safari (« Ajouter à l'écran d'accueil »). Pas d'application dans les stores en v1.

---

## 4. Rôles et permissions

Un compte peut porter plusieurs rôles (par exemple client et artisan). *Visiteur* n'est pas un rôle stocké : c'est l'état d'une personne non connectée. Chaque droit est vérifié côté serveur.

| Action | Visiteur | Client | Artisan | Éditeur | Admin | Super admin |
| --- | --- | --- | --- | --- | --- | --- |
| Parcourir la boutique, vérifier un QR | oui | oui | oui | oui | oui | oui |
| Ajouter au panier | oui | oui | oui | oui | oui | oui |
| Payer et suivre ses commandes | non | oui | oui | oui | oui | oui |
| Laisser un avis (achat livré) | non | oui | oui | non | non | non |
| Gérer ses produits et stocks | non | non | oui | non | oui | oui |
| Traiter les commandes de ses produits | non | non | oui | non | oui | oui |
| Modifier textes, images, pages, bannières | non | non | non | oui | oui | oui |
| Modérer les avis | non | non | non | oui | oui | oui |
| Valider artisans et produits | non | non | non | non | oui | oui |
| Voir paiements, commissions, reversements | non | non | non | non | oui | oui |
| Changer le thème et les réglages commerciaux | non | non | non | non | oui | oui |
| Activer ou désactiver un module | non | non | non | non | non | oui |
| Créer des comptes éditeur ou admin, changer les rôles | non | non | non | non | éditeur seulement | oui |
| Consulter le journal d'activité | non | non | non | non | oui | oui |

**Règles complémentaires** : un artisan ne voit jamais les données d'un autre artisan. L'éditeur n'a aucun accès aux paiements ni aux réglages techniques. Un artisan suspendu garde l'accès à son compte client.

Un visiteur sans compte peut payer et suivre sa commande grâce au lien de suivi reçu par WhatsApp ou email ; ce lien ne montre que cette commande.

---

## 5. Parcours utilisateurs

**Règles communes** : une seule action principale par page ; le tableau de bord de chaque rôle montre d'abord ce qui l'attend ; chaque erreur dit quoi faire ensuite ; chaque liste vide propose une action ; le panier se conserve sans compte ; le client peut commander sans compte, avec son téléphone, et reçoit un lien de suivi (le compte lui est proposé ensuite).

### Client

1. Arrive sur l'accueil, choisit une catégorie ou recherche.
2. Filtre la boutique, ouvre une fiche produit.
3. Ajoute au panier (articles regroupés par artisan).
4. Commande sans compte avec son téléphone (lien de suivi par WhatsApp ou email), ou se connecte ou crée son compte.
5. Renseigne l'adresse et choisit la livraison par artisan.
6. Paie (Wave, Orange Money, carte, paiement à la livraison, ou paiement simulé identifié) et reçoit un numéro de commande par email ou WhatsApp, selon son choix.
7. Suit chaque colis dans Mon compte, puis laisse un avis après livraison.

### Artisan

1. Remplit « Devenir artisan » avec son email, son numéro WhatsApp et son canal préféré, et attend la validation.
2. Reçoit la décision (approbation, ou motif de refus ou de complément) par email ou WhatsApp, selon son choix.
3. Complète son profil d'atelier via la liste d'étapes de son tableau de bord.
4. Crée un produit en brouillon et le soumet pour validation.
5. Voit son produit publié après validation ; peut modifier prix et stock à tout moment.
6. Reçoit chaque commande par email ou WhatsApp, puis l'accepte ou la refuse (carte « À traiter »).
7. Marque la préparation puis l'expédition, en choisissant ou en ajoutant le livreur (nom, téléphone) et le suivi ou le point de retrait.
8. Consulte ventes, commission et reversements dans « Mes ventes ».

### Administrateur

1. Ouvre un tableau de bord qui liste d'abord : demandes d'artisans, produits à valider, commandes bloquées, avis à modérer.
2. Valide ou refuse, avec motif, artisans et produits.
3. Suit commandes, livraisons et paiements, tient l'annuaire des livreurs, enregistre les reversements et les remises d'argent des livraisons.
4. Modifie textes, images, bannières, pages, thème et réglages.
5. Crée les comptes éditeur, active ou désactive les modules.

---

## 6. Règles métier

Chaque règle a une décision unique, appliquée sans interprétation.

| Sujet | Règle |
| --- | --- |
| Publication d'un produit | Validation admin toujours obligatoire. Cycle : brouillon, en attente, publié ou refusé (avec motif), archivé. Un produit déjà commandé ne se supprime pas, il s'archive. |
| Disponibilité | Trois types : en stock (quantité), pièce unique (quantité 1, retirée après vente), sur commande (délai de fabrication affiché, sans stock). Le stock est réservé pendant le paiement et libéré si le paiement échoue ou expire. Les réservations expirées sont libérées à la demande, à chaque consultation du stock ou de la commande, sans tâche planifiée. |
| Origine et filtres | Le produit porte sa propre région d'origine et sa technique, distinctes de la région de l'artisan. |
| Commande multi-artisans | Une commande regroupe une sous-commande par artisan, chacune avec son statut, sa livraison et ses frais. Un artisan ne voit que sa sous-commande. |
| Refus ou annulation partielle | Si un artisan refuse, seule sa part est annulée et remboursée ; les autres continuent. Le client est notifié. |
| Paiement | Les paiements passent par un agrégateur de paiement sénégalais en mode test (à choisir), qui couvre Wave, Orange Money et carte. Statut de paiement séparé du statut de commande. Wave et Orange Money pour le Sénégal, carte pour l'international, paiement à la livraison (Sénégal seulement) en « à encaisser ». En démonstration, le paiement simulé est étiqueté « Simulation ». |
| Livraison | Domicile, point relais ou retrait chez l'artisan, choisis par sous-commande ; international par zone (le client indique son pays). Tarifs : une grille par zone (Dakar, régions, international) configurée par l'admin, sans calcul par artisan. Pas de compte livreur en v1 : chaque livraison à domicile ou en point relais porte une fiche livreur (nom, téléphone, société ou transporteur, référence de suivi), renseignée par l'artisan ou l'admin depuis l'annuaire des livreurs. Le client voit le nom et le numéro du livreur. Pour le paiement à la livraison, le livreur remet l'argent à l'artisan ou à la plateforme, et l'admin enregistre cette remise, ce qui passe le paiement de « À encaisser » à « Payé ». |
| Commission et reversements | L'admin fixe un taux (10 % en démonstration). Chaque ligne enregistre la part artisan et la commission. Reversements enregistrés à la main en v1. Tout encaissement pour compte de tiers est à valider sur le plan réglementaire avant lancement commercial. |
| Factures | Une facture par commande avec détail par artisan. Mentions légales (NINEA, TVA) à confirmer avant usage commercial. |
| Retours | Politique affichée dans les CGV, adaptée au fait main : retour accepté si produit non conforme ou endommagé. |
| Avis | Un avis par produit et par commande livrée, badge « achat vérifié », modéré avant publication. Note d'artisan = moyenne de ses produits. L'artisan peut répondre. |
| QR et traçabilité | Le QR renvoie vers `/certification/[code]` et prouve l'enregistrement et l'origine déclarée, pas une expertise indépendante. |
| Vocabulaire | Le site dit « traçabilité », « origine déclarée », « atelier vérifié ». Jamais « authenticité garantie » ni « infalsifiable ». |
| Données de démonstration | Marquées `isDemo` en base et signalées par un badge ; jamais présentées comme preuves réelles. |

---

## 7. Statuts et notifications

Client, artisan et admin voient les mêmes statuts avec les mêmes mots.

**Sous-commande (par artisan)** : En attente de paiement, Payée, Acceptée, En préparation, Expédiée, Livrée, Refusée (motif), Annulée. La commande globale affiche le statut le plus en retard, avec le détail par artisan.

| Statut | Déclenché par | Suite |
| --- | --- | --- |
| En attente de paiement | Système | Payée ou Annulée |
| Payée | Système, ou admin (paiement à la livraison encaissé) | Acceptée ou Refusée |
| Acceptée | Artisan | En préparation |
| En préparation | Artisan | Expédiée |
| Expédiée | Artisan | Livrée |
| Livrée | Artisan, ou client qui confirme | Avis possible |
| Refusée | Artisan, avec motif | Remboursement |
| Annulée | Client avant préparation, ou admin | Remboursement si déjà payée |

- **Paiement** : En attente, Payé, Échec, À encaisser, Remboursé, Simulé.
- **Artisan** : En attente, Approuvé, Complément demandé, Refusé, Suspendu.
- **Produit** : Brouillon, En attente, Publié, Refusé, Archivé.

**Notifications** : chaque événement envoie une notification interne, puis un message par le canal choisi par la personne : email, WhatsApp, ou les deux. Cela couvre la réception d'une commande par l'artisan, la confirmation au client, chaque changement de statut et les alertes de l'admin. Exemples : commande payée (confirmation au client, carte « À traiter » chez l'artisan), refus (motif et remboursement au client, alerte admin), artisan approuvé ou refusé (décision avec motif), stock faible (alerte artisan et admin), rappel à l'artisan sans suite après 48 h.

**Canaux de notification.** Chaque personne choisit dans son profil comment elle est prévenue : email, WhatsApp, ou les deux (email par défaut). Le numéro WhatsApp est demandé à l'inscription et à la commande. L'envoi automatique par WhatsApp passe par WhatsApp Business (API officielle de Meta), qui impose des modèles de message validés et peut devenir payant selon le volume : le module s'active donc dans Admin > Modules une fois le compte configuré. Tant qu'il ne l'est pas, ou si un envoi échoue, l'email part à sa place et un lien WhatsApp prérempli reste proposé sur la commande.

**Livraison et livreurs.** « Expédiée » signifie remise au livreur ou au transporteur. « Livrée » est confirmée par l'artisan, l'admin ou le client. Le livreur reçoit par WhatsApp le numéro de commande, l'adresse, le téléphone du client et le montant à encaisser s'il y a paiement à la livraison ; sans le module WhatsApp, un lien prérempli permet à l'artisan de lui envoyer ces détails. Une livraison à domicile ou en point relais ne passe pas à « Expédiée » sans livreur renseigné ; le retrait chez l'artisan n'en demande pas.

---

## 8. Pages et navigation

Aucun lien sans cible, aucun bouton sans action. Les routes sont renommées pour éviter toute collision (l'ancien `/artisan/[slug]` devient `/artisans/[slug]`, l'espace pro devient `/atelier`, l'ancien `/authenticite/[token]` devient `/certification/[code]`).

### 8.1 Éléments globaux

**En-tête sticky** (`top-0`, `z-50`) : barre d'annonce (expédition, traçabilité, assistance WhatsApp Dakar) ; navigation Accueil, Boutique, Artisans, Vérifier un certificat ; recherche instantanée ; panier avec compteur en temps réel ; bouton « Devenir artisan » ; menu utilisateur selon les rôles (Mon compte, Espace artisan, Administration, Déconnexion) ; sélecteur FR/EN.

**Pied de page** : mission, liens par catégorie et par région, contact (Dakar, email, horaires), CGV, confidentialité, mentions légales (pages éditables en admin).

**Boutons flottants** : WhatsApp (message pré-rempli) et Sunu Bot (assistant, texte et voix). Si l'assistant est désactivé, seul WhatsApp reste.

### 8.2 Pages publiques

| Route | Contenu | Action principale |
| --- | --- | --- |
| `/` | Hero animé (catégories, images d'ateliers, appel à l'action) ; bandeau de réassurance ; grille de catégories ; créations phares (image, titre, région, prix FCFA) ; maîtres artisans à la une | Découvrir les créations |
| `/boutique` | Filtres catégorie, région d'origine, technique, disponibilité ; tri prix et nouveautés ; recherche ; stock affiché | Ouvrir un produit |
| `/categories`, `/categories/[slug]` | Catégories | Ouvrir un produit |
| `/produits/[slug]` | Galerie HD, matériaux, dimensions, temps de fabrication, prix FCFA avec indicatif en euros, carte de l'artisan, bloc traçabilité, avis, quantité | Ajouter au panier |
| `/artisans` | Annuaire des ateliers approuvés : bannière, médaillon, ville et région, badge « Atelier vérifié », spécialité, nombre d'œuvres | Visiter l'atelier |
| `/artisans/[slug]` | En-tête immersif, fiche (expérience, région, adresse), récit complet, catalogue filtrable, avis | Découvrir son atelier |
| `/panier` | Articles groupés par artisan, quantités, sous-total par artisan et total | Commander |
| `/commande` | Adresse (téléphone obligatoire au Sénégal, pays pour l'international), livraison par artisan, paiement | Payer |
| `/commande/confirmation/[numero]` | Reçu, numéro `SUNU-AAAAMMJJ-NNN`, suivi | Suivre ma commande |
| `/recherche`, `/assistant` | Résultats ; assistant de découverte (produits réels) | Ouvrir un produit |
| `/certification/[code]` | Œuvre, date d'enregistrement, atelier, numéro de série, matériaux et origine déclarés ; état affiché si code désactivé ou inconnu | Voir le produit |
| `/histoire`, `/a-propos`, `/avis`, `/contact` | Contenus institutionnels | Selon la page |
| `/connexion`, `/inscription`, `/mot-de-passe-oublie` | Comptes | Se connecter |
| `/cgv`, `/confidentialite`, `/mentions-legales`, `/p/[slug]` | Pages légales et pages créées par l'admin | Lire |

### 8.3 Espace client (`/compte`)

Profil, commandes (`/compte/commandes/[id]`), factures, adresses, notifications, sécurité.

### 8.4 Espace artisan (`/atelier`)

`/atelier/inscription` et `/atelier/connexion` (publics), puis :

- **Tableau de bord** : carte « À traiter » en premier, liste d'étapes de profil, chiffre d'affaires en FCFA, nombre de commandes, alertes de stock faible.
- **Profil d'atelier** : nom, spécialité, ville, région, années d'expérience, histoire. **Logo et couverture envoyés comme fichiers** (aperçu instantané, repli sur image de secours si indisponible).
- **Produits** : liste, création en brouillon (`/atelier/produits/nouveau`), soumission, modification du prix et du stock sans quitter la page.
- **Commandes** : sous-commandes reçues avec coordonnées, adresse et statut ; accepter, refuser, préparer, désigner le livreur, expédier (`/atelier/commandes/[id]`).
- **Ventes, statistiques, avis, notifications, paramètres.**

### 8.5 Administration (`/admin`)

Tableau de bord, utilisateurs et rôles, artisans, produits, catégories, commandes, paiements et reversements, livraisons et livreurs, avis, QR Codes, contenus (pages, bannières, médiathèque, navigation), thème, paramètres, modules, journal d'activité.

Sur la fiche d'un artisan : **Valider**, **Refuser** (motif), **Demander un complément**, **Suspendre**, et le bouton **Œil** qui ouvre sa vitrine publique pour contrôle qualité.

**Saisie assistée.** Depuis la fiche d'un artisan, l'admin crée et modifie des produits à sa place à partir des photos et informations reçues par WhatsApp. L'action est inscrite au journal d'activité, l'artisan confirme par WhatsApp ou email, et le produit suit la validation habituelle avant publication.

### 8.6 Carte des clics

| Depuis | Clic | Mène à |
| --- | --- | --- |
| Accueil | Bouton du hero | `/boutique` |
| Accueil | Carte catégorie | `/categories/[slug]` |
| Carte produit | Image ou nom | `/produits/[slug]` |
| Carte produit | Nom de l'artisan | `/artisans/[slug]` |
| Fiche produit | Ajouter au panier | Panier mis à jour (compteur) |
| Fiche produit | Vérifier le certificat | `/certification/[code]` |
| Panier | Commander (non connecté) | `/connexion`, ou « Continuer sans compte » ; retour auto à `/commande` |
| Commande | Payer | Confirmation, ou retour avec message d'échec |
| Confirmation | Suivre ma commande | `/compte/commandes/[id]` |
| Notification artisan | Commande à traiter | `/atelier/commandes/[id]` |
| Notification admin | Demande ou produit en attente | Fiche dans `/admin` |
| Pied de page | Devenir artisan | `/atelier/inscription` |

---

## 9. Modèle de données unifié

Un seul nom par table.

| Table | Rôle |
| --- | --- |
| User, UserRole (Permission en v2) | Compte (email, téléphone WhatsApp, mot de passe haché, canal de notification préféré : email, WhatsApp ou les deux) et rôles multiples |
| CustomerProfile, Address | Profil client, adresses |
| ArtisanProfile | Atelier : `workshopName`, `slug`, `specialty`, `bio`, `experienceYears`, `city`, `region`, `address`, `phone`, `logoUrl`, `coverUrl`, statut de validation, `verified` |
| ArtisanDocument | Justificatifs |
| Category | Catégories sur un seul niveau en v1, avec `parentId` |
| Product | Statut, type de disponibilité, région d'origine, technique, `isDemo` |
| ProductImage, ProductMaterial (ProductModel3D en v2) | Photos, matériaux |
| Inventory | Quantité et quantité réservée |
| Cart, CartItem (Favorite en v2) | Panier |
| Order, SubOrder, OrderItem | Commande, part de chaque artisan (statut, frais, motif de refus), lignes (prix, part artisan, commission figés à l'achat) |
| Payment, Delivery, Courier, Payout, Invoice | Paiement (statut séparé, drapeau simulation), livraison par sous-commande (livreur, suivi, montant à encaisser, remise d'argent enregistrée), annuaire des livreurs (nom, téléphone WhatsApp, société, zone), reversement, facture |
| Review | Avis lié à un produit et une commande, réponse, modération |
| QRCode (QRScan en v2) | Certificat |
| AIConversation | Historique de l'assistant |
| Promotion, Newsletter (v2) | Promotions, abonnements |
| Page, ContentBlock, MediaAsset | Pages, textes et images modifiables, avec brouillon, publié, historique |
| Theme, Module, Setting | Apparence, fonctions activables, réglages commerciaux |
| RateLimit, Notification, AuditLog | Limitation, notifications (interne, email, WhatsApp, statut d'envoi), journal des actions sensibles |

**Règles de cohérence** : montants en entiers (le FCFA n'a pas de décimales) ; clés étrangères et index sur toutes les relations ; numéro de commande par séquence en base (`SUNU-AAAAMMJJ-NNN`), sans collision ; produit commandé archivé, jamais supprimé.

---

## 10. Administration et contenu modifiable

L'admin gère tout le site depuis `/admin` : chaque texte, bannière et image publics se modifie sans toucher au code, avec aperçu, brouillon et retour en arrière.

**Mécanisme** : chaque emplacement lit sa valeur dans `ContentBlock` ou `MediaAsset` par une clé stable (par exemple `home.hero.title`). Si la valeur manque, le texte par défaut du code s'affiche.

| Contenu | Où |
| --- | --- |
| Textes des pages (slogan, accueil, À propos, Histoire, CGV) | Admin > Contenus > Pages |
| Bannières (hero, boutons, barre d'annonce) | Admin > Contenus > Bannières |
| Images (logo, favicon, catégories, portraits, partage) | Admin > Contenus > Médiathèque |
| Catégories | Admin > Catégories |
| Navigation | Admin > Contenus > Navigation |
| Couleurs, polices, thème actif | Admin > Thème |
| Livraison, commission, paiements | Admin > Paramètres |
| Emails et messages WhatsApp automatiques | Admin > Paramètres > Notifications |
| Coordonnées et réseaux | Admin > Paramètres |

**Les quatre opérations de démonstration (CR4)**

1. **Compte éditeur** : Admin > Utilisateurs > Créer, rôle Éditeur ; il ne voit ni paiements ni réglages techniques.
2. **Thème** : Admin > Thème ; le site entier change sans redéploiement.
3. **Nouvelle page** : Admin > Contenus > Pages, publiée sur `/p/[slug]` et ajoutée à la navigation.
4. **Extension** : Admin > Modules, activation d'un module livré dans le code mais désactivé (par exemple Assistant IA). Une dépendance npm se déploie par le code, pas depuis l'interface.

---

## 11. Sécurité et exigences non fonctionnelles

**Sécurité**

1. Mots de passe hachés, sessions protégées, réinitialisation par lien à durée limitée.
2. Droits contrôlés par rôle et par propriétaire sur chaque action, y compris `/api/artisan/*` et `/api/admin/*`.
3. Validation des entrées côté serveur ; requêtes préparées via Prisma ; protection XSS et CSRF.
4. Limitation des tentatives de connexion, formulaires et requêtes IA (`RateLimit`).
5. Prix, stock et montants recalculés côté serveur à chaque commande.
6. Fichiers contrôlés (type, taille), stockés hors du dépôt.
7. Secrets en variables d'environnement, jamais dans GitHub.
8. Journal d'activité, sauvegardes de la base, HTTPS en production.
9. Aucune donnée personnelle dans un QR Code.

**Performance** : `next/image` (chargement différé, WebP), pagination, images de secours, site installable (PWA).

### Performance mobile : cibles mesurables

Ces cibles sont mesurées sur le site déployé, en mode mobile et connexion 4G moyenne, avec Lighthouse et PageSpeed Insights.

| Indicateur | Cible |
| --- | --- |
| Affichage du contenu principal (LCP) | moins de 2,5 s |
| Réactivité aux touches (INP) | moins de 200 ms |
| Stabilité de la mise en page (CLS) | moins de 0,1 |
| Score Lighthouse mobile (performance, SEO, accessibilité, bonnes pratiques) | 90 ou plus |
| JavaScript chargé au premier affichage | le plus bas possible, objectif sous 170 Ko compressés |

### Performance mobile : règles de construction

- **Rendu serveur par défaut.** Les Server Components servent les pages ; un composant client n'existe que là où il faut de l'interaction (panier, filtres, menu, assistant).
- **Pages publiques mises en cache.** Accueil, catégories, fiches produits et vitrines d'artisans sont pré-générées et rafraîchies automatiquement quand l'admin ou l'artisan les modifie. Prix, stock et droits restent vérifiés par le serveur à chaque commande.
- **Images allégées.** `next/image` en WebP ou AVIF avec tailles adaptées à l'écran, dimensions déclarées pour éviter les sauts de page, chargement différé sauf l'image principale de l'accueil. À l'envoi, chaque photo est redimensionnée (1 600 px au maximum) et compressée, car les artisans envoient des photos de téléphone très lourdes.
- **Polices légères.** `next/font`, deux familles au plus, caractères latins seulement, affichage immédiat du texte de secours.
- **JavaScript sobre.** Pas de bibliothèque d'animation ni de grosse dépendance ; assistant, bouton d'installation et éléments hors écran chargés à la demande.
- **Base de données rapide.** Index sur toutes les relations, pagination (24 produits par page), requêtes qui ne lisent que les champs utiles, connexions poolées.
- **Hébergement proche.** Vercel et Supabase dans la même région d'Europe de l'Ouest, la plus proche du Sénégal disponible, avec CDN, compression et HTTP/2.
- **Cache de la PWA.** Pages et images déjà consultées servies depuis l'appareil pendant que la version fraîche se recharge en arrière-plan.

### Expérience tactile et mise en page flexible

- **Mobile d'abord.** Points de rupture à 360, 640, 768, 1 024 et 1 280 px ; grilles fluides ; tests sur petit Android (360 × 640).
- **Cibles tactiles.** Boutons et liens d'au moins 44 px ; textes en `rem` ; champs de formulaire à 16 px pour éviter le zoom automatique sur iPhone.
- **Formulaires adaptés.** Clavier numérique pour le téléphone, saisie automatique de l'adresse, un seul champ par ligne, erreurs affichées sous le champ.
- **Actions toujours à portée.** Barre fixe en bas d'écran avec « Ajouter au panier » sur la fiche produit et « Commander » sur le panier ; en-tête compact ; aucune fenêtre plein écran bloquante.
- **Mise en page stable.** Rapports d'image fixes (`aspect-ratio`) et espaces réservés pendant le chargement.

**SEO** : métadonnées, Open Graph, URL propres, `sitemap.xml`, `robots.txt`, textes alternatifs.

### SEO : règles détaillées

- **Contenu lisible sans JavaScript.** Toutes les pages publiques sont rendues par le serveur, avec un seul titre principal par page et des titres hiérarchisés.
- **Titre et description uniques.** Générés à partir des données : par exemple « Nom du produit, atelier de [artisan], [région] ».
- **URL propres et canoniques.** Une adresse stable par produit, catégorie et artisan ; balise canonique sur les pages filtrées ; fiches archivées ou refusées retirées proprement.
- **Pages à ne pas indexer.** Recherche, panier, commande, compte, atelier et administration portent `noindex` et sont exclues de `robots.txt`.
- **Données structurées (JSON-LD).** Produit (prix en FCFA, disponibilité, images, avis réels seulement), organisation pour les ateliers, fil d'Ariane. Les avis et certificats de démonstration n'y figurent jamais.
- **Plan du site automatique.** `sitemap.xml` dynamique (produits publiés, catégories, artisans approuvés, pages) avec date de mise à jour, déclaré dans Google Search Console.
- **Partage WhatsApp soigné.** Open Graph et cartes de partage avec image 1 200 × 630, nom et prix : un lien produit collé dans WhatsApp montre une vraie vignette.
- **Langues.** Langue du document déclarée et balises `hreflang` sur les pages traduites.
- **Images référencées.** Texte alternatif obligatoire à l'envoi, proposé automatiquement à partir du nom du produit.
- **Maillage interne.** Fil d'Ariane, produits du même artisan, produits de la même catégorie, lien de l'artisan vers chaque création.
- **Contenu éditorial.** Histoire de chaque atelier, région et technique sur chaque fiche, pour les recherches comme « poterie Casamance » ou « maroquinerie Thiès ». Un blog est prévu en v2.
- **Mesure.** Google Search Console et Lighthouse SEO à 90 ou plus, contrôlés avant le jury.

**Accessibilité** : clavier, labels, contrastes, erreurs explicites.

**Langues** : français sur tout le site, anglais limité en v1 à la boutique, la fiche produit, la commande et les emails, textes dans des fichiers de traduction pour ajouter le wolof.

**Honnêteté des fonctions** : aucune fonction n'est présentée comme opérationnelle si elle n'est pas développée et testée. Un service non configuré affiche son état et un mode de test identifié.

---

## 12. Conformité CPS et démonstration

Seuil de réussite : 70 % sur quatre critères.

| Critère | Poids | Preuves | Démonstration |
| --- | --- | --- | --- |
| CR1 Architecture | 20 % | Ce cahier, diagramme d'architecture, schéma de base, arborescence, justification de la stack | Présenter les documents |
| CR2 Développement | 45 % | Site responsive sur PostgreSQL, navigation sans lien mort, catalogue, comptes, panier, commandes, livraison, paiement simulé, administration | Les trois parcours de bout en bout, téléphone et ordinateur |
| CR3 Hébergement | 15 % | URL publique, GitHub, variables d'environnement, tableaux de bord Vercel et Supabase, HTTPS | Ouvrir le site en ligne et la configuration |
| CR4 Administration | 20 % | Compte éditeur, thème, nouvelle page, module activable | Les quatre opérations de la section 10, dans l'ordre |

**Avant le jury** : vérifier la veille et le jour même la base Supabase, le site, les comptes admin et éditeur, les données de démonstration. Faire confirmer par l'évaluateur que « extension » signifie « module activable livré dans le code ».

**Livrables** : code source, dépôt GitHub, migrations, `.env.example`, scripts d'installation, documentation technique, utilisateur et administrateur, procédures de déploiement, matrices de conformité, guide de démonstration, liste des fonctions opérationnelles et de celles à configurer.

---

## 13. Phases de développement

L'ordre suit les dépendances. Chaque phase se termine par un test et un déploiement ; on ne passe pas à la suivante avec une erreur bloquante.

1. **Fondations et déploiement** : environnement, Next.js, TypeScript, Tailwind avec variables de thème, Supabase, Prisma, GitHub, premier déploiement Vercel.
2. **Modèle de données** : schéma unifié, migrations, données `isDemo`, pooling, stockage d'images.
3. **Comptes et rôles** : authentification, rôles multiples (contrôle par rôle, permissions fines en v2), limitation de requêtes, emails de base, journal.
4. **Administration de base** : validation des artisans, catégories, médiathèque, contenus, thème, pages, modules (le socle CR4 avant le catalogue).
5. **Espace artisan et catalogue** : inscription, profil d'atelier, produits et validation, boutique, filtres, fiches, profils.
6. **Commerce** : panier, commande, sous-commandes, livraison, paiement simulé, statuts, notifications, factures, reversements.
7. **Interface et identité** : design system aux couleurs du Sénégal, accueil animé, en-tête, pied de page, responsive, PWA installable (manifeste, icônes, service worker), carte des clics vérifiée page par page.
8. **Innovation** : QR Codes et vérification, assistant IA texte et voix avec repli ; réalité augmentée si le temps le permet.
9. **Tests et recette** : tests automatiques (permissions, calcul des commandes, paiement), suivi d'erreurs, parcours complets, sécurité, responsive, performance et SEO mesurés (Lighthouse, PageSpeed Insights), production, sauvegarde de la base avant le jury.
10. **Production et jury** : configuration finale, documentation, répétition des quatre opérations CR4, vérification de la base la veille.

---

## 14. Conditions de validation finale

Chaque case est testée en ligne, sur téléphone et ordinateur.

- [ ] Un visiteur parcourt la boutique, filtre et ouvre une fiche produit.
- [ ] Un client ajoute des produits de deux artisans, commande sans compte ou crée son compte, et retrouve son panier.
- [ ] Le client paie (agrégateur en mode test, ou simulation identifiée) et reçoit un numéro par email ou WhatsApp, selon son choix.
- [ ] Un artisan envoie sa demande ; l'admin l'approuve ; l'artisan reçoit l'approbation par email ou WhatsApp, puis se connecte.
- [ ] L'artisan soumet un produit ; l'admin le valide ; il apparaît dans la boutique.
- [ ] Chaque artisan est prévenu de sa sous-commande par email ou WhatsApp, la voit seule, l'accepte, la prépare, désigne le livreur, l'expédie ; le client suit chaque colis et voit le nom et le téléphone du livreur.
- [ ] Un refus d'artisan n'annule que sa part et notifie le client.
- [ ] L'admin gère catalogue, commandes, paiements et reversements.
- [ ] L'admin change un texte, une bannière et un logo sans redéploiement.
- [ ] Les quatre opérations CR4 fonctionnent.
- [ ] Un QR Code ouvre la page de vérification ; un code désactivé ou inconnu affiche son état.
- [ ] L'assistant répond avec des produits réels ; la recherche textuelle prend le relais si Groq est indisponible.
- [ ] Aucun lien sans destination, aucune erreur TypeScript ni de compilation ; score Lighthouse mobile d'au moins 90 en performance, SEO, accessibilité et bonnes pratiques.
- [ ] Le site est accessible en ligne en HTTPS et s'installe comme une application (PWA) sur téléphone.

---

## 15. Ajouts et reports validés

Ces décisions suivent la revue de conception : neuf ajouts entrent dans la v1, cinq éléments passent en v2.

**Ajoutés à la v1**

| Ajout | Ce qui change |
| --- | --- |
| Agrégateur de paiement en mode test | Un seul branchement pour Wave, Orange Money et carte ; paiement simulé en secours. Choix entre PayDunya, CinetPay et PayTech à trancher après vérification de leurs conditions |
| Saisie assistée par l'admin | L'admin crée et modifie des produits au nom d'un artisan à partir de photos reçues par WhatsApp |
| Connexion par téléphone | Identifiant au choix : email ou numéro de téléphone |
| Achat sans compte | Commande avec le téléphone et lien de suivi, compte proposé ensuite |
| Livraison par zone | Grille de tarifs Dakar, régions, international, sans calcul par artisan |
| Stock sans tâche planifiée | Libération des réservations expirées à la demande |
| Qualité | Tests automatiques, suivi d'erreurs (Sentry), sauvegarde de la base avant le jury |
| PWA installable | Site installable sur téléphone (manifeste, icônes, service worker), sans application dans les stores |
| Performance mobile et SEO | Cibles mesurables (Lighthouse 90 ou plus), pages en cache, images compressées à l'envoi, données structurées, partage WhatsApp soigné |

**Reportés à la v2**

| Élément | Gardé en v1 à la place |
| --- | --- |
| Visualisation 3D | Galerie de photos HD |
| Promotions, newsletter, rapports, historique des scans QR | Vérification du QR sans historique ; module de démonstration CR4 : Assistant IA |
| Sous-catégories et favoris | Catégories sur un seul niveau, pas de favoris |
| Anglais sur tout le site | Anglais limité à la boutique, la fiche produit, la commande et les emails |
| Permissions fines (table Permission) | Contrôle par rôle |

---

## 16. Décisions ouvertes

1. **Emails** : Resend (proposé) ou un autre service gratuit.
2. **Réalité augmentée** : dans la v1 si le temps le permet, sinon en v2 (proposition : v2).
3. **Facturation légale** : la plateforme ou chaque artisan émet-il les factures ? À trancher avant tout lancement commercial.

*Principe pour la suite du développement : accord requis pour toute dépense, publication de données sensibles ou opération destructive ; aucune confirmation nécessaire pour le reste.*
