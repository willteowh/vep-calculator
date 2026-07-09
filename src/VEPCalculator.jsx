"use client";
import { useState, useEffect } from "react";

import { useCalculatorForm } from "@/hooks/useCalculatorForm";
import { calculate } from "@/utils/calculations";
import {
  CUTOFF_2027,
  QUICK_FILL_MAX_DAYS,
  QUICK_FILL_STAY_DAYS_MAX,
} from "@/config/constants";
import { TEST_CASES } from "@/config/testCases";

import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultTable } from "@/components/ResultTable";
import { TestCaseCard } from "@/components/TestCaseCard";

import { baseStyles, infoStyles, buttonStyles } from "@/utils/styles";

export default function VEPCalculator() {
  const { form, errors, set, setErrors, validate, reset } = useCalculatorForm();
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("calc");
  const [testResults, setTestResults] = useState({});
  const includeTests = import.meta.env.VITE_INCLUDE_TESTS !== "false";
  const hideIfProd = import.meta.env.VITE_INCLUDE_TESTS !== "false";

  const [testSummary, setTestSummary] = useState(null);
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [runningTests, setRunningTests] = useState([]);

  useEffect(() => {
    let passed = 0;
    let total = TEST_CASES.length;
    TEST_CASES.forEach((tc) => {
      const result = testResults[tc.id];
      if (result && !("error" in result)) {
        const totalMatches =
          Math.abs(result.grandTotal - tc.expectedTotal) < 0.01;
        if (totalMatches) passed++;
      }
    });
    setTestSummary({ passed, total });
  }, [testResults]);

  function handleCalculate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setResult(null);
    setCalculateLoading(true);

    // Simulate async calculation (in a real app, this might be an actual async operation)
    setTimeout(() => {
      const entryDt = new Date(form.entryDatetime);
      const departureDt = new Date(form.departDatetime);

      if (departureDt <= entryDt) {
        setErrors({ _g: "Departure must be after entry date/time." });
        setCalculateLoading(false);
        return;
      }

      const res = calculate({
        ...form,
        entryDt,
        departureDt,
      });

      setResult(res);
      setCalculateLoading(false);
    }, 500); // Small delay to show loading animation
  }

  function handleQuickFill() {
    const now = new Date();
    const entryDate = new Date(
      now.getTime() + Math.random() * QUICK_FILL_MAX_DAYS * 24 * 60 * 60 * 1000,
    );

    const stayDays = Math.floor(Math.random() * QUICK_FILL_STAY_DAYS_MAX) + 1;
    const departDate = new Date(
      entryDate.getTime() + stayDays * 24 * 60 * 60 * 1000,
    );

    const randomForm = {
      vehicleCategory: Math.random() > 0.5 ? "cars" : "motorcycles",
      hasIU: Math.random() > 0.5 ? "yes" : "no",
      entryDatetime: entryDate.toISOString().slice(0, 16),
      departDatetime: departDate.toISOString().slice(0, 16),
      entryCheckpoint: Math.random() > 0.5 ? "woodlands" : "tuas",
      departCheckpoint: Math.random() > 0.5 ? "woodlands" : "tuas",
      erpDays: Math.floor(Math.random() * stayDays).toString(),
    };

    Object.entries(randomForm).forEach(([k, v]) => {
      set(k, v);
    });
    setErrors({});
    setResult(null);
  }

  function handleReset() {
    reset();
    setResult(null);
    setCalculateLoading(false);
  }

  function handleTestRun(testCase) {
    setTestSummary(null);
    setTestResults((prev) => ({ ...prev, [testCase.id]: undefined }));
    setRunningTests((prev) => [...prev, testCase.id]);

    setTimeout(() => {
      const res = calculate(testCase.params);
      setTestResults((prev) => ({ ...prev, [testCase.id]: res }));
      setRunningTests((prev) => prev.filter((id) => id !== testCase.id));
    }, 500);
  }

  function handleRunAllTests() {
    setTestLoading(true);
    setTestSummary(null);
    setRunningTests(TEST_CASES.map((tc) => tc.id));
    setTestResults({});

    // Simulate async test running
    setTimeout(() => {
      const newResults = {};
      TEST_CASES.forEach((tc) => {
        newResults[tc.id] = calculate(tc.params);
      });
      setTestResults(newResults);
      setTestLoading(false);
      setRunningTests([]);
    }, 1000); // Longer delay for test running
  }

  const straddlesBoundary = (() => {
    if (!form.entryDatetime || !form.departDatetime) return false;
    const entry = new Date(form.entryDatetime);
    const dept = new Date(form.departDatetime);
    return entry < CUTOFF_2027 && dept >= CUTOFF_2027;
  })();

  return (
    <>
      <style>{`
        .vep-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 768px) {
          .vep-grid {
            grid-template-columns: 1fr 1fr;
          }
          .full-width {
            grid-column: span 2;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={baseStyles.wrap}>
        {hideIfProd && (
          <div style={baseStyles.tabs}>
            <button
              style={baseStyles.tab(tab === "calc")}
              onClick={() => setTab("calc")}
            >
              Fee Calculator
            </button>
            {includeTests && (
              <button
                style={baseStyles.tab(tab === "tests")}
                onClick={() => {
                  setTab("tests");
                }}
              >
                Test Cases
              </button>
            )}
          </div>
        )}

        {/* ── Calculator Tab ── */}
        {tab === "calc" && (
          <>
            <CalculatorForm
              form={form}
              errors={errors}
              straddlesBoundary={straddlesBoundary}
              loading={calculateLoading}
              onFieldChange={set}
              onCalculate={handleCalculate}
              onQuickFill={handleQuickFill}
              onReset={handleReset}
            />

            {result && !("error" in result) && <ResultTable result={result} />}

            {result && "error" in result && (
              <div style={{ ...infoStyles.errBanner, marginTop: 16 }}>
                {result.error}
              </div>
            )}
          </>
        )}

        {/* ── Test Cases Tab ── */}
        {includeTests && tab === "tests" && (
          <div>
            <div style={infoStyles.info}>
              9 test cases covering pre-2027, post-2027, and boundary-straddling
              scenarios. Click <strong>▶ Run</strong> to execute each one
              against the calculation engine, or <strong>Run All Tests</strong>{" "}
              to execute all at once.
            </div>
            <div style={{ marginBottom: 16 }}>
              <button
                style={{
                  ...buttonStyles.btn,
                  background: "#2196f3",
                  marginRight: 8,
                }}
                onClick={handleRunAllTests}
                disabled={testLoading}
              >
                {testLoading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        border: "2px solid #ffffff",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginRight: "8px",
                      }}
                    ></span>
                    Running Tests...
                  </>
                ) : (
                  "Run All Tests"
                )}
              </button>
              {!testLoading && testSummary && (
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    backgroundColor:
                      testSummary.passed === testSummary.total
                        ? "#e8f5e8"
                        : "#ffeaea",
                    border: `1px solid ${testSummary.passed === testSummary.total ? "#4caf50" : "#f44336"}`,
                    borderRadius: 4,
                    fontWeight: 600,
                    color:
                      testSummary.passed === testSummary.total
                        ? "#2e7d32"
                        : "#c62828",
                  }}
                >
                  {testSummary.passed}/{testSummary.total} test cases passed
                </div>
              )}
            </div>
            {TEST_CASES.map((tc) => (
              <TestCaseCard
                key={tc.id}
                testCase={tc}
                result={
                  !testLoading && !runningTests.includes(tc.id)
                    ? testResults[tc.id]
                    : undefined
                }
                onRun={handleTestRun}
                isRunning={testLoading || runningTests.includes(tc.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
