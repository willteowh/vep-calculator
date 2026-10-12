import { describe, expect, it } from "vitest";

import { TEST_CASES } from "@/config/testCases";
import { calculate, countErpDays, getStayError } from "./calculations";
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
