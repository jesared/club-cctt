import { describe, expect, it } from "vitest";

import {
  getContactFormAvailability,
  getTournamentRegistrationNotificationAvailability,
} from "../lib/public-form-availability";

describe("getContactFormAvailability", () => {
  it("marks contact form available with webhook delivery", () => {
    const availability = getContactFormAvailability({
      NODE_ENV: "test",
      CONTACT_WEBHOOK_URL: "https://example.com/webhook",
    });

    expect(availability).toEqual({
      isAvailable: true,
      message: "Le formulaire de contact est configure.",
      missing: [],
    });
  });

  it("marks contact form available with resend delivery", () => {
    const availability = getContactFormAvailability({
      NODE_ENV: "test",
      RESEND_API_KEY: "re_test",
      CONTACT_TO_EMAIL: "communication@cctt.fr",
    });

    expect(availability.isAvailable).toBe(true);
    expect(availability.missing).toEqual([]);
  });

  it("marks contact form unavailable without delivery config", () => {
    const availability = getContactFormAvailability({ NODE_ENV: "test" });

    expect(availability.isAvailable).toBe(false);
    expect(availability.missing).toContain(
      "ou RESEND_API_KEY + CONTACT_TO_EMAIL",
    );
  });
});

describe("getTournamentRegistrationNotificationAvailability", () => {
  it("marks tournament registrations available with webhook delivery", () => {
    const availability = getTournamentRegistrationNotificationAvailability({
      NODE_ENV: "test",
      TOURNAMENT_REGISTRATION_WEBHOOK_URL: "https://example.com/webhook",
    });

    expect(availability.isAvailable).toBe(true);
    expect(availability.missing).toEqual([]);
  });

  it("marks tournament registrations available with resend delivery", () => {
    const availability = getTournamentRegistrationNotificationAvailability({
      NODE_ENV: "test",
      RESEND_API_KEY: "re_test",
      TOURNAMENT_REGISTRATION_TO_EMAIL: "inscriptions-tournoi@cctt.fr",
    });

    expect(availability.isAvailable).toBe(true);
    expect(availability.missing).toEqual([]);
  });

  it("marks tournament registrations unavailable without delivery config", () => {
    const availability = getTournamentRegistrationNotificationAvailability({
      NODE_ENV: "test",
    });

    expect(availability.isAvailable).toBe(false);
    expect(availability.missing).toContain(
      "ou RESEND_API_KEY + TOURNAMENT_REGISTRATION_TO_EMAIL",
    );
  });
});
