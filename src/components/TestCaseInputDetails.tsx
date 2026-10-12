import type { TestCase } from "@/config/testCases";

function formatDateTime(value: Date): string {
  if (Number.isNaN(value.getTime())) return "-";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (value instanceof Date) return formatDateTime(value);
  return String(value);
}

export function TestCaseInputDetails({ testCase }: { testCase: TestCase }) {
  const inputRows = [
    ["Vehicle", testCase.params.vehicleCategory],
    ["IU/OBU", testCase.params.hasIU],
    ["Entry Datetime", testCase.params.entryDt],
    ["Departure Datetime", testCase.params.departureDt],
    ["Entry Checkpoint", testCase.params.entryCheckpoint],
    ["Departure Checkpoint", testCase.params.departCheckpoint],
  ] as const;

  return (
    <details
      style={{
        marginBottom: 10,
        background: "#fff",
        border: "1px solid #dfe5ee",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          padding: "9px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#2b4055",
          background: "#f7f9fc",
        }}
      >
        Inspect Test Input Data
      </summary>
      <div
        style={{
          padding: "10px 12px",
          display: "grid",
          gridTemplateColumns: "minmax(130px, 180px) 1fr",
          gap: "6px 12px",
          fontSize: 12,
        }}
      >
        {inputRows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <div style={{ color: "#55697e", fontWeight: 600 }}>{label}</div>
            <div style={{ color: "#1e2c3a", wordBreak: "break-word" }}>
              {formatValue(value)}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
