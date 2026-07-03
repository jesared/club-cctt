import { createHash, createHmac } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const DEFAULT_FFTT_API_BASE_URL = "https://apiv2.fftt.com/mobile/pxml";
const DEFAULT_FFTT_LICENSE_ENDPOINT = "xml_licence_b.php";
const DEFAULT_FFTT_CLUB_PLAYERS_ENDPOINT = "xml_liste_joueur_o.php";
const DEFAULT_FFTT_CLUB_TEAMS_ENDPOINT = "xml_equipe.php";
const DEFAULT_FFTT_TEAM_RESULTS_ENDPOINT = "xml_result_equ.php";
const DEFAULT_FFTT_CLUB_PARAM = "club";

type FfttConfig = {
  baseUrl: string;
  licenseEndpoint: string;
  clubPlayersEndpoint: string;
  clubTeamsEndpoint: string;
  teamResultsEndpoint: string;
  clubParam: string;
  appId: string;
  appKey: string;
  serial: string;
  idRel: string;
};

export type FfttPlayer = {
  licence: string;
  nom: string;
  prenom: string;
  points: number | null;
  club: string;
  gender: string;
  licenseType: string;
};

export type FfttClubMember = FfttPlayer & {
  category: string;
};

export type FfttClubTeam = {
  eventId: string;
  eventName: string;
  teamId: string;
  teamName: string;
  divisionName: string;
  divisionLink: string;
};

export type FfttTeamMatch = {
  label: string;
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
  plannedDate: string;
  playedDate: string;
  meetingId: string;
  isHome: boolean | null;
  isWin: boolean | null;
};

export type FfttClubTeamResults = FfttClubTeam & {
  matches: FfttTeamMatch[];
};

export type FfttPlayerLookupResult =
  | { ok: true; player: FfttPlayer }
  | {
      ok: false;
      reason: "not-configured" | "not-found" | "upstream-error";
      message: string;
    };

export type FfttClubMembersLookupResult =
  | { ok: true; members: FfttClubMember[] }
  | {
      ok: false;
      reason: "not-configured" | "not-found" | "upstream-error";
      message: string;
    };

export type FfttClubTeamResultsLookupResult =
  | { ok: true; teams: FfttClubTeamResults[] }
  | {
      ok: false;
      reason: "not-configured" | "not-found" | "upstream-error";
      message: string;
    };

const parser = new XMLParser({
  attributeNamePrefix: "",
  ignoreAttributes: false,
  parseTagValue: false,
  trimValues: true,
});

function getFfttConfig(): FfttConfig | null {
  const appId = process.env.FFTT_API_ID?.trim() ?? "";
  const appKey = process.env.FFTT_API_KEY?.trim() ?? "";
  const serial = process.env.FFTT_API_SERIAL?.trim() ?? "";
  const idRel = process.env.FFTT_API_ID_REL?.trim() ?? "";

  if (!appId || !appKey || !serial) {
    return null;
  }

  return {
    appId,
    appKey,
    serial,
    idRel,
    baseUrl: process.env.FFTT_API_BASE_URL?.trim() || DEFAULT_FFTT_API_BASE_URL,
    licenseEndpoint:
      process.env.FFTT_API_LICENSE_ENDPOINT?.trim() ||
      DEFAULT_FFTT_LICENSE_ENDPOINT,
    clubPlayersEndpoint:
      process.env.FFTT_API_CLUB_PLAYERS_ENDPOINT?.trim() ||
      DEFAULT_FFTT_CLUB_PLAYERS_ENDPOINT,
    clubTeamsEndpoint:
      process.env.FFTT_API_CLUB_TEAMS_ENDPOINT?.trim() ||
      DEFAULT_FFTT_CLUB_TEAMS_ENDPOINT,
    teamResultsEndpoint:
      process.env.FFTT_API_TEAM_RESULTS_ENDPOINT?.trim() ||
      DEFAULT_FFTT_TEAM_RESULTS_ENDPOINT,
    clubParam:
      process.env.FFTT_API_CLUB_PARAM?.trim() || DEFAULT_FFTT_CLUB_PARAM,
  };
}

export function isFfttConfigured() {
  return getFfttConfig() !== null;
}

function buildSignedFfttUrl(config: FfttConfig, endpoint: string) {
  const tm = Date.now().toString();
  const signatureKey = getSignatureKey(config.appKey);
  const tmc = createHmac("sha1", signatureKey).update(tm).digest("hex");
  const url = new URL(`${config.baseUrl.replace(/\/$/, "")}/${endpoint}`);

  url.searchParams.set("serie", config.serial);
  url.searchParams.set("tm", tm);
  url.searchParams.set("tmc", tmc);
  url.searchParams.set("id", config.appId);

  if (config.idRel) {
    url.searchParams.set("idRel", config.idRel);
  }

  return url;
}

function buildLicenseUrl(config: FfttConfig, licence: string) {
  const url = buildSignedFfttUrl(config, config.licenseEndpoint);

  url.searchParams.set("licence", licence);

  return url;
}

function buildClubPlayersUrl(config: FfttConfig, clubNumber: string) {
  const url = buildSignedFfttUrl(config, config.clubPlayersEndpoint);

  url.searchParams.set(config.clubParam, clubNumber);

  return url;
}

function buildClubTeamsUrl(config: FfttConfig, clubNumber: string) {
  const url = buildSignedFfttUrl(config, config.clubTeamsEndpoint);

  url.searchParams.set("numclu", clubNumber);

  return url;
}

function buildTeamResultsUrl(
  config: FfttConfig,
  divisionParams: Record<string, string>,
) {
  const url = buildSignedFfttUrl(config, config.teamResultsEndpoint);

  for (const [key, value] of Object.entries(divisionParams)) {
    url.searchParams.set(key, value);
  }

  return url;
}

function getSignatureKey(appKey: string) {
  if (/^[a-f0-9]{32}$/i.test(appKey)) {
    return appKey.toLowerCase();
  }

  return createHash("md5").update(appKey).digest("hex");
}

async function readFfttXml(response: Response) {
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const headerPreview = new TextDecoder("utf-8")
    .decode(bytes.slice(0, 256))
    .replace(/\0/g, "");
  const declaredEncoding =
    headerPreview.match(/encoding=["']([^"']+)["']/i)?.[1] ??
    contentType.match(/charset=([^;\s]+)/i)?.[1] ??
    "utf-8";

  try {
    return new TextDecoder(declaredEncoding).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function collectRecords(value: unknown): Record<string, unknown>[] {
  const record = asRecord(value);

  if (!record) {
    return [];
  }

  const records: Record<string, unknown>[] = [];

  if (
    Object.values(record).some(
      (entry) => typeof entry === "string" || typeof entry === "number",
    )
  ) {
    records.push(record);
  }

  for (const entry of Object.values(record)) {
    if (Array.isArray(entry)) {
      for (const item of entry) {
        records.push(...collectRecords(item));
      }
    } else {
      records.push(...collectRecords(entry));
    }
  }

  return records;
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return value.toString();
    }
  }

  return "";
}

function getPoints(record: Record<string, unknown>) {
  const pointsValue = getString(record, [
    "points",
    "point",
    "clast",
    "classement",
    "pointsMensuels",
  ]);
  const numericPoints = Number.parseInt(pointsValue, 10);

  return Number.isNaN(numericPoints) ? null : numericPoints;
}

function normalizeGender(value: string) {
  const normalizedValue = value.trim().toUpperCase();

  if (normalizedValue.startsWith("F")) {
    return "F";
  }

  if (normalizedValue.startsWith("M")) {
    return "M";
  }

  return "";
}

function normalizeFfttPlayer(
  record: Record<string, unknown>,
  licence: string,
): FfttPlayer | null {
  const nom = getString(record, ["nom", "lastName", "lastname"]);
  const prenom = getString(record, ["prenom", "firstName", "firstname"]);

  if (!nom || !prenom) {
    return null;
  }

  return {
    licence: getString(record, ["licence", "numlic", "idlicence"]) || licence,
    nom,
    prenom,
    points: getPoints(record),
    club: getString(record, ["club", "nomclub", "libelleclub", "clu_nom"]),
    gender: normalizeGender(getString(record, ["sexe", "genre", "gender"])),
    licenseType: getString(record, ["type", "typelic", "lictype"]),
  };
}

function normalizeFfttClubMember(
  record: Record<string, unknown>,
): FfttClubMember | null {
  const licence = getString(record, ["licence", "numlic", "idlicence"]);
  const nom = getString(record, ["nom", "lastName", "lastname"]);
  const prenom = getString(record, ["prenom", "firstName", "firstname"]);

  if (!licence || !nom || !prenom) {
    return null;
  }

  return {
    licence,
    nom,
    prenom,
    points: getPoints(record),
    club: getString(record, ["club", "nomclub", "libelleclub", "clu_nom"]),
    gender: normalizeGender(getString(record, ["sexe", "genre", "gender"])),
    licenseType: getString(record, ["type", "typelic", "lictype"]),
    category: getString(record, [
      "cat",
      "cat" + "egorie",
      "category",
      "type",
      "validation",
    ]),
  };
}

function normalizeTextForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+-\s+phase\s+\d+$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function parseQueryString(value: string) {
  return Object.fromEntries(new URLSearchParams(value));
}

function normalizeFfttClubTeam(record: Record<string, unknown>) {
  const teamName = getString(record, [
    "libequipe",
    "equ" + "ipe",
    "teamName",
  ]);
  const divisionLink = getString(record, ["liendivision", "lien"]);

  if (!teamName || !divisionLink) {
    return null;
  }

  return {
    eventId: getString(record, ["idepr", "eventId"]),
    eventName: getString(record, ["libepr", "eventName"]),
    teamId: getString(record, ["idequipe", "teamId"]),
    teamName,
    divisionName: getString(record, ["libdivision", "divisionName"]),
    divisionLink,
  } satisfies FfttClubTeam;
}

function normalizeFfttTeamMatch(
  record: Record<string, unknown>,
  clubNumber: string,
  teamName: string,
) {
  const teamA = getString(record, ["equa", "teamA"]);
  const teamB = getString(record, ["equb", "teamB"]);
  const scoreA = getString(record, ["scorea", "scoreA"]);
  const scoreB = getString(record, ["scoreb", "scoreB"]);
  const link = getString(record, ["lien", "link"]);
  const linkParams = parseQueryString(link);
  const normalizedClubNumber = clubNumber.trim();
  const normalizedTeamName = normalizeTextForComparison(teamName);
  const normalizedTeamA = normalizeTextForComparison(teamA);
  const normalizedTeamB = normalizeTextForComparison(teamB);
  const clubIsTeamA =
    linkParams.clubnum_1 === normalizedClubNumber ||
    normalizedTeamA === normalizedTeamName;
  const clubIsTeamB =
    linkParams.clubnum_2 === normalizedClubNumber ||
    normalizedTeamB === normalizedTeamName;

  if (!teamA || !teamB || (!clubIsTeamA && !clubIsTeamB)) {
    return null;
  }

  const numericScoreA = Number.parseInt(scoreA, 10);
  const numericScoreB = Number.parseInt(scoreB, 10);
  const hasScore =
    !Number.isNaN(numericScoreA) && !Number.isNaN(numericScoreB);
  const clubScore = clubIsTeamA ? numericScoreA : numericScoreB;
  const opponentScore = clubIsTeamA ? numericScoreB : numericScoreA;

  return {
    label: getString(record, ["libelle", "label"]),
    teamA,
    teamB,
    scoreA,
    scoreB,
    plannedDate: getString(record, ["dateprevue", "plannedDate"]),
    playedDate: getString(record, ["datereelle", "playedDate"]),
    meetingId: linkParams.renc_id ?? "",
    isHome: clubIsTeamA ? true : clubIsTeamB ? false : null,
    isWin: hasScore ? clubScore > opponentScore : null,
  } satisfies FfttTeamMatch;
}

async function fetchFfttTeamResults(
  config: FfttConfig,
  clubNumber: string,
  team: FfttClubTeam,
) {
  const response = await fetch(
    buildTeamResultsUrl(config, parseQueryString(team.divisionLink)),
    {
      headers: {
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 60 * 30 },
    },
  );

  if (!response.ok) {
    return [];
  }

  const xml = await readFfttXml(response);
  const parsed = parser.parse(xml);

  return collectRecords(parsed)
    .map((record) => normalizeFfttTeamMatch(record, clubNumber, team.teamName))
    .filter((entry): entry is FfttTeamMatch => entry !== null);
}

async function fetchFfttClubMemberDetailsByLicense(
  config: FfttConfig,
  licence: string,
) {
  const response = await fetch(buildLicenseUrl(config, licence), {
    cache: "no-store",
    headers: {
      Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    return null;
  }

  const xml = await readFfttXml(response);
  const parsed = parser.parse(xml);

  return (
    collectRecords(parsed)
      .map((record) => normalizeFfttClubMember(record))
      .find((entry): entry is FfttClubMember => entry !== null) ?? null
  );
}

async function enrichFfttClubMembersWithLicenseDetails(
  config: FfttConfig,
  members: FfttClubMember[],
) {
  const detailsByLicense = new Map<string, FfttClubMember>();
  const concurrency = 8;
  let cursor = 0;

  async function worker() {
    while (cursor < members.length) {
      const member = members[cursor];
      cursor += 1;

      const detail = await fetchFfttClubMemberDetailsByLicense(
        config,
        member.licence,
      ).catch(() => null);

      if (detail) {
        detailsByLicense.set(member.licence, detail);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, members.length) }, () =>
      worker(),
    ),
  );

  return members.map((member) => ({
    ...member,
    ...(detailsByLicense.get(member.licence) ?? {}),
  }));
}

export async function fetchFfttPlayerByLicense(
  licence: string,
): Promise<FfttPlayerLookupResult> {
  const config = getFfttConfig();

  if (!config) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "API FFTT non configuree. Ajoutez FFTT_API_ID, FFTT_API_KEY et FFTT_API_SERIAL.",
    };
  }

  try {
    const response = await fetch(buildLicenseUrl(config, licence), {
      cache: "no-store",
      headers: {
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "upstream-error",
        message: `La FFTT a repondu avec le statut ${response.status}.`,
      };
    }

    const xml = await readFfttXml(response);
    const parsed = parser.parse(xml);
    const player =
      collectRecords(parsed)
        .map((record) => normalizeFfttPlayer(record, licence))
        .find((entry): entry is FfttPlayer => entry !== null) ?? null;

    if (!player) {
      return {
        ok: false,
        reason: "not-found",
        message: "Aucun licencie FFTT trouve pour cette licence.",
      };
    }

    return { ok: true, player };
  } catch {
    return {
      ok: false,
      reason: "upstream-error",
      message: "Impossible de joindre l'API FFTT pour le moment.",
    };
  }
}

export async function fetchFfttClubMembers(
  clubNumber: string,
): Promise<FfttClubMembersLookupResult> {
  const config = getFfttConfig();

  if (!config) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "API FFTT non configuree. Ajoutez FFTT_API_ID, FFTT_API_KEY et FFTT_API_SERIAL.",
    };
  }

  try {
    const response = await fetch(buildClubPlayersUrl(config, clubNumber), {
      cache: "no-store",
      headers: {
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "upstream-error",
        message: `La FFTT a repondu avec le statut ${response.status}.`,
      };
    }

    const xml = await readFfttXml(response);
    const parsed = parser.parse(xml);
    const membersByLicense = new Map<string, FfttClubMember>();

    for (const record of collectRecords(parsed)) {
      const member = normalizeFfttClubMember(record);
      if (member) {
        membersByLicense.set(member.licence, member);
      }
    }

    const members = (
      await enrichFfttClubMembersWithLicenseDetails(
        config,
        Array.from(membersByLicense.values()),
      )
    ).sort((a, b) => {
      const nomCompare = a.nom.localeCompare(b.nom, "fr");
      return nomCompare || a.prenom.localeCompare(b.prenom, "fr");
    });

    if (members.length === 0) {
      return {
        ok: false,
        reason: "not-found",
        message: "Aucun licencie FFTT trouve pour ce club.",
      };
    }

    return { ok: true, members };
  } catch {
    return {
      ok: false,
      reason: "upstream-error",
      message: "Impossible de joindre l'API FFTT pour le moment.",
    };
  }
}

export async function fetchFfttClubTeamResults(
  clubNumber: string,
): Promise<FfttClubTeamResultsLookupResult> {
  const config = getFfttConfig();

  if (!config) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "API FFTT non configuree. Ajoutez FFTT_API_ID, FFTT_API_KEY et FFTT_API_SERIAL.",
    };
  }

  try {
    const response = await fetch(buildClubTeamsUrl(config, clubNumber), {
      headers: {
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      return {
        ok: false,
        reason: "upstream-error",
        message: `La FFTT a repondu avec le statut ${response.status}.`,
      };
    }

    const xml = await readFfttXml(response);
    const parsed = parser.parse(xml);
    const teamsByDivisionLink = new Map<string, FfttClubTeam>();

    for (const record of collectRecords(parsed)) {
      const team = normalizeFfttClubTeam(record);

      if (team) {
        teamsByDivisionLink.set(team.divisionLink, team);
      }
    }

    const teams = await Promise.all(
      Array.from(teamsByDivisionLink.values()).map(async (team) => ({
        ...team,
        matches: await fetchFfttTeamResults(config, clubNumber, team),
      })),
    );

    const teamsWithMatches = teams
      .filter((team) => team.matches.length > 0)
      .sort((a, b) => {
        const eventCompare = a.eventName.localeCompare(b.eventName, "fr");
        return eventCompare || a.teamName.localeCompare(b.teamName, "fr");
      });

    if (teamsWithMatches.length === 0) {
      return {
        ok: false,
        reason: "not-found",
        message: "Aucun résultat FFTT trouvé pour les équipes du club.",
      };
    }

    return { ok: true, teams: teamsWithMatches };
  } catch {
    return {
      ok: false,
      reason: "upstream-error",
      message: "Impossible de joindre l'API FFTT pour le moment.",
    };
  }
}
