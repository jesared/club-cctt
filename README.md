# Chalons-en-Champagne Tennis de Table (CCTT)

Site du club de tennis de table de Chalons-en-Champagne. Le projet couvre la presentation du club, les contenus publics, l'espace membre et l'administration du tournoi.

## Prerequis

- Node.js 20+
- npm 10+ (ou yarn/pnpm/bun)
- Une base PostgreSQL accessible via `DATABASE_URL`

## Installation

```bash
npm install
```

## Configuration

1. Creez un fichier `.env` a partir de `.env.example`.
2. Renseignez les variables correspondant a votre environnement.

### Variables minimales

- `DATABASE_URL` : connexion PostgreSQL.
- `NEXT_PUBLIC_SITE_URL` : URL publique du site.
- `BETTER_AUTH_URL` : URL canonique utilisée par Better Auth pour les callbacks.
- `NEXT_PUBLIC_BETTER_AUTH_URL` : meme URL cote client, utile si l'auth est servie sur un domaine explicite.
- `BETTER_AUTH_TRUSTED_ORIGINS` : origines autorisees separees par des virgules.
- `AUTH_SECRET` : secret d'authentification principal.
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

### Variables requises si le formulaire de contact est ouvert

- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`

Optionnel : `CONTACT_FROM_EMAIL` ou `CONTACT_WEBHOOK_URL`.

### Variables requises si les inscriptions tournoi sont ouvertes

- `RESEND_API_KEY` + `TOURNAMENT_REGISTRATION_TO_EMAIL`
- `TOURNAMENT_REGISTRATION_FROM_EMAIL`

ou

- `TOURNAMENT_REGISTRATION_WEBHOOK_URL`

Recommande pour envoyer aussi un e-mail récapitulatif au joueur :

- `TOURNAMENT_REGISTRATION_CONFIRMATION_FROM_EMAIL`
- `TOURNAMENT_REGISTRATION_REPLY_TO_EMAIL`

### Variables de contenu externe

- `COMITE_JSON_ID`
- `HORAIRES_JSON_ID`
- `PARTENAIRES_JSON_ID`
- `TARIFS_JSON_ID`

Sans ces variables, certaines pages publiques pourront retomber sur le cache ou le contenu de repli.

## Base de donnees (Prisma)

Le projet utilise Prisma Migrate avec les migrations du dossier `prisma/migrations`.

### Initialiser une base vide

```bash
npx prisma migrate deploy
```

### Cas d'une base déjà existante (erreur `P3005`)

Si vous obtenez l'erreur suivante :

```txt
Error: P3005
The database schema is not empty.
```

cela signifie que Prisma tente d'appliquer des migrations sur une base déjà peuplee sans historique Prisma.

Dans ce cas, baseliner la base existante avec la première migration du projet :

```bash
npx prisma migrate resolve --applied 20260210144025_init
npx prisma migrate deploy
```

Si plusieurs migrations ont déjà été appliquees manuellement, marquez-les aussi comme `--applied` dans l'ordre avant `migrate deploy`.

## Demarrage en local

```bash
npm run dev
```

Puis ouvrez [http://localhost:3000](http://localhost:3000).

## Scripts utiles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm test
npm run seed:admin-tournoi
```

## Structure du projet

- `app/` : routes et pages (App Router Next.js)
- `components/` : composants UI reutilisables
- `public/` : assets statiques
- `lib/` : utilitaires et helpers
- `prisma/` : schema, migrations et scripts de seed

## Deploiement

Le projet peut être deploye sur Vercel ou tout hebergeur compatible Node.js.

1. Vérifier que les variables d'environnement de production sont definies.
2. Construire le projet :

   ```bash
   npm run build
   ```

3. Demarrer en production :

   ```bash
   npm run start
   ```

### Checklist go-live minimale

- `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL` et `NEXT_PUBLIC_BETTER_AUTH_URL` pointent vers le vrai domaine, par exemple `https://cctt.fr`.
- `BETTER_AUTH_TRUSTED_ORIGINS` contient les variantes utilisées en production, par exemple `https://cctt.fr,https://www.cctt.fr`.
- La console Google OAuth autorise l'URI de redirection `https://cctt.fr/api/auth/callback/google` et, si `www` reste accessible, `https://www.cctt.fr/api/auth/callback/google`.
- Les formulaires publics ont leurs variables d'envoi configurees.
- Les pages club chargent correctement leurs contenus externes.
- `npm run build` passe.
- `npx vitest run --pool=vmThreads` passe.

## Contribution

1. Creer une branche dédiée.
2. Decrire clairement les changements.
3. Vérifier que le lint passe avant de proposer une PR.

## Contact

Pour toute question liee au site : communication@cctt.fr
