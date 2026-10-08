import { describe, expect, it } from "vitest";

import { TEST_CASES } from "@/config/testCases";
import { calculate } from "./calculations";
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
