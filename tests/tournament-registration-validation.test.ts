import { describe, expect, it } from "vitest";

import {
  getInvalidTables,
  validateAndNormalizeRegistration,
} from "../lib/tournament-registration-validation";

describe("validateAndNormalizeRegistration", () => {
  it("normalise les champs, déduplique les tableaux et filtre la liste d'attente", () => {
    const result = validateAndNormalizeRegistration({
      firstName: "  Lea ",
      lastName: " Martin  ",
      email: " lea@example.com ",
      phone: "0612345678",
      licenseNumber: "123456",
      points: "812",
      gender: " f ",
      club: " CCTT ",
      tables: ["a", " A ", "b", "c", "d", "e", "f", "g"],
      waitlistTables: ["f", "z", "A", "A"],
      website: "   ",
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        firstName: "Lea",
        lastName: "Martin",
        email: "lea@example.com",
        phone: "0612345678",
        licenseNumber: "123456",
        points: "812",
        pointsNumber: 812,
        gender: "F",
        club: "CCTT",
        tables: ["A", "B", "C", "D", "E", "F"],
        waitlistTables: ["F", "A"],
        website: "",
      },
    });
  });

  it("rejette un email invalide", () => {
    const result = validateAndNormalizeRegistration({
      firstName: "Lea",
      lastName: "Martin",
      email: "lea-at-example.com",
      phone: "0612345678",
      licenseNumber: "123456",
      points: "812",
      gender: "F",
      club: "CCTT",
      tables: ["A"],
    });

    expect(result).toEqual({
      ok: false,
      message: "Adresse email invalide.",
    });
  });

  it("rejette une inscription sans tableau", () => {
    const result = validateAndNormalizeRegistration({
      firstName: "Lea",
      lastName: "Martin",
      email: "lea@example.com",
      phone: "0612345678",
      licenseNumber: "123456",
      points: "812",
      gender: "F",
      club: "CCTT",
      tables: [],
    });

    expect(result).toEqual({
      ok: false,
      message: "Merci de selectionner au moins un tableau.",
    });
  });
});

describe("getInvalidTables", () => {
  it("retourne les tableaux incompatibles avec le genre ou le classement", () => {
    const invalidTables = getInvalidTables(
      [
        { code: "F500", gender: "F", minPoints: null, maxPoints: 700 },
        { code: "M900", gender: "M", minPoints: 700, maxPoints: 900 },
        { code: "OPEN", gender: "MIXED", minPoints: null, maxPoints: null },
      ],
      {
        firstName: "Lea",
        lastName: "Martin",
        email: "lea@example.com",
        phone: "0612345678",
        licenseNumber: "123456",
        points: "650",
        pointsNumber: 650,
        gender: "F",
        club: "CCTT",
        tables: ["F500", "M900", "OPEN"],
        waitlistTables: [],
        website: "",
      },
    );

    expect(invalidTables).toEqual(["M900"]);
  });
});
