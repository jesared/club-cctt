import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus, RegistrationStatus } from "@prisma/client";

export type TournamentTable = {
  id: string;
  dayKey: string;
  date: string;
  time: string;
  table: string;
  category: string;
  earlyPayment: string;
  onsitePayment: string;
};

export type RegistrationByTable = {
  table: string;
  category: string;
  registrations: number;
  waitlist: number;
  checkins: number;
};

export type AdminPlayerRow = {
  name: string;
  club: string;
  licence: string;
  ranking: string;
  table: string;
  payment: string;
  status: string;
  checkedDayKeys: string[];
  registrationEventIdsByDay: Record<string, string[]>;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)}€`;
}

function formatCategory(minPoints: number | null, maxPoints: number | null) {
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

export async function getCurrentTournament() {
  return prisma.tournament.findFirst({
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });
}

export async function getTournamentTables(tournamentId: string): Promise<TournamentTable[]> {
  const events = await prisma.tournamentEvent.findMany({
    where: { tournamentId },
    orderBy: [{ startAt: "asc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      minPoints: true,
      maxPoints: true,
      startAt: true,
      feeOnlineCents: true,
      feeOnsiteCents: true,
    },
  });

  return events.map((event) => ({
    id: event.id,
    dayKey: event.startAt.toISOString().slice(0, 10),
    date: DATE_FORMATTER.format(event.startAt),
    time: TIME_FORMATTER.format(event.startAt),
    table: event.code,
    category: formatCategory(event.minPoints, event.maxPoints),
    earlyPayment: formatEuro(event.feeOnlineCents),
    onsitePayment: formatEuro(event.feeOnsiteCents),
  }));
}

export async function getRegistrationsByTable(tournamentId: string): Promise<RegistrationByTable[]> {
  const events = await prisma.tournamentEvent.findMany({
    where: { tournamentId },
    orderBy: [{ startAt: "asc" }, { code: "asc" }],
    select: {
      code: true,
      minPoints: true,
      maxPoints: true,
      registrationEvents: {
        select: {
          status: true,
        },
      },
    },
  });

  return events.map((event) => {
    const registrations = event.registrationEvents.length;
    const waitlist = event.registrationEvents.filter(
      (registrationEvent) => registrationEvent.status === RegistrationEventStatus.WAITLISTED,
    ).length;
    const checkins = event.registrationEvents.filter(
      (registrationEvent) => registrationEvent.status === RegistrationEventStatus.CHECKED_IN,
    ).length;

    return {
      table: event.code,
      category: formatCategory(event.minPoints, event.maxPoints),
      registrations,
      waitlist,
      checkins,
    };
  });
}

function getRegistrationStatusLabel(status: RegistrationStatus) {
  switch (status) {
    case RegistrationStatus.CONFIRMED:
      return "Confirmée";
    case RegistrationStatus.CANCELLED:
      return "Annulée";
    case RegistrationStatus.PENDING:
    default:
      return "À confirmer";
  }
}

export async function getAdminPlayers(tournamentId: string): Promise<AdminPlayerRow[]> {
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      status: true,
      player: {
        select: {
          nom: true,
          prenom: true,
          club: true,
          licence: true,
          points: true,
        },
      },
      registrationEvents: {
        select: {
          id: true,
          event: {
            select: {
              code: true,
              startAt: true,
            },
          },
          status: true,
          checkIn: {
            select: {
              id: true,
            },
          },
        },
      },
      payments: {
        select: {
          status: true,
        },
      },
    },
    take: 100,
  });

  return registrations.map((registration) => {
    const hasPaidPayment = registration.payments.some((payment) => payment.status === "PAID");
    const hasCheckedIn = registration.registrationEvents.some(
      (registrationEvent) => registrationEvent.status === RegistrationEventStatus.CHECKED_IN,
    );
    const hasWaitlist = registration.registrationEvents.some(
      (registrationEvent) => registrationEvent.status === RegistrationEventStatus.WAITLISTED,
    );

    const computedStatus = hasCheckedIn
      ? "Pointé"
      : hasWaitlist
        ? "Liste d'attente"
        : getRegistrationStatusLabel(registration.status);

    return {
      name: `${registration.player.prenom} ${registration.player.nom}`.trim(),
      club: registration.player.club ?? "—",
      licence: registration.player.licence,
      ranking: registration.player.points ? `${registration.player.points}` : "—",
      table: registration.registrationEvents.map((entry) => entry.event.code).join(", ") || "—",
      payment: hasPaidPayment ? "Anticipé" : "Sur place",
      status: computedStatus,
      checkedDayKeys: Array.from(
        new Set(
          registration.registrationEvents
            .filter(
              (entry) => entry.checkIn !== null || entry.status === RegistrationEventStatus.CHECKED_IN,
            )
            .map((entry) => entry.event.startAt.toISOString().slice(0, 10)),
        ),
      ),
      registrationEventIdsByDay: registration.registrationEvents.reduce<Record<string, string[]>>((acc, entry) => {
        const dayKey = entry.event.startAt.toISOString().slice(0, 10);
        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push(entry.id);
        return acc;
      }, {}),
    };
  });
}
