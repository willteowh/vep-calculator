import type { TestCase } from "@/config/testCases";
import { getStayError, type CalculationOutput } from "./calculations";

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

  return getStayError(entryDt, departureDt);
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
