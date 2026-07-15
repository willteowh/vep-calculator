import { fmt } from "@/utils/formatters";
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
  Link,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { formCardStyle, linkStyle } from "./calculatorFormStyles";

interface ResultTableProps {
  result: CalculationResult;
  straddlesBoundary: boolean;
}

export function ResultTable({ result, straddlesBoundary }: ResultTableProps) {
  const resultStyles = {
    wrapper: {
      ...formCardStyle,
      paddingTop: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    tableContainer: {
      border: "1px solid #E1E4E8",
      borderRadius: "8px",
      mt: 0,
      mb: 0,
      p: 0,
      overflow: "hidden",
      backgroundColor: "#fff",
      "& .MuiTableCell-root": { fontSize: "1rem" },
    },
    tableStyle: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: 0,
    },
    tableHead: {
      backgroundColor: "#F5F5FF",
      borderBottom: "1px solid #E1E4E8",
    },
    tableHeaderCell: {
      fontWeight: 700,
      color: "#333",
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
    },
    tableCell: {
      padding: "12px 16px",
      borderBottom: "1px solid #e5e7eb",
    },
    itemCell: {
      color: "#333",
    },
    totalCell: {
      backgroundColor: "#f5f5ff",
    },
    amountCell: {
      textAlign: "right" as const,
      color: "#333",
    },
    subTextCell: {},
    warningCard: {
      backgroundColor: "#fff7e6",
      border: "1px solid #ed6c02",
      boxShadow: "none",
      borderRadius: "8px",
    },
    infoCard: {
      backgroundColor: "#eef5ff",
      border: "1px solid #0288d1",
      borderRadius: "8px",
      py: 0.5,
      boxShadow: "none",
    },
    noticeContent: {
      display: "flex",
      alignItems: "center",
      py: 1,
      "&:last-child": {
        pb: 1,
      },
    },
    InfoIcon: {
      color: "#2847D8",
      flexShrink: 0,
      mr: 2,
      fontSize: 18,
    },
    erpInfoText: {
      fontSize: 18,
      lineHeight: 1.4,
      fontWeight: 400,
      color: "#2C2F36",
    },
    disclaimerCard: {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
      backgroundColor: "#F2F2FA",
    },
    disclaimerContent: {
      lineHeight: 1.6,
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
    <Box sx={resultStyles.wrapper}>
      {straddlesBoundary && (
        <Card sx={resultStyles.infoCard}>
          <CardContent sx={resultStyles.noticeContent}>
            <InfoOutlinedIcon sx={resultStyles.InfoIcon} />
            <strong>
              Your trip straddles the 1 January 2027 rate change.
            </strong>{" "}
            Days before 2027 will be charged at current rates; days from 1 Jan
            2027 will be charged at the new rates. The breakdown is shown
            separately in the results.
          </CardContent>
        </Card>
      )}

      {totalDays > 14 && (
        <Card sx={resultStyles.infoCard}>
          <CardContent sx={resultStyles.noticeContent}>
            <InfoOutlinedIcon sx={resultStyles.InfoIcon} />
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
          <Card sx={resultStyles.infoCard}>
            <CardContent sx={resultStyles.noticeContent}>
              <InfoOutlinedIcon sx={resultStyles.InfoIcon} />
              Please indicate the number of days intend to drive through ERP
              gantries during ERP operating hours.
            </CardContent>
          </Card>
        )}

      {hasPublicHoliday && (
        <Card sx={resultStyles.infoCard}>
          <CardContent sx={resultStyles.noticeContent}>
            <InfoOutlinedIcon sx={resultStyles.InfoIcon} />
            The Date Range you chose contains Public Holiday
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Result: For Foreign-registered vehicles only
      </Typography>

      <TableContainer sx={resultStyles.tableContainer}>
        <Table sx={resultStyles.tableStyle}>
          <TableHead>
            <TableRow sx={resultStyles.tableHead}>
              <TableCell sx={resultStyles.tableHeaderCell}>Item</TableCell>
              <TableCell
                sx={{ ...resultStyles.tableHeaderCell, textAlign: "right" }}
              >
                Amount <br /> ($)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                Toll Charges
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                {fmt(result.tollTotal)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography component="span" sx={resultStyles.subTextCell}>
                    VEP Charges
                  </Typography>
                  {result.preDays > 0 && (
                    <Typography component="span" sx={resultStyles.subTextCell}>
                      {result.preDays} day(s) × ${result.rPre.vepPerDay}/day
                    </Typography>
                  )}
                  {result.postDays > 0 && (
                    <Typography component="span" sx={resultStyles.subTextCell}>
                      {result.postDays} day(s) × ${result.rPost.vepPerDay}/day
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                {fmt(result.vepFees)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.itemCell,
                  ...resultStyles.totalCell,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                (excluding {appliesRRC ? "Reciprocal Road Charge and " : ""}
                ERP charges)
              </TableCell>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.amountCell,
                  ...resultStyles.totalCell,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {fmt(result.subtotal)}
                </Typography>
              </TableCell>
            </TableRow>

            {appliesRRC && (
              <TableRow>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
                >
                  Reciprocal Road Charge (RRC)
                </TableCell>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
                >
                  {result.rrc > 0 ? `${fmt(result.rrc)} (per entry)` : "—"}
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                ERP Charges
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                {fmt(result.erpCharge)}
              </TableCell>
            </TableRow>

            {result.vehicleCategory === "cars" && result.hasIU === "no" && (
              <>
                {result.erpDaysPre > 0 && (
                  <TableRow>
                    <TableCell sx={resultStyles.subTextCell}>
                      {result.erpDaysPre} day(s) × ${result.rPre.erpNoIU}/day
                    </TableCell>
                    <TableCell
                      sx={{ ...resultStyles.subTextCell, textAlign: "right" }}
                    >
                      {fmt(result.erpDaysPre * result.rPre.erpNoIU)}
                    </TableCell>
                  </TableRow>
                )}
                {result.erpDaysPost > 0 && (
                  <TableRow>
                    <TableCell sx={resultStyles.subTextCell}>
                      {result.erpDaysPost} day(s) × ${result.rPost.erpNoIU}/day
                    </TableCell>
                    <TableCell
                      sx={{ ...resultStyles.subTextCell, textAlign: "right" }}
                    >
                      ${fmt(result.erpDaysPost * result.rPost.erpNoIU)}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}

            <TableRow>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.itemCell,
                  ...resultStyles.totalCell,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                (including {appliesRRC ? "Reciprocal Road Charge and " : ""}
                ERP charges)
              </TableCell>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.amountCell,
                  ...resultStyles.totalCell,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {fmt(result.grandTotal)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        aria-hidden
        sx={{
          mt: 1.25,
          mb: 1.25,
          borderBottom: "1px solid #d9dde5",
          width: "100%",
        }}
      />

      <Card sx={resultStyles.disclaimerCard}>
        <CardContent>
          <Typography component="p" sx={resultStyles.disclaimerContent}>
            Please note that the above charges shown in the table do not include
            any fines or outstanding charges your vehicle might have incurred in
            its past/current visit to Singapore, and do not take into
            consideration the 10 VEP-fee free days (applicable for
            foreign-registered cars and motorcycles). Click{" "}
            <Link
              sx={linkStyle}
              href="https://www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/entering_and_exiting_singapore/cars-and-motorcycles-registered-in-malaysia.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to enquire VEP-fee free days.
            <br />
            <br />
            <strong>Disclaimers</strong>
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
              href="https://www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to enquire ERP rates*. <br />
            <br />
            • All terms and conditions outlined in the application for the
            International Circulation Permit (ICP), Visitor's Permit (VP), ASEAN
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
              sx={linkStyle}
              href="https://www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/entering_and_exiting_singapore.html"
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
              sx={linkStyle}
              href="https://www.onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html"
              target="_blank"
            >
              here
            </Link>{" "}
            to learn more about ERP and applicable charges.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
