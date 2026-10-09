import { Box } from "@mui/material";

import type { TestSummary } from "@/utils/testRunner";

const BADGES: {
  key: Exclude<keyof TestSummary, "total">;
  label: string;
  palette: "success" | "error" | "info" | "secondary";
}[] = [
  {
    key: "passed",
    label: "Passed",
    palette: "success",
  },
  {
    key: "failed",
    label: "Failed",
    palette: "error",
  },
  {
    key: "running",
    label: "Running",
    palette: "info",
  },
  {
    key: "notRun",
    label: "Not Run",
    palette: "secondary",
  },
];

export function TestSummaryBadges({ summary }: { summary: TestSummary }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
      {BADGES.map(({ key, label, palette }) => (
        <Box
          key={key}
          sx={{
            padding: "8px 10px",
            backgroundColor: `${palette}.light`,
            border: "1px solid",
            borderColor: `${palette}.main`,
            borderRadius: 1,
            fontWeight: 600,
            color: `${palette}.dark`,
          }}
        >
          {label}: {summary[key]}
        </Box>
      ))}
    </Box>
  );
}
