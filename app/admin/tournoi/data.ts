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
  minPoints: number | null;
  maxPoints: number | null;
};

export type RegistrationByTable = {
  table: string;
  category: string;
  registrations: number;
  waitlist: number;
  checkins: number;
};

export type AdminPlayerRow = {
  id: string;
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

export type AdminPaymentGroupRow = {
  groupKey: string;
  payerLabel: string;
  registrations: number;
  players: string[];
  totalAmountDueCents: number;
  totalPaidCents: number;
  totalPendingCents: number;
  paymentStatus: "PAYÉ" | "PARTIEL" | "EN ATTENTE" | "SUR PLACE";
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
    minPoints: event.minPoints,
    maxPoints: event.maxPoints,
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
    orderBy: [
      {
        player: {
          nom: "asc",
        },
      },
      {
        player: {
          prenom: "asc",
        },
      },
    ],
    select: {
      id: true,
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
      id: registration.id,
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

function normalizeGroupValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase();
}

function buildPayerLabel(email: string | null | undefined, phone: string | null | undefined) {
  if (email && phone) {
    return `${email} / ${phone}`;
  }

  if (email) {
    return email;
  }

  if (phone) {
    return phone;
  }

  return "Contact manquant";
}

export async function getAdminPaymentGroups(tournamentId: string): Promise<AdminPaymentGroupRow[]> {
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId },
    select: {
      id: true,
      contactEmail: true,
      contactPhone: true,
      player: {
        select: {
          nom: true,
          prenom: true,
        },
      },
      registrationEvents: {
        select: {
          event: {
            select: {
              feeOnlineCents: true,
            },
          },
        },
      },
      payments: {
        select: {
          amountCents: true,
          status: true,
        },
      },
    },
  });

  const groups = new Map<string, AdminPaymentGroupRow>();

  for (const registration of registrations) {
    const normalizedEmail = normalizeGroupValue(registration.contactEmail);
    const normalizedPhone = normalizeGroupValue(registration.contactPhone);
    const groupKey = normalizedEmail || normalizedPhone || `registration:${registration.id}`;

    const totalAmountDueCents = registration.registrationEvents.reduce(
      (acc, eventEntry) => acc + eventEntry.event.feeOnlineCents,
      0,
    );
    const totalPaidCents = registration.payments
      .filter((payment) => payment.status === "PAID")
      .reduce((acc, payment) => acc + payment.amountCents, 0);
    const totalPendingCents = registration.payments
      .filter((payment) => payment.status === "PENDING")
      .reduce((acc, payment) => acc + payment.amountCents, 0);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        groupKey,
        payerLabel: buildPayerLabel(registration.contactEmail, registration.contactPhone),
        registrations: 0,
        players: [],
        totalAmountDueCents: 0,
        totalPaidCents: 0,
        totalPendingCents: 0,
        paymentStatus: "SUR PLACE",
      });
    }

    const group = groups.get(groupKey)!;
    group.registrations += 1;
    group.players.push(`${registration.player.prenom} ${registration.player.nom}`.trim());
    group.totalAmountDueCents += totalAmountDueCents;
    group.totalPaidCents += totalPaidCents;
    group.totalPendingCents += totalPendingCents;
  }

  const rows = Array.from(groups.values()).map((group) => {
    let paymentStatus: AdminPaymentGroupRow["paymentStatus"] = "SUR PLACE";
    if (group.totalPaidCents >= group.totalAmountDueCents && group.totalAmountDueCents > 0) {
      paymentStatus = "PAYÉ";
    } else if (group.totalPaidCents > 0) {
      paymentStatus = "PARTIEL";
    } else if (group.totalPendingCents > 0) {
      paymentStatus = "EN ATTENTE";
    }

    return {
      ...group,
      paymentStatus,
      players: group.players.sort((a, b) => a.localeCompare(b, "fr")),
    };
  });

  return rows.sort((a, b) => {
    if (a.registrations !== b.registrations) {
      return b.registrations - a.registrations;
    }

    return a.payerLabel.localeCompare(b.payerLabel, "fr");
  });
}
