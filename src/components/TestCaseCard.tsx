import { CUTOFF_2027 } from "@/config/constants";
import { CalculationResult, CalculationError } from "@/utils/calculations";
import { fmt } from "@/utils/formatters";
import {
  evaluateTestCase,
  deriveExpectedError,
} from "@/utils/testCaseEvaluation";
import { TestResult } from "./TestResult";

interface TestCase {
  id: number;
  label: string;
  desc: string;
  params: {
    entryDt: Date;
    departureDt: Date;
  } & Record<string, any>;
  expectedTotal: number;
  note: string;
}

interface TestCaseCardProps {
  testCase: TestCase;
  result?: CalculationResult | CalculationError;
  onRun: (testCase: TestCase) => void;
  isRunning?: boolean;
}

function formatDateTime(value: unknown): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return formatDateTime(value);
  return String(value);
}

export function TestCaseCard({
  testCase,
  result,
  onRun,
  isRunning = false,
}: TestCaseCardProps) {
  const expectedError = deriveExpectedError(testCase);
  const evaluation = evaluateTestCase(testCase, result);
  const hasResult = !!result;
  const hasError = !!result && "error" in result;
  const isPassed = hasResult && evaluation.status === "passed";
  const isFailed = hasResult && !isPassed;
  const actualTotal =
    result && !("error" in result) ? result.grandTotal : Number.NaN;
  const delta = evaluation.delta;
  const statusLabel = isRunning
    ? "RUNNING"
    : !hasResult
      ? "NOT RUN"
      : evaluation.status === "passed"
        ? "PASSED"
        : "FAILED";

  const tcCardStyle = {
    border: isFailed ? "1px solid #f44336" : "1px solid #ddd",
    borderLeft: isFailed ? "4px solid #d32f2f" : "1px solid #ddd",
    borderRadius: 2,
    padding: "16px 20px",
    marginBottom: 12,
    background: isFailed ? "#fff8f8" : "#fafafa",
  } as const;
  const tcTitleStyle = {
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 4,
  } as const;
  const tcDescStyle = { fontSize: 12, color: "#555", marginBottom: 8 } as const;
  const tcExpectedStyle = {
    fontSize: 12,
    color: "#336",
    background: "#eef2ff",
    padding: "6px 10px",
    borderRadius: 3,
    marginBottom: 8,
  } as const;
  const tcButtonStyle = {
    background: "#0056a6",
    color: "#fff",
    border: "none",
    borderRadius: 3,
    padding: "6px 16px",
    fontSize: 12,
    cursor: "pointer",
  } as const;

  const isPeriod =
    testCase.params.entryDt >= CUTOFF_2027
      ? "post"
      : testCase.params.departureDt >= CUTOFF_2027
        ? "pre"
        : "pre";

  const periodLabel =
    testCase.params.entryDt >= CUTOFF_2027
      ? "post-2027"
      : testCase.params.departureDt >= CUTOFF_2027
        ? "straddles 2027"
        : "pre-2027";

  const inputRows = [
    ["Vehicle", testCase.params.vehicleCategory],
    ["IU/OBU", testCase.params.hasIU],
    ["ERP Days (2026)", testCase.params.erpDays2026],
    ["ERP Days (2027)", testCase.params.erpDays2027],
    ["Entry Datetime", testCase.params.entryDt],
    ["Departure Datetime", testCase.params.departureDt],
    ["Entry Checkpoint", testCase.params.entryCheckpoint],
    ["Departure Checkpoint", testCase.params.departCheckpoint],
  ] as const;

  return (
    <div style={tcCardStyle}>
      <div style={tcTitleStyle}>
        #{testCase.id} — {testCase.label}
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            marginLeft: 6,
            background: isPassed
              ? "#e8f5e9"
              : isFailed
                ? "#ffebee"
                : isRunning
                  ? "#e3f2fd"
                  : "#eeeeee",
            color: isPassed
              ? "#2e7d32"
              : isFailed
                ? "#c62828"
                : isRunning
                  ? "#1565c0"
                  : "#555",
          }}
        >
          {statusLabel}
        </span>
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            background:
              isPeriod === "pre"
                ? "#e8f5e9"
                : isPeriod === "post"
                  ? "#e3f2fd"
                  : "#eee",
            color:
              isPeriod === "pre"
                ? "#2e7d32"
                : isPeriod === "post"
                  ? "#1565c0"
                  : "#555",
            marginLeft: 6,
          }}
        >
          {periodLabel}
        </span>
      </div>
      <div style={tcDescStyle}>{testCase.desc}</div>
      <div style={tcExpectedStyle}>
        {expectedError ? (
          <>
            <strong>Expected Error:</strong> {expectedError}
          </>
        ) : (
          <>
            <strong>Expected Total:</strong> $
            {testCase.expectedTotal.toFixed(2)}
          </>
        )}
      </div>
      {hasResult && !hasError && (
        <div
          style={{
            fontSize: 12,
            marginBottom: 8,
            color: isFailed ? "#b71c1c" : "#37474f",
            fontWeight: isFailed ? 700 : 500,
          }}
        >
          {expectedError ? (
            <>Expected error but got successful calculation.</>
          ) : (
            <>
              Actual: {fmt(actualTotal)} &nbsp;|&nbsp; Delta: {fmt(delta)}
            </>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            background: "#f4f7ff",
            border: "1px solid #d8e1ff",
            borderRadius: 6,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 10, color: "#50618a", fontWeight: 700 }}>
            EXPECTED
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1d335c" }}>
            {expectedError ? "Error Expected" : fmt(testCase.expectedTotal)}
          </div>
        </div>
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #dbe4ee",
            borderRadius: 6,
            padding: "8px 10px",
          }}
        >
          <div style={{ fontSize: 10, color: "#4f6273", fontWeight: 700 }}>
            ACTUAL
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#21323f" }}>
            {hasResult ? (hasError ? "Error Returned" : fmt(actualTotal)) : "-"}
          </div>
        </div>
        <div
          style={{
            background: isFailed ? "#fff1f1" : "#f1faf4",
            border: `1px solid ${isFailed ? "#f3c3c3" : "#cde8d4"}`,
            borderRadius: 6,
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: isFailed ? "#8b3b3b" : "#365f42",
              fontWeight: 700,
            }}
          >
            DELTA
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isFailed ? "#b71c1c" : "#1f6d3a",
            }}
          >
            {hasResult && !hasError ? fmt(delta) : "-"}
          </div>
        </div>
      </div>

      <details
        style={{
          marginBottom: 10,
          background: "#fff",
          border: "1px solid #dfe5ee",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            padding: "9px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: "#2b4055",
            background: "#f7f9fc",
          }}
        >
          Inspect Test Input Data
        </summary>
        <div
          style={{
            padding: "10px 12px",
            display: "grid",
            gridTemplateColumns: "minmax(130px, 180px) 1fr",
            gap: "6px 12px",
            fontSize: 12,
          }}
        >
          {inputRows.map(([label, value]) => (
            <>
              <div
                key={`${label}-k`}
                style={{ color: "#55697e", fontWeight: 600 }}
              >
                {label}
              </div>
              <div
                key={`${label}-v`}
                style={{ color: "#1e2c3a", wordBreak: "break-word" }}
              >
                {formatValue(value)}
              </div>
            </>
          ))}
        </div>
      </details>

      <button
        style={tcButtonStyle}
        onClick={() => onRun(testCase)}
        disabled={isRunning}
      >
        {isRunning ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                border: "2px solid #fff",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginRight: 6,
              }}
            />
            Running...
          </>
        ) : (
          "▶ Run"
        )}
      </button>
      {!isRunning && <TestResult result={result} testCase={testCase} />}
    </div>
  );
}
