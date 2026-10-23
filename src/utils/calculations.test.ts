import { describe, expect, it } from "vitest";

import { TEST_CASES } from "@/config/testCases";
import {
  calculate,
  countErpDays,
  getStayError,
  isDayVEPFree,
} from "./calculations";
import { evaluateTestCase } from "./testCaseEvaluation";

describe("calculate() against TEST_CASES", () => {
  it.each(TEST_CASES.map((tc) => [tc.id, tc.label, tc] as const))(
    "#%i %s",
    (_id, _label, testCase) => {
      const result = calculate(testCase.params);
      expect(evaluateTestCase(testCase, result).passed).toBe(true);
    },
  );
});

describe("calculate() input validation", () => {
  const base = TEST_CASES[0].params;

  it("rejects departure before entry", () => {
    const result = calculate({
      ...base,
      entryDt: new Date("2026-04-10T10:00"),
      departureDt: new Date("2026-04-09T10:00"),
    });
    expect(result).toHaveProperty("error");
  });

  it("rejects stays longer than the maximum", () => {
    const result = calculate({
      ...base,
      entryDt: new Date("2026-01-01T10:00"),
      departureDt: new Date("2027-01-01T10:00"),
    });
    expect(result).toHaveProperty("error");
  });
});

describe("taxi PSVP exit boundary", () => {
  const params = {
    vehicleCategory: "taxis",
    hasIU: "yes",
    entryCheckpoint: "woodlands",
    departCheckpoint: "woodlands",
    entryDt: new Date("2026-12-31T23:59"),
  } as const;

  it("does not charge before 2027-01-01 00:00 and charges at the boundary", () => {
    const before = calculate({
      ...params,
      departureDt: new Date("2026-12-31T23:59"),
    });
    const atBoundary = calculate({
      ...params,
      departureDt: new Date("2027-01-01T00:00"),
    });

    expect(before).toMatchObject({ psvpFee: 0, grandTotal: 0.4 });
    expect(atBoundary).toMatchObject({ psvpFee: 15, grandTotal: 15.4 });
  });
});

describe("getStayError", () => {
  it("returns null for a valid stay", () => {
    expect(
      getStayError(new Date("2026-04-10T10:00"), new Date("2026-04-12T10:00")),
    ).toBeNull();
  });

  it("flags reversed and over-long stays", () => {
    expect(
      getStayError(new Date("2026-04-12T10:00"), new Date("2026-04-10T10:00")),
    ).not.toBeNull();
    expect(
      getStayError(new Date("2026-01-01T10:00"), new Date("2027-01-01T10:00")),
    ).not.toBeNull();
  });
});

describe("countErpDays", () => {
  it("counts every weekday in the stay, split at the 2027 boundary", () => {
    // Mon 28 Dec 2026 to Tue 5 Jan 2027; 1 Jan 2027 is a public holiday.
    expect(
      countErpDays(new Date("2026-12-28T09:00"), new Date("2027-01-05T18:00")),
    ).toEqual({ pre: 4, post: 2 });
  });

  it("excludes weekends", () => {
    // Fri 10 Apr to Mon 13 Apr 2026
    expect(
      countErpDays(new Date("2026-04-10T10:00"), new Date("2026-04-13T10:00")),
    ).toEqual({ pre: 2, post: 0 });
  });

  it("excludes public holidays", () => {
    // Thu 30 Apr to Mon 4 May 2026; Fri 1 May is Labour Day, 2-3 May weekend
    expect(
      countErpDays(new Date("2026-04-30T10:00"), new Date("2026-05-04T10:00")),
    ).toEqual({ pre: 2, post: 0 });
  });

  it("counts a single weekday as one ERP day", () => {
    expect(
      countErpDays(new Date("2027-01-04T10:00"), new Date("2027-01-04T18:00")),
    ).toEqual({ pre: 0, post: 1 });
  });
});

// Hand-derived from the published waiver rules; weekdays chosen so no weekend/holiday masks the rule.
describe("isDayVEPFree waiver boundaries", () => {
  const at = (iso: string) => new Date(iso);
  const tue14Apr = at("2026-04-14T00:00");
  const wed15Apr = at("2026-04-15T00:00");
  const mon15Jun = at("2026-06-15T00:00"); // school holiday weekday

  it("frees the entry day from 17:00, not at 16:59", () => {
    const dep = at("2026-04-14T18:00");
    expect(isDayVEPFree(tue14Apr, at("2026-04-14T16:59"), dep)).toBe(false);
    expect(isDayVEPFree(tue14Apr, at("2026-04-14T17:00"), dep)).toBe(true);
  });

  it("frees the exit day before 02:00, not at 02:00", () => {
    const entry = at("2026-04-14T18:00");
    expect(isDayVEPFree(wed15Apr, entry, at("2026-04-15T01:59"))).toBe(true);
    expect(isDayVEPFree(wed15Apr, entry, at("2026-04-15T02:00"))).toBe(false);
  });

  it("frees a school-holiday entry day from 12:00, not at 11:59", () => {
    const dep = at("2026-06-15T18:00");
    expect(isDayVEPFree(mon15Jun, at("2026-06-15T11:59"), dep)).toBe(false);
    expect(isDayVEPFree(mon15Jun, at("2026-06-15T12:00"), dep)).toBe(true);
  });

  it("does not apply the noon waiver outside school holidays", () => {
    expect(
      isDayVEPFree(tue14Apr, at("2026-04-14T12:00"), at("2026-04-14T18:00")),
    ).toBe(false);
  });

  it("applies no time waivers from 2027", () => {
    const mon4Jan2027 = at("2027-01-04T00:00");
    const dep = at("2027-01-04T18:00");
    expect(isDayVEPFree(mon4Jan2027, at("2027-01-04T17:00"), dep)).toBe(false);
    expect(isDayVEPFree(mon4Jan2027, at("2027-01-04T12:00"), dep)).toBe(false);
  });

  it.each([
    ["Saturday before 2027", "2026-04-11T00:00"],
    ["public holiday before 2027", "2026-05-01T00:00"],
    ["Saturday from 2027", "2027-01-02T00:00"],
    ["public holiday from 2027", "2027-01-01T00:00"],
  ])("always frees a %s", (_name, day) => {
    expect(isDayVEPFree(at(day), at(day), at(day))).toBe(true);
  });
});

describe("fare at the evening-entry boundary", () => {
  const base = {
    vehicleCategory: "cars",
    hasIU: "yes",
    entryCheckpoint: "woodlands",
    departCheckpoint: "woodlands",
    departureDt: new Date("2026-04-11T01:30"),
  } as const;

  it("charges the Friday at 16:59: 35 VEP + 0.80 toll + 6.40 RRC", () => {
    const result = calculate({
      ...base,
      entryDt: new Date("2026-04-10T16:59"),
    });
    expect(result).toMatchObject({ vepFees: 35, grandTotal: 42.2 });
  });

  it("waives the Friday at 17:00: 0.80 toll + 6.40 RRC", () => {
    const result = calculate({
      ...base,
      entryDt: new Date("2026-04-10T17:00"),
    });
    expect(result).toMatchObject({ vepFees: 0, grandTotal: 7.2 });
  });
});

describe("maximum stay boundary", () => {
  const entry = new Date("2026-01-01T00:00");

  it("allows exactly 250 days", () => {
    expect(getStayError(entry, new Date("2026-09-08T00:00"))).toBeNull();
  });

  it("rejects 250 days and one minute", () => {
    expect(getStayError(entry, new Date("2026-09-08T00:01"))).not.toBeNull();
  });

  it("allows departure in the same minute as entry", () => {
    expect(getStayError(entry, entry)).toBeNull();
  });
});
