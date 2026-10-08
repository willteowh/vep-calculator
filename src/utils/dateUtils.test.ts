import { describe, expect, it } from "vitest";

import {
  dateKey,
  durationDays,
  getHourFromDate,
  isPost2027,
  isPublicHoliday,
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
