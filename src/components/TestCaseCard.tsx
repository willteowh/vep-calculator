import { CUTOFF_2027 } from "@/config/constants";
import { CalculationResult, CalculationError } from "@/utils/calculations";
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

export function TestCaseCard({
  testCase,
  result,
  onRun,
  isRunning = false,
}: TestCaseCardProps) {
  const tcCardStyle = {
    border: "1px solid #ddd",
    borderRadius: 2,
    padding: "16px 20px",
    marginBottom: 12,
    background: "#fafafa",
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
        <strong>Expected Total:</strong> ${testCase.expectedTotal.toFixed(2)}
      </div>
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
