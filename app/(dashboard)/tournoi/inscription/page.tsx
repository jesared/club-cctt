import KpiPageViewTracker from "@/components/KpiPageViewTracker";
import Reveal from "@/components/Reveal";
import TournamentRegistrationForm from "@/components/TournamentRegistrationForm";
import { prisma } from "@/lib/prisma";
import { getTournamentRegistrationNotificationAvailability } from "@/lib/public-form-availability";
import { getCurrentSession } from "@/lib/session";
import { getTournamentRegistrationStatus } from "@/lib/tournament-registration-window";
import { ACTIVE_TOURNAMENT_STATUSES } from "@/lib/tournament-status";
import { redirect } from "next/navigation";

function formatEventLabel(event: {
  code: string;
  label: string;
  startAt: Date;
  minPoints: number | null;
  maxPoints: number | null;
  gender: "MIXED" | "M" | "F";
}) {
  const startHour = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(event.startAt);

  const pointsRange =
    event.minPoints === null && event.maxPoints === null
      ? "Toutes catégories"
      : event.minPoints !== null && event.maxPoints !== null
        ? `${event.minPoints} à ${event.maxPoints} pts`
        : event.minPoints !== null
          ? `${event.minPoints}+ pts`
          : `Jusqu'à ${event.maxPoints} pts`;

  const genderLabel =
    event.gender === "M"
      ? "Messieurs"
      : event.gender === "F"
        ? "Dames"
        : "Mixte";

  const labelParts = [event.label.trim()];

  if (
    pointsRange &&
    event.label.trim().toLowerCase() !== pointsRange.trim().toLowerCase()
  ) {
    labelParts.push(pointsRange);
  }

  if (event.gender !== "MIXED") {
    const normalizedLabel = event.label.trim().toLowerCase();
    const normalizedGenderLabel = genderLabel.toLowerCase();
    if (!normalizedLabel.includes(normalizedGenderLabel)) {
      labelParts.push(genderLabel);
    }
  }

  return `${event.code} (${labelParts.join(" - ")}) - ${startHour}`;
}

function formatEventDateLabel(startAt: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(startAt);
}

export default async function InscriptionsPage() {
  const session = await getCurrentSession();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tournoi/inscription");
  }
  const userEmail = session?.user?.email?.trim().toLowerCase();

  const tournament = await prisma.tournament.findFirst({
    where: {
      status: { in: ACTIVE_TOURNAMENT_STATUSES },
    },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      status: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      events: {
        where: {
          status: { in: ["OPEN", "FULL"] },
        },
        orderBy: [{ startAt: "asc" }, { code: "asc" }],
        select: {
          code: true,
          label: true,
          gender: true,
          minPoints: true,
          maxPoints: true,
          startAt: true,
          feeOnlineCents: true,
          feeOnsiteCents: true,
          maxPlayers: true,
          _count: {
            select: {
              registrationEvents: {
                where: {
                  status: {
                    in: ["REGISTERED", "CHECKED_IN"],
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const registrationStatus = getTournamentRegistrationStatus(tournament);
  const notificationAvailability =
    getTournamentRegistrationNotificationAvailability();

  const tableOptions = (tournament?.events ?? []).map((event) => {
    const maxPlayers = event.maxPlayers ?? null;
    const registrations = event._count.registrationEvents;
    const remainingSpots =
      maxPlayers !== null ? Math.max(maxPlayers - registrations, 0) : null;
    const isFull = maxPlayers !== null && registrations >= maxPlayers;

    return {
      value: event.code,
      label: formatEventLabel(event),
      dateLabel: formatEventDateLabel(event.startAt),
      dateKey: event.startAt.toISOString().split("T")[0],
      minPoints: event.minPoints,
      maxPoints: event.maxPoints,
      gender: event.gender,
      onlinePriceLabel: `${(event.feeOnlineCents / 100).toFixed(0)} EUR`,
      onsitePriceLabel: `${(event.feeOnsiteCents / 100).toFixed(0)} EUR`,
      isFull,
      remainingSpots,
    };
  });

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

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:py-8">
      <KpiPageViewTracker page="tournoi-inscription" label="inscription-page" />

      <Reveal>
        <header className="space-y-2 sm:space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Tournoi CCTT
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Inscription{" "}
            {tournament?.name ? `au ${tournament.name}` : "au Tournoi"}
          </h1>
          <p className="hidden text-sm leading-relaxed text-muted-foreground sm:block">
            {registrationStatus.canRegister
              ? "Saisissez votre numéro de licence FFTT : le formulaire récupère les données joueur, filtre les tableaux compatibles, puis affiche un récapitulatif avant validation."
              : registrationStatus.message}
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/tournoi"
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition hover:bg-accent/40"
            >
              Retour au tournoi
            </a>
            {hasUserRegistration ? (
              <a
                href="/user/inscriptions"
                className="inline-flex h-10 items-center justify-center rounded-md border border-primary px-4 text-sm font-medium text-primary transition hover:bg-primary/10"
              >
                Voir mes inscriptions
              </a>
            ) : null}
          </div>
        </header>
      </Reveal>

      <Reveal>
        {registrationStatus.canRegister && notificationAvailability.isAvailable ? (
          <TournamentRegistrationForm tableOptions={tableOptions} />
        ) : (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-foreground">
            <p className="font-medium">
              {notificationAvailability.isAvailable
                ? registrationStatus.label
                : "Inscriptions temporairement indisponibles"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {notificationAvailability.isAvailable
                ? registrationStatus.message
                : notificationAvailability.message}
            </p>
            {!notificationAvailability.isAvailable ? (
              <p className="mt-3 text-muted-foreground">
                Merci d&apos;ecrire a{" "}
                <a
                  href="mailto:inscriptions-tournoi@cctt.fr"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  inscriptions-tournoi@cctt.fr
                </a>{" "}
                pour toute demande urgente.
              </p>
            ) : null}
          </div>
        )}
      </Reveal>
    </main>
  );
}
