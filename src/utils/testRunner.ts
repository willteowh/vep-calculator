import type { TestCase } from "@/config/testCases";
import type { CalculationOutput } from "./calculations";
import { evaluateTestCase, type TestStatus } from "./testCaseEvaluation";

export type TestRunStatus = "running" | TestStatus;
export type StatusFilter = "all" | TestRunStatus;
export type SortBy = "id" | "status" | "delta";
export type TestResults = Record<number, CalculationOutput | undefined>;

export interface TestSummary {
  passed: number;
  failed: number;
  running: number;
  notRun: number;
  total: number;
}

const STATUS_RANK: Record<TestRunStatus, number> = {
  failed: 0,
  running: 1,
  "not-run": 2,
  passed: 3,
};

export function getTestStatus(
  testCase: TestCase,
  results: TestResults,
  runningIds: readonly number[],
): TestRunStatus {
  if (runningIds.includes(testCase.id)) return "running";
  const result = results[testCase.id];
  if (!result) return "not-run";
  return evaluateTestCase(testCase, result).status;
}

function getTestDelta(testCase: TestCase, results: TestResults): number {
  const result = results[testCase.id];
  if (!result) return Number.NEGATIVE_INFINITY;

  const evaluation = evaluateTestCase(testCase, result);
  if (Number.isFinite(evaluation.delta)) return evaluation.delta;

  // Bring failed error cases to the top when sorting by delta.
  return evaluation.status === "failed"
    ? Number.POSITIVE_INFINITY
    : Number.NEGATIVE_INFINITY;
}

export function summariseTests(
  testCases: readonly TestCase[],
  results: TestResults,
  runningIds: readonly number[],
): TestSummary {
  const summary: TestSummary = {
    passed: 0,
    failed: 0,
    running: 0,
    notRun: 0,
    total: testCases.length,
  };

  for (const tc of testCases) {
    const status = getTestStatus(tc, results, runningIds);
    if (status === "running") summary.running++;
    else if (status === "not-run") summary.notRun++;
    else if (status === "passed") summary.passed++;
    else summary.failed++;
  }
  return summary;
}

export function filterAndSortTestCases(
  testCases: readonly TestCase[],
  results: TestResults,
  runningIds: readonly number[],
  statusFilter: StatusFilter,
  sortBy: SortBy,
): TestCase[] {
  const status = (tc: TestCase) => getTestStatus(tc, results, runningIds);

  return testCases
    .filter((tc) => statusFilter === "all" || status(tc) === statusFilter)
    .sort((a, b) => {
      if (sortBy === "status") {
        const rankDiff = STATUS_RANK[status(a)] - STATUS_RANK[status(b)];
        if (rankDiff !== 0) return rankDiff;
      } else if (sortBy === "delta") {
        const deltaDiff = getTestDelta(b, results) - getTestDelta(a, results);
        if (deltaDiff !== 0) return deltaDiff;
      }
      return a.id - b.id;
    });
}
