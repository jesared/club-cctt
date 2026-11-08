import { describe, expect, it } from "vitest";

import {
  formatParisDateTimeInput,
  getParisDayKey,
  parseParisDateTimeInput,
} from "../lib/dates";

describe("Paris date helpers", () => {
  it("uses the next calendar day after midnight in Paris even when UTC is still on the previous day", () => {
    expect(getParisDayKey(new Date("2027-03-28T22:30:00Z"))).toBe("2027-03-29");
  });

  it("parses a summer datetime-local value as Paris time", () => {
    const date = parseParisDateTimeInput("2026-06-10T14:00");

    expect(date?.toISOString()).toBe("2026-06-10T12:00:00.000Z");
  });

  it("parses a winter datetime-local value as Paris time", () => {
    const date = parseParisDateTimeInput("2026-01-10T14:00");

    expect(date?.toISOString()).toBe("2026-01-10T13:00:00.000Z");
  });

  it("formats an UTC instant for datetime-local inputs in Paris time", () => {
    expect(formatParisDateTimeInput("2026-06-10T12:00:00.000Z")).toBe(
      "2026-06-10T14:00",
    );
  });
});
