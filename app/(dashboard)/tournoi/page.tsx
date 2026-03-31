import type { Metadata } from "next";
import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import Reveal from "@/components/Reveal";
import TrackedLink from "@/components/TrackedLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { normalizeContactContent } from "@/lib/contact-content";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/roles";
import { tournamentRegistrationContent } from "@/lib/tournament-registration-content";
import { getServerSession } from "next-auth";

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
        url: "https://res.cloudinary.com/diimhrbx7/image/upload/v1774953383/couv-facebook_ktnewg.jpg",
        width: 1200,
        height: 630,
        alt: "Tournoi de Pâques CCTT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tournoi national de Pâques – CCTT",
    description: "Dates, tableaux et inscriptions au tournoi CCTT.",
    images: [
      "https://res.cloudinary.com/diimhrbx7/image/upload/v1774953383/couv-facebook_ktnewg.jpg",
    ],
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
  if (!startDate || !endDate) return "Dates a confirmer";
  const sameDay =
    startDate.toDateString() === endDate.toDateString();
  const startLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(startDate);
  if (sameDay) return startLabel;
  const endLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(endDate);
  return `${startLabel} au ${endLabel}`;
}

function formatDateTime(value?: Date | null) {
  if (!value) return "A confirmer";
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
  const [tournament, contactContentRaw] = await Promise.all([
    prisma.tournament.findFirst({
      where: {
        status: {
          in: ["PUBLISHED", "DRAFT"],
        },
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
  ]);
  const tournamentEvents = tournament?.events ?? [];
  const contactContent = normalizeContactContent(contactContentRaw ?? undefined);

  const registrationCount = tournament
    ? await prisma.tournamentRegistration.count({
        where: {
          tournamentId: tournament.id,
          status: {
            not: "CANCELLED",
          },
        },
      })
    : 0;

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

  const registrationStatus = tournament
    ? (() => {
        const now = new Date();
        const openAt = tournament.registrationOpenAt;
        const closeAt = tournament.registrationCloseAt;
        if (openAt && now < openAt) {
          return { label: "Inscriptions a venir", tone: "upcoming" as const };
        }
        if (closeAt && now > closeAt) {
          return { label: "Inscriptions fermees", tone: "closed" as const };
        }
        if (openAt || closeAt) {
          return { label: "Inscriptions ouvertes", tone: "open" as const };
        }
        return { label: "Inscriptions a confirmer", tone: "unknown" as const };
      })()
    : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 space-y-10">
      <KpiPageViewTracker page="tournoi" label="tournoi-page" />

      <Reveal>
        <section className="rounded-2xl border bg-card/50 p-6 md:p-8 shadow-sm space-y-6 card-hover">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground animate-fade-up-2">
              {tournament?.name ?? "Tournoi CCTT"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {formatDateRange(tournament?.startDate, tournament?.endDate)}
            </p>
          </div>

          {tournament?.description ? (
            <p className="text-sm text-muted-foreground">
              {tournament.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {tournamentRegistrationContent.message}
            </p>
          )}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-4 lg:flex lg:flex-col lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-3">
                <TrackedLink
                  kpiPage="tournoi"
                  kpiLabel="cta-inscription"
                  href={tournamentRegistrationContent.cta.href}
                  className="inline-flex justify-center rounded-md bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:opacity-90 focus-ring"
                >
                  {tournamentRegistrationContent.cta.label}
                </TrackedLink>
                <a
                  href="/tournoi/reglement"
                  className="inline-flex justify-center rounded-md border border-primary px-6 py-3 text-primary transition hover:bg-primary/10 focus-ring"
                >
                  Consulter le règlement 2026
                </a>
                {hasUserRegistration ? (
                  <a
                    href="/user/inscriptions"
                    className="inline-flex justify-center rounded-md border border-border px-6 py-3 text-foreground transition hover:bg-accent/40 focus-ring"
                  >
                    Voir mes inscriptions
                  </a>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  Déjà {registrationCount} inscrit(s)
                </span>
                {tournament?.status ? (
                  <span>{tournament.status}</span>
                ) : null}
                {registrationStatus ? (
                  <span
                    className={
                      registrationStatus.tone === "open"
                        ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600"
                        : registrationStatus.tone === "upcoming"
                          ? "rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-600"
                          : registrationStatus.tone === "closed"
                            ? "rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-600"
                            : "rounded-full bg-muted/60 px-2.5 py-1 text-muted-foreground"
                    }
                  >
                    {registrationStatus.label}
                  </span>
                ) : null}
                {tournament && session && isAdminRole(session.user.role) ? (
                  <span className="rounded-full border border-dashed px-2.5 py-1 text-[11px]">
                    ID: {tournament.id} • slug: {tournament.slug}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="group w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:justify-self-end">
              <div
                className="aspect-[16/9] w-full bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                style={{
                  backgroundImage:
                    "url(https://res.cloudinary.com/diimhrbx7/image/upload/v1774953383/couv-facebook_ktnewg.jpg)",
                  backgroundPosition: "50% 50%",
                }}
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Dates",
                value: formatDateRange(
                  tournament?.startDate,
                  tournament?.endDate,
                ),
              },
              { label: "Lieu", value: tournament?.venue ?? "A confirmer" },
              {
                label: "Ouverture",
                value: formatDateTime(tournament?.registrationOpenAt),
              },
              {
                label: "Cloture",
                value: formatDateTime(tournament?.registrationCloseAt),
              },
            ].map((item, index) => (
              <Reveal key={item.label} delay={index * 100}>
                <div className="rounded-xl border bg-background p-4 card-hover">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Reveal>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Informations pratiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Lieu :</strong> {tournament?.venue ?? "A confirmer"}
              </p>
              <p>
                <strong>Dates :</strong>{" "}
                {formatDateRange(tournament?.startDate, tournament?.endDate)}
              </p>
              <p>
                <strong>Inscriptions :</strong> jusqu&apos;au{" "}
                {formatDateTime(tournament?.registrationCloseAt)}.
              </p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Contact organisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                <strong>Contact :</strong> {contactContent.email}
              </p>
              <p>
                <strong>Delai :</strong> {contactContent.responseDelay}
              </p>
              <p>
                <strong>Adresse :</strong> {contactContent.addressName},{" "}
                {contactContent.addressLine}, {contactContent.addressCity}
              </p>
            </CardContent>
          </Card>
        </Reveal>
      </section>

      <Reveal>
        <section>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Tableaux et horaires</CardTitle>
            </CardHeader>
            <CardContent>
              {tableaux.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun tableau ouvert n&apos;est disponible pour le moment.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4">Code</th>
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Heure</th>
                        <th className="py-2 pr-4">Catégorie</th>
                        <th className="py-2 pr-4">En ligne</th>
                        <th className="py-2">Sur place</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableaux.map((tableau) => (
                        <tr key={tableau.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-semibold">
                            {tableau.code}
                          </td>
                          <td className="py-2 pr-4">{tableau.date}</td>
                          <td className="py-2 pr-4">{tableau.heure}</td>
                          <td className="py-2 pr-4">{tableau.categorie}</td>
                          <td className="py-2 pr-4">{tableau.online}</td>
                          <td className="py-2">{tableau.surPlace}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Les tarifs en ligne et sur place s&apos;appliquent par tableau. En
                cas de forfait médical, le remboursement suit les conditions FFTT.
              </p>
            </CardContent>
          </Card>
        </section>
      </Reveal>
    </main>
  );
}

