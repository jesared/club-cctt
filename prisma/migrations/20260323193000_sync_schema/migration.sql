-- Align database schema with current Prisma datamodel (enums + cache + cleanup)

DO $$
BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'CLUB', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "TournamentEventStatus" AS ENUM ('OPEN', 'FULL', 'CLOSED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "RegistrationEventStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CHECKED_IN', 'NO_SHOW', 'FORFEIT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('ONLINE', 'CASH', 'CARD', 'TRANSFER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "RegistrationSource" AS ENUM ('WEB', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
  CREATE TYPE "EventGender" AS ENUM ('MIXED', 'M', 'F');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role" USING ("role"::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'USER';

ALTER TABLE "Tournament"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Tournament"
  ALTER COLUMN "status" TYPE "TournamentStatus" USING ("status"::"TournamentStatus"),
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

ALTER TABLE "TournamentEvent"
  ALTER COLUMN "gender" DROP DEFAULT,
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "TournamentEvent"
  ALTER COLUMN "gender" TYPE "EventGender" USING ("gender"::"EventGender"),
  ALTER COLUMN "gender" SET DEFAULT 'MIXED',
  ALTER COLUMN "status" TYPE "TournamentEventStatus" USING ("status"::"TournamentEventStatus"),
  ALTER COLUMN "status" SET DEFAULT 'OPEN';

ALTER TABLE "TournamentRegistration"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "source" DROP DEFAULT;

ALTER TABLE "TournamentRegistration"
  ALTER COLUMN "status" TYPE "RegistrationStatus" USING ("status"::"RegistrationStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING',
  ALTER COLUMN "source" TYPE "RegistrationSource" USING ("source"::"RegistrationSource"),
  ALTER COLUMN "source" SET DEFAULT 'WEB';

ALTER TABLE "TournamentRegistrationEvent"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "TournamentRegistrationEvent"
  ALTER COLUMN "status" TYPE "RegistrationEventStatus" USING ("status"::"RegistrationEventStatus"),
  ALTER COLUMN "status" SET DEFAULT 'REGISTERED';

ALTER TABLE "TournamentPayment"
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "TournamentPayment"
  ALTER COLUMN "method" TYPE "PaymentMethod" USING ("method"::"PaymentMethod"),
  ALTER COLUMN "status" TYPE "PaymentStatus" USING ("status"::"PaymentStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'isActive'
  ) THEN
    ALTER TABLE "User" DROP COLUMN "isActive";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "HorairesCache" (
  "id" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HorairesCache_pkey" PRIMARY KEY ("id")
);
