import { describe, expect, it } from "vitest";

import { BadRequestError } from "@mono/errors";

import { computeNextRun } from "./computeNextRun";

const NY = "America/New_York";
const LA = "America/Los_Angeles";

describe("computeNextRun", () => {
  it("daily 9am NY: returns next 9am after now", () => {
    const after = new Date("2026-03-01T15:00:00Z"); // 10am EST
    const next = computeNextRun({
      rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: new Date("2026-03-01T14:00:00Z"), // 9am EST
      after,
    });
    // Next 9am EST after 10am EST is March 2, 9am EST = 14:00 UTC
    expect(next?.toISOString()).toBe("2026-03-02T14:00:00.000Z");
  });

  it("DST transition: 9am LA stays 9am wall-clock across spring-forward", () => {
    // US spring-forward 2026: March 8, 2:00am → 3:00am local. PST(-8) → PDT(-7).
    // 9am PT on March 7 = 17:00Z (PST).
    // 9am PT on March 8 = 16:00Z (PDT).
    const dtstart = new Date("2026-03-07T17:00:00Z");
    const next = computeNextRun({
      rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: LA,
      dtstart,
      after: new Date("2026-03-07T17:00:01Z"), // just after first fire
    });
    expect(next?.toISOString()).toBe("2026-03-08T16:00:00.000Z");
  });

  it("DST transition: 9am LA stays 9am wall-clock across fall-back", () => {
    // US fall-back 2026: November 1, 2:00am → 1:00am local. PDT(-7) → PST(-8).
    // 9am PT on Oct 31 = 16:00Z (PDT).
    // 9am PT on Nov 1 = 17:00Z (PST).
    const next = computeNextRun({
      rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: LA,
      dtstart: new Date("2026-10-31T16:00:00Z"),
      after: new Date("2026-10-31T16:00:01Z"),
    });
    expect(next?.toISOString()).toBe("2026-11-01T17:00:00.000Z");
  });

  it("every other Tuesday: anchors on dtstart's week", () => {
    // dtstart = Tue 2026-01-06 09:00 NY → on-weeks: Jan 6, Jan 20, Feb 3
    const next = computeNextRun({
      rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: new Date("2026-01-06T14:00:00Z"), // 9am EST
      after: new Date("2026-01-06T14:00:01Z"),
    });
    // Jan 20 9am EST = 14:00 UTC
    expect(next?.toISOString()).toBe("2026-01-20T14:00:00.000Z");
  });

  it("MWF noon: weekday filter respected", () => {
    // From a Tuesday, next M/W/F at noon NY is Wednesday.
    const next = computeNextRun({
      rrule: "FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=12;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: new Date("2026-01-05T17:00:00Z"), // Mon noon EST = 17:00 UTC
      after: new Date("2026-01-06T18:00:00Z"), // Tue 1pm EST
    });
    expect(next?.toISOString()).toBe("2026-01-07T17:00:00.000Z"); // Wed noon EST
  });

  it("one-time schedule: returns the single instant then exhausts", () => {
    const dtstart = new Date("2026-04-20T18:00:00Z"); // 2pm EDT = 18:00 UTC
    const first = computeNextRun({
      rrule: "FREQ=DAILY;COUNT=1",
      timezone: NY,
      dtstart,
      after: new Date("2026-04-19T00:00:00Z"),
      inclusive: true,
    });
    expect(first?.toISOString()).toBe("2026-04-20T18:00:00.000Z");

    const second = computeNextRun({
      rrule: "FREQ=DAILY;COUNT=1",
      timezone: NY,
      dtstart,
      after: dtstart, // strictly after the only fire
    });
    expect(second).toBeNull();
  });

  it("UNTIL in the past: returns null", () => {
    const next = computeNextRun({
      rrule: "FREQ=DAILY;BYHOUR=9;UNTIL=20200101T000000Z",
      timezone: NY,
      dtstart: new Date("2019-01-01T14:00:00Z"),
      after: new Date("2026-01-01T00:00:00Z"),
    });
    expect(next).toBeNull();
  });

  it("BYMONTHDAY=-1: leap-year February", () => {
    const leap = computeNextRun({
      rrule: "FREQ=MONTHLY;BYMONTHDAY=-1;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: new Date("2024-02-01T14:00:00Z"),
      after: new Date("2024-02-01T00:00:00Z"),
    });
    // Feb 29 2024 9am EST = 14:00 UTC
    expect(leap?.toISOString()).toBe("2024-02-29T14:00:00.000Z");

    const nonLeap = computeNextRun({
      rrule: "FREQ=MONTHLY;BYMONTHDAY=-1;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: new Date("2025-02-01T14:00:00Z"),
      after: new Date("2025-02-01T00:00:00Z"),
    });
    // Feb 28 2025 9am EST = 14:00 UTC
    expect(nonLeap?.toISOString()).toBe("2025-02-28T14:00:00.000Z");
  });

  it("inclusive=true: returns occurrence at exactly `after`", () => {
    const at = new Date("2026-01-06T14:00:00Z"); // Tue 9am EST
    const next = computeNextRun({
      rrule: "FREQ=WEEKLY;BYDAY=TU;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: at,
      after: at,
      inclusive: true,
    });
    expect(next?.toISOString()).toBe(at.toISOString());
  });

  it("inclusive=false (default): skips occurrence at exactly `after`", () => {
    const at = new Date("2026-01-06T14:00:00Z"); // Tue 9am EST
    const next = computeNextRun({
      rrule: "FREQ=WEEKLY;BYDAY=TU;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
      timezone: NY,
      dtstart: at,
      after: at,
    });
    // Next Tuesday 9am EST = Jan 13 14:00 UTC
    expect(next?.toISOString()).toBe("2026-01-13T14:00:00.000Z");
  });

  it("rejects invalid timezone", () => {
    expect(() =>
      computeNextRun({
        rrule: "FREQ=DAILY",
        timezone: "Not/A_Real_Zone",
        dtstart: new Date(),
        after: new Date(),
      }),
    ).toThrow(BadRequestError);
  });

  it("throws on malformed rrule", () => {
    expect(() =>
      computeNextRun({
        rrule: "NOT_A_VALID_RULE",
        timezone: NY,
        dtstart: new Date(),
        after: new Date(),
      }),
    ).toThrow();
  });
});
