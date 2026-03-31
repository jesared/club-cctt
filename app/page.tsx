import type { Metadata } from "next";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import TournoiHeroLazy from "@/components/TournoiHeroLazy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeHomeContent } from "@/lib/home-content";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "CCTT – Club de tennis de table à Châlons-en-Champagne",
  description:
    "Le CCTT accueille joueurs débutants comme confirmés. Horaires, tarifs, contact et actualités du club de tennis de table à Châlons-en-Champagne.",
  openGraph: {
    title: "CCTT – Club de tennis de table",
    description:
      "Découvrez le CCTT : horaires, tarifs et vie du club à Châlons-en-Champagne.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 512,
        height: 512,
        alt: "Logo CCTT",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "CCTT – Club de tennis de table",
    description:
      "Horaires, tarifs et vie du club de tennis de table à Châlons-en-Champagne.",
    images: ["/logo.jpg"],
  },
};

export default async function Home() {
  const homeContentRaw = await prisma.homeContent.findUnique({
    where: { id: "default" },
  });
  const content = normalizeHomeContent(homeContentRaw ?? undefined);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 animate-fade-soft">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-3xl font-bold animate-fade-up-1">
            {content.heroTitle}
          </h1>
          <p className="text-sm text-muted-foreground animate-fade-up-2">
            {content.heroSubtitle}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap animate-fade-up-2">
            <Button
              asChild
              className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
            >
              <Link href={content.heroCtaHref}>{content.heroCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="py-4">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-0 bg-primary/5 card-hover">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {content.welcomeTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {content.welcomeText1}
                </p>
                <p className="text-sm text-muted-foreground">
                  {content.welcomeText2}
                </p>
              </CardContent>
            </Card>
            <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div
                className="h-full min-h-[220px] bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                style={{
                  backgroundImage: `url(${content.heroImageUrl})`,
                }}
                aria-hidden="true"
              />
            </div>
          </div>
        </section>
      </Reveal>

      <section className="py-4">
        <Reveal>
          <h2 className="text-3xl font-bold">Le club en quelques mots</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            [content.highlight1Title, content.highlight1Text],
            [content.highlight2Title, content.highlight2Text],
            [content.highlight3Title, content.highlight3Text],
          ].map(([title, description], index) => (
            <Reveal key={title} delay={index * 120}>
              <Card className="p-6 card-hover">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal>
        <section className="py-8">
            <Card className="border-primary/30 bg-primary/5 card-hover">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {content.ctaTitle}
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">{content.ctaText}</p>
                <Button asChild>
                  <Link href={content.ctaButtonHref}>
                    {content.ctaButtonLabel}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
      </Reveal>

      {content.eventEnabled ? (
        <section>
          <Reveal>
            <h2 className="text-3xl font-bold">{content.eventTitle}</h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6">
              <TournoiHeroLazy />
            </div>
          </Reveal>
        </section>
      ) : null}
    </main>
  );
}
