import { Box } from "@mui/material";

import type { TestSummary } from "@/utils/testRunner";

const BADGES: {
  key: Exclude<keyof TestSummary, "total">;
  label: string;
  background: string;
  border: string;
  color: string;
}[] = [
  {
    key: "passed",
    label: "Passed",
    background: "success.light",
    border: "success.main",
    color: "success.dark",
  },
  {
    key: "failed",
    label: "Failed",
    background: "error.light",
    border: "error.main",
    color: "error.dark",
  },
  {
    key: "running",
    label: "Running",
    background: "info.light",
    border: "info.main",
    color: "info.dark",
  },
  {
    key: "notRun",
    label: "Not Run",
    background: "#f3e5f5",
    border: "#ab47bc",
    color: "#6a1b9a",
  },
];

export function TestSummaryBadges({ summary }: { summary: TestSummary }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
      {BADGES.map(({ key, label, background, border, color }) => (
        <Box
          key={key}
          sx={{
            padding: "8px 10px",
            backgroundColor: background,
            border: "1px solid",
            borderColor: border,
            borderRadius: "6px",
            fontWeight: 600,
            color: color,
          }}
        >
          {label}: {summary[key]}
        </Box>
      ))}
    </Box>
  );
}
