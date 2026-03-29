import { fmt } from "@/utils/formatters";
import { testCaseStyles, RED } from "@/utils/styles";
import { CalculationResult, CalculationError } from "@/utils/calculations";

interface TestCase {
  id: number;
  label: string;
  desc: string;
  params: object;
  note: string;
}

interface TestResultProps {
  result?: CalculationResult | CalculationError;
  testCase: TestCase;
}

export function TestResult({ result, testCase }: TestResultProps) {
  if (!result) return null;

  const ok = !("error" in result);

  return (
    <div style={testCaseStyles.tcR(ok)}>
      {"error" in result ? (
        <strong>{result.error}</strong>
      ) : (
        <>
          <div>
            <strong>Duration:</strong> {result.dur} day(s) &nbsp;|&nbsp;
            <strong> Chargeable:</strong> {result.totalChargeable}
            {result.preDays > 0 && (
              <span style={testCaseStyles.tcN}>
                {" "}
                {result.preDays} pre-2027
              </span>
            )}
            {result.postDays > 0 && (
              <span style={testCaseStyles.tcN}>
                {" "}
                {result.postDays} from 2027
              </span>
            )}
          </div>
          <div>
            <strong>Tolls:</strong> {fmt(result.tollTotal)} &nbsp;|&nbsp;{" "}
            <strong>VEP:</strong> {fmt(result.vepFees)}
            {result.preDays > 0 && ` (pre: ${fmt(result.vepFeePre)})`}
            {result.postDays > 0 && ` (post: ${fmt(result.vepFeePost)})`}
          </div>
          <div>
            <strong>RRC:</strong> {result.rrc > 0 ? fmt(result.rrc) : "—"}{" "}
            &nbsp;|&nbsp; <strong>ERP:</strong> {result.erpNote}
          </div>
          <div style={{ marginTop: 6, fontWeight: 700 }}>
            Subtotal (excl RRC/ERP): {fmt(result.subtotal)}
          </div>
          <div
            style={{
              fontWeight: 700,
              color: ok ? "#1a6e2e" : RED,
              fontSize: 13,
            }}
          >
            Grand Total: {fmt(result.grandTotal)}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
            ℹ {testCase.note}
          </div>
        </>
      )}
    </div>
  );
}
