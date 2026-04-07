-- CreateTable
CREATE TABLE "MenuVisibility" (
    "key" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuVisibility_pkey" PRIMARY KEY ("key")
);

-- Seed default public menu settings
INSERT INTO "MenuVisibility" ("key", "label", "enabled", "updatedAt", "createdAt")
VALUES ('tournoi', 'Menu Tournoi', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
