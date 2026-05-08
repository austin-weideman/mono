import { DateTime } from "luxon";

export function fromJSDate(date: Date): DateTime {
  return DateTime.fromJSDate(date, { zone: "utc" });
}

export function fromISO(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: "utc" });
}

export function toJSDate(dt: DateTime): Date {
  return dt.toJSDate();
}

export function utcNow(): DateTime {
  return DateTime.utc();
}

/**
 * Converts a real UTC instant to a "floating" Date whose UTC fields
 * (`getUTCFullYear()`, `getUTCHours()`, etc.) represent the wall-clock time
 * in `tz`. The instant the returned Date represents is meaningless on its
 * own — only its UTC fields are meaningful, as a wall-clock-in-tz value.
 *
 * Useful as input to libraries that operate purely on calendrical fields
 * (rrule, ical-style parsers) when you want them to "see" the wall clock
 * in a specific timezone.
 *
 * Inverse of `fromFloatingDate`.
 */
export function toFloatingDate(d: Date, tz: string): Date {
  const dt = DateTime.fromJSDate(d, { zone: "utc" }).setZone(tz);
  return new Date(
    Date.UTC(
      dt.year,
      // Luxon months are 1-indexed (Jan = 1); Date.UTC months are 0-indexed
      // (Jan = 0). Subtract to convert.
      dt.month - 1,
      dt.day,
      dt.hour,
      dt.minute,
      dt.second,
      dt.millisecond,
    ),
  );
}

/**
 * Converts a "floating" Date (UTC fields represent wall-clock in `tz`)
 * back to a real UTC instant.
 *
 * Inverse of `toFloatingDate`.
 */
export function fromFloatingDate(d: Date, tz: string): Date {
  return DateTime.fromObject(
    {
      year: d.getUTCFullYear(),
      // getUTCMonth() is 0-indexed (Jan = 0); Luxon's fromObject expects
      // 1-indexed months (Jan = 1). Add to convert.
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
      millisecond: d.getUTCMilliseconds(),
    },
    { zone: tz },
  )
    .toUTC()
    .toJSDate();
}
