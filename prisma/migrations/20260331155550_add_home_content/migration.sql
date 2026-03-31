-- CreateTable
CREATE TABLE "HomeContent" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroSubtitle" TEXT NOT NULL,
    "heroCtaLabel" TEXT NOT NULL,
    "heroCtaHref" TEXT NOT NULL,
    "heroImageUrl" TEXT NOT NULL,
    "welcomeTitle" TEXT NOT NULL,
    "welcomeText1" TEXT NOT NULL,
    "welcomeText2" TEXT NOT NULL,
    "highlight1Title" TEXT NOT NULL,
    "highlight1Text" TEXT NOT NULL,
    "highlight2Title" TEXT NOT NULL,
    "highlight2Text" TEXT NOT NULL,
    "highlight3Title" TEXT NOT NULL,
    "highlight3Text" TEXT NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaButtonLabel" TEXT NOT NULL,
    "ctaButtonHref" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id")
);
