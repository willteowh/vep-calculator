import { Grid, TextField, Typography } from "@mui/material";
import type { KeyboardEvent } from "react";

import type { FormErrors } from "@/types/form";
import { inputStyle, labelStyle } from "./calculatorFormStyles";

interface ErpDaysFieldProps {
  year: 2026 | 2027;
  value: string;
  error?: FormErrors["erpDays2026"];
  straddlesYear: boolean;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export function ErpDaysField({
  year,
  value,
  error,
  straddlesYear,
  onChange,
  onKeyDown,
}: ErpDaysFieldProps) {
  const fieldSx = {
    ...inputStyle,
    height: "auto",
    "& .MuiInputBase-root": {
      height: "48px",
      fontSize: "18px",
      color: "text.primary",
    },
    "& .MuiFormHelperText-root": {
      mt: 1,
      lineHeight: 1.4,
    },
  } as const;

  return (
    <Grid size={{ xs: 12, sm: 6 }} sx={{ pb: 1 }}>
      <Typography component="label" sx={labelStyle}>
        No. of days using ERP-priced roads {straddlesYear && `in year ${year}`}
      </Typography>
      <TextField
        data-testid={`erp-days-${year}`}
        fullWidth
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        error={!!error}
        helperText={error || "Only include travel during ERP operating hours"}
        sx={fieldSx}
        slotProps={{
          htmlInput: {
            maxLength: 2,
            pattern: "[0-9]*",
            inputMode: "numeric",
          },
          formHelperText: {
            sx: {
              fontSize: "16px",
              ml: 0,
              color: error ? "error.main" : "text.secondary",
            },
          },
        }}
      />
    </Grid>
  );
}
