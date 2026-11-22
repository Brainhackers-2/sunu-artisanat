# Guide de Déploiement — SUNU ARTISANAT

## 1. Prérequis & Comptes
Pour déployer SUNU ARTISANAT en production et en environnement de test, les comptes gratuits suivants sont requis :

1. **GitHub** :
   - Dépôt privé ou public pour le versionnement du code et l'intégration continue Vercel.
2. **Supabase** (Offre gratuite) :
   - Créer un projet PostgreSQL dans la région la plus proche (ex: Frankfurt `eu-central-1` ou Paris `eu-west-3`).
   - Récupérer les chaînes de connexion dans `Settings > Database` :
     - **Connection string (Transaction pooler, port 6543)** -> `DATABASE_URL` (avec `?pgbouncer=true`).
     - **Connection string (Direct session, port 5432)** -> `DIRECT_URL`.
   - Créer un bucket de stockage public/sécurisé `artisan-media` dans `Storage`.
   - Récupérer l'URL du projet et les clés API (Anon & Service Role).
3. **Vercel** (Offre Hobby) :
   - Lier le compte GitHub.
   - Importer le projet Next.js.
   - Renseigner les variables d'environnement listées dans `.env.example`.

## 2. Commandes de vérification locale
```bash
npm run typecheck    # Vérification stricte TypeScript
npm run build        # Compilation et build de production Next.js
npx prisma generate  # Génération du client Prisma
```
