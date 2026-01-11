import { DateTime } from "luxon";

export function formatDateTime(dt: DateTime, timezone: string): string {
  return dt.setZone(timezone).toFormat("LLLL d, h:mma ZZZZ");
}

export function formatTime(dt: DateTime, timezone: string): string {
  return dt.setZone(timezone).toFormat("h:mma ZZZZ");
}

export function formatDate(dt: DateTime, timezone: string): string {
  return dt.setZone(timezone).toFormat("LLLL d, yyyy");
}

export function formatRelative(dt: DateTime, timezone: string): string {
  return dt.setZone(timezone).toRelative() ?? "unknown";
}
