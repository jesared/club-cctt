import { RegistrationEventStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  buildTournamentRegistrationAdminText,
  buildTournamentRegistrationPlayerText,
} from "../lib/tournament-registration-email";

const payload = {
  firstName: "Lina",
  lastName: "Martin",
  email: "lina@example.com",
  phone: "0612345678",
  licenseNumber: "123456",
  points: "845",
  pointsNumber: 845,
  gender: "F",
  club: "CCTT",
  tables: ["F500", "OPEN"],
  waitlistTables: ["OPEN"],
  website: "",
};

const context = {
  tournamentName: "Tournoi National de Paques 2027",
  tournamentContactEmail: "inscriptions-tournoi@cctt.fr",
  selectedEvents: [
    {
      code: "F500",
      label: "Tableau 500 a 899 pts",
      startAt: new Date("2027-04-03T09:30:00.000Z"),
      feeOnlineCents: 900,
      status: RegistrationEventStatus.REGISTERED,
    },
    {
      code: "OPEN",
      label: "Toutes catégories",
      startAt: new Date("2027-04-03T13:30:00.000Z"),
      feeOnlineCents: 1100,
      status: RegistrationEventStatus.WAITLISTED,
    },
  ],
};

describe("tournament registration email builders", () => {
  it("builds admin summary text with event details", () => {
    const text = buildTournamentRegistrationAdminText(payload, context);

    expect(text).toContain("Nouvelle inscription tournoi");
    expect(text).toContain("Lina");
    expect(text).toContain("OPEN");
    expect(text).toContain("Liste d'attente: OPEN");
  });

  it("builds player confirmation text with waitlist notice", () => {
    const text = buildTournamentRegistrationPlayerText(payload, context);

    expect(text).toContain("Bonjour Lina");
    expect(text).toContain("Votre demande d'inscription");
    expect(text).toContain("liste d'attente");
    expect(text).toContain("inscriptions-tournoi@cctt.fr");
  });
});
