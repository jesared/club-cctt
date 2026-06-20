import {
  CalendarClock,
  ClipboardCheck,
  Mail,
  MapPin,
  TimerReset,
  Trophy,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import AdminTournamentVisibilityControls from "@/components/admin-tournament-visibility-controls";
import { ExternalMapLink } from "@/components/external-map-link";
import { MetricTile, SectionEyebrow } from "@/components/public/marketing";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePopup } from "@/components/ui/image-popup";
import { ctaToneClasses } from "@/lib/cta-theme";
import { getCurrentSession } from "@/lib/session";
import { normalizeContactContent } from "@/lib/contact-content";
import {
  DEFAULT_EVENT_IMAGE_URL,
} from "@/lib/home-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { ACTIVE_TOURNAMENT_STATUSES } from "@/lib/tournament-status";
import TournamentActionBar from "./tournament-action-bar";

export const metadata: Metadata = {
  title: "Tournoi national de Pâques | CCTT",
  description:
    "Toutes les informations du tournoi : dates, tableaux, inscriptions, résultats et contact de l'organisation.",
  openGraph: {
    title: "Tournoi national de Pâques | CCTT",
    description:
      "Informations tournoi CCTT : dates, tableaux, inscriptions et résultats.",
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
    title: "Tournoi national de Pâques | CCTT",
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
    return "Toutes catégories";
  }

  if (minPoints === null) {
    return `Jusqu'à ${maxPoints} pts`;
  }

  if (maxPoints === null) {
    return `${minPoints}+ pts`;
  }

  return `${minPoints} à ${maxPoints} pts`;
}

function formatDateLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(startAt);
}

function formatTimeLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startAt);
}

function formatDateRange(startDate?: Date | null, endDate?: Date | null) {
  if (!startDate || !endDate) {
    return "Dates à confirmer";
  }

  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startLabel = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(startDate);

  if (sameDay) {
    return startLabel;
  }

  const endLabel = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(endDate);

  return `${startLabel} au ${endLabel}`;
}

function formatDateTime(value?: Date | null) {
  if (!value) {
    return "À confirmer";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function normalizeVenue(value?: string | null) {
  return value?.trim() || null;
}

function buildMapDirectionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

function resolveTournamentPosterUrl(value: string | null | undefined) {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  return normalizedValue === DEFAULT_EVENT_IMAGE_URL ? "" : normalizedValue;
}

type PageProps = {
  searchParams?: Promise<{
    showRegistrationCta?: string;
  }>;
};

export default async function TournoiHomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getCurrentSession();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  const [tournament, contactContentRaw, homeContentRaw] = await Promise.all([
    prisma.tournament.findFirst({
      where: {
        status: { in: ACTIVE_TOURNAMENT_STATUSES },
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
  const eventImageUrl = resolveTournamentPosterUrl(homeContentRaw?.eventImageUrl);
  const registrationStatus = getTournamentRegistrationStatus(tournament);
  const isAdmin = isAdminRole(session?.user?.role);
  const showRegistrationCtaOverride =
    resolvedSearchParams?.showRegistrationCta === "1";
  const showRegistrationCta =
    registrationStatus.canRegister || (isAdmin && showRegistrationCtaOverride);
  const isTournamentFinished = tournament?.endDate
    ? new Date() > tournament.endDate
    : false;
  const tournamentVenue = normalizeVenue(tournament?.venue);
  const tournamentMapUrl = tournamentVenue
    ? buildMapDirectionsUrl(tournamentVenue)
    : null;

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


  return (
    <main className="relative">
      <KpiPageViewTracker page="tournoi" label="tournoi-page" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative rounded-[2rem] border border-border/70 bg-background/92 p-6 shadow-xl shadow-black/5 backdrop-blur-sm md:p-8 lg:p-10">
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <SectionEyebrow className={ctaToneClasses.tournament.eyebrow}>
                    <Trophy className="mr-2 h-3.5 w-3.5" />
                    Tournoi en ligne
                  </SectionEyebrow>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${ctaToneClasses.tournament.eyebrow}`}>
                    {registrationStatus.label}
                  </span>
                </div>

                <div className="space-y-4">
                  <h1 className="font-serif text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
                    {tournament?.name ?? "Tournoi CCTT"}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground sm:text-base">
                    <span className="inline-flex items-center gap-2">
                      <CalendarClock className={`h-4 w-4 ${ctaToneClasses.tournament.accentText}`} />
                      {formatDateRange(
                        tournament?.startDate,
                        tournament?.endDate,
                      )}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className={`h-4 w-4 ${ctaToneClasses.tournament.accentText}`} />
                      {tournamentVenue ?? "Lieu à confirmer"}
                    </span>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {tournament?.description ??
                      tournamentRegistrationContent.message}
                  </p>
                </div>

                <TournamentActionBar
                  canRegister={registrationStatus.canRegister}
                  showRegistrationCta={showRegistrationCta}
                  registrationLabel={registrationStatus.label}
                  registrationHref={tournamentRegistrationContent.cta.href}
                  registrationCtaLabel={tournamentRegistrationContent.cta.label}
                  hasUserRegistration={hasUserRegistration}
                />

                {isAdmin && !registrationStatus.canRegister ? (
                  <AdminTournamentVisibilityControls
                    options={[
                      {
                        key: "showRegistrationCta",
                        label: "Afficher le bouton S'inscrire",
                        description:
                          "Permet de tester le CTA d'inscription même quand il est masqué au public.",
                      },
                    ]}
                  />
                ) : null}

                {!registrationStatus.canRegister && isTournamentFinished ? (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className={ctaToneClasses.tournament.softBorderButton}
                    >
                      <Link href="/tournoi/resultats">
                        Consulter les résultats
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/tournoi/palmares">
                        Consulter le palmarès
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                    >
                      <Link href="/tournoi/affiches">
                        Consulter les affiches
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>

              {eventImageUrl ? (
                <div className="w-full space-y-4 lg:pt-2">
                  <div className="flex justify-start lg:justify-end">
                    <span className="inline-flex rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                      Cliquer pour agrandir
                    </span>
                  </div>
                  <div className="rounded-[1.6rem] p-1 sm:p-2">
                    <ImagePopup
                      src={eventImageUrl}
                      alt="Affiche officielle du tournoi CCTT"
                      title={tournament?.name ?? "Tournoi CCTT"}
                      width={1200}
                      height={630}
                      shareLabel="Affiche officielle du tournoi CCTT"
                      previewClassName="mx-auto max-h-[260px] w-full rounded-[1.45rem] object-contain sm:max-h-[340px] lg:max-h-[540px]"
                      popupImageClassName="max-h-[90vh] w-auto rounded-xl object-contain"
                    />
                  </div>
                </div>
              ) : null}
            </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          <Reveal>
            <MetricTile
              label="Tableaux ouverts"
              value={String(tableaux.length)}
              detail="Programme actuellement disponible à l'inscription."
            />
          </Reveal>
          <Reveal delay={100}>
            <MetricTile
              label="Date limite"
              value={formatDateTime(tournament?.registrationCloseAt)}
              detail="Clôture des inscriptions en ligne."
            />
          </Reveal>
          <Reveal delay={200}>
            <MetricTile
              label="Contact"
              value={contactContent.email}
              detail={contactContent.responseDelay}
            />
          </Reveal>
        </section>

        <section>
          <Reveal>
            <Card className="rounded-[1.8rem] border-border/70 bg-card/94 shadow-sm shadow-black/5">
              <CardHeader className="space-y-3">
                <SectionEyebrow tone="neutral">Préparer ma venue</SectionEyebrow>
                <CardTitle className="font-serif text-3xl font-bold tracking-[-0.03em]">
                  Les infos vraiment utiles avant d&apos;arriver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] border border-cta-tournament-muted bg-cta-tournament-soft p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${ctaToneClasses.tournament.accentText}`}>
                        Gymnase
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {tournamentVenue ?? "Lieu à confirmer"}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {tournamentMapUrl
                          ? "Un seul lieu de référence pour venir le jour du tournoi."
                          : "Le lieu sera ajouté ici dès qu'il sera confirmé."}
                      </p>
                    </div>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ctaToneClasses.tournament.softButton}`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                  {tournamentMapUrl ? (
                    <ExternalMapLink
                      href={tournamentMapUrl}
                      label="Ouvrir l'itinéraire"
                      className={`mt-4 inline-flex items-center gap-2 rounded-md border bg-background/80 px-4 py-2 text-sm font-medium transition focus-ring ${ctaToneClasses.tournament.softBorderButton}`}
                    />
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ClipboardCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Inscriptions
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          {registrationStatus.label}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {registrationStatus.message}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Date limite
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          {formatDateTime(tournament?.registrationCloseAt)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Clôture des inscriptions en ligne avant le tournoi.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Contact organisation
                        </p>
                        <p className="mt-1 font-medium text-foreground">
                          {contactContent.email}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {contactContent.responseDelay}
                    </p>
                  </div>
                </div>
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
                    Informations à jour
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tableaux.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun tableau ouvert n&apos;est disponible pour le moment.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:hidden">
                      <p className="text-sm font-medium text-foreground">
                        Lecture mobile
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Chaque tableau est présenté comme une fiche avec
                        catégorie, horaire et tarifs pour éviter le scroll
                        horizontal sur téléphone.
                      </p>
                    </div>

                    <div className="grid gap-3 md:hidden">
                      {tableaux.map((tableau) => (
                        <article
                          key={tableau.id}
                          className="rounded-[1.35rem] border border-border/70 bg-background/90 p-4 shadow-sm shadow-black/5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                Tableau
                              </p>
                              <p className="mt-1 text-lg font-semibold text-foreground">
                                {tableau.code}
                              </p>
                            </div>
                            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {tableau.heure}
                            </span>
                          </div>

                          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/20 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Catégorie
                            </p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                              {tableau.categorie}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Date
                              </p>
                              <p className="mt-1 text-sm font-medium text-foreground">
                                {tableau.date}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Horaire
                              </p>
                              <p className="mt-1 text-sm font-medium text-foreground">
                                {tableau.heure}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Tarif en ligne
                              </p>
                              <p className="mt-1 text-sm font-medium text-foreground">
                                {tableau.online}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Tarif sur place
                              </p>
                              <p className="mt-1 text-sm font-medium text-foreground">
                                {tableau.surPlace}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="hidden overflow-x-auto rounded-2xl border border-border/70 md:block">
                      <table className="min-w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr className="text-left text-muted-foreground">
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Heure</th>
                            <th className="px-4 py-3">Catégorie</th>
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
                  </div>
                )}
                <p className="mt-4 text-sm text-muted-foreground">
                  Les tarifs en ligne et sur place s&apos;appliquent par
                  tableau. En cas de forfait médical, le remboursement suit les
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


