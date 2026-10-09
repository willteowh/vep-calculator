import { useState } from "react";
import { Box, Button, GlobalStyles } from "@mui/material";

import { CalculatorTab } from "@/components/CalculatorTab";
import { TestCasesTab } from "@/components/TestCasesTab";
import { tabSx, tabsSx, wrapSx } from "@/components/appStyles";
import { INCLUDE_TESTS } from "@/config/features";
import { useFeeCalculator } from "@/hooks/useFeeCalculator";
import { useTestRunner } from "@/hooks/useTestRunner";

type Tab = "calc" | "tests";

export default function VEPCalculator() {
  const [tab, setTab] = useState<Tab>("calc");
  // Hooks live here so state survives switching tabs.
  const calculator = useFeeCalculator();
  const testRunner = useTestRunner();

  return (
    <>
      <GlobalStyles
        styles={{
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          ".infoBox > *": { marginBottom: 20 },
        }}
      />
      <Box sx={wrapSx}>
        {INCLUDE_TESTS && (
          <Box sx={tabsSx}>
            <Button
              disableRipple
              data-testid="tab-calc"
              sx={tabSx(tab === "calc")}
              onClick={() => setTab("calc")}
            >
              Fee Calculator
            </Button>
            <Button
              disableRipple
              data-testid="tab-tests"
              sx={tabSx(tab === "tests")}
              onClick={() => setTab("tests")}
            >
              Test Cases
            </Button>
          </Box>
        )}

        {tab === "calc" && <CalculatorTab calculator={calculator} />}
        {INCLUDE_TESTS && tab === "tests" && (
          <TestCasesTab runner={testRunner} />
        )}
      </Box>
    </>
  );
}
