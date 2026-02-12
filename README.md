# Châlons-en-Champagne Tennis de Table (CCTT)

Site vitrine du club de tennis de table de Châlons-en-Champagne. Le site présente le club, ses horaires, ses tarifs et met en avant les événements annuels.

## Prérequis

- Node.js 20+
- npm 10+ (ou yarn/pnpm/bun)
- Une base PostgreSQL accessible via `DATABASE_URL`

## Installation

```bash
npm install
```

## Configuration

1. Créez un fichier `.env` à partir d’un modèle local.
2. Définissez au minimum `DATABASE_URL`.

## Base de données (Prisma)

Le projet utilise Prisma Migrate avec les migrations du dossier `prisma/migrations`.

### Initialiser une base vide (local/dev)

```bash
npx prisma migrate deploy
```

### Cas d’une base déjà existante (erreur `P3005`)

Si vous obtenez l’erreur suivante :

```txt
Error: P3005
The database schema is not empty.
```

cela signifie que Prisma tente d’appliquer des migrations sur une base déjà peuplée sans historique Prisma.

Dans ce cas, baseliner la base existante avec la première migration du projet :

```bash
npx prisma migrate resolve --applied 20260210144025_init
npx prisma migrate deploy
```

> Si plusieurs migrations ont déjà été appliquées manuellement, marquez-les aussi comme `--applied` dans l’ordre avant `migrate deploy`.

## Démarrage en local

```bash
npm run dev
```

Puis ouvrez [http://localhost:3000](http://localhost:3000).

## Scripts utiles

```bash
npm run dev     # Lancer le serveur de développement
npm run build   # Build de production
npm run start   # Démarrer le build de production
npm run lint    # Lint du projet
npm run seed:admin-tournoi # Seed admin tournoi
```

## Structure du projet

- `app/` : routes et pages (App Router Next.js).
- `components/` : composants UI réutilisables.
- `public/` : assets statiques (images, logos).
- `lib/` : utilitaires et helpers.
- `prisma/` : schéma, migrations et scripts de seed.

## Déploiement

Le projet peut être déployé sur Vercel ou tout hébergeur compatible Node.js.

1. Construire le projet :

   ```bash
   npm run build
   ```

2. Démarrer en production :

   ```bash
   npm run start
   ```

## Contribution

1. Créer une branche dédiée.
2. Décrire clairement les changements.
3. Vérifier que le lint passe avant de proposer une PR.

## Contact

Pour toute question liée au site : communication@cctt.fr
