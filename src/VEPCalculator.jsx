"use client";
import { useState, useEffect, useRef } from "react";

import { useCalculatorForm } from "@/hooks/useCalculatorForm";
import { calculate } from "@/utils/calculations";
import {
  QUICK_FILL_MAX_DAYS,
  QUICK_FILL_STAY_DAYS_MAX,
} from "@/config/constants";
import { TEST_CASES } from "@/config/testCases";
import { buildTestCasesCsv, parseTestCasesCsv } from "@/utils/testCaseCsv";
import { evaluateTestCase } from "@/utils/testCaseEvaluation";
import { Box, Typography, Link } from "@mui/material";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultTable } from "@/components/ResultTable";
import { TestCaseCard } from "@/components/TestCaseCard";
import {
  pageHeaderStyle,
  introParagraphStyle,
  linkStyle,
} from "@/components/calculatorFormStyles";
import { formCardStyle } from "@/components/calculatorFormStyles";

export default function VEPCalculator() {
  const themeColor = "#606fbb";
  const baseStyles = {
    wrap: {
      fontSize: 16,
      color: "#222",
      maxWidth: 960,
      margin: "0 auto",
      padding: 16,
    },
    tabs: {
      display: "flex",
      borderBottom: `2px solid ${themeColor}`,
      marginBottom: 24,
    },
    tab: (active) => ({
      padding: "9px 22px",
      cursor: "pointer",
      fontWeight: 700,
      background: active ? themeColor : "#f0f0f0",
      color: active ? "#fff" : "#555",
      borderTop: `1px solid ${active ? themeColor : "#ddd"}`,
      borderLeft: `1px solid ${active ? themeColor : "#ddd"}`,
      borderRight: `1px solid ${active ? themeColor : "#ddd"}`,
      borderBottom: "none",
      borderRadius: "4px 4px 0 0",
      marginRight: 4,
    }),
  };
  const infoStyles = {
    info: {
      background: "#fff8e1",
      border: "1px solid #ffe082",
      borderLeft: "4px solid #f9a825",
      padding: "11px 14px",
      borderRadius: 2,
      marginBottom: 16,
      lineHeight: 1.7,
    },
    errBanner: {
      background: "#ffeaea",
      border: "1px solid #f5c6c6",
      borderLeft: `4px solid ${themeColor}`,
      padding: "10px 14px",
      borderRadius: 2,
      marginBottom: 16,
      color: themeColor,
    },
  };
  const buttonStyles = {
    btn: {
      background: "#606fbb",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "10px 48px",
      fontWeight: 700,
      cursor: "pointer",
      marginRight: 10,
    },
  };

  const { form, errors, set, setErrors, validate, reset } = useCalculatorForm();
  const [result, setResult] = useState(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [tab, setTab] = useState("calc");
  const [testCases, setTestCases] = useState(TEST_CASES);
  const [testResults, setTestResults] = useState({});
  const includeTests = import.meta.env.VITE_INCLUDE_TESTS !== "false";
  const hideIfProd = import.meta.env.VITE_INCLUDE_TESTS !== "false";

  const [testSummary, setTestSummary] = useState(null);
  const [calculateLoading, setCalculateLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [runningTests, setRunningTests] = useState([]);
  const [csvStatus, setCsvStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const csvInputRef = useRef(null);

  const formatDateTimeLocal = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    let passed = 0;
    let failed = 0;
    let running = 0;
    let notRun = 0;
    let total = testCases.length;

    testCases.forEach((tc) => {
      if (runningTests.includes(tc.id)) {
        running++;
        return;
      }

      const result = testResults[tc.id];
      if (!result) {
        notRun++;
        return;
      }

      const evaluation = evaluateTestCase(tc, result);
      if (evaluation.passed) passed++;
      else failed++;
    });
    setTestSummary({ passed, failed, running, notRun, total });
  }, [testResults, testCases, runningTests]);

  function getTestStatus(testCase) {
    if (runningTests.includes(testCase.id)) return "running";
    const result = testResults[testCase.id];
    if (!result) return "not-run";
    return evaluateTestCase(testCase, result).status;
  }

  function getTestDelta(testCase) {
    const result = testResults[testCase.id];
    if (!result) return Number.NEGATIVE_INFINITY;

    const evaluation = evaluateTestCase(testCase, result);
    if (Number.isFinite(evaluation.delta)) return evaluation.delta;

    // Bring failed error cases to the top when sorting by delta.
    return evaluation.status === "failed"
      ? Number.POSITIVE_INFINITY
      : Number.NEGATIVE_INFINITY;
  }

  const displayedTestCases = [...testCases]
    .filter((tc) => {
      if (statusFilter === "all") return true;
      return getTestStatus(tc) === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "id") return a.id - b.id;

      if (sortBy === "status") {
        const rank = {
          failed: 0,
          running: 1,
          "not-run": 2,
          passed: 3,
        };
        const rankDiff = rank[getTestStatus(a)] - rank[getTestStatus(b)];
        if (rankDiff !== 0) return rankDiff;
        return a.id - b.id;
      }

      // sortBy === "delta"
      const deltaDiff = getTestDelta(b) - getTestDelta(a);
      if (deltaDiff !== 0) return deltaDiff;
      return a.id - b.id;
    });

  function handleDownloadSampleCsv() {
    const csv = buildTestCasesCsv(TEST_CASES);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vep-test-cases-sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleUploadCsv(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedCases = parseTestCasesCsv(text);

      setTestCases(importedCases);
      setTestResults({});
      setRunningTests([]);
      setTestLoading(false);
      setTestSummary(null);
      setCsvStatus(
        `Loaded ${importedCases.length} test case(s) from ${file.name}.`,
      );
    } catch (err) {
      setCsvStatus(
        `Failed to import CSV: ${err instanceof Error ? err.message : "Invalid CSV file."}`,
      );
    } finally {
      event.target.value = "";
    }
  }

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

      // sanitise ERP day rate across year
      const showErp2026 =
        form.entryDatetime >= "2026-01-01T00:00" &&
        form.entryDatetime < "2027-01-01T00:00";
      const showErp2027 = form.departDatetime >= "2027-01-01T00:00";
      if (!showErp2026) form.erpDays2026 = "";
      if (!showErp2027) form.erpDays202 = "";

      if (departureDt < entryDt) {
        setErrors({ _g: "Departure must be after entry date/time." });
        setCalculateLoading(false);
        return;
      }

      // if Taxi, hasIU is always yes
      if (form.vehicleCategory === "taxis") form.hasIU = "yes";

      const res = calculate({
        ...form,
        entryDt,
        departureDt,
      });
      console.log(res);
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

    const entryYear = entryDate.getFullYear();
    const randomErpDays = Math.floor(Math.random() * (stayDays + 1)).toString();

    let erpDays2026 = "";
    let erpDays2027 = "";
    if (entryYear === 2026) {
      erpDays2026 = randomErpDays;
    } else if (entryYear === 2027) {
      erpDays2027 = randomErpDays;
    }

    const randomForm = {
      vehicleCategory: Math.random() > 0.5 ? "cars" : "motorcycles",
      hasIU: Math.random() > 0.5 ? "yes" : "no",
      entryDatetime: formatDateTimeLocal(entryDate),
      departDatetime: formatDateTimeLocal(departDate),
      entryCheckpoint: Math.random() > 0.5 ? "woodlands" : "tuas",
      departCheckpoint: Math.random() > 0.5 ? "woodlands" : "tuas",
      erpDays2026,
      erpDays2027,
    };

    Object.entries(randomForm).forEach(([k, v]) => {
      set(k, v);
    });
    setErrors({});
    setResult(null);
  }

  function handleReset() {
    reset();
    setResetVersion((prev) => prev + 1);
    setResult(null);
    setCalculateLoading(false);
  }

  function handleTestRun(testCase) {
    setTestSummary(null);
    setTestResults((prev) => ({ ...prev, [testCase.id]: undefined }));
    setRunningTests((prev) => [...prev, testCase.id]);

    setTimeout(() => {
      const res = calculate(testCase.params);
      console.log(res);
      setTestResults((prev) => ({ ...prev, [testCase.id]: res }));
      setRunningTests((prev) => prev.filter((id) => id !== testCase.id));
    }, 500);
  }

  function handleRunAllTests() {
    setTestLoading(true);
    setTestSummary(null);
    setRunningTests(testCases.map((tc) => tc.id));
    setTestResults({});

    // Simulate async test running
    setTimeout(() => {
      const newResults = {};
      testCases.forEach((tc) => {
        newResults[tc.id] = calculate(tc.params);
      });
      setTestResults(newResults);
      setTestLoading(false);
      setRunningTests([]);
    }, 1000); // Longer delay for test running
  }

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
        .infoBox > * {
          margin-bottom: 20px;
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
          <Box>
            <Box className="infoBox">
              <Typography component="h1" style={pageHeaderStyle}>
                Calculate Fees and Charges for Foreign Vehicles in Singapore
              </Typography>
              <Typography sx={introParagraphStyle}>
                You can check your entry and exit toll charges, VEP fees and
                Reciprocal Road Charge to prepare for your next visit to
                Singapore. The values from the calculator are indicative. The
                actual fees and charges may be different depending on any
                changes that are determined by the authorities.
              </Typography>
              <Typography sx={introParagraphStyle}>
                As announced on 6 February 2026, the revised daily VEP fee,
                cessation of free VEP days and hours for cars and motorcycles
                and daily flat-rate ERP fee on ERP operational days for
                foreign-registered vehicles without OBUs, will apply from 1
                January 2027.&nbsp;
              </Typography>
              <Typography sx={introParagraphStyle}>
                Refer to the&nbsp;
                <Link
                  sx={linkStyle}
                  href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/updates-foreign-registered-vehicles-entering-singapore.html"
                  target="_blank"
                >
                  news release
                </Link>
                &nbsp;and LTA OneMotoring website for more information.
              </Typography>
            </Box>

            <Box sx={formCardStyle}>
              <CalculatorForm
                form={form}
                errors={errors}
                loading={calculateLoading}
                resetVersion={resetVersion}
                onFieldChange={set}
                onCalculate={handleCalculate}
                onQuickFill={handleQuickFill}
                onReset={handleReset}
              />

              {result && !("error" in result) && (
                <ResultTable result={result} />
              )}

              {result && "error" in result && (
                <div style={{ ...infoStyles.errBanner, marginTop: 16 }}>
                  {result.error}
                </div>
              )}
            </Box>
          </Box>
        )}

        {/* ── Test Cases Tab ── */}
        {includeTests && tab === "tests" && (
          <div>
            <div style={infoStyles.info}>
              {testCases.length} test cases loaded. Download the sample CSV, add
              custom rows, upload it, then click <strong>Run All Tests</strong>
              to execute the full set. Use filters and sorting below to triage
              failed cases quickly.
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
              <button
                style={{
                  ...buttonStyles.btn,
                  background: "#4caf50",
                  marginRight: 8,
                }}
                onClick={handleDownloadSampleCsv}
                disabled={testLoading}
              >
                Download Sample CSV
              </button>
              <button
                style={{
                  ...buttonStyles.btn,
                  background: "#7e57c2",
                  marginRight: 8,
                }}
                onClick={() => csvInputRef.current?.click()}
                disabled={testLoading}
              >
                Upload CSV
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleUploadCsv}
                style={{ display: "none" }}
              />
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
              {csvStatus && (
                <div
                  style={{
                    marginTop: 10,
                    color: csvStatus.startsWith("Failed")
                      ? "#c62828"
                      : "#2e7d32",
                    fontWeight: 600,
                  }}
                >
                  {csvStatus}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <button
                style={{
                  ...buttonStyles.btn,
                  padding: "8px 14px",
                  background: statusFilter === "all" ? "#455a64" : "#90a4ae",
                }}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                style={{
                  ...buttonStyles.btn,
                  padding: "8px 14px",
                  background: statusFilter === "failed" ? "#d32f2f" : "#ef9a9a",
                }}
                onClick={() => setStatusFilter("failed")}
              >
                Failed
              </button>
              <button
                style={{
                  ...buttonStyles.btn,
                  padding: "8px 14px",
                  background:
                    statusFilter === "running" ? "#1976d2" : "#90caf9",
                }}
                onClick={() => setStatusFilter("running")}
              >
                Running
              </button>
              <button
                style={{
                  ...buttonStyles.btn,
                  padding: "8px 14px",
                  background:
                    statusFilter === "not-run" ? "#6d4c41" : "#bcaaa4",
                }}
                onClick={() => setStatusFilter("not-run")}
              >
                Not Run
              </button>
              <button
                style={{
                  ...buttonStyles.btn,
                  padding: "8px 14px",
                  background: statusFilter === "passed" ? "#2e7d32" : "#a5d6a7",
                }}
                onClick={() => setStatusFilter("passed")}
              >
                Passed
              </button>

              <label
                style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }}
              >
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: "1px solid #c8d0de",
                  minWidth: 150,
                }}
              >
                <option value="id">Test ID</option>
                <option value="status">Status</option>
                <option value="delta">Largest Delta</option>
              </select>
            </div>

            {!testLoading && testSummary && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    padding: "8px 10px",
                    background: "#e8f5e8",
                    border: "1px solid #4caf50",
                    borderRadius: 6,
                    fontWeight: 600,
                    color: "#2e7d32",
                  }}
                >
                  Passed: {testSummary.passed}
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    background: "#ffeaea",
                    border: "1px solid #f44336",
                    borderRadius: 6,
                    fontWeight: 600,
                    color: "#c62828",
                  }}
                >
                  Failed: {testSummary.failed}
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    background: "#e3f2fd",
                    border: "1px solid #42a5f5",
                    borderRadius: 6,
                    fontWeight: 600,
                    color: "#1565c0",
                  }}
                >
                  Running: {testSummary.running}
                </div>
                <div
                  style={{
                    padding: "8px 10px",
                    background: "#f3e5f5",
                    border: "1px solid #ab47bc",
                    borderRadius: 6,
                    fontWeight: 600,
                    color: "#6a1b9a",
                  }}
                >
                  Not Run: {testSummary.notRun}
                </div>
              </div>
            )}

            {displayedTestCases.length === 0 && (
              <div
                style={{
                  border: "1px dashed #c8d0de",
                  borderRadius: 8,
                  padding: "12px 14px",
                  color: "#546174",
                  marginBottom: 12,
                }}
              >
                No test cases match this filter.
              </div>
            )}

            {displayedTestCases.map((tc) => (
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
