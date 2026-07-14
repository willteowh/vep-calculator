import { fmt } from "@/utils/formatters";
import { CalculationResult } from "@/utils/calculations";

interface VEPBreakdownCellProps {
  result: CalculationResult;
}

export function VEPBreakdownCell({ result }: VEPBreakdownCellProps) {
  return (
    <td
      style={{
        padding: "15px 10px",
        borderBottom: "1px solid #eee",
        borderRight: "1px solid rgb(221, 221, 221)",
        verticalAlign: "top",
      }}
    >
      {result.preDays > 0 && (
        <div>
          {result.preDays} day(s) × ${result.rPre.vepPerDay}/day{" "}
          {/* <span style={resultStyles.pill("pre")}>pre-2027</span>  */}
          <span>=</span> {fmt(result.vepFeePre)}
        </div>
      )}
      {result.postDays > 0 && (
        <div>
          {result.postDays} day(s) × ${result.rPost.vepPerDay}/day{" "}
          {/* <span style={resultStyles.pill("post")}>from 2027</span>  */}
          <span>=</span> {fmt(result.vepFeePost)}
        </div>
      )}
      {result.preDays === 0 && result.postDays === 0 && (
        <div>$0.00 (all days waived)</div>
      )}
      {/* {(result.preDays > 0 || result.postDays > 0) && (
        <div style={{ marginTop: 4 }}>Total: {fmt(result.vepFees)}</div>
      )} */}
    </td>
  );
}
