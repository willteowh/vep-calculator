import { describe, expect, it } from "vitest";

import {
  dateKey,
  durationDays,
  getHourFromDate,
  isPost2027,
  getPublicHolidayTitle,
  isPublicHoliday,
  isSchoolHoliday,
  isWeekend,
} from "./dateUtils";

describe("dateUtils", () => {
  it("formats dateKey as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("detects weekends", () => {
    expect(isWeekend(new Date(2026, 3, 11))).toBe(true); // Sat
    expect(isWeekend(new Date(2026, 3, 10))).toBe(false); // Fri
  });

  it("detects public holidays", () => {
    expect(isPublicHoliday(new Date(2026, 11, 25))).toBe(true);
    expect(isPublicHoliday(new Date(2026, 11, 24))).toBe(false);
  });

  it("names a public holiday and returns null otherwise", () => {
    expect(getPublicHolidayTitle(new Date(2026, 11, 25))).toBe("Christmas Day");
    expect(getPublicHolidayTitle(new Date(2026, 11, 24))).toBeNull();
  });

  it("detects the 2027 rate boundary", () => {
    expect(isPost2027(new Date("2026-12-31T23:59"))).toBe(false);
    expect(isPost2027(new Date("2027-01-01T00:00"))).toBe(true);
  });

  it("returns fractional hours", () => {
    expect(getHourFromDate(new Date("2026-04-10T17:30"))).toBe(17.5);
  });

  it("rounds duration up to whole days and floors negatives at 0", () => {
    const a = new Date("2026-04-10T10:00");
    expect(durationDays(a, new Date("2026-04-11T11:00"))).toBe(2);
    expect(durationDays(a, new Date("2026-04-09T10:00"))).toBe(0);
  });
});

describe("isSchoolHoliday boundaries", () => {
  // [first day, last day] of each range in the configured school holidays
  const ranges: [string, string][] = [
    ["2026-05-30", "2026-06-28"],
    ["2026-11-21", "2026-12-31"],
    ["2027-05-29", "2027-06-27"],
    ["2027-11-20", "2027-12-31"],
  ];
  const day = (iso: string, offset = 0, time = "00:00") => {
    const [y, m, d] = iso.split("-").map(Number);
    const base = new Date(y, m - 1, d + offset);
    const [hh, mm] = time.split(":").map(Number);
    base.setHours(hh, mm);
    return base;
  };

  it.each(ranges)("range %s to %s includes both end days", (first, last) => {
    expect(isSchoolHoliday(day(first))).toBe(true);
    expect(isSchoolHoliday(day(first, 0, "23:59"))).toBe(true);
    expect(isSchoolHoliday(day(last))).toBe(true);
    expect(isSchoolHoliday(day(last, 0, "23:59"))).toBe(true);
  });

  it.each(ranges)(
    "range %s to %s excludes the neighbouring days",
    (first, last) => {
      expect(isSchoolHoliday(day(first, -1, "23:59"))).toBe(false);
      expect(isSchoolHoliday(day(last, 1))).toBe(false);
    },
  );
});
