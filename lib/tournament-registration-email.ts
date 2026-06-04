import { RegistrationEventStatus } from "@prisma/client";

import type { NormalizedRegistrationPayload } from "./tournament-registration-validation";

export type RegistrationEmailEvent = {
  code: string;
  label: string;
  startAt: Date;
  feeOnlineCents: number;
  status: RegistrationEventStatus;
};

export type RegistrationEmailContext = {
  tournamentName: string;
  tournamentContactEmail: string;
  selectedEvents: RegistrationEmailEvent[];
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function formatAmount(cents: number) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function buildEventLines(selectedEvents: RegistrationEmailEvent[]) {
  return selectedEvents.map((event) => {
    const waitlistSuffix =
      event.status === RegistrationEventStatus.WAITLISTED
        ? " (liste d'attente)"
        : "";

    return `- ${event.code} - ${event.label} - ${formatDateTime(event.startAt)} - ${formatAmount(event.feeOnlineCents)}${waitlistSuffix}`;
  });
}

export function buildTournamentRegistrationAdminText(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  return [
    `Nouvelle inscription tournoi - ${context.tournamentName}`,
    "",
    `Nom: ${payload.lastName}`,
    `Prenom: ${payload.firstName}`,
    `Email: ${payload.email}`,
    `Telephone: ${payload.phone}`,
    `No licence: ${payload.licenseNumber}`,
    `Points: ${payload.points || "Non renseigne"}`,
    `Genre: ${payload.gender || "Non renseigne"}`,
    `Club: ${payload.club}`,
    "",
    "Tableaux demandes:",
    ...buildEventLines(context.selectedEvents),
    "",
    `Liste d'attente: ${payload.waitlistTables.join(", ") || "Aucune"}`,
  ].join("\n");
}

export function buildTournamentRegistrationPlayerText(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  const waitlistedEvents = context.selectedEvents.filter(
    (event) => event.status === RegistrationEventStatus.WAITLISTED,
  );

  return [
    `Bonjour ${payload.firstName},`,
    "",
    `Votre demande d'inscription au ${context.tournamentName} a bien ete enregistree.`,
    "",
    "Recapitulatif:",
    `- Joueur: ${payload.firstName} ${payload.lastName}`,
    `- Licence: ${payload.licenseNumber}`,
    `- Club: ${payload.club}`,
    `- Points: ${payload.points}`,
    "",
    "Tableaux:",
    ...buildEventLines(context.selectedEvents),
    "",
    waitlistedEvents.length > 0
      ? `Attention: vous etes actuellement sur liste d'attente pour ${waitlistedEvents.map((event) => event.code).join(", ")}.`
      : "Tous les tableaux demandes sont bien enregistres.",
    "",
    "Conservez ce message jusqu'au tournoi.",
    `Pour toute question, contactez l'organisation: ${context.tournamentContactEmail}`,
  ].join("\n");
}
