import { useRef, type ChangeEvent } from "react";
import { Box, Button, Typography } from "@mui/material";

import { buttonSx } from "@/components/appStyles";
import type { TestRunner } from "@/hooks/useTestRunner";

const spinnerStyle = {
  display: "inline-block",
  width: "16px",
  height: "16px",
  border: "2px solid #ffffff",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginRight: "8px",
} as const;

export function TestToolbar({ runner }: { runner: TestRunner }) {
  const { isRunningAll, summary, csvStatus } = runner;
  const csvInputRef = useRef<HTMLInputElement>(null);
  const allPassed = summary.passed === summary.total;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    await runner.importCsv(file);
    input.value = "";
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        color="info"
        sx={{ ...buttonSx, px: 3, mr: 1 }}
        data-testid="run-all-tests"
        onClick={runner.runAll}
        disabled={isRunningAll}
      >
        {isRunningAll ? (
          <>
            <span style={spinnerStyle}></span>
            Running Tests...
          </>
        ) : (
          "Run All Tests"
        )}
      </Button>
      <Button
        variant="contained"
        color="success"
        sx={{ ...buttonSx, px: 3, mr: 1 }}
        data-testid="download-sample-csv"
        onClick={runner.downloadSampleCsv}
        disabled={isRunningAll}
      >
        Download Sample CSV
      </Button>
      <Button
        variant="contained"
        color="primary"
        sx={{ ...buttonSx, px: 3, mr: 1 }}
        onClick={() => csvInputRef.current?.click()}
        disabled={isRunningAll}
      >
        Upload CSV
      </Button>
      <input
        data-testid="csv-input"
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {!isRunningAll && (
        <Box
          data-testid="test-summary"
          sx={{
            display: "inline-block",
            px: 1.5,
            py: 1,
            backgroundColor: allPassed ? "success.light" : "error.light",
            border: "1px solid",
            borderColor: allPassed ? "success.main" : "error.main",
            borderRadius: 1,
            fontWeight: 600,
            color: allPassed ? "success.dark" : "error.dark",
          }}
        >
          {summary.passed}/{summary.total} test cases passed
        </Box>
      )}
      {csvStatus && (
        <Typography
          sx={{
            marginTop: 1.25,
            color: csvStatus.startsWith("Failed")
              ? "error.dark"
              : "success.dark",
            fontWeight: 600,
          }}
        >
          {csvStatus}
        </Typography>
      )}
    </Box>
  );
}
