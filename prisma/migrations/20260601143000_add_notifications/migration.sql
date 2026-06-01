-- Create enums for the dedicated notifications system
CREATE TYPE "NotificationType" AS ENUM (
  'ANNOUNCEMENT',
  'DOCUMENT',
  'SCHEDULE',
  'TOURNAMENT',
  'SYSTEM'
);

CREATE TYPE "NotificationPriority" AS ENUM (
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT'
);

CREATE TYPE "NotificationSourceKind" AS ENUM (
  'MESSAGE',
  'DOCUMENT',
  'HORAIRES',
  'TOURNAMENT',
  'MANUAL'
);

CREATE TYPE "NotificationAudience" AS ENUM (
  'ALL_MEMBERS',
  'CLUB_SPACE',
  'BUREAU_SPACE',
  'ENTRAINEUR_SPACE',
  'ADMIN_ONLY',
  'ROLE'
);

-- Create notifications table
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "href" TEXT,
  "sourceId" TEXT,
  "sourceKind" "NotificationSourceKind" NOT NULL DEFAULT 'MANUAL',
  "audience" "NotificationAudience" NOT NULL DEFAULT 'ALL_MEMBERS',
  "roleScope" "Role",
  "createdByUserId" TEXT,
  "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Create notification reads table
CREATE TABLE "NotificationRead" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationRead_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "Notification_publishedAt_idx" ON "Notification"("publishedAt");
CREATE INDEX "Notification_type_publishedAt_idx" ON "Notification"("type", "publishedAt");
CREATE INDEX "Notification_audience_publishedAt_idx" ON "Notification"("audience", "publishedAt");
CREATE INDEX "Notification_roleScope_publishedAt_idx" ON "Notification"("roleScope", "publishedAt");
CREATE INDEX "Notification_sourceKind_sourceId_idx" ON "Notification"("sourceKind", "sourceId");
CREATE UNIQUE INDEX "NotificationRead_notificationId_userId_key" ON "NotificationRead"("notificationId", "userId");
CREATE INDEX "NotificationRead_userId_readAt_idx" ON "NotificationRead"("userId", "readAt");

-- Foreign keys
ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "NotificationRead"
ADD CONSTRAINT "NotificationRead_notificationId_fkey"
FOREIGN KEY ("notificationId") REFERENCES "Notification"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationRead"
ADD CONSTRAINT "NotificationRead_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
