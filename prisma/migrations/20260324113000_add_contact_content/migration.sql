-- CreateTable
CREATE TABLE "ContactContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "responseDelay" TEXT NOT NULL,
    "addressName" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "ctaPrimaryLabel" TEXT NOT NULL,
    "ctaPrimaryHref" TEXT NOT NULL,
    "ctaSecondaryLabel" TEXT NOT NULL,
    "ctaSecondaryHref" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactContent_pkey" PRIMARY KEY ("id")
);
