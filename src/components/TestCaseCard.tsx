import { testCaseStyles, resultStyles } from "@/utils/styles";
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
  note: string;
}

interface TestCaseCardProps {
  testCase: TestCase;
  result?: CalculationResult | CalculationError;
  onRun: (testCase: TestCase) => void;
}

export function TestCaseCard({ testCase, result, onRun }: TestCaseCardProps) {
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
    <div style={testCaseStyles.tcCard}>
      <div style={testCaseStyles.tcT}>
        #{testCase.id} — {testCase.label}
        <span style={resultStyles.pill(isPeriod as "pre" | "post" | "default")}>
          {periodLabel}
        </span>
      </div>
      <div style={testCaseStyles.tcD}>{testCase.desc}</div>
      <div style={testCaseStyles.tcN}>
        <strong>Expected:</strong> {testCase.note}
      </div>
      <button style={testCaseStyles.tcB} onClick={() => onRun(testCase)}>
        ▶ Run
      </button>
      <TestResult result={result} testCase={testCase} />
    </div>
  );
}
