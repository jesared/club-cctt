import {
  CalendarClock,
  ClipboardCheck,
  MapPin,
  TimerReset,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";

import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import { MetricTile, SectionEyebrow } from "@/components/public/marketing";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePopup } from "@/components/ui/image-popup";
import { authOptions } from "@/lib/auth";
import { normalizeContactContent } from "@/lib/contact-content";
import {
  DEFAULT_EVENT_IMAGE_URL,
  normalizeHomeContent,
  resolveEventImageUrl,
} from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";

export const metadata: Metadata = {
  title: "Tournoi national de Pâques – CCTT",
  description:
    "Toutes les infos du tournoi : dates, tableaux, inscriptions, résultats et contact organisation.",
  openGraph: {
    title: "Tournoi national de Pâques – CCTT",
    description:
      "Infos tournoi CCTT : dates, tableaux, inscriptions et résultats.",
    url: "/tournoi",
    type: "website",
    images: [
      {
        url: DEFAULT_EVENT_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Visuel du tournoi CCTT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tournoi national de Pâques – CCTT",
    description: "Dates, tableaux et inscriptions au tournoi CCTT.",
    images: [DEFAULT_EVENT_IMAGE_URL],
  },
};

function formatCategory(
  minPoints: number | null,
  maxPoints: number | null,
  label: string,
) {
  if (label.trim().length > 0) {
    return label;
  }

  if (minPoints === null && maxPoints === null) {
    return "Toutes categories";
  }

  if (minPoints === null) {
    return `Jusqu'a ${maxPoints} pts`;
  }

  if (maxPoints === null) {
    return `${minPoints}+ pts`;
  }

  return `${minPoints} a ${maxPoints} pts`;
}

function formatDateLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(startAt);
}

function formatTimeLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(startAt);
}

function formatDateRange(startDate?: Date | null, endDate?: Date | null) {
  if (!startDate || !endDate) {
    return "Dates a confirmer";
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(startDate);

  if (sameDay) {
    return startLabel;
  }

  const endLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(endDate);

  return `${startLabel} au ${endLabel}`;
}

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "A confirmer";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export default async function TournoiHomePage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.trim().toLowerCase();
  const [tournament, contactContentRaw, homeContentRaw] = await Promise.all([
    prisma.tournament.findFirst({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [{ startDate: "desc" }],
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        venue: true,
        registrationOpenAt: true,
        registrationCloseAt: true,
        startDate: true,
        endDate: true,
        status: true,
        events: {
          where: { status: "OPEN" },
          orderBy: [{ startAt: "asc" }, { code: "asc" }],
          select: {
            id: true,
            code: true,
            label: true,
            startAt: true,
            minPoints: true,
            maxPoints: true,
            feeOnlineCents: true,
            feeOnsiteCents: true,
          },
        },
      },
    }),
    prisma.contactContent.findUnique({ where: { id: "default" } }),
    prisma.homeContent.findUnique({ where: { id: "default" } }),
  ]);

  const tournamentEvents = tournament?.events ?? [];
  const contactContent = normalizeContactContent(
    contactContentRaw ?? undefined,
  );
  const homeContent = normalizeHomeContent(homeContentRaw ?? undefined);
  const eventImageUrl = resolveEventImageUrl(homeContent.eventImageUrl);
  const registrationStatus = getTournamentRegistrationStatus(tournament);
  const isTournamentFinished = tournament?.endDate
    ? new Date() > tournament.endDate
    : false;

  const hasUserRegistration =
    tournament && session?.user?.id
      ? (await prisma.tournamentRegistration.count({
          where: {
            tournamentId: tournament.id,
            OR: [
              { userId: session.user.id },
              ...(userEmail
                ? [
                    {
                      contactEmail: {
                        equals: userEmail,
                        mode: "insensitive" as const,
                      },
                    },
                  ]
                : []),
            ],
          },
        })) > 0
      : false;

  const tableaux = tournamentEvents.map((event) => ({
    id: event.id,
    code: event.code,
    date: formatDateLabel(event.startAt),
    heure: formatTimeLabel(event.startAt),
    categorie: formatCategory(event.minPoints, event.maxPoints, event.label),
    online: `${(event.feeOnlineCents / 100).toFixed(0)} EUR`,
    surPlace: `${(event.feeOnsiteCents / 100).toFixed(0)} EUR`,
  }));

  const timelineSteps = [
    {
      title: "Je choisis mes tableaux",
      detail:
        tableaux.length > 0
          ? `${tableaux.length} tableaux sont actuellement ouverts a l'inscription.`
          : "Le programme complet sera ajoute ici des qu'il sera disponible.",
      icon: Trophy,
    },
    {
      title: "Je valide mon inscription",
      detail: registrationStatus.message,
      icon: ClipboardCheck,
    },
    {
      title: "Je prepare ma venue",
      detail: `${contactContent.addressName}, ${contactContent.addressCity}.`,
      icon: MapPin,
    },
  ];

  return (
    <main className="relative overflow-hidden">
      <KpiPageViewTracker page="tournoi" label="tournoi-page" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <Reveal>
          <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/92 p-6 shadow-xl shadow-black/5 backdrop-blur-sm md:p-8 lg:p-10">
            <div className="relative space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <SectionEyebrow>
                    <Trophy className="mr-2 h-3.5 w-3.5" />
                    Tournoi en ligne
                  </SectionEyebrow>
                  <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {registrationStatus.label}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="font-serif text-4xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
                    {tournament?.name ?? "Tournoi CCTT"}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground sm:text-base">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      {formatDateRange(
                        tournament?.startDate,
                        tournament?.endDate,
                      )}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {tournament?.venue ?? "Lieu a confirmer"}
                    </span>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {tournament?.description ??
                      tournamentRegistrationContent.message}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {registrationStatus.canRegister ? (
                    <TrackedLink
                      kpiPage="tournoi"
                      kpiLabel="cta-inscription"
                      href={tournamentRegistrationContent.cta.href}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 focus-ring"
                    >
                      {tournamentRegistrationContent.cta.label}
                    </TrackedLink>
                  ) : (
                    <span className="inline-flex h-11 items-center justify-center rounded-full bg-muted px-5 text-sm font-semibold text-muted-foreground">
                      {registrationStatus.label}
                    </span>
                  )}
                  <Link
                    href="/tournoi/reglement"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-primary px-6 text-sm font-medium text-primary transition hover:bg-primary/10 focus-ring"
                  >
                    Consulter le reglement
                  </Link>
                  {hasUserRegistration ? (
                    <Link
                      href="/user/inscriptions"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition hover:bg-accent/40 focus-ring"
                    >
                      Voir mes inscriptions
                    </Link>
                  ) : null}
                </div>

                {!registrationStatus.canRegister && isTournamentFinished ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/tournoi/resultats"
                      className="inline-flex items-center justify-center rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 focus-ring"
                    >
                      Voir les resultats
                    </Link>
                    <Link
                      href="/tournoi/palmares"
                      className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent/40 focus-ring"
                    >
                      Voir le palmares
                    </Link>
                    <Link
                      href="/tournoi/affiches"
                      className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-accent/40 focus-ring"
                    >
                      Voir les affiches
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Affiche officielle
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Le visuel complet du tournoi, sans recadrage.
                    </p>
                  </div>
                  <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                    Cliquer pour agrandir
                  </span>
                </div>
                <div className="rounded-[1.8rem] border border-border/70 bg-gradient-to-br from-primary/5 via-background to-background p-3 shadow-lg shadow-black/5 sm:p-4">
                  <ImagePopup
                    src={eventImageUrl}
                    alt="Affiche officielle du tournoi CCTT"
                    title={tournament?.name ?? "Tournoi CCTT"}
                    width={1200}
                    height={630}
                    shareLabel="Affiche officielle du tournoi CCTT"
                    previewClassName="h-auto w-full rounded-[1.35rem] border border-border/60 bg-card object-contain shadow-md shadow-black/10"
                    popupImageClassName="max-h-[90vh] w-auto rounded-xl object-contain"
                  />
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal>
            <MetricTile
              label="Statut"
              value={registrationStatus.label}
              detail={registrationStatus.message}
            />
          </Reveal>
          <Reveal delay={100}>
            <MetricTile
              label="Tableaux ouverts"
              value={String(tableaux.length)}
              detail="Programme actuellement disponible a l'inscription."
            />
          </Reveal>
          <Reveal delay={200}>
            <MetricTile
              label="Contact"
              value={contactContent.email}
              detail={contactContent.responseDelay}
            />
          </Reveal>
          <Reveal delay={300}>
            <MetricTile
              label="Date limite"
              value={formatDateTime(tournament?.registrationCloseAt)}
              detail="Date limite pour s'inscrire en ligne."
            />
          </Reveal>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <Card className="rounded-[1.7rem] border-border/70 bg-card/94 shadow-sm shadow-black/5">
              <CardHeader className="space-y-3">
                <SectionEyebrow tone="neutral">Infos pratiques</SectionEyebrow>
                <CardTitle className="font-serif text-3xl font-bold tracking-[-0.03em]">
                  Toutes les infos pratiques du tournoi
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Lieu
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {tournament?.venue ?? "A confirmer"}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {contactContent.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Adresse
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {contactContent.addressName}
                  </p>
                  <p>{contactContent.addressLine}</p>
                  <p>{contactContent.addressCity}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Delai
                  </p>
                  <p className="mt-2 font-medium text-foreground">
                    {contactContent.responseDelay}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={120}>
            <Card className="rounded-[1.7rem] border-border/70 bg-card/94 shadow-sm shadow-black/5">
              <CardHeader className="space-y-3">
                <SectionEyebrow tone="neutral">Parcours joueur</SectionEyebrow>
                <CardTitle className="font-serif text-3xl font-bold tracking-[-0.03em]">
                  De l&apos;inscription a la salle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {timelineSteps.map((step) => (
                  <div
                    key={step.title}
                    className="flex gap-4 rounded-2xl border border-border/70 bg-background/80 p-4"
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Reveal>
        </section>

        <Reveal>
          <section>
            <Card className="rounded-[1.8rem] border-border/70 bg-card/94 shadow-sm shadow-black/5">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-3">
                    <SectionEyebrow tone="neutral">
                      Tableaux ouverts
                    </SectionEyebrow>
                    <CardTitle className="font-serif text-3xl font-bold tracking-[-0.03em]">
                      Tous les tableaux, horaires et tarifs
                    </CardTitle>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
                    <TimerReset className="h-4 w-4" />
                    Informations a jour
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tableaux.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun tableau ouvert n&apos;est disponible pour le moment.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border/70">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr className="text-left text-muted-foreground">
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Heure</th>
                          <th className="px-4 py-3">Categorie</th>
                          <th className="px-4 py-3">En ligne</th>
                          <th className="px-4 py-3">Sur place</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableaux.map((tableau) => (
                          <tr
                            key={tableau.id}
                            className="border-t border-border/70"
                          >
                            <td className="px-4 py-3 font-semibold text-foreground">
                              {tableau.code}
                            </td>
                            <td className="px-4 py-3">{tableau.date}</td>
                            <td className="px-4 py-3">{tableau.heure}</td>
                            <td className="px-4 py-3">{tableau.categorie}</td>
                            <td className="px-4 py-3">{tableau.online}</td>
                            <td className="px-4 py-3">{tableau.surPlace}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Les tarifs en ligne et sur place s&apos;appliquent par
                  tableau. En cas de forfait medical, le remboursement suit les
                  conditions FFTT.
                </p>
              </CardContent>
            </Card>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
