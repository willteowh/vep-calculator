"use client";
import { useState } from "react";

import { useCalculatorForm } from "@/hooks/useCalculatorForm";
import { calculate, CalculationOutput } from "@/utils/calculations";
import {
  CUTOFF_2027,
  QUICK_FILL_MAX_DAYS,
  QUICK_FILL_STAY_DAYS_MAX,
} from "@/config/constants";
import { TEST_CASES } from "@/config/testCases";

import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultTable } from "@/components/ResultTable";
import { TestCaseCard } from "@/components/TestCaseCard";

import { baseStyles, infoStyles } from "@/utils/styles";

export default function VEPCalculator() {
  const { form, errors, set, setErrors, validate, reset } = useCalculatorForm();
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("calc");
  const [testResults, setTestResults] = useState({});

  function handleCalculate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    const entryDt = new Date(form.entryDatetime);
    const departureDt = new Date(form.departDatetime);

    if (departureDt <= entryDt) {
      setErrors({ _g: "Departure must be after entry date/time." });
      return;
    }

    const res = calculate({
      ...form,
      entryDt,
      departureDt,
    });

    setResult(res);
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
  }

  function handleTestRun(testCase) {
    const res = calculate(testCase.params);
    setTestResults((prev) => ({ ...prev, [testCase.id]: res }));
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
      `}</style>
      <div style={baseStyles.wrap}>
        <div style={baseStyles.tabs}>
          <button
            style={baseStyles.tab(tab === "calc")}
            onClick={() => setTab("calc")}
          >
            Fee Calculator
          </button>
          <button
            style={baseStyles.tab(tab === "tests")}
            onClick={() => setTab("tests")}
          >
            Test Cases
          </button>
        </div>

        {/* ── Calculator Tab ── */}
        {tab === "calc" && (
          <>
            <CalculatorForm
              form={form}
              errors={errors}
              straddlesBoundary={straddlesBoundary}
              onFieldChange={set}
              onCalculate={handleCalculate}
              onQuickFill={handleQuickFill}
              onReset={handleReset}
            />

            {result && !("error" in result) && (
              <ResultTable
                result={result}
                form={form}
                entryDt={new Date(form.entryDatetime)}
                departureDt={new Date(form.departDatetime)}
              />
            )}

            {result && "error" in result && (
              <div style={{ ...infoStyles.errBanner, marginTop: 16 }}>
                {result.error}
              </div>
            )}
          </>
        )}

        {/* ── Test Cases Tab ── */}
        {tab === "tests" && (
          <div>
            <div style={infoStyles.info}>
              8 test cases covering pre-2027, post-2027, and boundary-straddling
              scenarios. Click <strong>▶ Run</strong> to execute each one
              against the calculation engine.
            </div>
            {TEST_CASES.map((tc) => (
              <TestCaseCard
                key={tc.id}
                testCase={tc}
                result={testResults[tc.id]}
                onRun={handleTestRun}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
