import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Search,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Reveal from "@/components/Reveal";
import { HeroBanner } from "@/components/public/hero-banner";
import { SectionEyebrow } from "@/components/public/marketing";
import { Button } from "@/components/ui/button";
import {
  normalizeHomeContent,
  resolveEventImageUrl,
} from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { ACTIVE_TOURNAMENT_STATUSES } from "@/lib/tournament-status";

export const metadata: Metadata = {
  title: "CCTT | Club de tennis de table à Châlons-en-Champagne",
  description:
    "Le CCTT accueille joueurs débutants et confirmés. Retrouvez les horaires, les tarifs, le tournoi et les informations utiles du club à Châlons-en-Champagne.",
  openGraph: {
    title: "CCTT | Club de tennis de table",
    description:
      "Découvrez le CCTT : horaires, tarifs, tournoi et vie du club à Châlons-en-Champagne.",
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
    title: "CCTT | Club de tennis de table",
    description:
      "Horaires, tarifs, tournoi et vie du club de tennis de table à Châlons-en-Champagne.",
    images: ["/logo.jpg"],
  },
};

function formatDateRange(startDate?: Date | null, endDate?: Date | null) {
  if (!startDate || !endDate) {
    return "Dates à confirmer";
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
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
      where: { status: { in: ACTIVE_TOURNAMENT_STATUSES } },
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
  const tournamentVenue = tournament?.venue ?? "Châlons-en-Champagne";
  const tournamentEventsCount = tournament?.events.length ?? 0;

  const intentionCards = [
    {
      title: "Je veux découvrir le club",
      description:
        "Comprendre l'esprit du CCTT, le niveau d'accueil et la vie du club avant de vous engager.",
      href: "/club",
      label: "Découvrir le club",
      Icon: Search,
      tone: "border-border/60 bg-card/70",
      hoverTone: "hover:border-[#2F6BFF] hover:shadow-[#2F6BFF]/15",
      iconTone: "text-[#2F6BFF]",
      ctaTone: "text-[#2F6BFF]",
      ctaHoverTone: "group-hover:bg-[#2F6BFF]/5 group-hover:text-[#2F6BFF]",
      arrowTone: "text-[#2F6BFF]/75 group-hover:text-[#2F6BFF]",
    },
    {
      title: "Je veux voir les horaires",
      description:
        "Trouver rapidement le bon créneau selon le profil : jeunes, loisir, entraînement soutenu ou jeu libre.",
      href: "/club/horaires",
      label: "Voir les horaires",
      Icon: Clock3,
      tone: "border-border/60 bg-card/70",
      hoverTone: "hover:border-[#00D9FF] hover:shadow-[#00D9FF]/15",
      iconTone: "text-[#00D9FF]",
      ctaTone: "text-[#00B8D9]",
      ctaHoverTone: "group-hover:bg-[#00D9FF]/6 group-hover:text-[#00B8D9]",
      arrowTone: "text-[#00B8D9]/75 group-hover:text-[#00B8D9]",
    },
    {
      title: "Je veux m'inscrire au tournoi",
      description:
        "Retrouver les dates, les tableaux et l'accès direct à l'inscription si elle est ouverte.",
      href: registrationStatus.canRegister
        ? "/tournoi/inscription"
        : "/tournoi",
      label: registrationStatus.canRegister
        ? "S'inscrire au tournoi"
        : "Voir le tournoi",
      Icon: Trophy,
      tone: "border-border/60 bg-card/70",
      hoverTone: "hover:border-[#FF7A00] hover:shadow-[#FF7A00]/15",
      iconTone: "text-[#FF7A00]",
      ctaTone: "text-[#FF7A00]",
      ctaHoverTone: "group-hover:bg-[#FF7A00]/6 group-hover:text-[#FF7A00]",
      arrowTone: "text-[#FF7A00]/75 group-hover:text-[#FF7A00]",
    },
    {
      title: "Je veux contacter le club",
      description:
        "Poser une question, demander un essai, vérifier un tarif ou être orienté vers le bon interlocuteur.",
      href: "/club/contact",
      label: "Contacter le club",
      Icon: Mail,
      tone: "border-border/60 bg-card/70",
      hoverTone: "hover:border-[#FF2E88] hover:shadow-[#FF2E88]/15",
      iconTone: "text-[#FF2E88]",
      ctaTone: "text-[#FF2E88]",
      ctaHoverTone: "group-hover:bg-[#FF2E88]/6 group-hover:text-[#FF2E88]",
      arrowTone: "text-[#FF2E88]/75 group-hover:text-[#FF2E88]",
    },
  ];

  const clubPillars = [
    {
      label: "Accueil",
      value: "Un cadre clair pour débuter, reprendre ou faire essayer le club.",
    },
    {
      label: "Progression",
      value: "Des séances adaptées aux jeunes, au loisir et aux joueurs plus engagés.",
    },
    {
      label: "Saison",
      value: "Une vie de club régulière, renforcée par un tournoi bien installé.",
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

  const primaryHeroAction = {
    href: "/club/horaires",
    label: "Voir les horaires",
  };
  const secondaryHeroAction = registrationStatus.canRegister
    ? {
        href: "/tournoi/inscription",
        label: "S'inscrire au tournoi",
      }
    : {
        href: "/club/contact",
        label: "Contacter le club",
      };

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 sm:px-6 sm:py-10">
        <Reveal>
          <section className="relative overflow-hidden rounded-[2rem] border border-border/45 bg-background px-5 py-6 md:px-6 md:py-7 lg:px-7 lg:py-8">
            <div className="relative space-y-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <SectionEyebrow>
                    Le club de tennis de table à Châlons-en-Champagne
                  </SectionEyebrow>
                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                      {content.heroTitle}
                    </h1>
                    <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {content.heroSubtitle}
                    </p>
                  </div>
                </div>

                <div
                  className="inline-flex w-full flex-col gap-1 rounded-lg border border-border bg-background/70 p-1 shadow-sm sm:w-fit sm:flex-row"
                  role="group"
                  aria-label="Actions principales"
                >
                  <Button
                    asChild
                    size="lg"
                    className="h-11 rounded-md bg-[#00B8D9] px-6 text-white shadow-none transition hover:bg-[#009FBC]"
                  >
                    <Link href={primaryHeroAction.href}>
                      {primaryHeroAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className={`h-11 rounded-md px-6 shadow-none transition ${
                      registrationStatus.canRegister
                        ? "border-[#FF7A00]/45 bg-[#FF7A00]/8 text-[#FF7A00] hover:border-[#FF7A00] hover:bg-[#FF7A00]/14 hover:text-[#FF7A00]"
                        : "border-[#FF2E88]/45 bg-[#FF2E88]/8 text-[#FF2E88] hover:border-[#FF2E88] hover:bg-[#FF2E88]/14 hover:text-[#FF2E88]"
                    }`}
                  >
                    <Link href={secondaryHeroAction.href}>
                      {secondaryHeroAction.label}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

              </div>

              <HeroBanner imageUrl={content.heroImageUrl} />

            </div>
          </section>
        </Reveal>

        <section className="space-y-5">
          <Reveal>
            <div className="space-y-2">
              <SectionEyebrow tone="neutral">
                Choisir votre point d&apos;entrée
              </SectionEyebrow>
              <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                Commencez selon votre besoin
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Vous n&apos;avez pas besoin de tout parcourir. Choisissez ce que vous
                cherchez, et nous vous guidons directement vers la bonne page.
              </p>
            </div>
          </Reveal>

          <div className="grid items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {intentionCards.map((item, index) => {
              const Icon = item.Icon;

              return (
                <Reveal key={item.title} className="h-full" delay={index * 90}>
                  <Link
                    href={item.href}
                    className={`group flex h-full min-h-[236px] flex-col overflow-hidden rounded-[1.65rem] border shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.tone} ${item.hoverTone}`}
                  >
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full bg-background/80 p-2 ${item.iconTone}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <p className="mt-5 text-xl font-semibold tracking-[-0.025em] text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div
                      className={`mt-auto flex items-center justify-between gap-3 border-t border-border/50 bg-background/35 px-5 py-3 text-sm font-medium transition-colors ${item.ctaTone} ${item.ctaHoverTone}`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${item.arrowTone}`}
                      />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <SectionEyebrow tone="neutral">Le club</SectionEyebrow>
                <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                  Un club à comprendre vite, avant d&apos;aller plus loin
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Le CCTT réunit accueil, progression et compétition dans un cadre
                lisible pour les nouveaux venus comme pour les joueurs réguliers.
              </p>
            </div>
          </Reveal>

          <div>
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

                  <Button asChild variant="outline" className="rounded-md">
                    <Link href="/club">Découvrir le club</Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {content.eventEnabled ? (
          <section className="space-y-5">
            <Reveal>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <SectionEyebrow>Tournoi national</SectionEyebrow>
                  <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-foreground sm:text-4xl">
                    Je veux suivre ou rejoindre le tournoi
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Dates, lieu, statut des inscriptions et accès direct aux pages
                  utiles sont regroupés ici sans détour.
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
                      L&apos;objectif est simple : voir tout de suite si l&apos;inscription
                      est ouverte, combien de tableaux sont proposés et où aller
                      ensuite.
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button asChild size="lg" className="rounded-md px-6">
                        <Link href={registrationStatus.canRegister ? "/tournoi/inscription" : "/tournoi"}>
                          {registrationStatus.canRegister
                            ? "S'inscrire au tournoi"
                            : "Voir le tournoi"}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-md px-6"
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
          <section className="rounded-[1.9rem] border border-border/45 bg-card/60 p-6 text-foreground md:p-8 lg:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <SectionEyebrow tone="neutral">
                  Premier contact
                </SectionEyebrow>
                <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                  {content.ctaTitle}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {content.ctaText}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Essai, information pratique, question sur les tarifs ou sur le
                  tournoi : on vous oriente ensuite vers la bonne suite.
                </p>
              </div>

              <div className="flex flex-col items-start gap-4 lg:max-w-sm lg:items-end lg:text-right">
                <Button
                  asChild
                  size="lg"
                  className="rounded-md bg-[#FF2E88] px-6 text-white hover:bg-[#E12678]"
                >
                  <Link href="/club/contact">
                    Contacter le club
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Si vous ne savez pas encore quelle page visiter, commencez ici
                  et nous vous orienterons.
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
