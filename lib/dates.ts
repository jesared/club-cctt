export const APP_TIME_ZONE = "Europe/Paris";
export const APP_LOCALE = "fr-FR";

const DATE_TIME_INPUT_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const TIME_ZONE_PARTS_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getPartMap(date: Date, formatter: Intl.DateTimeFormat) {
  return Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
}

function getParisOffsetMs(date: Date) {
  const parts = getPartMap(date, TIME_ZONE_PARTS_FORMATTER);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

export function parseParisDateTimeInput(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null;

  const trimmed = value.trim();
  const localMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!localMatch) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, year, month, day, hour, minute, second = "00"] = localMatch;
  const localUtcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const firstGuess = new Date(localUtcMs);
  const firstOffset = getParisOffsetMs(firstGuess);
  const secondGuess = new Date(localUtcMs - firstOffset);
  const secondOffset = getParisOffsetMs(secondGuess);

  return new Date(localUtcMs - secondOffset);
}

export function formatParisDateTimeInput(value: string | Date | null | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = getPartMap(date, DATE_TIME_INPUT_FORMATTER);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function createParisDateFormatter(
  options: Intl.DateTimeFormatOptions,
  locale = APP_LOCALE,
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    ...options,
  });
}
