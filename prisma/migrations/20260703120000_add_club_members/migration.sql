CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "clubNumber" TEXT NOT NULL,
    "licence" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "points" INTEGER,
    "category" TEXT,
    "gender" TEXT,
    "clubName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "syncedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClubMember_licence_key" ON "ClubMember"("licence");
CREATE INDEX "ClubMember_clubNumber_active_idx" ON "ClubMember"("clubNumber", "active");
CREATE INDEX "ClubMember_nom_prenom_idx" ON "ClubMember"("nom", "prenom");
