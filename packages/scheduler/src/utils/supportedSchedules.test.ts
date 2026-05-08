import { describe, expect, it } from "vitest";

import { computeNextRun } from "./computeNextRun";

// Walks `count` consecutive firings starting from `dtstart`, advancing
// `after` to each previous fire. Returns ISO strings for clean diffs.
function fires(args: {
  rrule: string;
  timezone: string;
  dtstart: Date;
  count: number;
}): string[] {
  const out: string[] = [];
  let after = args.dtstart;
  for (let i = 0; i < args.count; i++) {
    const next = computeNextRun({
      rrule: args.rrule,
      timezone: args.timezone,
      dtstart: args.dtstart,
      after,
    });
    if (!next) throw new Error(`rule exhausted at iteration ${i}`);
    out.push(next.toISOString());
    after = next;
  }
  return out;
}

describe("supported schedule patterns", () => {
  it("every 30 minutes — fires on :00 and :30 indefinitely", () => {
    expect(
      fires({
        rrule: "FREQ=MINUTELY;INTERVAL=30",
        timezone: "UTC",
        dtstart: new Date("2026-06-15T12:00:00Z"),
        count: 4,
      }),
    ).toEqual([
      "2026-06-15T12:30:00.000Z",
      "2026-06-15T13:00:00.000Z",
      "2026-06-15T13:30:00.000Z",
      "2026-06-15T14:00:00.000Z",
    ]);
  });

  it("hourly — fires on the same minute every hour", () => {
    expect(
      fires({
        rrule: "FREQ=HOURLY",
        timezone: "UTC",
        dtstart: new Date("2026-06-15T09:00:00Z"),
        count: 3,
      }),
    ).toEqual([
      "2026-06-15T10:00:00.000Z",
      "2026-06-15T11:00:00.000Z",
      "2026-06-15T12:00:00.000Z",
    ]);
  });

  it("daily at 9 AM Eastern — fires at 9 AM each day in user's tz", () => {
    // 2026-06-15 09:00 EDT = 13:00Z (UTC-4)
    expect(
      fires({
        rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        timezone: "America/New_York",
        dtstart: new Date("2026-06-15T13:00:00Z"),
        count: 3,
      }),
    ).toEqual([
      "2026-06-16T13:00:00.000Z",
      "2026-06-17T13:00:00.000Z",
      "2026-06-18T13:00:00.000Z",
    ]);
  });

  it("daily at 9 AM Eastern — UTC offset shifts across DST spring-forward", () => {
    // Spring-forward 2026: Sun Mar 8, 02:00 EST → 03:00 EDT.
    // Wall-clock 9 AM stays 9 AM, but the UTC offset shifts:
    //   Mar 7 (EST, UTC-5): 9 AM = 14:00Z
    //   Mar 8 (EDT, UTC-4): 9 AM = 13:00Z
    // The offset *change* across firings can only land correctly if luxon's
    // IANA-aware conversion is being applied at the rrule boundary.
    expect(
      fires({
        rrule: "FREQ=DAILY;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        timezone: "America/New_York",
        dtstart: new Date("2026-03-06T14:00:00Z"), // Fri 9 AM EST
        count: 4,
      }),
    ).toEqual([
      "2026-03-07T14:00:00.000Z", // Sat 9 AM EST (still UTC-5)
      "2026-03-08T13:00:00.000Z", // Sun 9 AM EDT (DST started at 2 AM, now UTC-4)
      "2026-03-09T13:00:00.000Z", // Mon 9 AM EDT
      "2026-03-10T13:00:00.000Z", // Tue 9 AM EDT
    ]);
  });

  it("weekdays at 9 AM Eastern — Mon-Fri only, skips Sat/Sun", () => {
    // dtstart = Fri 2026-06-12 09:00 EDT = 13:00Z. Then Mon, Tue, Wed, Thu, Fri,
    // Mon (no Sat/Sun emitted).
    expect(
      fires({
        rrule:
          "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        timezone: "America/New_York",
        dtstart: new Date("2026-06-12T13:00:00Z"),
        count: 6,
      }),
    ).toEqual([
      "2026-06-15T13:00:00.000Z", // Mon
      "2026-06-16T13:00:00.000Z", // Tue
      "2026-06-17T13:00:00.000Z", // Wed
      "2026-06-18T13:00:00.000Z", // Thu
      "2026-06-19T13:00:00.000Z", // Fri
      "2026-06-22T13:00:00.000Z", // Mon (3-day jump, weekend skipped)
    ]);
  });

  it("Mon/Tue/Fri at 9 AM Pacific — fires only on listed weekdays", () => {
    // dtstart = Mon 2026-06-15 09:00 PDT = 16:00Z (UTC-7).
    // Cadence: Mon → Tue → Fri → Mon → Tue → Fri (skips Wed/Thu/Sat/Sun).
    expect(
      fires({
        rrule: "FREQ=WEEKLY;BYDAY=MO,TU,FR;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        timezone: "America/Los_Angeles",
        dtstart: new Date("2026-06-15T16:00:00Z"),
        count: 6,
      }),
    ).toEqual([
      "2026-06-16T16:00:00.000Z", // Tue
      "2026-06-19T16:00:00.000Z", // Fri (3-day jump from Tue)
      "2026-06-22T16:00:00.000Z", // Mon (3-day jump from Fri)
      "2026-06-23T16:00:00.000Z", // Tue
      "2026-06-26T16:00:00.000Z", // Fri
      "2026-06-29T16:00:00.000Z", // Mon
    ]);
  });

  it("every other Tuesday at 9 AM Eastern — 14-day cadence on the same weekday", () => {
    // dtstart = Tue 2026-06-16 09:00 EDT = 13:00Z. Each fire +14 days.
    expect(
      fires({
        rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=TU;BYHOUR=9;BYMINUTE=0;BYSECOND=0",
        timezone: "America/New_York",
        dtstart: new Date("2026-06-16T13:00:00Z"),
        count: 4,
      }),
    ).toEqual([
      "2026-06-30T13:00:00.000Z",
      "2026-07-14T13:00:00.000Z",
      "2026-07-28T13:00:00.000Z",
      "2026-08-11T13:00:00.000Z",
    ]);
  });
});
