# SUNU ARTISANAT — Guide de Prise en Main Utilisateur & Administrateur

---

## 1. Parcours Client & Achat

### A. Navigation & Découverte
1. **Accès au catalogue** : Rendez-vous sur `/boutique`. Filtrez par région (*Thiès, Dakar, Casamance, Saint-Louis*) ou par catégorie (*Tissage, Maroquinerie, Bijouterie, etc.*).
2. **Découverte des ateliers** : Rendez-vous sur `/artisans` pour explorer les fiches détaillées des artisans partenaires et leurs démarches culturelles.
3. **Fiche produit** : Consultez les détails de la pièce, son origine déclarée et la liste des matériaux artisanaux. Le badge vert *✓ Atelier vérifié* confirme l'adhésion de l'artisan.

### B. Commande & Suivi
1. **Ajout au panier** : Cliquez sur *Ajouter au panier* ou *Commander*.
2. **Panier multi-artisans (`/panier`)** : Vos articles sont présentés regroupés par atelier pour une transparence totale sur les expéditions.
3. **Validation (`/commande`)** : Renseignez vos coordonnées sénégalaises (région, quartier, téléphone WhatsApp). Vous pouvez commander sans avoir créé de compte.
4. **Suivi en temps réel (`/suivi/[trackingToken]`)** : Conservez l'URL privée reçue lors de la commande pour suivre l'état d'avancement de chaque colis (préparation en atelier, expédition par coursier, livraison).

### C. Vérification de la Traçabilité
- Chaque produit commandé est associé à un QR Code physique ou virtuel.
- En scannant le code ou en visitant `/certification/[code]`, vous accédez à l'attestation officielle de l'origine déclarée par l'atelier.

---

## 2. Espace Artisan Partenaire (`/atelier`)

1. **Connexion atelier** : Connectez-vous avec vos identifiants artisan sur `/atelier/connexion`.
2. **Tableau de bord** : Visualisez l'état de validation de votre atelier, vos dernières commandes et vos statistiques.
3. **Gestion des créations (`/atelier/produits`)** :
   - Ajoutez de nouvelles pièces avec photo, prix en FCFA, stock disponible et description des matériaux.
   - Dès la soumission, votre pièce est en attente de validation par l'équipe administrative.
4. **Gestion des commandes** :
   - Lorsqu'une commande est réglée, préparez le colis à l'atelier.
   - Dès qu'un livreur est assigné par la plateforme, passez la commande à l'état *Expédiée*.

---

## 3. Administration Générale de la Plateforme (`/admin`)

*(Accessible aux rôles `ADMIN` et `SUPERADMIN`)*

1. **Modération des Créations (`/admin/produits`)** :
   - Examinez les nouveaux produits soumis par les artisans.
   - Cliquez sur *Valider & Générer le QR Code* pour publier la pièce sur la boutique.
   - En cas de non-conformité, cliquez sur *Refuser* et saisissez obligatoirement le motif précis pour guider l'artisan.
2. **Validation des Artisans (`/admin/artisans`)** :
   - Examinez les dossiers d'inscription des nouveaux ateliers et attribuez le badge *Atelier vérifié*.
3. **Gestion des Reversements (`/admin/reversements`)** :
   - Enregistrez les reversements des parts nettes aux artisans via Wave, Orange Money ou virement, avec notification automatique.
4. **CMS & Thème Officiel (Opérations CR4)** :
   - Modifiez les couleurs de la charte nationale et les logos sur `/admin/theme` sans aucun redéploiement.
   - Créez de nouvelles pages de contenu (CGV, Mentions, etc.) sur `/admin/pages`.
   - Activez ou désactivez les services tiers (Groq, Resend, WhatsApp) en un clic sur `/admin/modules`.
