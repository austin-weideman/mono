import { RRule } from "rrule";

import { BadRequestError } from "@mono/errors";
import { fromFloatingDate, isValidTimezone, toFloatingDate } from "@mono/time";

export interface ComputeNextRunInput {
  rrule: string;
  timezone: string;
  dtstart: Date;
  after: Date;
  /** If `after` is itself an occurrence: `true` returns it, `false` (default) skips to the next. */
  inclusive?: boolean;
}

// We do NOT set rrule's `tzid` option — its tzid handling leaks the system's
// local timezone into BYHOUR resolution. Instead we run rrule in pure
// "floating UTC" mode (a Date whose UTC fields represent the wall-clock time
// in the schedule's IANA tz) and own the wall-clock ↔ absolute UTC conversion
// at the boundaries via @mono/time. rrule's recurrence math (BYDAY,
// BYHOUR, INTERVAL, BYMONTHDAY, etc.) is purely calendrical, so this gives
// correct DST behavior — each occurrence's floating fields are a wall-clock
// spec that luxon resolves to the right absolute instant in the schedule's tz.

/**
 * Computes the next firing instant for a schedule.
 *
 * Returns null when the rule is exhausted (e.g., UNTIL/COUNT bound exceeded).
 * Throws on malformed rrule strings or invalid timezones.
 *
 * Note: per rrule.js semantics (which differ from RFC 5545), dtstart is
 * not necessarily the first occurrence — the first fire is the first
 * matching instance >= dtstart.
 */
export function computeNextRun(input: ComputeNextRunInput): Date | null {
  if (!isValidTimezone(input.timezone)) {
    throw new BadRequestError(`Invalid timezone: ${input.timezone}`);
  }

  const parsed = RRule.parseString(input.rrule);

  const rule = new RRule({
    ...parsed,
    dtstart: toFloatingDate(input.dtstart, input.timezone),
  });

  const result = rule.after(
    toFloatingDate(input.after, input.timezone),
    input.inclusive ?? false,
  );

  if (!result) return null;
  return fromFloatingDate(result, input.timezone);
}
