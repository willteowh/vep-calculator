import { buttonStyle } from "@/components/appStyles";
import type { TestRunner } from "@/hooks/useTestRunner";
import type { SortBy, StatusFilter } from "@/utils/testRunner";

const FILTERS: {
  value: StatusFilter;
  label: string;
  on: string;
  off: string;
}[] = [
  { value: "all", label: "All", on: "#455a64", off: "#90a4ae" },
  { value: "failed", label: "Failed", on: "#d32f2f", off: "#ef9a9a" },
  { value: "running", label: "Running", on: "#1976d2", off: "#90caf9" },
  { value: "not-run", label: "Not Run", on: "#6d4c41", off: "#bcaaa4" },
  { value: "passed", label: "Passed", on: "#2e7d32", off: "#a5d6a7" },
];

export function TestFilters({ runner }: { runner: TestRunner }) {
  const { statusFilter, sortBy, setStatusFilter, setSortBy } = runner;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      {FILTERS.map(({ value, label, on, off }) => (
        <button
          key={value}
          style={{
            ...buttonStyle,
            padding: "8px 14px",
            background: statusFilter === value ? on : off,
          }}
          onClick={() => setStatusFilter(value)}
        >
          {label}
        </button>
      ))}

      <label style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }}>
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
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
  );
}
