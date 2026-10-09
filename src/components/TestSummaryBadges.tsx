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
    background: "#e8f5e8",
    border: "#4caf50",
    color: "#2e7d32",
  },
  {
    key: "failed",
    label: "Failed",
    background: "#ffeaea",
    border: "#f44336",
    color: "#c62828",
  },
  {
    key: "running",
    label: "Running",
    background: "#e3f2fd",
    border: "#42a5f5",
    color: "#1565c0",
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
    <div
      style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
    >
      {BADGES.map(({ key, label, background, border, color }) => (
        <div
          key={key}
          style={{
            padding: "8px 10px",
            background,
            border: `1px solid ${border}`,
            borderRadius: 6,
            fontWeight: 600,
            color,
          }}
        >
          {label}: {summary[key]}
        </div>
      ))}
    </div>
  );
}
