import { Box, Button, FormControl, MenuItem, Select } from "@mui/material";

import { buttonSx } from "@/components/appStyles";
import type { TestRunner } from "@/hooks/useTestRunner";
import type { SortBy, StatusFilter } from "@/utils/testRunner";

const FILTERS: {
  value: StatusFilter;
  label: string;
  on: string;
  off: string;
}[] = [
  { value: "all", label: "All", on: "text.secondary", off: "action.selected" },
  { value: "failed", label: "Failed", on: "error.main", off: "error.light" },
  { value: "running", label: "Running", on: "info.main", off: "info.light" },
  {
    value: "not-run",
    label: "Not Run",
    on: "text.secondary",
    off: "action.selected",
  },
  {
    value: "passed",
    label: "Passed",
    on: "success.main",
    off: "success.light",
  },
];

export function TestFilters({ runner }: { runner: TestRunner }) {
  const { statusFilter, sortBy, setStatusFilter, setSortBy } = runner;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      {FILTERS.map(({ value, label, on, off }) => (
        <Button
          variant="contained"
          color="primary"
          key={value}
          sx={{
            ...buttonSx,
            px: 1.75,
            py: 1,
            bgcolor: statusFilter === value ? on : off,
            color:
              statusFilter === value && value !== "not-run" && value !== "all"
                ? "common.white"
                : "text.primary",
          }}
          onClick={() => setStatusFilter(value)}
        >
          {label}
        </Button>
      ))}

      <label style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }}>
        Sort by:
      </label>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          aria-label="Sort test cases"
        >
          <MenuItem value="id">Test ID</MenuItem>
          <MenuItem value="status">Status</MenuItem>
          <MenuItem value="delta">Largest Delta</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
