import { ERROR_MESSAGES } from "@/config/messages";
import { MAX_STAY_DAYS } from "@/config/constants";
import type { TestCase } from "@/config/testCases";
import type { CalculationOutput } from "./calculations";

export type TestStatus = "not-run" | "passed" | "failed";

export interface TestEvaluation {
  status: TestStatus;
  passed: boolean;
  expectedError: string | null;
  actualError: string | null;
  delta: number;
  totalMatches: boolean;
  unexpectedSuccess: boolean;
}

export function deriveExpectedError(testCase: TestCase): string | null {
  const { entryDt, departureDt } = testCase.params;

  if (Number.isNaN(entryDt.getTime()) || Number.isNaN(departureDt.getTime())) {
    return null;
  }

  const msDiff = departureDt.getTime() - entryDt.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);

  if (msDiff < 0) return ERROR_MESSAGES.INVALID_DATE_RANGE;
  if (daysDiff > MAX_STAY_DAYS) return ERROR_MESSAGES.EXCEED_DURATION;

  return null;
}

export function evaluateTestCase(
  testCase: TestCase,
  result?: CalculationOutput,
): TestEvaluation {
  const expectedError = deriveExpectedError(testCase);

  if (!result) {
    return {
      status: "not-run",
      passed: false,
      expectedError,
      actualError: null,
      delta: Number.NaN,
      totalMatches: false,
      unexpectedSuccess: false,
    };
  }

  if ("error" in result) {
    const passed = !!expectedError && result.error === expectedError;
    return {
      status: passed ? "passed" : "failed",
      passed,
      expectedError,
      actualError: result.error,
      delta: Number.NaN,
      totalMatches: false,
      unexpectedSuccess: false,
    };
  }

  if (expectedError) {
    return {
      status: "failed",
      passed: false,
      expectedError,
      actualError: null,
      delta: Number.NaN,
      totalMatches: false,
      unexpectedSuccess: true,
    };
  }

  const expectedTotal = Number(testCase.expectedTotal) || 0;
  const delta = Math.abs(result.grandTotal - expectedTotal);
  const totalMatches = delta < 0.01;

  return {
    status: totalMatches ? "passed" : "failed",
    passed: totalMatches,
    expectedError: null,
    actualError: null,
    delta,
    totalMatches,
    unexpectedSuccess: false,
  };
}
