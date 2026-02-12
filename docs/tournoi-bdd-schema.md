# Proposition de schéma BDD pour `/tournoi` et `/admin/tournoi`

Ce document propose un schéma relationnel (orienté Prisma/PostgreSQL) pour remplacer les données statiques de tournoi par des données persistées.

## Objectifs couverts

- Publier un ou plusieurs tournois dans `/tournoi`.
- Gérer les tableaux (A, B, C...) et leurs règles (bornes de points, capacité, tarif).
- Enregistrer les inscriptions des joueurs sur un ou plusieurs tableaux.
- Suivre la liste d’attente automatiquement si le tableau est complet.
- Suivre le paiement (anticipé / sur place / remboursé).
- Suivre le pointage le jour J dans `/admin/tournoi/pointages`.
- Permettre les exports `/admin/tournoi/exports`.

## Modèle de données (vue métier)

### 1) `Tournament`
Représente un événement global (ex: tournoi national 2026).

Champs clés:
- `id`
- `slug` (unique, utilisé dans les URL)
- `name`
- `description`
- `venue`
- `registrationOpenAt`
- `registrationCloseAt`
- `startDate`
- `endDate`
- `status` (`DRAFT`, `PUBLISHED`, `CLOSED`, `ARCHIVED`)
- `createdAt`, `updatedAt`

### 2) `TournamentEvent` (tableaux)
Représente un tableau/épreuve (A, B, C...) d’un tournoi.

Champs clés:
- `id`
- `tournamentId` (FK)
- `code` (A, B, C...) — unique par tournoi
- `label` (ex: "500 à 799 pts")
- `gender` (`MIXED`, `WOMEN`...)
- `minPoints`, `maxPoints`
- `maxPlayers`
- `startAt`
- `feeOnlineCents`, `feeOnsiteCents`
- `status` (`OPEN`, `FULL`, `CLOSED`, `CANCELLED`)
- `createdAt`, `updatedAt`

### 3) `TournamentRegistration`
Inscription d’un joueur à un tournoi (niveau entête).

Champs clés:
- `id`
- `tournamentId` (FK)
- `playerId` (FK vers `Player`)
- `userId` (FK vers `User`, nullable si saisie admin)
- `contactEmail`, `contactPhone`
- `notes`
- `status` (`PENDING`, `CONFIRMED`, `CANCELLED`)
- `source` (`WEB`, `ADMIN`)
- `createdAt`, `updatedAt`

Contrainte:
- Unicité `(tournamentId, playerId)` pour éviter les doublons d’inscription.

### 4) `TournamentRegistrationEvent`
Association entre une inscription et un tableau (1 inscription peut cibler N tableaux).

Champs clés:
- `id`
- `registrationId` (FK)
- `eventId` (FK)
- `seedPointsSnapshot` (points figés au moment de l’inscription)
- `position`
- `status` (`REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `NO_SHOW`, `FORFEIT`)
- `waitlistRank` (nullable)
- `createdAt`, `updatedAt`

Contraintes:
- Unicité `(registrationId, eventId)`.

### 5) `TournamentPayment`
Paiement lié à une inscription (un ou plusieurs paiements possibles).

Champs clés:
- `id`
- `registrationId` (FK)
- `amountCents`
- `method` (`ONLINE`, `CASH`, `CARD`, `TRANSFER`)
- `status` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`)
- `provider` (nullable)
- `providerRef` (nullable)
- `paidAt` (nullable)
- `createdAt`

### 6) `TournamentCheckIn`
Pointage à l’accueil pour un tableau donné.

Champs clés:
- `id`
- `registrationEventId` (FK)
- `checkedInAt`
- `checkedInByUserId` (FK vers `User`)
- `desk` (nullable)

Contrainte:
- Unicité `registrationEventId` (un seul pointage par tableau).

### 7) `TournamentAuditLog` (optionnel mais recommandé)
Historique admin (changement de statut, bascule liste d’attente, paiement forcé, etc.).

## Enums recommandés

- `TournamentStatus`: `DRAFT | PUBLISHED | CLOSED | ARCHIVED`
- `TournamentEventStatus`: `OPEN | FULL | CLOSED | CANCELLED`
- `RegistrationStatus`: `PENDING | CONFIRMED | CANCELLED`
- `RegistrationEventStatus`: `REGISTERED | WAITLISTED | CHECKED_IN | NO_SHOW | FORFEIT`
- `PaymentMethod`: `ONLINE | CASH | CARD | TRANSFER`
- `PaymentStatus`: `PENDING | PAID | FAILED | REFUNDED`
- `RegistrationSource`: `WEB | ADMIN`
- `EventGender`: `MIXED | WOMEN | MEN`

## Proposition Prisma (base de départ)

```prisma
enum TournamentStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

enum TournamentEventStatus {
  OPEN
  FULL
  CLOSED
  CANCELLED
}

enum RegistrationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum RegistrationEventStatus {
  REGISTERED
  WAITLISTED
  CHECKED_IN
  NO_SHOW
  FORFEIT
}

enum PaymentMethod {
  ONLINE
  CASH
  CARD
  TRANSFER
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum RegistrationSource {
  WEB
  ADMIN
}

enum EventGender {
  MIXED
  WOMEN
  MEN
}

model Tournament {
  id                    String                  @id @default(cuid())
  slug                  String                  @unique
  name                  String
  description           String?
  venue                 String?
  registrationOpenAt    DateTime?
  registrationCloseAt   DateTime?
  startDate             DateTime
  endDate               DateTime
  status                TournamentStatus        @default(DRAFT)

  events                TournamentEvent[]
  registrations         TournamentRegistration[]

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt
}

model TournamentEvent {
  id                    String                  @id @default(cuid())
  tournamentId          String
  tournament            Tournament              @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  code                  String
  label                 String
  gender                EventGender             @default(MIXED)
  minPoints             Int?
  maxPoints             Int?
  maxPlayers            Int                     @default(32)
  startAt               DateTime
  feeOnlineCents        Int
  feeOnsiteCents        Int
  status                TournamentEventStatus   @default(OPEN)

  registrationEvents    TournamentRegistrationEvent[]

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  @@unique([tournamentId, code])
  @@index([tournamentId, startAt])
}

model TournamentRegistration {
  id                    String                  @id @default(cuid())
  tournamentId          String
  tournament            Tournament              @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  playerId              String
  player                Player                  @relation(fields: [playerId], references: [id], onDelete: Restrict)

  userId                String?
  user                  User?                   @relation(fields: [userId], references: [id], onDelete: SetNull)

  contactEmail          String?
  contactPhone          String?
  notes                 String?
  status                RegistrationStatus      @default(PENDING)
  source                RegistrationSource      @default(WEB)

  registrationEvents    TournamentRegistrationEvent[]
  payments              TournamentPayment[]

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  @@unique([tournamentId, playerId])
  @@index([tournamentId, status])
}

model TournamentRegistrationEvent {
  id                    String                  @id @default(cuid())
  registrationId        String
  registration          TournamentRegistration  @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  eventId               String
  event                 TournamentEvent         @relation(fields: [eventId], references: [id], onDelete: Cascade)

  seedPointsSnapshot    Int?
  position              Int?
  status                RegistrationEventStatus @default(REGISTERED)
  waitlistRank          Int?

  checkIn               TournamentCheckIn?

  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  @@unique([registrationId, eventId])
  @@index([eventId, status, waitlistRank])
}

model TournamentPayment {
  id                    String                  @id @default(cuid())
  registrationId        String
  registration          TournamentRegistration  @relation(fields: [registrationId], references: [id], onDelete: Cascade)

  amountCents           Int
  method                PaymentMethod
  status                PaymentStatus           @default(PENDING)
  provider              String?
  providerRef           String?
  paidAt                DateTime?

  createdAt             DateTime                @default(now())

  @@index([registrationId, status])
}

model TournamentCheckIn {
  id                    String                    @id @default(cuid())
  registrationEventId   String                    @unique
  registrationEvent     TournamentRegistrationEvent @relation(fields: [registrationEventId], references: [id], onDelete: Cascade)

  checkedInAt           DateTime                  @default(now())
  checkedInByUserId     String?
  checkedInByUser       User?                     @relation(fields: [checkedInByUserId], references: [id], onDelete: SetNull)
  desk                  String?
}
```

## Mapping rapide avec les écrans existants

- `/tournoi`
  - Liste des tableaux: `TournamentEvent` filtré par tournoi + statut.
  - Tarifs: `feeOnlineCents` / `feeOnsiteCents`.
  - Formulaire d’inscription: création `TournamentRegistration` + `TournamentRegistrationEvent`.

- `/admin/tournoi`
  - Vue globale: agrégats sur `TournamentEvent` + `TournamentRegistrationEvent`.
  - Inscriptions: `TournamentRegistration` + jointure vers `Player`.
  - Joueurs / pointages: `TournamentRegistrationEvent` + `TournamentCheckIn`.
  - Paiement: `TournamentPayment`.
  - Exports CSV: requêtes jointes sur les 4 tables ci-dessus.

## Recommandations d’implémentation

1. Créer les modèles en migration 1 (sans suppression de l’existant).
2. Ajouter un seed pour un tournoi + tableaux A à P.
3. Remplacer progressivement `app/admin/tournoi/data.ts` par des requêtes Prisma.
4. Ajouter des index ciblés si volumétrie > 10k inscriptions.
5. Mettre des garde-fous métier côté API:
   - fenêtre d’inscription ouverte,
   - vérification points min/max,
   - passage automatique en `WAITLISTED` si capacité atteinte.
