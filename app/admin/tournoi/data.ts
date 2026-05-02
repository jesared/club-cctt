import { prisma } from "@/lib/prisma";
import { RegistrationEventStatus, RegistrationStatus } from "@prisma/client";
import {
  getEffectivePaidCents,
  getPaymentStatusFromAmounts,
  getRecordedPaidCents,
  getRegistrationTotalDueCents,
} from "./payment-utils";
import {
  buildPayerLabel,
  getPaymentGroupKey,
  getPaymentPayerInfo,
} from "./payment-grouping";

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
  gender: "MIXED" | "M" | "F";
  maxPlayers: number | null;
  registrations: number;
};

export type RegistrationByTable = {
  table: string;
  category: string;
  registrations: number;
  waitlist: number;
  checkins: number;
  maxPlayers: number | null;
};

export type AdminPlayerRow = {
  id: string;
  paymentGroupKey: string;
  dossard: number;
  name: string;
  club: string;
  licence: string;
  ranking: string;
  table: string;
  payment: string;
  status: string;
  statusDetail: string | null;
  hasCheckedIn: boolean;
  hasWaitlist: boolean;
  hasPendingConfirmation: boolean;
  engagedEventIds: string[];
  waitlistEventIds: string[];
  checkedDayKeys: string[];
  registrationEventIdsByDay: Record<string, string[]>;
  createdAt: string;
};

type AdminPlayerRegistrationRecord = {
  id: string;
  tournamentId: string;
  contactEmail: string | null;
  contactPhone: string | null;
  playerId: number;
  status: RegistrationStatus;
  createdAt: Date;
  paidAmountCents: number;
  player: {
    nom: string;
    prenom: string;
    club: string | null;
    licence: string;
    points: number | null;
    ownerId: string;
    owner: {
      name: string | null;
      email: string | null;
    } | null;
  };
  registrationEvents: Array<{
    id: string;
    eventId: string;
    event: {
      code: string;
      startAt: Date;
      feeOnlineCents: number;
    };
    status: RegistrationEventStatus;
    checkIn: {
      id: string;
    } | null;
  }>;
  payments: Array<{
    amountCents: number;
    status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  }>;
};

export type AdminRegistrationsOverview = {
  playerDossiers: number;
  pendingDossiers: number;
  activeEngagements: number;
  checkedEngagements: number;
  waitlistEntries: number;
};

export type AdminPaymentGroupRow = {
  groupKey: string;
  payerName: string;
  payerEmail: string | null;
  payerPhone: string | null;
  payerLabel: string;
  registrations: number;
  players: string[];
  totalAmountDueCents: number;
  totalPaidCents: number;
  totalPendingCents: number;
  paymentStatus: "PAYÉ" | "PARTIEL" | "EN ATTENTE";
  hasPaymentMismatch?: boolean;
  note?: string | null;
  noteMismatch?: boolean;
};

export type TournamentDashboardStats = {
  totalPlayers: number;
  paidPlayers: number;
  pendingPayments: number;
  totalTables: number;
  fullTables: number;
  registrationsToday: number;
};

export type TournamentProgress = {
  registrationStatus: "CLOSED" | "OPEN" | "UPCOMING";
  daysToStart: number | null;
  paymentsPending: number;
  tablesFull: number;
  totalTables: number;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const adminPlayerRegistrationSelect = {
  id: true,
  tournamentId: true,
  contactEmail: true,
  contactPhone: true,
  playerId: true,
  status: true,
  createdAt: true,
  paidAmountCents: true,
  player: {
    select: {
      nom: true,
      prenom: true,
      club: true,
      licence: true,
      points: true,
      ownerId: true,
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  },
  registrationEvents: {
    select: {
      id: true,
      eventId: true,
      event: {
        select: {
          code: true,
          startAt: true,
          feeOnlineCents: true,
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
      amountCents: true,
      status: true,
    },
  },
} as const;

function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(0)} EUR`;
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
  const published = await prisma.tournament.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      venue: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });

  if (published) {
    return published;
  }

  return prisma.tournament.findFirst({
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      venue: true,
      registrationOpenAt: true,
      registrationCloseAt: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  });
}

export async function getAdminTournaments() {
  return prisma.tournament.findMany({
    orderBy: [{ startDate: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });
}

export async function getTournamentDashboardStats(
  tournamentId: string,
): Promise<TournamentDashboardStats> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [registrations, registrationsToday, tables] = await Promise.all([
    prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      select: {
        paidAmountCents: true,
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
    }),
    prisma.tournamentRegistration.count({
      where: {
        tournamentId,
        createdAt: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
      },
    }),
    prisma.tournamentEvent.findMany({
      where: { tournamentId },
      select: {
        maxPlayers: true,
        _count: {
          select: {
            registrationEvents: {
              where: {
                status: {
                  in: [
                    RegistrationEventStatus.REGISTERED,
                    RegistrationEventStatus.CHECKED_IN,
                    RegistrationEventStatus.NO_SHOW,
                    RegistrationEventStatus.FORFEIT,
                  ],
                },
              },
            },
          },
        },
      },
    }),
  ]);
  const totalPlayers = registrations.length;
  const paidPlayers = registrations.filter((registration) => {
    const totalDueCents = getRegistrationTotalDueCents(
      registration.registrationEvents,
    );
    const totalPaidCents = getEffectivePaidCents({
      paidAmountCents: registration.paidAmountCents,
      payments: registration.payments,
    });

    return getPaymentStatusFromAmounts(totalDueCents, totalPaidCents) === "PAYÉ";
  }).length;

  const totalTables = tables.length;
  const fullTables = tables.filter((table) => table._count.registrationEvents >= table.maxPlayers).length;
  const pendingPayments = Math.max(totalPlayers - paidPlayers, 0);

  return {
    totalPlayers,
    paidPlayers,
    pendingPayments,
    totalTables,
    fullTables,
    registrationsToday,
  };
}

export async function getTournamentProgress(
  tournamentId: string,
): Promise<TournamentProgress> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: {
      registrationOpenAt: true,
      registrationCloseAt: true,
      startDate: true,
      status: true,
    },
  });

  if (!tournament) {
    return {
      registrationStatus: "CLOSED",
      daysToStart: null,
      paymentsPending: 0,
      tablesFull: 0,
      totalTables: 0,
    };
  }

  const now = new Date();
  const registrationOpenAt = tournament.registrationOpenAt;
  const registrationCloseAt = tournament.registrationCloseAt;
  let registrationStatus: TournamentProgress["registrationStatus"] = "CLOSED";

  if (registrationOpenAt && now < registrationOpenAt) {
    registrationStatus = "UPCOMING";
  } else if (
    registrationOpenAt &&
    registrationCloseAt &&
    now >= registrationOpenAt &&
    now <= registrationCloseAt
  ) {
    registrationStatus = "OPEN";
  }

  const daysToStart = Math.ceil(
    (tournament.startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  const [registrations, tables] = await Promise.all([
    prisma.tournamentRegistration.findMany({
      where: { tournamentId },
      select: {
        paidAmountCents: true,
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
    }),
    prisma.tournamentEvent.findMany({
      where: { tournamentId },
      select: {
        maxPlayers: true,
        _count: {
          select: {
            registrationEvents: {
              where: {
                status: {
                  in: [
                    RegistrationEventStatus.REGISTERED,
                    RegistrationEventStatus.CHECKED_IN,
                    RegistrationEventStatus.NO_SHOW,
                    RegistrationEventStatus.FORFEIT,
                  ],
                },
              },
            },
          },
        },
      },
    }),
  ]);
  const totalPlayers = registrations.length;
  const paidPlayers = registrations.filter((registration) => {
    const totalDueCents = getRegistrationTotalDueCents(
      registration.registrationEvents,
    );
    const totalPaidCents = getEffectivePaidCents({
      paidAmountCents: registration.paidAmountCents,
      payments: registration.payments,
    });

    return getPaymentStatusFromAmounts(totalDueCents, totalPaidCents) === "PAYÉ";
  }).length;

  const totalTables = tables.length;
  const tablesFull = tables.filter(
    (table) => table._count.registrationEvents >= table.maxPlayers,
  ).length;

  return {
    registrationStatus,
    daysToStart: Number.isNaN(daysToStart) ? null : daysToStart,
    paymentsPending: Math.max(totalPlayers - paidPlayers, 0),
    tablesFull,
    totalTables,
  };
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
      gender: true,
      startAt: true,
      feeOnlineCents: true,
      feeOnsiteCents: true,
      maxPlayers: true,
      _count: {
        select: {
          registrationEvents: {
            where: {
              status: {
                in: [
                  RegistrationEventStatus.REGISTERED,
                  RegistrationEventStatus.CHECKED_IN,
                ],
              },
            },
          },
        },
      },
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
    gender: event.gender,
    maxPlayers: event.maxPlayers,
    registrations: event._count.registrationEvents,
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
      maxPlayers: true,
      registrationEvents: {
        select: {
          status: true,
        },
      },
    },
  });

  return events.map((event) => {
    const registrations = event.registrationEvents.filter(
      (registrationEvent) =>
        registrationEvent.status !== RegistrationEventStatus.WAITLISTED,
    ).length;
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
      maxPlayers: event.maxPlayers ?? null,
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

function formatStatusCount(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

function getAdminPlayerStatus(registration: {
  status: RegistrationStatus;
  registrationEvents: Array<{
    status: RegistrationEventStatus;
  }>;
}) {
  const checkedInCount = registration.registrationEvents.filter(
    (registrationEvent) =>
      registrationEvent.status === RegistrationEventStatus.CHECKED_IN,
  ).length;
  const waitlistCount = registration.registrationEvents.filter(
    (registrationEvent) =>
      registrationEvent.status === RegistrationEventStatus.WAITLISTED,
  ).length;
  const engagedCount = registration.registrationEvents.filter(
    (registrationEvent) =>
      registrationEvent.status !== RegistrationEventStatus.WAITLISTED,
  ).length;
  const hasCheckedIn = checkedInCount > 0;
  const hasWaitlist = waitlistCount > 0;
  const hasPendingConfirmation =
    registration.status === RegistrationStatus.PENDING;
  const isCancelled = registration.status === RegistrationStatus.CANCELLED;
  const totalEvents = registration.registrationEvents.length;
  const remainingEngagedCount = Math.max(engagedCount - checkedInCount, 0);
  const isMixed =
    !isCancelled &&
    totalEvents > 1 &&
    ((hasCheckedIn && checkedInCount < engagedCount) ||
      (hasWaitlist && waitlistCount < totalEvents) ||
      hasPendingConfirmation);

  let status = getRegistrationStatusLabel(registration.status);
  if (isCancelled) {
    status = "Annulée";
  } else if (isMixed) {
    status = "Mixte";
  } else if (
    hasCheckedIn &&
    checkedInCount === engagedCount &&
    waitlistCount === 0
  ) {
    status = "Pointé";
  } else if (hasWaitlist && waitlistCount === totalEvents) {
    status = "Liste d'attente";
  }

  const detailParts: string[] = [];
  if (isMixed) {
    if (checkedInCount > 0) {
      detailParts.push(formatStatusCount(checkedInCount, "pointé", "pointés"));
    }
    if (remainingEngagedCount > 0) {
      detailParts.push(
        formatStatusCount(
          remainingEngagedCount,
          "engagement actif",
          "engagements actifs",
        ),
      );
    }
    if (waitlistCount > 0) {
      detailParts.push(formatStatusCount(waitlistCount, "attente", "attentes"));
    }
    if (hasPendingConfirmation) {
      detailParts.push("dossier à confirmer");
    }
  }

  return {
    status,
    statusDetail: detailParts.length > 0 ? detailParts.join(" · ") : null,
    hasCheckedIn,
    hasWaitlist,
    hasPendingConfirmation,
  };
}

function buildAdminPlayerSearchWhere(tournamentId: string, searchQuery?: string) {
  const normalizedQuery = searchQuery?.trim();
  if (!normalizedQuery) {
    return { tournamentId };
  }

  return {
    tournamentId,
    OR: [
      {
        player: {
          prenom: {
            contains: normalizedQuery,
            mode: "insensitive" as const,
          },
        },
      },
      {
        player: {
          nom: {
            contains: normalizedQuery,
            mode: "insensitive" as const,
          },
        },
      },
      {
        player: {
          club: {
            contains: normalizedQuery,
            mode: "insensitive" as const,
          },
        },
      },
      {
        player: {
          licence: {
            contains: normalizedQuery,
            mode: "insensitive" as const,
          },
        },
      },
    ],
  };
}

function mapAdminPlayerRow(registration: AdminPlayerRegistrationRecord): AdminPlayerRow {
  const totalDueCents = getRegistrationTotalDueCents(
    registration.registrationEvents,
  );
  const totalPaidCents = getEffectivePaidCents({
    paidAmountCents: registration.paidAmountCents,
    payments: registration.payments,
  });
  const paymentStatus = getPaymentStatusFromAmounts(
    totalDueCents,
    totalPaidCents,
  );
  const computedStatus = getAdminPlayerStatus(registration);

  return {
    id: registration.id,
    paymentGroupKey: getPaymentGroupKey(registration),
    dossard: registration.playerId,
    name: `${registration.player.prenom} ${registration.player.nom}`.trim(),
    club: registration.player.club ?? "—",
    licence: registration.player.licence,
    ranking: registration.player.points ? `${registration.player.points}` : "—",
    table:
      registration.registrationEvents.map((entry) => entry.event.code).join(", ") ||
      "—",
    payment:
      paymentStatus === "PAYÉ"
        ? "Payé"
        : paymentStatus === "PARTIEL"
          ? "À régulariser"
          : "En attente",
    status: computedStatus.status,
    statusDetail: computedStatus.statusDetail,
    hasCheckedIn: computedStatus.hasCheckedIn,
    hasWaitlist: computedStatus.hasWaitlist,
    hasPendingConfirmation: computedStatus.hasPendingConfirmation,
    engagedEventIds: registration.registrationEvents.map((entry) => entry.eventId),
    waitlistEventIds: registration.registrationEvents
      .filter((entry) => entry.status === RegistrationEventStatus.WAITLISTED)
      .map((entry) => entry.eventId),
    checkedDayKeys: Array.from(
      new Set(
        registration.registrationEvents
          .filter(
            (entry) =>
              entry.checkIn !== null ||
              entry.status === RegistrationEventStatus.CHECKED_IN,
          )
          .map((entry) => entry.event.startAt.toISOString().slice(0, 10)),
      ),
    ),
    registrationEventIdsByDay: registration.registrationEvents.reduce<
      Record<string, string[]>
    >((acc, entry) => {
      const dayKey = entry.event.startAt.toISOString().slice(0, 10);
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(entry.id);
      return acc;
    }, {}),
    createdAt: registration.createdAt.toISOString(),
  };
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
    select: adminPlayerRegistrationSelect,
  });

  return registrations.map((registration) => mapAdminPlayerRow(registration));
}

export async function getRecentAdminPlayers(
  tournamentId: string,
  searchQuery?: string,
  limit = 30,
): Promise<AdminPlayerRow[]> {
  const registrations = await prisma.tournamentRegistration.findMany({
    where: buildAdminPlayerSearchWhere(tournamentId, searchQuery),
    orderBy: [{ createdAt: "desc" }],
    take: limit,
    select: adminPlayerRegistrationSelect,
  });

  return registrations.map((registration) => mapAdminPlayerRow(registration));
}

export async function getAdminRegistrationsOverview(
  tournamentId: string,
): Promise<AdminRegistrationsOverview> {
  const [
    playerDossiers,
    pendingDossiers,
    activeEngagements,
    checkedEngagements,
    waitlistEntries,
  ] = await Promise.all([
    prisma.tournamentRegistration.count({
      where: { tournamentId },
    }),
    prisma.tournamentRegistration.count({
      where: {
        tournamentId,
        status: RegistrationStatus.PENDING,
      },
    }),
    prisma.tournamentRegistrationEvent.count({
      where: {
        event: {
          tournamentId,
        },
        status: {
          in: [
            RegistrationEventStatus.REGISTERED,
            RegistrationEventStatus.CHECKED_IN,
            RegistrationEventStatus.NO_SHOW,
            RegistrationEventStatus.FORFEIT,
          ],
        },
      },
    }),
    prisma.tournamentRegistrationEvent.count({
      where: {
        event: {
          tournamentId,
        },
        status: RegistrationEventStatus.CHECKED_IN,
      },
    }),
    prisma.tournamentRegistrationEvent.count({
      where: {
        event: {
          tournamentId,
        },
        status: RegistrationEventStatus.WAITLISTED,
      },
    }),
  ]);

  return {
    playerDossiers,
    pendingDossiers,
    activeEngagements,
    checkedEngagements,
    waitlistEntries,
  };
}

export async function getAdminPaymentGroups(tournamentId: string): Promise<AdminPaymentGroupRow[]> {
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId },
    select: {
      id: true,
      tournamentId: true,
      contactEmail: true,
      contactPhone: true,
      paidAmountCents: true,
      notes: true,
      player: {
        select: {
          nom: true,
          prenom: true,
          ownerId: true,
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
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
    const groupKey = getPaymentGroupKey(registration);
    const payerInfo = getPaymentPayerInfo(registration);

    const totalAmountDueCents = registration.registrationEvents.reduce(
      (acc, eventEntry) => acc + eventEntry.event.feeOnlineCents,
      0,
    );
    const paymentsPaidCents = getRecordedPaidCents(registration.payments);
    const hasRecordedPayments = registration.payments.length > 0;
    const hasPaymentMismatch =
      hasRecordedPayments && registration.paidAmountCents !== paymentsPaidCents;
    const effectivePaidCents = hasRecordedPayments
      ? paymentsPaidCents
      : registration.paidAmountCents;
    const totalPendingCents = Math.max(
      totalAmountDueCents - effectivePaidCents,
      0,
    );

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        groupKey,
        payerName: payerInfo.name,
        payerEmail: payerInfo.email,
        payerPhone: payerInfo.phone,
        payerLabel: buildPayerLabel(payerInfo.email, payerInfo.phone),
        registrations: 0,
        players: [],
        totalAmountDueCents: 0,
        totalPaidCents: 0,
        totalPendingCents: 0,
        paymentStatus: "EN ATTENTE",
        note: registration.notes?.trim() || null,
        noteMismatch: false,
      });
    }

    const group = groups.get(groupKey)!;
    group.registrations += 1;
    group.players.push(`${registration.player.prenom} ${registration.player.nom}`.trim());
    group.totalAmountDueCents += totalAmountDueCents;
    group.totalPaidCents += effectivePaidCents;
    group.totalPendingCents += totalPendingCents;
    if (hasPaymentMismatch) {
      group.hasPaymentMismatch = true;
    }
    const registrationNote = registration.notes?.trim() || null;
    if (registrationNote) {
      if (!group.note) {
        group.note = registrationNote;
      } else if (group.note !== registrationNote) {
        group.noteMismatch = true;
      }
    }
  }

  const rows = Array.from(groups.values()).map((group) => {
    const paymentStatus = getPaymentStatusFromAmounts(
      group.totalAmountDueCents,
      group.totalPaidCents,
    );

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







