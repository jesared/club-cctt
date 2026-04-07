import { createHash, createHmac } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const DEFAULT_FFTT_API_BASE_URL = "https://apiv2.fftt.com/mobile/pxml";
const DEFAULT_FFTT_LICENSE_ENDPOINT = "xml_licence_b.php";

type FfttConfig = {
  baseUrl: string;
  licenseEndpoint: string;
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
};

export type FfttPlayerLookupResult =
  | { ok: true; player: FfttPlayer }
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
  };
}

export function isFfttConfigured() {
  return getFfttConfig() !== null;
}

function buildFfttUrl(config: FfttConfig, licence: string) {
  const tm = Date.now().toString();
  const signatureKey = getSignatureKey(config.appKey);
  const tmc = createHmac("sha1", signatureKey).update(tm).digest("hex");
  const url = new URL(
    `${config.baseUrl.replace(/\/$/, "")}/${config.licenseEndpoint}`,
  );

  url.searchParams.set("serie", config.serial);
  url.searchParams.set("tm", tm);
  url.searchParams.set("tmc", tmc);
  url.searchParams.set("id", config.appId);

  if (config.idRel) {
    url.searchParams.set("idRel", config.idRel);
  }

  url.searchParams.set("licence", licence);

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
  };
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
    const response = await fetch(buildFfttUrl(config, licence), {
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
