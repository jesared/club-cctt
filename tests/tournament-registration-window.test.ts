import { describe, expect, it } from "vitest";

import { getTournamentRegistrationStatus } from "../lib/tournament-registration-window";

describe("getTournamentRegistrationStatus", () => {
  const now = new Date("2026-06-01T10:00:00.000Z");

  it("returns suspended when tournament is temporarily suspended", () => {
    const status = getTournamentRegistrationStatus(
      {
        status: "SUSPENDED",
        registrationOpenAt: new Date("2026-05-01T10:00:00.000Z"),
        registrationCloseAt: new Date("2026-06-15T10:00:00.000Z"),
      },
      now,
    );

    expect(status).toEqual({
      state: "SUSPENDED",
      canRegister: false,
      label: "Inscriptions suspendues",
      message:
        "Les inscriptions sont temporairement suspendues. Merci de revenir un peu plus tard.",
    });
  });

  it("returns open when tournament is published and inside the registration window", () => {
    const status = getTournamentRegistrationStatus(
      {
        status: "PUBLISHED",
        registrationOpenAt: new Date("2026-05-01T10:00:00.000Z"),
        registrationCloseAt: new Date("2026-06-15T10:00:00.000Z"),
      },
      now,
    );

    expect(status.state).toBe("OPEN");
    expect(status.canRegister).toBe(true);
  });
});
