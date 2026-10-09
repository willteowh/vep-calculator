import { useMemo, useState } from "react";

import { TEST_CASES, type TestCase } from "@/config/testCases";
import { calculate } from "@/utils/calculations";
import { downloadTextFile } from "@/utils/downloadFile";
import { buildTestCasesCsv, parseTestCasesCsv } from "@/utils/testCaseCsv";
import {
  filterAndSortTestCases,
  summariseTests,
  type SortBy,
  type StatusFilter,
  type TestResults,
} from "@/utils/testRunner";

const RUN_ONE_DELAY_MS = 500;
const RUN_ALL_DELAY_MS = 1000;

export function useTestRunner() {
  const [testCases, setTestCases] = useState<TestCase[]>(TEST_CASES);
  const [testResults, setTestResults] = useState<TestResults>({});
  const [runningTests, setRunningTests] = useState<number[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [csvStatus, setCsvStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("id");

  const summary = useMemo(
    () => summariseTests(testCases, testResults, runningTests),
    [testCases, testResults, runningTests],
  );

  const displayedTestCases = useMemo(
    () =>
      filterAndSortTestCases(
        testCases,
        testResults,
        runningTests,
        statusFilter,
        sortBy,
      ),
    [testCases, testResults, runningTests, statusFilter, sortBy],
  );

  function runTest(testCase: TestCase) {
    setTestResults((prev) => ({ ...prev, [testCase.id]: undefined }));
    setRunningTests((prev) => [...prev, testCase.id]);

    // Simulate async work so the running state is visible.
    setTimeout(() => {
      const res = calculate(testCase.params);
      setTestResults((prev) => ({ ...prev, [testCase.id]: res }));
      setRunningTests((prev) => prev.filter((id) => id !== testCase.id));
    }, RUN_ONE_DELAY_MS);
  }

  function runAll() {
    setIsRunningAll(true);
    setRunningTests(testCases.map((tc) => tc.id));
    setTestResults({});

    setTimeout(() => {
      const newResults: TestResults = {};
      testCases.forEach((tc) => {
        newResults[tc.id] = calculate(tc.params);
      });
      setTestResults(newResults);
      setIsRunningAll(false);
      setRunningTests([]);
    }, RUN_ALL_DELAY_MS);
  }

  async function importCsv(file: File) {
    try {
      const importedCases = parseTestCasesCsv(await file.text());
      setTestCases(importedCases);
      setTestResults({});
      setRunningTests([]);
      setIsRunningAll(false);
      setCsvStatus(
        `Loaded ${importedCases.length} test case(s) from ${file.name}.`,
      );
    } catch (err) {
      setCsvStatus(
        `Failed to import CSV: ${err instanceof Error ? err.message : "Invalid CSV file."}`,
      );
    }
  }

  function downloadSampleCsv() {
    downloadTextFile(
      "vep-test-cases-sample.csv",
      buildTestCasesCsv(TEST_CASES),
    );
  }

  return {
    testCases,
    testResults,
    runningTests,
    isRunningAll,
    csvStatus,
    statusFilter,
    sortBy,
    summary,
    displayedTestCases,
    setStatusFilter,
    setSortBy,
    runTest,
    runAll,
    importCsv,
    downloadSampleCsv,
  };
}

export type TestRunner = ReturnType<typeof useTestRunner>;
