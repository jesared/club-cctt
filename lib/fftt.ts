import { createHash, createHmac } from "crypto";
import { XMLParser } from "fast-xml-parser";

const DEFAULT_FFTT_API_URL = "http://www.fftt.com/mobile/pxml/xml_licence_b.php";

type FFTTRawPlayer = {
  idlicence?: string;
  nom?: string;
  prenom?: string;
  licence?: string;
  numclub?: string;
  nomclub?: string;
  sexe?: string;
  type?: string;
  certif?: string;
  validation?: string;
  echelon?: string;
  place?: string;
  point?: string;
  cat?: string;
  pointm?: string;
  apointm?: string;
  initm?: string;
  mutation?: string;
};

export type FFTTPlayer = {
  licence: string;
  firstName: string;
  lastName: string;
  fullName: string;
  clubId?: string;
  club?: string;
  gender?: string;
  licenceType?: string;
  certificate?: string;
  validationDate?: string;
  echelon?: string;
  place?: string;
  points?: number;
  category?: string;
  monthlyPoints?: number;
  previousMonthlyPoints?: number;
  initialValue?: number;
  mutationDate?: string;
  ranking?: string;
  idLicence?: string;
  raw: unknown;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function readString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function toNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(",", ".").trim();
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function nowTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  const ms = String(now.getMilliseconds()).padStart(3, "0");

  return `${yyyy}${mm}${dd}${hh}${min}${sec}${ms}`;
}

function encryptTimestamp(timestamp: string, password: string) {
  const md5Password = createHash("md5").update(password, "utf8").digest("hex").toLowerCase();

  return createHmac("sha1", md5Password).update(timestamp, "utf8").digest("hex").toLowerCase();
}

function findFFTTPlayerNodes(node: unknown, collected: FFTTRawPlayer[] = []) {
  if (Array.isArray(node)) {
    for (const child of node) {
      findFFTTPlayerNodes(child, collected);
    }

    return collected;
  }

  if (!node || typeof node !== "object") {
    return collected;
  }

  const record = node as Record<string, unknown>;
  const hasPlayerShape =
    typeof record.nom !== "undefined" ||
    typeof record.prenom !== "undefined" ||
    typeof record.licence !== "undefined" ||
    typeof record.idlicence !== "undefined";

  if (hasPlayerShape) {
    collected.push(record as FFTTRawPlayer);
  }

  for (const value of Object.values(record)) {
    findFFTTPlayerNodes(value, collected);
  }

  return collected;
}

function normalizePlayer(raw: FFTTRawPlayer, askedLicence: string): FFTTPlayer | null {
  const lastName = raw.nom?.trim() ?? "";
  const firstName = raw.prenom?.trim() ?? "";
  const licence = raw.licence?.trim() || askedLicence;

  if (!licence || (!lastName && !firstName)) {
    return null;
  }

  return {
    licence,
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    idLicence: raw.idlicence?.trim() || undefined,
    clubId: raw.numclub?.trim() || undefined,
    club: raw.nomclub?.trim() || undefined,
    gender: raw.sexe?.trim() || undefined,
    licenceType: raw.type?.trim() || undefined,
    certificate: raw.certif?.trim() || undefined,
    validationDate: raw.validation?.trim() || undefined,
    echelon: raw.echelon?.trim() || undefined,
    place: raw.place?.trim() || undefined,
    points: toNumber(raw.point),
    ranking: raw.point?.trim() || undefined,
    category: raw.cat?.trim() || undefined,
    monthlyPoints: toNumber(raw.pointm),
    previousMonthlyPoints: toNumber(raw.apointm),
    initialValue: toNumber(raw.initm),
    mutationDate: raw.mutation?.trim() || undefined,
    raw,
  };
}

function parseXml(xml: string) {
  return new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true,
  }).parse(xml) as unknown;
}

export async function fetchFFTTPlayerByLicence(licence: string) {
  const serie = process.env.FFTT_API_SERIE;
  const appId = process.env.FFTT_API_ID;
  const password = process.env.FFTT_API_PASSWORD;
  const endpoint = process.env.FFTT_API_URL ?? DEFAULT_FFTT_API_URL;

  if (!serie || !appId || !password) {
    throw new Error("FFTT credentials are missing");
  }

  const tm = nowTimestamp();
  const tmc = encryptTimestamp(tm, password);

  const params = new URLSearchParams({
    serie,
    id: appId,
    tm,
    tmc,
    licence,
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  const rawBody = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: `FFTT API returned ${response.status}`,
      payload: rawBody,
    };
  }

  const payload = parseXml(rawBody);
  const nodes = findFFTTPlayerNodes(payload);

  if (nodes.length === 0) {
    return {
      ok: false,
      status: 404,
      error: "Aucun joueur trouvé dans la réponse FFTT",
      payload,
    };
  }

  const matchingNode =
    nodes.find((candidate) => String(candidate.licence ?? "").replace(/\s/g, "") === licence) ??
    nodes[0];

  const player = normalizePlayer(matchingNode, licence);

  if (!player) {
    return {
      ok: false,
      status: 404,
      error: "Réponse FFTT invalide pour ce joueur",
      payload,
    };
  }

  return {
    ok: true,
    status: 200,
    player,
    payload,
  };
}

export function healthFFTTConfig() {
  return {
    hasSerie: Boolean(process.env.FFTT_API_SERIE),
    hasId: Boolean(process.env.FFTT_API_ID),
    hasPassword: Boolean(process.env.FFTT_API_PASSWORD),
    hasCustomUrl: Boolean(process.env.FFTT_API_URL),
    endpoint: process.env.FFTT_API_URL ?? DEFAULT_FFTT_API_URL,
  };
}
