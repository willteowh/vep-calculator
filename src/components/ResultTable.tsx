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
              Result: For Foreign-registered vehicles only
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
          {/* <tr>
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
          </tr> */}
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
              Total{" "}
              <span style={resultStyles.footNote}>
                (excluding Reciprocal Road Charge and ERP charges)
              </span>
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
            <td style={resultStyles.tdL}>Total (incl. RRC &amp; ERP)</td>
            <td style={resultStyles.tdV}>{fmt(result.grandTotal)}</td>
          </tr>
          <tr style={resultStyles.gTr}>
            <td style={resultStyles.infoTr} colSpan={2}>
              <div style={resultStyles.infoFooter}>
                <p
                  style={{
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  Please note that the above charges shown in the table do not
                  include any fines or outstanding charges your vehicle might
                  have incurred in its past/current visit to Singapore, and do
                  not take into consideration the 10 VEP-fee free days
                  (applicable for foreign-registered cars and motorcycles).
                  Click{" "}
                  <a
                    href="www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/entering_and_exiting_singapore/cars-and-motorcycles-registered-in-malaysia.html"
                    target="_blank"
                  >
                    here
                  </a>{" "}
                  to enquire VEP-fee free days.
                  <br />
                  <br />
                  Disclaimers <br />
                  <br />• Please be advised that the information derived from
                  this computation table is a rough indication on the payable
                  fees/charges amount. It is subjected to change as may be
                  required or determined by the authority. <br />
                  <br />
                  • DISCLAIMER OF LIABILITY: With respect to information
                  available from this site, neither the Land Transport Authority
                  nor any of their employees assumes any legal liability or
                  responsibility for the accuracy, completeness, or usefulness
                  of any information. Please note that the information in this
                  computation table should not be taken against the
                  provider/authority. <br />
                  <br />
                  • From 15 February 2017, all foreign-registered cars will have
                  to pay a Reciprocal Road Charge (RRC) on a per-entry basis
                  when they enter Singapore via Tuas and Woodlands checkpoints.
                  The RRC will be collected together with the Vehicle Entry
                  Permit (VEP), toll charges and fixed Electronic Road Pricing
                  (ERP) fees upon departure at Tuas or Woodlands Checkpoint.{" "}
                  <br />
                  <br />
                  • For all foreign-registered cars, you will automatically be
                  on the fixed ERP fee scheme if no In-vehicle Unit (IU) is
                  installed in your vehicle. An ERP fee of S$5 daily is payable
                  if you use ERP-priced roads during the ERP operating hours.{" "}
                  <br />
                  <br />• For vehicles with IUs, please note that separate ERP
                  charges will apply. Click{" "}
                  <a
                    href="/content/onemotoring/home/driving/ERP.html"
                    target="_blank"
                  >
                    here
                  </a>{" "}
                  to enquire ERP rates*. <br />
                  <br />
                  • All terms and conditions outlined in the application for the
                  International Circulation Permit (ICP), Visitor’s Permit (VP),
                  ASEAN Goods Vehicle Permit (GVP) and ASEAN Public Service
                  Vehicle Permit (PSVP) remains in force for other
                  foreign-registered vehicles into Singapore, other than Vehicle
                  Entry Permit (VEP) for foreign-registered cars and
                  motorcycles. <br />
                  <br />
                  • Please note that the charges shown in this table do not
                  include any fines or outstanding charges your vehicle might
                  have incurred in its past/current visit to Singapore. <br />
                  <br />
                  • Foreign-registered vehicles detected at Woodlands or Tuas
                  Checkpoint without valid LTA's VEP/GVP/PSVP approval email,
                  Autopass card, insurance and road tax or are in violation of
                  Singapore regulations will be turned back from Singapore. If
                  the vehicle is found within Singapore, it would be subject to
                  enforcement action including vehicle seizure.
                  <br />
                  <br />• Should you require any information on keeping or using
                  a vehicle in Singapore, please log on to our{" "}
                  <a
                    href="/content/onemotoring/home/driving/entering_and_exiting_singapore.html"
                    target="_blank"
                  >
                    website
                  </a>{" "}
                  or call our hotlines at (02)-62255582 (from Malaysia) or at
                  1800-2255-582 (for calls made in Singapore). <br />
                  <br />* These rates are applicable to foreign-registered cars
                  installed with IUs, otherwise, a flat rate of S$5 per day is
                  payable irrespective of the number of gantries passed through
                  on that day by the foreign-registered car. Please click{" "}
                  <a
                    href="/content/onemotoring/home/driving/ERP.html"
                    target="_blank"
                  >
                    here
                  </a>{" "}
                  to learn more about ERP and applicable charges.
                  <br />
                  <br />
                </p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
