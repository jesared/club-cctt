import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import { HeroBanner } from "@/components/public/hero-banner";
import { SectionEyebrow } from "@/components/public/marketing";
import { Button } from "@/components/ui/button";
import { normalizeHomeContent, resolveEventImageUrl } from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";

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

function formatDateRange(startDate?: Date | null, endDate?: Date | null) {
  if (!startDate || !endDate) {
    return "Dates a confirmer";
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
  });
  const startLabel = formatter.format(startDate);
  const endLabel = formatter.format(endDate);

  if (startDate.toDateString() === endDate.toDateString()) {
    return startLabel;
  }

  return `${startLabel} au ${endLabel}`;
}

export default async function Home() {
  const [homeContentRaw, tournament] = await Promise.all([
    prisma.homeContent.findUnique({
      where: { id: "default" },
    }),
    prisma.tournament.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ startDate: "desc" }],
      select: {
        name: true,
        venue: true,
        startDate: true,
        endDate: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
        status: true,
        events: {
          where: { status: "OPEN" },
          select: { id: true },
        },
      },
    }),
  ]);

  const content = normalizeHomeContent(homeContentRaw ?? undefined);
  const eventImageUrl = resolveEventImageUrl(content.eventImageUrl);
  const registrationStatus = getTournamentRegistrationStatus(tournament);
  const tournamentDateLabel =
    formatDateRange(tournament?.startDate, tournament?.endDate) ||
    content.eventDateLabel;
  const tournamentName = tournament?.name ?? content.eventTitle;
  const tournamentVenue = tournament?.venue ?? "Chalons-en-Champagne";
  const tournamentEventsCount = tournament?.events.length ?? 0;
  const heroHighlights = [
    "Accueil simple pour debuter ou reprendre",
    "Jeunes et adultes, loisir et competition",
    "Une saison animee par le club et le tournoi",
  ];
  const clubPillars = [
    {
      label: "Encadrement",
      value: "Une structure serieuse pour progresser a chaque niveau.",
    },
    {
      label: "Public",
      value: "Jeunes et adultes accueillis dans le meme esprit d'exigence.",
    },
    {
      label: "Rythme",
      value: "Vie de club active et tournoi installe dans la saison.",
    },
  ];
  const clubLinks = [
    {
      title: content.highlight1Title,
      description: content.highlight1Text,
      href: "/club/horaires",
      label: "Voir les creneaux",
    },
    {
      title: content.highlight2Title,
      description: content.highlight2Text,
      href: "/club/tarifs",
      label: "Consulter les tarifs",
    },
    {
      title: content.highlight3Title,
      description: content.highlight3Text,
      href: "/club/contact",
      label: "Nous contacter",
    },
  ];
  const tournamentFacts = [
    {
      icon: CalendarDays,
      label: "Dates",
      value: tournamentDateLabel,
    },
    {
      icon: MapPin,
      label: "Lieu",
      value: tournamentVenue,
    },
    {
      icon: Trophy,
      label: "Tableaux ouverts",
      value: String(tournamentEventsCount),
    },
  ];

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 sm:py-10">
        <Reveal>
          <section className="relative overflow-hidden rounded-[2rem] border border-border/45 bg-background px-5 py-6 md:px-6 md:py-7 lg:px-7 lg:py-8">
            <div className="relative space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <SectionEyebrow>
                    L&apos;exigence du tennis de table
                  </SectionEyebrow>
                  <div className="space-y-4">
                    <h1 className="max-w-3xl  text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                      {content.heroTitle}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {content.heroSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-full px-6 shadow-lg shadow-primary/20"
                  >
                    <Link href={content.heroCtaHref}>
                      {content.heroCtaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-11 rounded-full px-6"
                  >
                    <Link href="/tournoi">Decouvrir le tournoi</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {heroHighlights.map((item, index) => (
                    <Reveal key={item} delay={index * 70}>
                      <span className="inline-flex items-center text-sm leading-relaxed text-muted-foreground">
                        {item}
                      </span>
                    </Reveal>
                  ))}
                </div>
              </div>

              <HeroBanner
                imageUrl={content.heroImageUrl}
                registrationLabel={registrationStatus.label}
                tournamentName={tournamentName}
                tournamentDateLabel={tournamentDateLabel}
                tournamentVenue={tournamentVenue}
              />

              <div className="grid gap-4 border-t border-border/45 pt-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Ambiance
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Conviviale et ambitieuse
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Un cadre accueillant, avec de vrais reperes pour entrer dans
                    le club.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Pratique
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Jeunes, adultes, loisir, competition
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Une proposition lisible pour progresser sans perdre
                    l&apos;esprit du club.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Saison
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    Club actif et tournoi installe
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Le rythme de l&apos;annee reste clair, sans multiplier les
                    points d&apos;entree.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="space-y-5">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <SectionEyebrow tone="neutral">Le club</SectionEyebrow>
                <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                  Un club ambitieux, un tournoi de reference
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Le CCTT reunit pratique en club, progression des joueurs et
                organisation d&apos;un tournoi national dans un cadre exigeant,
                accueillant et structure.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <Reveal>
              <div className="rounded-[1.75rem] border border-border/45 bg-card/50 p-6 md:p-8">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                      {content.welcomeTitle}
                    </h3>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {content.welcomeText1}
                    </p>
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {content.welcomeText2}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Club formateur", "Competition", "Tournoi national"].map(
                      (badge) => (
                        <span
                          key={badge}
                          className="inline-flex rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/80"
                        >
                          {badge}
                        </span>
                      ),
                    )}
                  </div>

                  <div className="grid gap-5 border-t border-border/45 pt-5 sm:grid-cols-3">
                    {clubPillars.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/club">Decouvrir le club</Link>
                  </Button>
                </div>
              </div>
            </Reveal>

            <div className="overflow-hidden rounded-[1.6rem] border border-border/45 bg-background">
              {clubLinks.map((item, index) => (
                <Reveal key={item.title} delay={index * 100}>
                  <Link
                    href={item.href}
                    className={`group flex h-full items-start justify-between gap-4 p-5 transition-colors hover:bg-muted/20 ${
                      index < clubLinks.length - 1
                        ? "border-b border-border/45"
                        : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                        {item.title}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {item.label}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {content.eventEnabled ? (
          <section className="space-y-5">
            <Reveal>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <SectionEyebrow>Tournoi national</SectionEyebrow>
                  <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                    Un tournoi national au coeur de la saison
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Retrouvez en un seul endroit les dates, le lieu, les
                  inscriptions et les tableaux ouverts du tournoi.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <section className="relative overflow-hidden rounded-[2rem] border border-border/45 bg-card/55 p-6 md:p-8">
                <div className="relative grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <SectionEyebrow tone="neutral">
                        <Trophy className="mr-2 h-3.5 w-3.5" />
                        {tournamentName}
                      </SectionEyebrow>
                      <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {registrationStatus.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground">
                        {content.eventTitle}
                      </h3>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {registrationStatus.message}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {tournamentFacts.map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="inline-flex items-center gap-3 rounded-full border border-border/45 bg-background/60 px-4 py-2 text-sm text-foreground"
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium text-muted-foreground">
                              {item.label}
                            </span>
                            <span className="font-semibold">{item.value}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="max-w-2xl border-l border-primary/25 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      Toutes les informations essentielles restent visibles en
                      un regard: dates, lieu, statut des inscriptions et acces
                      direct aux pages utiles.
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button asChild size="lg" className="rounded-full px-6">
                        <Link href="/tournoi/inscription">
                          S&apos;inscrire au tournoi
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-full px-6"
                      >
                        <Link href="/tournoi/liste-inscrits">
                          Voir les inscrits
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.6rem] bg-muted/20">
                    <Image
                      src={eventImageUrl}
                      alt="Visuel du tournoi CCTT"
                      width={900}
                      height={630}
                      className="h-full min-h-[320px] w-full object-contain object-center"
                    />
                  </div>
                </div>
              </section>
            </Reveal>
          </section>
        ) : null}

        <Reveal>
          <section className="rounded-[1.9rem] border border-white/10 bg-foreground p-6 text-background md:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <SectionEyebrow className="border-white/15">
                  L&apos;esprit du club
                </SectionEyebrow>
                <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {content.ctaTitle}
                </h2>
                <p className="text-sm leading-relaxed text-background/78 sm:text-base">
                  {content.ctaText}
                </p>
                <p className="text-sm leading-relaxed text-background/60 sm:text-base">
                  Club formateur, dynamique et tourne vers la competition, le
                  CCTT associe qualite d&apos;accueil, progression des joueurs
                  et tournoi reconnu.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:max-w-sm lg:items-end lg:text-right">
                <Button asChild size="lg" className="rounded-full px-6  ">
                  <Link href={content.ctaButtonHref}>
                    {content.ctaButtonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm leading-relaxed text-background/60">
                  Premier contact, demande d&apos;information ou inscription: on
                  vous oriente ensuite vers la bonne suite.
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
