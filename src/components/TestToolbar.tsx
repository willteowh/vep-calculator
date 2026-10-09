import { useRef, type ChangeEvent } from "react";

import { buttonStyle } from "@/components/appStyles";
import type { TestRunner } from "@/hooks/useTestRunner";

const spinnerStyle = {
  display: "inline-block",
  width: "16px",
  height: "16px",
  border: "2px solid #ffffff",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginRight: "8px",
} as const;

export function TestToolbar({ runner }: { runner: TestRunner }) {
  const { isRunningAll, summary, csvStatus } = runner;
  const csvInputRef = useRef<HTMLInputElement>(null);
  const allPassed = summary.passed === summary.total;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    await runner.importCsv(file);
    input.value = "";
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        style={{ ...buttonStyle, background: "#2196f3", marginRight: 8 }}
        data-testid="run-all-tests"
        onClick={runner.runAll}
        disabled={isRunningAll}
      >
        {isRunningAll ? (
          <>
            <span style={spinnerStyle}></span>
            Running Tests...
          </>
        ) : (
          "Run All Tests"
        )}
      </button>
      <button
        style={{ ...buttonStyle, background: "#4caf50", marginRight: 8 }}
        data-testid="download-sample-csv"
        onClick={runner.downloadSampleCsv}
        disabled={isRunningAll}
      >
        Download Sample CSV
      </button>
      <button
        style={{ ...buttonStyle, background: "#7e57c2", marginRight: 8 }}
        onClick={() => csvInputRef.current?.click()}
        disabled={isRunningAll}
      >
        Upload CSV
      </button>
      <input
        data-testid="csv-input"
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {!isRunningAll && (
        <div
          data-testid="test-summary"
          style={{
            display: "inline-block",
            padding: "8px 12px",
            backgroundColor: allPassed ? "#e8f5e8" : "#ffeaea",
            border: `1px solid ${allPassed ? "#4caf50" : "#f44336"}`,
            borderRadius: 4,
            fontWeight: 600,
            color: allPassed ? "#2e7d32" : "#c62828",
          }}
        >
          {summary.passed}/{summary.total} test cases passed
        </div>
      )}
      {csvStatus && (
        <div
          style={{
            marginTop: 10,
            color: csvStatus.startsWith("Failed") ? "#c62828" : "#2e7d32",
            fontWeight: 600,
          }}
        >
          {csvStatus}
        </div>
      )}
    </div>
  );
}
