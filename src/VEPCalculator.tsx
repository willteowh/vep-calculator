import { useState } from "react";

import { CalculatorTab } from "@/components/CalculatorTab";
import { TestCasesTab } from "@/components/TestCasesTab";
import { tabStyle, tabsStyle, wrapStyle } from "@/components/appStyles";
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
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .infoBox > * {
          margin-bottom: 20px;
        }
      `}</style>
      <div style={wrapStyle}>
        {INCLUDE_TESTS && (
          <div style={tabsStyle}>
            <button
              data-testid="tab-calc"
              style={tabStyle(tab === "calc")}
              onClick={() => setTab("calc")}
            >
              Fee Calculator
            </button>
            <button
              data-testid="tab-tests"
              style={tabStyle(tab === "tests")}
              onClick={() => setTab("tests")}
            >
              Test Cases
            </button>
          </div>
        )}

        {tab === "calc" && <CalculatorTab calculator={calculator} />}
        {INCLUDE_TESTS && tab === "tests" && (
          <TestCasesTab runner={testRunner} />
        )}
      </div>
    </>
  );
}
