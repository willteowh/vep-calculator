import { infoBannerStyle } from "@/components/appStyles";
import { TestCaseCard } from "@/components/TestCaseCard";
import { TestFilters } from "@/components/TestFilters";
import { TestSummaryBadges } from "@/components/TestSummaryBadges";
import { TestToolbar } from "@/components/TestToolbar";
import type { TestRunner } from "@/hooks/useTestRunner";

export function TestCasesTab({ runner }: { runner: TestRunner }) {
  const {
    testCases,
    displayedTestCases,
    testResults,
    runningTests,
    isRunningAll,
    summary,
    runTest,
  } = runner;

  return (
    <div>
      <div style={infoBannerStyle}>
        {testCases.length} test cases loaded. Download the sample CSV, add
        custom rows, upload it, then click <strong>Run All Tests</strong>
        to execute the full set. Use filters and sorting below to triage failed
        cases quickly.
      </div>
      <TestToolbar runner={runner} />
      <TestFilters runner={runner} />

      {!isRunningAll && <TestSummaryBadges summary={summary} />}

      {displayedTestCases.length === 0 && (
        <div
          style={{
            border: "1px dashed #c8d0de",
            borderRadius: 8,
            padding: "12px 14px",
            color: "#546174",
            marginBottom: 12,
          }}
        >
          No test cases match this filter.
        </div>
      )}

      {displayedTestCases.map((tc) => {
        const isRunning = isRunningAll || runningTests.includes(tc.id);
        return (
          <TestCaseCard
            key={tc.id}
            testCase={tc}
            result={isRunning ? undefined : testResults[tc.id]}
            onRun={runTest}
            isRunning={isRunning}
          />
        );
      })}
    </div>
  );
}
