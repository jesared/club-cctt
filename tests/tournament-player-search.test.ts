import { describe, expect, it } from "vitest";
import { getPlayerSearchTerms, scorePlayerSearch } from "../app/admin/tournoi/player-search";

const player = { name: "Thomas Hocquéloux", club: "Châlons TT", licence: "5110051" };
const score = (query: string) => scorePlayerSearch(getPlayerSearchTerms(query), player);

describe("recherche des inscrits", () => {
  it.each(["hoq", "hocqueloux thomas", "Thomas Hocquéloux", "chalons 5110051", "5110051"])(
    "retrouve le joueur avec %s",
    (query) => expect(score(query)).not.toBeNull(),
  );

  it("classe un préfixe exact devant un préfixe approximatif", () => {
    expect(score("hoq")).toBeLessThan(scorePlayerSearch(getPlayerSearchTerms("hoq"), {
      ...player, name: "Thomas Hoquet",
    })!);
  });

  it("écarte un nom sans rapport et une licence mal saisie", () => {
    expect(score("Thomas Durand")).toBeNull();
    expect(score("5110052")).toBeNull();
  });
});
