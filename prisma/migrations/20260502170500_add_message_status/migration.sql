-- Reconcile databases that were created before Message.status existed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'MessageStatus'
  ) THEN
    CREATE TYPE "MessageStatus" AS ENUM ('DRAFT', 'PUBLISHED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Message'
      AND column_name = 'status'
  ) THEN
    ALTER TABLE "Message"
    ADD COLUMN "status" "MessageStatus" NOT NULL DEFAULT 'DRAFT';
  END IF;
END $$;
