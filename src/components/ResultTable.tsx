import { fmt, fmtDt } from "@/utils/formatters";
import { resultStyles } from "@/utils/styles";
import { CalculationResult } from "@/utils/calculations";
import { FormState } from "@/hooks/useCalculatorForm";
import {
  isPublicHoliday,
  getCalendarDate,
  getDateDifferenceDays,
} from "@/utils/dateUtils";
import { VEPBreakdownCell } from "./VEPBreakdownCell";

interface ResultTableProps {
  result: CalculationResult;
  form: FormState;
  entryDt: Date;
  departureDt: Date;
}

export function ResultTable({
  result,
  form,
  entryDt,
  departureDt,
}: ResultTableProps) {
  const entryDate = getCalendarDate(entryDt);
  const deptDate = getCalendarDate(departureDt);
  const totalDays = getDateDifferenceDays(entryDate, deptDate) + 1;
  let hasPublicHoliday = false;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (isPublicHoliday(d)) {
      hasPublicHoliday = true;
      break;
    }
  }
  return (
    <div style={resultStyles.rWrap}>
      <div style={resultStyles.rTitle}>
        Result: For Foreign-registered vehicles only
      </div>
      {hasPublicHoliday && (
        <div
          style={{
            marginTop: 10,
            marginBottom: 10,
            fontSize: 12,
            color: "#d32f2f",
            fontWeight: 600,
            background: "#ffeaea",
            padding: "8px 12px",
            borderRadius: 4,
            border: "1px solid #f5c6c6",
          }}
        >
          The Date Range you chose contains Public Holiday
        </div>
      )}
      <table style={resultStyles.tbl}>
        <thead>
          <tr>
            <th style={resultStyles.th} colSpan={2}>
              Fee Breakdown
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={resultStyles.tdL}>Vehicle Type</td>
            <td style={resultStyles.tdV}>{result.vehicleType}</td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>Entry</td>
            <td style={resultStyles.tdV}>
              {fmtDt(entryDt, form.entryCheckpoint)}
            </td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>Departure</td>
            <td style={resultStyles.tdV}>
              {fmtDt(departureDt, form.departCheckpoint)}
            </td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>Duration of Stay</td>
            <td style={resultStyles.tdV}>{result.dur} day(s)</td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>
              Chargeable VEP Days
              <br />
              <span style={{ fontWeight: 400, fontSize: 11, color: "#777" }}>
                (excl. weekends, PH
                {result.preDays > 0 ? ", & pre-2027 waivers" : ""})
              </span>
            </td>
            <td style={resultStyles.tdV}>
              {result.totalChargeable} total
              {result.preDays > 0 && (
                <span>
                  <span style={resultStyles.pill("pre")}>
                    {result.preDays} pre-2027
                  </span>
                </span>
              )}
              {result.postDays > 0 && (
                <span>
                  <span style={resultStyles.pill("post")}>
                    {result.postDays} from 2027
                  </span>
                </span>
              )}
            </td>
          </tr>
          {/* <tr>
            <td style={resultStyles.tdL}>Entry Toll</td>
            <td style={resultStyles.tdV}>{fmt(result.entryToll)}</td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>Exit Toll</td>
            <td style={resultStyles.tdV}>{fmt(result.exitToll)}</td>
          </tr> */}
          <tr>
            <td style={resultStyles.tdL}>Toll Charges</td>
            <td style={resultStyles.tdV}>{fmt(result.tollTotal)}</td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>VEP Charges</td>
            <VEPBreakdownCell result={result} />
          </tr>
          <tr style={resultStyles.subTr}>
            <td style={{ ...resultStyles.tdL, fontWeight: 700 }}>
              Total (excluding Reciprocal Road Charge and ERP charges)
            </td>
            <td style={{ ...resultStyles.tdV, fontWeight: 700 }}>
              {fmt(result.subtotal)}
            </td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>Reciprocal Road Charge (RRC)</td>
            <td style={resultStyles.tdV}>
              {result.rrc > 0 ? `${fmt(result.rrc)} (per entry)` : "—"}
            </td>
          </tr>
          <tr>
            <td style={resultStyles.tdL}>ERP Charges</td>
            <td style={resultStyles.tdV}>{result.erpNote}</td>
          </tr>
          <tr style={resultStyles.gTr}>
            <td style={resultStyles.gTd}>Total (incl. RRC &amp; ERP)</td>
            <td style={resultStyles.gTd}>{fmt(result.grandTotal)}</td>
          </tr>
        </tbody>
      </table>
      <p
        style={{
          fontSize: 11,
          color: "#888",
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        * Values are indicative. Actual fees may differ based on authority
        decisions. ERP charges for vehicles with OBU/IU depend on actual gantry
        usage and are not included here. RRC applies per entry for cars only.
        Public holidays and school holidays are based on the predefined list and
        may not reflect the latest announcements. From 1 Jan 2027: VEP rates
        increase, evening/noon/10-day exemptions removed; only weekends &amp; PH
        remain free.
      </p>
    </div>
  );
}
