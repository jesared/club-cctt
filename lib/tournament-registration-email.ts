import { RegistrationEventStatus } from "@prisma/client";

import { renderEmailTemplate } from "./email-template";
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
    timeZone: "Europe/Paris",
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
    `Votre demande d'inscription au ${context.tournamentName} a bien été enregistree.`,
    "",
    "Récapitulatif:",
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

function buildEventSummary(selectedEvents: RegistrationEmailEvent[]) {
  return selectedEvents
    .map(
      (event) =>
        `${event.code} - ${event.label} - ${formatDateTime(event.startAt)} - ${formatAmount(event.feeOnlineCents)}${
          event.status === RegistrationEventStatus.WAITLISTED
            ? " - liste d'attente"
            : ""
        }`,
    )
    .join("\n");
}

export function buildTournamentRegistrationAdminHtml(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  return renderEmailTemplate({
    eyebrow: "Nouvelle inscription tournoi",
    title: `${payload.firstName} ${payload.lastName}`,
    intro: `Une nouvelle demande vient d'être déposée pour ${context.tournamentName}.`,
    infoTitle: "Coordonnées joueur",
    infoItems: [
      { label: "Nom", value: payload.lastName },
      { label: "Prénom", value: payload.firstName },
      { label: "Email", value: payload.email },
      { label: "Téléphone", value: payload.phone },
      { label: "Licence", value: payload.licenseNumber },
      { label: "Points", value: payload.points || "Non renseigné" },
      { label: "Genre", value: payload.gender || "Non renseigné" },
      { label: "Club", value: payload.club },
      { label: "Tableaux", value: buildEventSummary(context.selectedEvents) },
      {
        label: "Liste d'attente",
        value: payload.waitlistTables.join(", ") || "Aucune",
      },
    ],
  });
}

export function buildTournamentRegistrationPlayerHtml(
  payload: NormalizedRegistrationPayload,
  context: RegistrationEmailContext,
) {
  const waitlistedEvents = context.selectedEvents.filter(
    (event) => event.status === RegistrationEventStatus.WAITLISTED,
  );
  const waitlistCodes = waitlistedEvents.map((event) => event.code).join(", ");

  return renderEmailTemplate({
    eyebrow: "Confirmation d'inscription",
    title: `Inscription reçue, ${payload.firstName}`,
    intro: `Votre demande d'inscription au ${context.tournamentName} a bien été enregistrée.`,
    body: "Conservez ce message jusqu'au tournoi. L'organisation reviendra vers vous si une information doit être complétée.",
    infoTitle: "Récapitulatif",
    infoItems: [
      { label: "Joueur", value: `${payload.firstName} ${payload.lastName}` },
      { label: "Licence", value: payload.licenseNumber },
      { label: "Club", value: payload.club },
      { label: "Points", value: payload.points || "Non renseigné" },
      { label: "Tableaux", value: buildEventSummary(context.selectedEvents) },
    ],
    note:
      waitlistedEvents.length > 0
        ? `Vous êtes actuellement sur liste d'attente pour ${waitlistCodes}.`
        : "Tous les tableaux demandés sont bien enregistrés.",
    footer: `Pour toute question, contactez l'organisation : ${context.tournamentContactEmail}`,
  });
}
