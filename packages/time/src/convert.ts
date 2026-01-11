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
