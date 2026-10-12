import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { CalculationResult } from "@/utils/calculations";
import { fmt } from "@/utils/formatters";
import { resultStyles } from "@/utils/resultStyles";
import { linkStyle } from "./calculatorFormStyles";

interface ChargeBreakdownTableProps {
  result: CalculationResult;
  departureDt: Date;
}

export function ChargeBreakdownTable({
  result,
  departureDt,
}: ChargeBreakdownTableProps) {
  const appliesRRC = result.vehicleCategory !== "motorcycles" && result.rrc > 0;
  const separateERPChargesApply = false;
  const normalERPChargesApply =
    (["cars", "taxis", "vans", "heavyGoods", "buses"].includes(
      result.vehicleCategory,
    ) &&
      result.hasIU === "yes") ||
    (result.vehicleCategory === "motorcycles" &&
      result.hasIU === "yes" &&
      departureDt >= new Date("2027-01-01T00:00:00"));
  const erpFlatRateApplies =
    result.hasIU === "no" ||
    (result.vehicleCategory === "motorcycles" &&
      result.hasIU === "yes" &&
      departureDt < new Date("2027-01-01T00:00:00"));

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>
        Charges:
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
            <TableRow sx={resultStyles.itemRow}>
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

            <TableRow sx={resultStyles.itemRow}>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography component="span" sx={resultStyles.subTextCell}>
                    VEP Charges
                  </Typography>
                  {result.vepFees !== 0 && (
                    <>
                      {result.preDays > 0 && "vepPerDay" in result.rPre && (
                        <Typography
                          component="span"
                          sx={resultStyles.subTextCell}
                        >
                          {result.preDays} day(s) × ${result.rPre.vepPerDay}/day
                        </Typography>
                      )}
                      {result.postDays > 0 && "vepPerDay" in result.rPost && (
                        <Typography
                          component="span"
                          sx={resultStyles.subTextCell}
                        >
                          {result.postDays} day(s) × ${result.rPost.vepPerDay}
                          /day
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                {fmt(result.vepFees)}
              </TableCell>
            </TableRow>

            <TableRow sx={resultStyles.totalRow}>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
                (excluding other charges)
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {fmt(result.subtotal)}
                </Typography>
              </TableCell>
            </TableRow>

            {appliesRRC && (
              <TableRow sx={resultStyles.itemRow}>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
                >
                  Reciprocal Road Charge (per entry)
                </TableCell>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
                >
                  {result.rrc > 0 ? fmt(result.rrc) : "—"}
                </TableCell>
              </TableRow>
            )}

            {result.psvpFee > 0 && (
              <TableRow sx={resultStyles.itemRow}>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
                >
                  PSVP Fee (per entry)
                </TableCell>
                <TableCell
                  sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
                >
                  {fmt(result.psvpFee)}
                </TableCell>
              </TableRow>
            )}

            <TableRow sx={resultStyles.itemRow}>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.itemCell }}
              >
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Typography component="span" sx={resultStyles.subTextCell}>
                    {erpFlatRateApplies && (
                      <>Flat-rate ERP Charges (indicative)</>
                    )}
                    {!erpFlatRateApplies && <>ERP Charges</>}
                  </Typography>
                  {erpFlatRateApplies && result.erpCharge > 0 && (
                    <>
                      {result.erpDaysPre > 0 && (
                        <Typography
                          component="span"
                          sx={resultStyles.subTextCell}
                        >
                          {result.erpDaysPre} day(s) × ${result.rPre.erpNoIU}
                          /day
                        </Typography>
                      )}
                      {result.erpDaysPost > 0 && (
                        <Typography
                          component="span"
                          sx={resultStyles.subTextCell}
                        >
                          {result.erpDaysPost} day(s) × ${result.rPost.erpNoIU}
                          /day
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{ ...resultStyles.tableCell, ...resultStyles.amountCell }}
              >
                <Typography>
                  {separateERPChargesApply && <>Separate ERP charges apply.</>}
                  {normalERPChargesApply && (
                    <>
                      Normal ERP charges apply. <br />
                      Please refer to ERP Rates{" "}
                      <Link
                        sx={linkStyle}
                        href="https://onemotoring.lta.gov.sg/content/onemotoring/home/driving/ERP.html#vehicle_rates"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        published
                      </Link>
                    </>
                  )}
                  {erpFlatRateApplies && <>{fmt(result.erpCharge)}</>}
                </Typography>
              </TableCell>
            </TableRow>

            <TableRow sx={resultStyles.totalRow}>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.itemCell,
                  ...resultStyles.tableFooterCell,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Total</Typography>
              </TableCell>
              <TableCell
                sx={{
                  ...resultStyles.tableCell,
                  ...resultStyles.amountCell,
                  ...resultStyles.tableFooterCell,
                }}
              >
                <Typography data-testid="grand-total" sx={{ fontWeight: 600 }}>
                  {fmt(result.grandTotal)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
