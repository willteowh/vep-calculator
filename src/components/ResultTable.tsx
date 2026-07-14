import { fmt, fmtDt } from "@/utils/formatters";
import { CalculationResult } from "@/utils/calculations";
import {
  isPublicHoliday,
  getCalendarDate,
  getDateDifferenceDays,
} from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { linkStyle } from "./calculatorFormStyles";

interface ResultTableProps {
  result: CalculationResult;
  straddlesBoundary: boolean;
}

export function ResultTable({ result, straddlesBoundary }: ResultTableProps) {
  const resultStyles = {
    rWrap: {
      paddingTop: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      lineHeight: "24px",
    },
    summaryCard: {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
    },
    summaryHeader: {
      px: 2,
      py: 1.5,
      fontWeight: 700,
      backgroundColor: "#f3f4f7",
      borderBottom: "1px solid #e5e7eb",
    },
    row: {
      px: 2,
      py: 1.5,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 2,
    },
    rowLabel: {
      minWidth: 220,
      fontWeight: 600,
      color: "#333",
    },
    rowValue: {
      flex: 1,
      textAlign: "left",
    },
    footNote: {
      fontSize: "1rem",
      color: "#555",
      fontWeight: 700,
    },
    disclaimerCard: {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
    },
    infoFooter: {
      padding: "10px 14px",
    },
    noticeCard: {
      mb: 1,
      border: "1px solid #e5e7eb",
      boxShadow: "none",
    },
    warningCard: {
      backgroundColor: "#fff7e6",
      borderLeft: "4px solid #ed6c02",
    },
    infoCard: {
      backgroundColor: "#eef5ff",
      borderLeft: "4px solid #0288d1",
    },
    noticeContent: {
      py: 1,
      "&:last-child": {
        pb: 1,
      },
      fontWeight: 600,
    },
  } as const;
  const entryDt = new Date(result.entryDatetime);
  const departureDt = new Date(result.departDatetime);
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
  const [appliesRRC, setAppliesRRC] = useState<boolean>(
    result.vehicleCategory !== "motorcycles" && result.rrc > 0,
  );

  useEffect(() => {
    setAppliesRRC(result.vehicleCategory !== "motorcycles" && result.rrc > 0);
  }, [result.vehicleCategory, result.rrc]);

  return (
    // special note display for condition hit:
    // hasPublicHoliday => display note that the date range contains public holiday
    // more than 14 days => display "For Foreign cars and motorcycles, please note that your vehicle is allowed in Singapore for up to 14 days from the date of your last entry, or up to the expiry date of your vehicle's insurance and road tax, whichever is earlier."
    // if Car & No IU/OBU & no ERP day input => display "Please indicate the no. of days which you intend to drive through the ERP gantries during ERP operating hours"
    <Box sx={resultStyles.rWrap}>
      {straddlesBoundary && (
        <Card sx={{ ...resultStyles.noticeCard, ...resultStyles.warningCard }}>
          <CardContent sx={resultStyles.noticeContent}>
            <strong>Your trip straddles the 1 January 2027 rate change.</strong>{" "}
            Days before 2027 will be charged at current rates; days from 1 Jan
            2027 will be charged at the new rates. The breakdown is shown
            separately in the results.
          </CardContent>
        </Card>
      )}

      {totalDays > 14 && (
        <Card sx={{ ...resultStyles.noticeCard, ...resultStyles.infoCard }}>
          <CardContent sx={resultStyles.noticeContent}>
            For Foreign cars and motorcycles, please note that your vehicle is
            allowed in Singapore for up to 14 days from the date of your last
            entry, or up to the expiry date of your vehicle's insurance and road
            tax, whichever is earlier.
          </CardContent>
        </Card>
      )}

      {result.vehicleCategory === "cars" &&
        result.hasIU === "no" &&
        (!result.erpDays || String(result.erpDays).trim() === "") && (
          <Card sx={{ ...resultStyles.noticeCard, ...resultStyles.infoCard }}>
            <CardContent sx={resultStyles.noticeContent}>
              Please indicate the number of days you intend to drive through ERP
              gantries during ERP operating hours.
            </CardContent>
          </Card>
        )}
      {hasPublicHoliday && (
        <Card sx={{ ...resultStyles.noticeCard, ...resultStyles.infoCard }}>
          <CardContent sx={resultStyles.noticeContent}>
            The Date Range you chose contains Public Holiday
          </CardContent>
        </Card>
      )}

      <Card sx={resultStyles.summaryCard}>
        <Box sx={resultStyles.summaryHeader}>
          Result: For Foreign-registered vehicles only
        </Box>
        <Stack divider={<Divider />}>
          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>Vehicle Type</Typography>
            <Typography sx={resultStyles.rowValue}>
              {result.vehicleType}
            </Typography>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>Entry</Typography>
            <Typography sx={resultStyles.rowValue}>
              {fmtDt(entryDt, result.entryCheckpoint)}
            </Typography>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>Departure</Typography>
            <Typography sx={resultStyles.rowValue}>
              {fmtDt(departureDt, result.departCheckpoint)}
            </Typography>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>Duration of Stay</Typography>
            <Typography sx={resultStyles.rowValue}>
              {result.dur} day(s)
            </Typography>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>Toll Charges</Typography>
            <Typography sx={resultStyles.rowValue}>
              {fmt(result.tollTotal)}
            </Typography>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>VEP Charges</Typography>
            <Box sx={resultStyles.rowValue}>
              {result.vepFees > 0 ? (
                <>
                  {result.preDays > 0 && (
                    <Box>
                      {result.preDays} day(s) × ${result.rPre.vepPerDay}/day ={" "}
                      {fmt(result.vepFeePre)}
                    </Box>
                  )}
                  {result.postDays > 0 && (
                    <Box>
                      {result.postDays} day(s) × ${result.rPost.vepPerDay}/day ={" "}
                      {fmt(result.vepFeePost)}
                    </Box>
                  )}
                  {result.preDays === 0 && result.postDays === 0 && (
                    <Box>$0.00 (all days waived)</Box>
                  )}
                </>
              ) : (
                <Typography>{fmt(0)}</Typography>
              )}
            </Box>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>
              Total <br />
              <Typography component="span" sx={resultStyles.footNote}>
                (excluding {appliesRRC ? "Reciprocal Road Charge and " : ""}ERP
                charges)
              </Typography>
            </Typography>
            <Typography sx={resultStyles.rowValue}>
              {fmt(result.subtotal)}
            </Typography>
          </Box>

          {appliesRRC && (
            <Box sx={resultStyles.row}>
              <Typography sx={resultStyles.rowLabel}>
                Reciprocal Road Charge (RRC)
              </Typography>
              <Typography sx={resultStyles.rowValue}>
                {result.rrc > 0 ? `${fmt(result.rrc)} (per entry)` : "—"}
              </Typography>
            </Box>
          )}

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>ERP Charges</Typography>
            <Box sx={resultStyles.rowValue}>
              {result.vehicleCategory === "cars" && result.hasIU === "no" ? (
                <>
                  {result.erpDaysPre > 0 && (
                    <Box>
                      {result.erpDaysPre} day(s) × ${result.rPre.erpNoIU}/day =
                      {fmt(result.erpDaysPre * result.rPre.erpNoIU)}
                    </Box>
                  )}
                  {result.erpDaysPost > 0 && (
                    <Box>
                      {result.erpDaysPost} day(s) × ${result.rPost.erpNoIU}/day
                      = $ {fmt(result.erpDaysPost * result.rPost.erpNoIU)}
                    </Box>
                  )}
                  {result.erpDaysPre === 0 && result.erpDaysPost === 0 && (
                    <Box>$ 0.00</Box>
                  )}
                </>
              ) : result.vehicleCategory === "cars" ? (
                <>
                  Normal charges apply. Please refer to ERP rates{" "}
                  <Link
                    sx={linkStyle}
                    href="https://onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html#vehicle_rates"
                    target="_blank"
                    rel="noreferrer"
                  >
                    published
                  </Link>
                  .
                </>
              ) : (
                "Separate ERP Charges Apply"
              )}
            </Box>
          </Box>

          <Box sx={resultStyles.row}>
            <Typography sx={resultStyles.rowLabel}>
              Total <br />
              <Typography component="span" sx={resultStyles.footNote}>
                (including {appliesRRC ? "Reciprocal Road Charge and " : ""}ERP
                charges)
              </Typography>
            </Typography>
            <Typography sx={resultStyles.rowValue}>
              {fmt(result.grandTotal)}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Card sx={resultStyles.disclaimerCard}>
        <CardContent sx={resultStyles.infoFooter}>
          <Typography
            component="p"
            sx={{
              lineHeight: 1.6,
            }}
          >
            Please note that the above charges shown in the table do not include
            any fines or outstanding charges your vehicle might have incurred in
            its past/current visit to Singapore, and do not take into
            consideration the 10 VEP-fee free days (applicable for
            foreign-registered cars and motorcycles). Click{" "}
            <Link
              sx={linkStyle}
              href="www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/entering_and_exiting_singapore/cars-and-motorcycles-registered-in-malaysia.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to enquire VEP-fee free days.
            <br />
            <br />
            Disclaimers <br />
            <br />• Please be advised that the information derived from this
            computation table is a rough indication on the payable fees/charges
            amount. It is subjected to change as may be required or determined
            by the authority. <br />
            <br />
            • DISCLAIMER OF LIABILITY: With respect to information available
            from this site, neither the Land Transport Authority nor any of
            their employees assumes any legal liability or responsibility for
            the accuracy, completeness, or usefulness of any information. Please
            note that the information in this computation table should not be
            taken against the provider/authority. <br />
            <br />• From 15 February 2017, all foreign-registered cars will have
            to pay a Reciprocal Road Charge (RRC) on a per-entry basis when they
            enter Singapore via Tuas and Woodlands checkpoints. The RRC will be
            collected together with the Vehicle Entry Permit (VEP), toll charges
            and fixed Electronic Road Pricing (ERP) fees upon departure at Tuas
            or Woodlands Checkpoint. <br />
            <br />• For all foreign-registered cars, you will automatically be
            on the fixed ERP fee scheme if no In-vehicle Unit (IU) is installed
            in your vehicle. An ERP fee of S$5 daily is payable if you use
            ERP-priced roads during the ERP operating hours. <br />
            <br />• For vehicles with IUs, please note that separate ERP charges
            will apply. Click{" "}
            <Link
              sx={linkStyle}
              href="www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to enquire ERP rates*. <br />
            <br />
            • All terms and conditions outlined in the application for the
            International Circulation Permit (ICP), Visitor’s Permit (VP), ASEAN
            Goods Vehicle Permit (GVP) and ASEAN Public Service Vehicle Permit
            (PSVP) remains in force for other foreign-registered vehicles into
            Singapore, other than Vehicle Entry Permit (VEP) for
            foreign-registered cars and motorcycles. <br />
            <br />
            • Please note that the charges shown in this table do not include
            any fines or outstanding charges your vehicle might have incurred in
            its past/current visit to Singapore. <br />
            <br />
            • Foreign-registered vehicles detected at Woodlands or Tuas
            Checkpoint without valid LTA's VEP/GVP/PSVP approval email, Autopass
            card, insurance and road tax or are in violation of Singapore
            regulations will be turned back from Singapore. If the vehicle is
            found within Singapore, it would be subject to enforcement action
            including vehicle seizure.
            <br />
            <br />• Should you require any information on keeping or using a
            vehicle in Singapore, please log on to our{" "}
            <Link
              href="www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/entering_and_exiting_singapore.html"
              target="_blank"
            >
              website
            </Link>{" "}
            or call our hotlines at (02)-62255582 (from Malaysia) or at
            1800-2255-582 (for calls made in Singapore). <br />
            <br />* These rates are applicable to foreign-registered cars
            installed with IUs, otherwise, a flat rate of S$5 per day is payable
            irrespective of the number of gantries passed through on that day by
            the foreign-registered car. Please click{" "}
            <Link
              href="www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to learn more about ERP and applicable charges.
            <br />
            <br />
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
