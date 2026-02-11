/workspace/club-cctt$ /bin/bash -lc 'git add README.md'
/workspace/club-cctt$ /bin/bash -lc 'git commit -m "docs: clarify README visibility note"'
[work b4b2ad2] docs: clarify README visibility note
1 file changed, 5 insertions(+)
/workspace/club-cctt$ /bin/bash -lc 'nl -ba README.md'
1 # Châlons-en-Champagne Tennis de Table (CCTT)
2
3 Site vitrine du club de tennis de table de Châlons-en-Champagne. Le site
4 présente le club, ses horaires, ses tarifs et met en avant les événements
5 annuels.
6
7 ## Prérequis
8
9 - Node.js 20+
10 - npm 10+ (ou yarn/pnpm/bun)
11
12 ## Installation
13
14 `bash
    15	npm install
    16	`
17
18 ## Démarrage en local
19
20 `bash
    21	npm run dev
    22	`
23
24 Puis ouvrez [http://localhost:3000](http://localhost:3000).
25
26 ## Scripts utiles
27
28 `bash
    29	npm run dev     # Lancer le serveur de développement
    30	npm run build   # Build de production
    31	npm run start   # Démarrer le build de production
    32	npm run lint    # Lint du projet
    33	`
34
35 ## Structure du projet
36
37 - `app/` : routes et pages (App Router Next.js).
38 - `components/` : composants UI réutilisables.
39 - `public/` : assets statiques (images, logos).
40 - `lib/` : utilitaires et helpers.
41
42 ## Déploiement
43
44 Le projet peut être déployé sur Vercel ou tout hébergeur compatible Node.js.
45
46 1. Construire le projet :
47 `bash
    48	   npm run build
    49	   `
50 2. Démarrer en production :
51 `bash
    52	   npm run start
    53	   `
54
55 ## Contribution
56
57 1. Créer une branche dédiée.
58 2. Décrire clairement les changements.
59 3. Vérifier que le lint passe avant de proposer une PR.
60
61 ## Contact
62
63 Pour toute question liée au site : communication@cctt.fr
64
65 ## Notes
66
67 Si le README vous paraît vide après un pull, vérifiez que votre branche est à
68 jour et que le fichier n’est pas ouvert dans un éditeur filtrant l’encodage.

## Dépannage Auth (`/api/auth/error?error=Configuration`)

Si l’URL d’erreur NextAuth affiche `error=Configuration`, vérifier en priorité :

1. Variables OAuth Google présentes en production (`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, ou `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`).
2. Secret d’authentification (`AUTH_SECRET` ou `NEXTAUTH_SECRET`).
3. URL de callback Google OAuth autorisée côté Google Cloud (domaine de prod + `/api/auth/callback/google`).
4. `AUTH_URL` / `NEXTAUTH_URL` défini sur **l'origine du site uniquement** (ex: `https://club.cctt.fr`, sans `/api/auth`).
5. Variables injectées sur l’environnement de déploiement (Vercel/serveur), pas uniquement en local.
6. Valeurs sans guillemets parasites ni espaces (éviter `"..."` / `'...'` copiés depuis un `.env`).
