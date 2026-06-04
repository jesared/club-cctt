# Checklist De Recette Pre-Lancement

Cette checklist sert a valider que le site est prêt a être mis en ligne sans blocage majeur. L'objectif n'est pas de tout retester indéfiniment, mais de vérifier les parcours critiques, les états degradés visibles et les fonctions sensibles avant le go-live.

## Règles D'Usage

- Faire la recette sur mobile et desktop.
- Tester avec un compte non connecte, un compte membre et un compte admin.
- Noter chaque point avec `OK`, `A corriger`, ou `Non applicable`.
- En cas d'erreur, noter l'URL, l'action effectuée et le résultat observe.

## 1. Verification Technique De Base

- `npm run lint` passe.
- `npm run build` passe.
- `npx vitest run --pool=vmThreads` passe.
- Le site démarré sans erreur serveur bloquante.
- Aucune erreur console bloquante n'apparaît sur les pages critiques.
- Les variables de production sont bien renseignees.
- L'authentification Google et les secrets d'auth sont valides.
- Les formulaires publics ont une vraie configuration d'envoi.

## 2. Parcours Public Global

- La page d'accueil charge correctement.
- Le header s'affiche correctement sur desktop.
- Le header mobile fonctionne.
- Le footer s'affiche correctement.
- Les liens principaux du menu vont au bon endroit.
- Le site reste coherent visuellement sur mobile.
- Aucun texte placeholder ou brouillon n'est visible.
- Les pages `404` ont un rendu correct.

## 3. Pages Publiques Club

### Accueil

- Le hero principal est lisible.
- Les CTA principaux sont compréhensibles.
- Les liens vers le club, le tournoi et le contact fonctionnent.

### Horaires

- [app/(dashboard)/club/horaires/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/club/horaires/page.tsx) charge sans erreur.
- Les créneaux s'affichent.
- Le badge de fraicheur des donnees est coherent.
- Le fallback degrade reste compréhensible si les donnees externes sont absentes.

### Tarifs

- [app/(dashboard)/club/tarifs/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/club/tarifs/page.tsx) charge sans erreur.
- Les blocs tarifs s'affichent.
- Les CTA de fin de page vont au bon endroit.
- Les textes sont coherents et a jour.

### Partenaires

- [app/(dashboard)/club/partenaires/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/club/partenaires/page.tsx) charge sans erreur.
- Les logos partenaires s'affichent.
- Si un logo externe manque, le fallback s'affiche bien.
- Les liens externes partenaires fonctionnent.

### Contact

- [app/(dashboard)/club/contact/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/club/contact/page.tsx) charge sans erreur.
- Les coordonnées club sont correctes.
- Si le formulaire est actif, il est visible et soumis correctement.
- Si le formulaire est inactif, le message de fallback et l'e-mail direct sont bien visibles.
- Les motifs de contact pre-remplissent bien le sujet.

## 4. Parcours Authentification

- Un visiteur non connecte peut ouvrir `/auth/signin`.
- La connexion fonctionne.
- La deconnexion fonctionne.
- La redirection après connexion revient bien sur la page demandee.
- Un utilisateur non connecte tente `/user` et est bien redirige vers la connexion.
- Un utilisateur non admin tente `/admin` et est bien redirige/refuse proprement.

## 5. Parcours Tournoi Public

### Page Tournoi

- `/tournoi` charge sans erreur.
- Le statut des inscriptions est coherent.
- Les tableaux ou infos tournoi s'affichent correctement.
- Les CTA vers inscription, reglement, palmares ou liste fonctionnent.

### Inscription Tournoi

- [app/(dashboard)/tournoi/inscription/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/tournoi/inscription/page.tsx) charge sans erreur.
- Si les inscriptions sont ouvertes et configurees, le formulaire est affiché.
- Si la config d'envoi n'est pas prete, le bloc d'indisponibilite s'affiche clairement.
- La recherche FFTT fonctionne avec une licence valide.
- Une licence invalide retourne un message propre.
- Les champs joueur se remplissent correctement après lookup FFTT.
- Le filtrage des tableaux correspond bien au genre et aux points.
- Les tableaux complets passent bien en logique liste d'attente.
- Le récapitulatif avant envoi est coherent.
- Une soumission valide retourne un message de succès clair.
- Une double inscription retourne un message clair.
- Le lien vers `/user/inscriptions` apparaît quand il doit apparaitre.

### Pages Tournoi Secondaires

- `/tournoi/reglement` charge.
- `/tournoi/palmares` charge.
- `/tournoi/liste-inscrits` charge.
- `/tournoi/tableaux` charge.

## 6. Espace Membre

### Tableau De Bord Utilisateur

- [app/(dashboard)/user/page.tsx](C:/Users/User/Documents/Web/cctt-club/app/(dashboard)/user/page.tsx) charge après connexion.
- Les cartes principales sont coherentes.
- Les notifications recentes s'affichent.
- Les liens vers inscriptions, paiements et documents fonctionnent.

### Inscriptions

- `/user/inscriptions` charge.
- Les inscriptions du compte apparaissent correctement.
- Les statuts sont lisibles.

### Paiements

- `/user/paiements` charge.
- Les paiements en attente et payes sont coherents.

### Notifications

- `/user/notifications` charge.
- Le compteur de non lus est coherent.
- Le marquage comme lu fonctionne.

### Parametres / Profil

- `/user/parametres` charge.
- La mise a jour du nom fonctionne.

## 7. Espaces A Droits

### Espace Club

- `/user/club` charge avec un role autorise.
- `/user/club/agenda` charge.
- `/user/club/annonces` charge.
- `/user/club/contacts` charge.
- `/user/club/documents` charge.

### Espace Bureau

- `/user/bureau` charge avec un role autorise.
- `/user/bureau/reunions` charge.
- `/user/bureau/documents` charge.

### Espace Entraineur

- `/user/entraineur` charge avec un role autorise.
- `/user/entraineur/joueurs` charge.
- `/user/entraineur/groupes` charge.
- `/user/entraineur/documents` charge.

### Contrôle D'Acces

- Un utilisateur sans role Club est bloque sur les pages Club réservées.
- Un utilisateur sans role Bureau est bloque sur les pages Bureau réservées.
- Un utilisateur sans role Entraineur est bloque sur les pages Entraineur réservées.
- Les redirections `forbidden` restent comprehensibles.

## 8. Administration

### Acces Global

- `/admin` charge avec un compte admin.
- Un compte non admin n'y accede pas.
- Le layout admin est stable.

### Contenus Club

- `/admin/home` charge.
- `/admin/contact` charge.
- `/admin/horaires` charge.
- `/admin/tarifs` charge.
- `/admin/partenaires` charge.
- `/admin/comite-directeur` charge.
- Les modifications de contenu se sauvegardent correctement.

### Media

- `/admin/media` charge.
- L'ajout d'un media fonctionne si Cloudinary est configure.
- La suppression fonctionne.
- Les medias ajoutes sont visibles dans les pages qui les utilisent.

### Utilisateurs Et Notifications

- `/admin/users` charge.
- Les roles visibles sont coherents.
- `/admin/messages` charge.
- La creation d'un message fonctionne.
- `/admin/notifications` charge.

### Audit UX / Documentation

- `/admin/audit-ux` charge.
- `/admin/documentation` charge.

## 9. Administration Tournoi

- `/admin/tournoi` charge.
- La liste des tournois s'affiche.
- La creation d'un tournoi fonctionne.
- La duplication d'un tournoi fonctionne.
- L'edition d'un tournoi fonctionne.
- L'activation d'un tournoi fonctionne.
- Les tableaux s'affichent.
- Les inscriptions s'affichent.
- Les paiements s'affichent.
- Les pointages s'affichent.
- Les exports critiques se generent sans erreur.

## 10. États Degrades Et Cas Limites

- Le site reste exploitable si Drive ne repond pas.
- Le site reste exploitable si aucun tournoi publie n'existe.
- Le contact affiche un fallback propre si l'envoi est indisponible.
- L'inscription tournoi affiche un fallback propre si l'envoi est indisponible.
- Les pages a contenu vide restent comprehensibles.

## 11. Validation Avant Go-Live

- Tous les points critiques ci-dessus sont `OK`.
- Aucun point `A corriger` ne concerne auth, admin, contact ou inscription tournoi.
- Les variables de prod réelles ont été vérifiées une dernière fois.
- Une sauvegarde / possibilite de rollback est connue.
- La personne qui publie sait comment vérifier rapidement la santé du site après mise en ligne.

## Verdict

- `GO` : aucun blocage majeur, parcours critiques valides.
- `GO AVEC SURVEILLANCE` : petits defauts non bloquants, site publiable.
- `NO GO` : auth, admin, formulaires publics, ou parcours tournoi encore instables.
