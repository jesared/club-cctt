-- CreateEnum
CREATE TYPE "KpiEventType" AS ENUM ('VIEW', 'CLICK', 'START', 'SUBMIT');

-- CreateTable
CREATE TABLE "KpiEvent" (
    "id" TEXT NOT NULL,
    "eventType" "KpiEventType" NOT NULL,
    "page" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KpiEvent_createdAt_idx" ON "KpiEvent"("createdAt");

-- CreateIndex
CREATE INDEX "KpiEvent_eventType_page_idx" ON "KpiEvent"("eventType", "page");
