import { describe, expect, it } from "vitest";

import { ERROR_MESSAGES } from "@/config/messages";
import type { TestCase } from "@/config/testCases";
import { calculate } from "./calculations";
import { deriveExpectedError, evaluateTestCase } from "./testCaseEvaluation";

const base: TestCase = {
  id: 1,
  label: "weekday",
  desc: "",
  params: {
    vehicleCategory: "cars",
    hasIU: "yes",
    entryDt: new Date("2026-04-13T10:00"),
    departureDt: new Date("2026-04-14T18:00"),
    entryCheckpoint: "woodlands",
    departCheckpoint: "woodlands",
  },
  expectedTotal: 77.2,
  note: "",
};

const reversed: TestCase = {
  ...base,
  params: { ...base.params, departureDt: new Date("2026-04-12T10:00") },
  expectedTotal: 0,
};

const tooLong: TestCase = {
  ...base,
  params: { ...base.params, departureDt: new Date("2027-04-14T18:00") },
  expectedTotal: 0,
};

describe("deriveExpectedError", () => {
  it("is null for a valid stay", () => {
    expect(deriveExpectedError(base)).toBeNull();
  });

  it("flags a reversed range and an over-long stay", () => {
    expect(deriveExpectedError(reversed)).toBe(
      ERROR_MESSAGES.INVALID_DATE_RANGE,
    );
    expect(deriveExpectedError(tooLong)).toBe(ERROR_MESSAGES.EXCEED_DURATION);
  });

  it("is null when a date is invalid", () => {
    const invalid = {
      ...base,
      params: { ...base.params, entryDt: new Date("nope") },
    };
    expect(deriveExpectedError(invalid)).toBeNull();
  });
});

describe("evaluateTestCase", () => {
  it("reports not-run without a result", () => {
    expect(evaluateTestCase(base)).toMatchObject({
      status: "not-run",
      passed: false,
    });
  });

  it("passes when the total matches within a cent", () => {
    const result = calculate(base.params);
    expect(evaluateTestCase(base, result)).toMatchObject({
      status: "passed",
      passed: true,
      delta: 0,
    });
  });

  it("fails and reports the delta when the total differs", () => {
    const result = calculate(base.params);
    const evaluation = evaluateTestCase({ ...base, expectedTotal: 80 }, result);
    expect(evaluation.status).toBe("failed");
    expect(evaluation.delta).toBeCloseTo(2.8, 2);
  });

  it("passes when the expected error is returned", () => {
    expect(
      evaluateTestCase(reversed, calculate(reversed.params)),
    ).toMatchObject({
      status: "passed",
      actualError: ERROR_MESSAGES.INVALID_DATE_RANGE,
    });
  });

  it("fails when an error is returned but none was expected", () => {
    const result = calculate(reversed.params);
    expect(evaluateTestCase(base, result)).toMatchObject({
      status: "failed",
      expectedError: null,
    });
  });

  it("fails as an unexpected success when an error was expected", () => {
    const result = calculate(base.params);
    expect(evaluateTestCase(reversed, result)).toMatchObject({
      status: "failed",
      unexpectedSuccess: true,
    });
  });
});
