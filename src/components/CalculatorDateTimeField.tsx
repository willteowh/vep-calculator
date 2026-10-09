import { Typography } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import type { Dayjs } from "dayjs";

import { asteriskStyle, inputStyle, labelStyle } from "./calculatorFormStyles";

const PLACEHOLDER_LOCALE_TEXT = {
  fieldDayPlaceholder: () => "DD",
  fieldMonthPlaceholder: () => "MM",
  fieldYearPlaceholder: () => "YYYY",
  fieldHoursPlaceholder: () => "HH",
  fieldMinutesPlaceholder: () => "MM",
} as const;

interface CalculatorDateTimeFieldProps {
  label: string;
  testId: string;
  value: Dayjs | null;
  error?: string;
  resetVersion: number;
  open: boolean;
  minDateTime: Dayjs;
  maxDateTime: Dayjs;
  onChange: (value: Dayjs | null) => void;
  onOpen: () => void;
  onClose: () => void;
}

export function CalculatorDateTimeField({
  label,
  testId,
  value,
  error,
  resetVersion,
  open,
  minDateTime,
  maxDateTime,
  onChange,
  onOpen,
  onClose,
}: CalculatorDateTimeFieldProps) {
  return (
    <>
      <Typography component="label" sx={labelStyle}>
        {label}
        <Typography component="span" sx={asteriskStyle}>
          *
        </Typography>
      </Typography>
      <DateTimePicker
        key={`${testId}-${resetVersion}`}
        value={value}
        onChange={onChange}
        open={open}
        onOpen={onOpen}
        onClose={onClose}
        format="DD/MM/YYYY HH:mm"
        minDateTime={minDateTime}
        maxDateTime={maxDateTime}
        timeSteps={{ minutes: 1 }}
        ampm={false}
        reduceAnimations
        localeText={PLACEHOLDER_LOCALE_TEXT}
        slotProps={{
          openPickerButton: {
            disableRipple: true,
            disableTouchRipple: true,
          },
          textField: {
            ...{ "data-testid": testId },
            fullWidth: true,
            error: !!error,
            helperText: error || "",
            sx: {
              width: "100%",
              ...inputStyle,
              ...(value && {
                "& .MuiPickersInputBase-sectionsContainer": {
                  color: "text.primary",
                },
              }),
            },
          },
        }}
      />
    </>
  );
}
