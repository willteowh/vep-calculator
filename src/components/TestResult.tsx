import { fmt } from "@/utils/formatters";
import { CalculationResult, CalculationError } from "@/utils/calculations";
import { evaluateTestCase } from "@/utils/testCaseEvaluation";

interface TestCase {
  id: number;
  label: string;
  desc: string;
  params: object;
  expectedTotal: number;
  note: string;
}

interface TestResultProps {
  result?: CalculationResult | CalculationError;
  testCase: TestCase;
}

export function TestResult({ result, testCase }: TestResultProps) {
  if (!result) return null;

  const evaluation = evaluateTestCase(testCase, result);
  const ok = evaluation.status === "passed";
  const totalMatches = evaluation.totalMatches;
  const themeColor = "#606fbb";

  return (
    <div
      style={{
        marginTop: 10,
        fontSize: 12,
        padding: "10px 12px",
        borderRadius: 3,
        background: ok && totalMatches ? "#f0faf0" : "#fff3f3",
        border: `1px solid ${ok && totalMatches ? "#b2dfb2" : "#f5c6c6"}`,
      }}
    >
      {"error" in result ? (
        <>
          <strong>{result.error}</strong>
          {ok && (
            <span style={{ marginLeft: 8, color: "#2e7d32", fontSize: 16 }}>
              ✅
            </span>
          )}
          {!ok && evaluation.expectedError && (
            <div style={{ marginTop: 6, color: themeColor, fontWeight: 700 }}>
              ❌ Expected: {evaluation.expectedError}
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            <strong>Duration:</strong> {result.dur} day(s) &nbsp;|&nbsp;
            <strong> Chargeable:</strong> {result.totalChargeable}
            {result.preDays > 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: "#336",
                  background: "#eef2ff",
                  padding: "6px 10px",
                  borderRadius: 3,
                  marginBottom: 8,
                }}
              >
                {" "}
                {result.preDays} pre-2027
              </span>
            )}
            {result.postDays > 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: "#336",
                  background: "#eef2ff",
                  padding: "6px 10px",
                  borderRadius: 3,
                  marginBottom: 8,
                }}
              >
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
              color: ok ? "#2e7d32" : themeColor,
              fontSize: 13,
            }}
          >
            Grand Total: {fmt(result.grandTotal)}
            {ok && (
              <span style={{ marginLeft: 8, color: "#2e7d32", fontSize: 16 }}>
                ✅
              </span>
            )}
            {!ok && (
              <span style={{ marginLeft: 8, color: themeColor, fontSize: 16 }}>
                ❌ Expected: {fmt(testCase.expectedTotal)}
              </span>
            )}
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
            ℹ {testCase.note}
          </div>
        </>
      )}
    </div>
  );
}
