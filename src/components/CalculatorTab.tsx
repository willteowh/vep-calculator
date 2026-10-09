import { Box, Link, Typography } from "@mui/material";

import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultTable } from "@/components/ResultTable";
import {
  formCardStyle,
  introParagraphStyle,
  linkStyle,
  pageHeaderStyle,
} from "@/components/calculatorFormStyles";
import { errorBannerSx } from "@/components/appStyles";
import type { FeeCalculator } from "@/hooks/useFeeCalculator";

const NEWS_RELEASE_URL =
  "https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/updates-foreign-registered-vehicles-entering-singapore.html";

export function CalculatorTab({ calculator }: { calculator: FeeCalculator }) {
  const { form, errors, result, resetVersion, set, submit, quickFill, clear } =
    calculator;

  return (
    <Box>
      <Box className="infoBox">
        <Typography component="h1" style={pageHeaderStyle}>
          Calculate Fees and Charges for Foreign Vehicles in Singapore
        </Typography>
        <Typography sx={introParagraphStyle}>
          You can check your entry and exit toll charges, VEP fees and
          Reciprocal Road Charge to prepare for your next visit to Singapore.
          The values from the calculator are indicative. The actual fees and
          charges may be different depending on any changes that are determined
          by the authorities.
        </Typography>
        <Typography sx={introParagraphStyle}>
          As announced on 6 February 2026, the revised daily VEP fee, cessation
          of free VEP days and hours for cars and motorcycles and daily
          flat-rate ERP fee on ERP operational days for foreign-registered
          vehicles without OBUs, will apply from 1 January 2027.&nbsp;
        </Typography>
        <Typography sx={introParagraphStyle}>
          Refer to the&nbsp;
          <Link sx={linkStyle} href={NEWS_RELEASE_URL} target="_blank">
            news release
          </Link>
          &nbsp;and LTA OneMotoring website for more information.
        </Typography>
      </Box>

      <Box sx={formCardStyle}>
        <CalculatorForm
          form={form}
          errors={errors}
          resetVersion={resetVersion}
          onFieldChange={set}
          onCalculate={submit}
          onQuickFill={quickFill}
          onReset={clear}
        />

        {result && !("error" in result) && <ResultTable result={result} />}

        {result && "error" in result && (
          <Box sx={{ ...errorBannerSx, marginTop: 16 }}>{result.error}</Box>
        )}
      </Box>
    </Box>
  );
}
