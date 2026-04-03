import { type TournamentStatus } from "@prisma/client";

type TournamentRegistrationWindow = {
  status: TournamentStatus;
  registrationOpenAt: Date | null;
  registrationCloseAt: Date | null;
};

export type TournamentRegistrationState =
  | "UNAVAILABLE"
  | "UPCOMING"
  | "OPEN"
  | "CLOSED";

export type TournamentRegistrationStatus = {
  state: TournamentRegistrationState;
  canRegister: boolean;
  label: string;
  message: string;
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: Date) {
  return DATE_TIME_FORMATTER.format(value);
}

export function getTournamentRegistrationStatus(
  tournament: TournamentRegistrationWindow | null | undefined,
  now = new Date(),
): TournamentRegistrationStatus {
  if (!tournament || tournament.status !== "PUBLISHED") {
    return {
      state: "UNAVAILABLE",
      canRegister: false,
      label: "Inscriptions indisponibles",
      message: "Aucun tournoi publie n'est disponible pour le moment.",
    };
  }

  const { registrationOpenAt, registrationCloseAt } = tournament;

  if (!registrationOpenAt || !registrationCloseAt) {
    return {
      state: "UNAVAILABLE",
      canRegister: false,
      label: "Dates a confirmer",
      message: "Les dates d'inscription n'ont pas encore ete confirmees.",
    };
  }

  if (now < registrationOpenAt) {
    return {
      state: "UPCOMING",
      canRegister: false,
      label: "Inscriptions a venir",
      message: `Les inscriptions ouvriront le ${formatDateTime(registrationOpenAt)}.`,
    };
  }

  if (now > registrationCloseAt) {
    return {
      state: "CLOSED",
      canRegister: false,
      label: "Inscriptions fermees",
      message: `Les inscriptions sont closes depuis le ${formatDateTime(registrationCloseAt)}.`,
    };
  }

  return {
    state: "OPEN",
    canRegister: true,
    label: "Inscriptions ouvertes",
    message: `Les inscriptions sont ouvertes jusqu'au ${formatDateTime(registrationCloseAt)}.`,
  };
}
