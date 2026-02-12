-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "venue" TEXT,
    "registrationOpenAt" DATETIME,
    "registrationCloseAt" DATETIME,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TournamentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MIXED',
    "minPoints" INTEGER,
    "maxPoints" INTEGER,
    "maxPlayers" INTEGER NOT NULL DEFAULT 32,
    "startAt" DATETIME NOT NULL,
    "feeOnlineCents" INTEGER NOT NULL,
    "feeOnsiteCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TournamentEvent_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentRegistration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "playerRefId" TEXT NOT NULL,
    "userId" TEXT,
    "licenseNumber" TEXT,
    "clubName" TEXT,
    "gender" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentRegistration_playerRefId_fkey" FOREIGN KEY ("playerRefId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TournamentRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentRegistrationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "seedPointsSnapshot" INTEGER,
    "position" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "waitlistRank" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TournamentRegistrationEvent_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "TournamentRegistration" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentRegistrationEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TournamentEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerRef" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentPayment_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "TournamentRegistration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentCheckIn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationEventId" TEXT NOT NULL,
    "checkedInAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInByUserId" TEXT,
    "desk" TEXT,
    CONSTRAINT "TournamentCheckIn_registrationEventId_fkey" FOREIGN KEY ("registrationEventId") REFERENCES "TournamentRegistrationEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentCheckIn_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");
CREATE UNIQUE INDEX "TournamentEvent_tournamentId_code_key" ON "TournamentEvent"("tournamentId", "code");
CREATE INDEX "TournamentEvent_tournamentId_startAt_idx" ON "TournamentEvent"("tournamentId", "startAt");
CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_playerId_key" ON "TournamentRegistration"("tournamentId", "playerId");
CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_playerRefId_key" ON "TournamentRegistration"("tournamentId", "playerRefId");
CREATE INDEX "TournamentRegistration_tournamentId_status_idx" ON "TournamentRegistration"("tournamentId", "status");
CREATE UNIQUE INDEX "TournamentRegistrationEvent_registrationId_eventId_key" ON "TournamentRegistrationEvent"("registrationId", "eventId");
CREATE INDEX "TournamentRegistrationEvent_eventId_status_waitlistRank_idx" ON "TournamentRegistrationEvent"("eventId", "status", "waitlistRank");
CREATE INDEX "TournamentPayment_registrationId_status_idx" ON "TournamentPayment"("registrationId", "status");
CREATE UNIQUE INDEX "TournamentCheckIn_registrationEventId_key" ON "TournamentCheckIn"("registrationEventId");

-- Seed tournament
INSERT INTO "Tournament" (
  "id", "slug", "name", "description", "venue", "registrationOpenAt", "registrationCloseAt", "startDate", "endDate", "status", "updatedAt"
) VALUES (
  'tournoi-2026-cctt',
  'tournoi-cctt-2026',
  'Tournoi CCTT 2026',
  'Tournoi annuel CCTT avec tableaux A à P.',
  'Gymnase Pierre de Coubertin, Châlons-en-Champagne',
  '2026-01-15T08:00:00Z',
  '2026-04-03T23:00:00Z',
  '2026-04-04T00:00:00Z',
  '2026-04-06T23:59:59Z',
  'PUBLISHED',
  CURRENT_TIMESTAMP
);

INSERT INTO "TournamentEvent" ("id", "tournamentId", "code", "label", "gender", "minPoints", "maxPoints", "maxPlayers", "startAt", "feeOnlineCents", "feeOnsiteCents", "status", "updatedAt") VALUES
('evt-A','tournoi-2026-cctt','A','500 à 799 pts','MIXED',500,799,32,'2026-04-04T11:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-B','tournoi-2026-cctt','B','500 à 1099 pts','MIXED',500,1099,32,'2026-04-04T13:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-C','tournoi-2026-cctt','C','800 à 1399 pts','MIXED',800,1399,32,'2026-04-04T10:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-D','tournoi-2026-cctt','D','1100 à 1699 pts','MIXED',1100,1699,32,'2026-04-04T12:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-E','tournoi-2026-cctt','E','500 à 899 pts','MIXED',500,899,32,'2026-04-05T11:00:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-F','tournoi-2026-cctt','F','500 à 1199 pts','MIXED',500,1199,32,'2026-04-05T08:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-G','tournoi-2026-cctt','G','900 à 1499 pts','MIXED',900,1499,32,'2026-04-05T12:00:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-H','tournoi-2026-cctt','H','1200 à 1799 pts','MIXED',1200,1799,32,'2026-04-05T09:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-I','tournoi-2026-cctt','I','-500 à N°400','MIXED',NULL,NULL,32,'2026-04-05T13:15:00Z',900,1000,'OPEN',CURRENT_TIMESTAMP),
('evt-J','tournoi-2026-cctt','J','Dames TC','WOMEN',NULL,NULL,32,'2026-04-05T14:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-K','tournoi-2026-cctt','K','500 à 999 pts','MIXED',500,999,32,'2026-04-06T11:00:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-L','tournoi-2026-cctt','L','500 à 1299 pts','MIXED',500,1299,32,'2026-04-06T08:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-M','tournoi-2026-cctt','M','1000 à 1599 pts','MIXED',1000,1599,32,'2026-04-06T12:00:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-N','tournoi-2026-cctt','N','1300 à 2099 pts','MIXED',1300,2099,32,'2026-04-06T09:30:00Z',800,900,'OPEN',CURRENT_TIMESTAMP),
('evt-P','tournoi-2026-cctt','P','TC','MIXED',NULL,NULL,32,'2026-04-06T13:15:00Z',1000,1100,'OPEN',CURRENT_TIMESTAMP);

INSERT INTO "Player" ("id", "licence", "nom", "prenom", "points", "club", "ownerId", "createdAt") VALUES
('p001','2501001','Martin','Léa',1240,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p002','2501002','Petit','Noah',780,'TT Saint-Orens','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p003','2501003','Durand','Camille',1422,'AS Muret','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p004','2501004','Bernard','Mathis',1675,'Ping Fronton','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p005','2501005','Lopez','Sarah',980,'Reims Olympique TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p006','2501006','Morel','Lucas',1540,'TT Épernay','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p007','2501007','Renard','Emma',865,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p008','2501008','Garnier','Hugo',1320,'Troyes TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p009','2501009','Dubois','Inès',710,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p010','2501010','Chevalier','Tom',1198,'Sedan TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p011','2501011','Leroy','Jules',1015,'Reims TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p012','2501012','Faure','Nina',1388,'Rethel Ping','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p013','2501013','Roussel','Paul',645,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p014','2501014','Robin','Maël',920,'Vitry TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p015','2501015','Mercier','Zoé',1505,'Nancy TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p016','2501016','Vincent','Ethan',840,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p017','2501017','Lambert','Louise',1260,'Chaumont TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p018','2501018','Moulin','Axel',1122,'Langres TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p019','2501019','Benoit','Clara',560,'CCTT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP),
('p020','2501020','Girard','Théo',1740,'Metz TT','cmlgqxfdo0000tjdccvq010t1',CURRENT_TIMESTAMP);

INSERT INTO "TournamentRegistration" ("id", "tournamentId", "playerId", "playerRefId", "userId", "licenseNumber", "clubName", "gender", "contactEmail", "contactPhone", "notes", "status", "source", "updatedAt") VALUES
('reg001','tournoi-2026-cctt',1,'p001','cmlgqxfdo0000tjdccvq010t1','2501001','CCTT','F','lea.martin@example.org','0600000001',NULL,'CONFIRMED','ADMIN',CURRENT_TIMESTAMP),
('reg002','tournoi-2026-cctt',2,'p002','cmlgqxfdo0000tjdccvq010t1','2501002','TT Saint-Orens','M','noah.petit@example.org','0600000002',NULL,'CONFIRMED','ADMIN',CURRENT_TIMESTAMP),
('reg003','tournoi-2026-cctt',3,'p003','cmlgqxfdo0000tjdccvq010t1','2501003','AS Muret','F','camille.durand@example.org','0600000003',NULL,'CONFIRMED','ADMIN',CURRENT_TIMESTAMP),
('reg004','tournoi-2026-cctt',4,'p004','cmlgqxfdo0000tjdccvq010t1','2501004','Ping Fronton','M','mathis.bernard@example.org','0600000004',NULL,'PENDING','ADMIN',CURRENT_TIMESTAMP),
('reg005','tournoi-2026-cctt',5,'p005','cmlgqxfdo0000tjdccvq010t1','2501005','Reims Olympique TT','F','sarah.lopez@example.org','0600000005',NULL,'CONFIRMED','ADMIN',CURRENT_TIMESTAMP),
('reg006','tournoi-2026-cctt',6,'p006','cmlgqxfdo0000tjdccvq010t1','2501006','TT Épernay','M','lucas.morel@example.org','0600000006',NULL,'PENDING','ADMIN',CURRENT_TIMESTAMP),
('reg007','tournoi-2026-cctt',7,'p007','cmlgqxfdo0000tjdccvq010t1','2501007','CCTT','F','emma.renard@example.org','0600000007',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg008','tournoi-2026-cctt',8,'p008','cmlgqxfdo0000tjdccvq010t1','2501008','Troyes TT','M','hugo.garnier@example.org','0600000008',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg009','tournoi-2026-cctt',9,'p009','cmlgqxfdo0000tjdccvq010t1','2501009','CCTT','F','ines.dubois@example.org','0600000009',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg010','tournoi-2026-cctt',10,'p010','cmlgqxfdo0000tjdccvq010t1','2501010','Sedan TT','M','tom.chevalier@example.org','0600000010',NULL,'PENDING','WEB',CURRENT_TIMESTAMP),
('reg011','tournoi-2026-cctt',11,'p011','cmlgqxfdo0000tjdccvq010t1','2501011','Reims TT','M','jules.leroy@example.org','0600000011',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg012','tournoi-2026-cctt',12,'p012','cmlgqxfdo0000tjdccvq010t1','2501012','Rethel Ping','F','nina.faure@example.org','0600000012',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg013','tournoi-2026-cctt',13,'p013','cmlgqxfdo0000tjdccvq010t1','2501013','CCTT','M','paul.roussel@example.org','0600000013',NULL,'PENDING','WEB',CURRENT_TIMESTAMP),
('reg014','tournoi-2026-cctt',14,'p014','cmlgqxfdo0000tjdccvq010t1','2501014','Vitry TT','M','mael.robin@example.org','0600000014',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg015','tournoi-2026-cctt',15,'p015','cmlgqxfdo0000tjdccvq010t1','2501015','Nancy TT','F','zoe.mercier@example.org','0600000015',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg016','tournoi-2026-cctt',16,'p016','cmlgqxfdo0000tjdccvq010t1','2501016','CCTT','M','ethan.vincent@example.org','0600000016',NULL,'PENDING','WEB',CURRENT_TIMESTAMP),
('reg017','tournoi-2026-cctt',17,'p017','cmlgqxfdo0000tjdccvq010t1','2501017','Chaumont TT','F','louise.lambert@example.org','0600000017',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg018','tournoi-2026-cctt',18,'p018','cmlgqxfdo0000tjdccvq010t1','2501018','Langres TT','M','axel.moulin@example.org','0600000018',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg019','tournoi-2026-cctt',19,'p019','cmlgqxfdo0000tjdccvq010t1','2501019','CCTT','F','clara.benoit@example.org','0600000019',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP),
('reg020','tournoi-2026-cctt',20,'p020','cmlgqxfdo0000tjdccvq010t1','2501020','Metz TT','M','theo.girard@example.org','0600000020',NULL,'CONFIRMED','WEB',CURRENT_TIMESTAMP);

INSERT INTO "TournamentRegistrationEvent" ("id", "registrationId", "eventId", "seedPointsSnapshot", "position", "status", "waitlistRank", "updatedAt") VALUES
('re001','reg001','evt-C',1240,1,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re002','reg002','evt-A',780,2,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re003','reg003','evt-H',1422,3,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re004','reg004','evt-N',1675,4,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re005','reg005','evt-G',980,5,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re006','reg006','evt-I',1540,6,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re007','reg007','evt-E',865,7,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re008','reg008','evt-C',1320,8,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re009','reg009','evt-A',710,9,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re010','reg010','evt-F',1198,10,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re011','reg011','evt-M',1015,11,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re012','reg012','evt-N',1388,12,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re013','reg013','evt-A',645,13,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re014','reg014','evt-K',920,14,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re015','reg015','evt-P',1505,15,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re016','reg016','evt-E',840,16,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re017','reg017','evt-L',1260,17,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re018','reg018','evt-B',1122,18,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re019','reg019','evt-J',560,19,'REGISTERED',NULL,CURRENT_TIMESTAMP),
('re020','reg020','evt-P',1740,20,'REGISTERED',NULL,CURRENT_TIMESTAMP);

INSERT INTO "TournamentPayment" ("id", "registrationId", "amountCents", "method", "status", "paidAt") VALUES
('pay001','reg001',800,'ONLINE','PAID','2026-03-01T10:00:00Z'),
('pay002','reg002',900,'CASH','PENDING',NULL),
('pay003','reg003',800,'ONLINE','PAID','2026-03-04T12:00:00Z'),
('pay004','reg004',900,'CARD','PENDING',NULL),
('pay005','reg005',800,'ONLINE','PAID','2026-03-07T09:00:00Z'),
('pay006','reg006',1000,'CASH','PENDING',NULL),
('pay007','reg007',800,'ONLINE','PAID','2026-03-08T11:30:00Z'),
('pay008','reg008',800,'ONLINE','PAID','2026-03-10T14:00:00Z'),
('pay009','reg009',800,'ONLINE','PAID','2026-03-11T15:00:00Z'),
('pay010','reg010',800,'CASH','PENDING',NULL),
('pay011','reg011',800,'ONLINE','PAID','2026-03-12T10:00:00Z'),
('pay012','reg012',800,'ONLINE','PAID','2026-03-12T16:00:00Z'),
('pay013','reg013',800,'CASH','PENDING',NULL),
('pay014','reg014',800,'ONLINE','PAID','2026-03-13T10:00:00Z'),
('pay015','reg015',1000,'ONLINE','PAID','2026-03-14T18:00:00Z'),
('pay016','reg016',800,'CASH','PENDING',NULL),
('pay017','reg017',800,'ONLINE','PAID','2026-03-16T10:15:00Z'),
('pay018','reg018',800,'ONLINE','PAID','2026-03-17T11:00:00Z'),
('pay019','reg019',800,'ONLINE','PAID','2026-03-18T12:00:00Z'),
('pay020','reg020',1000,'ONLINE','PAID','2026-03-19T13:00:00Z');
