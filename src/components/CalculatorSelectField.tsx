import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  asteriskStyle,
  inputStyle,
  labelStyle,
  selectPlaceholderStyle,
} from "./calculatorFormStyles";

interface CalculatorSelectFieldProps {
  label: string;
  testId: string;
  value: string;
  error?: string;
  options: readonly { value: string; label: string }[];
  placeholderDisabled?: boolean;
  onChange: (value: string) => void;
}

export function CalculatorSelectField({
  label,
  testId,
  value,
  error,
  options,
  placeholderDisabled = true,
  onChange,
}: CalculatorSelectFieldProps) {
  return (
    <>
      <Typography component="label" sx={labelStyle}>
        {label}
        <Typography component="span" sx={asteriskStyle}>
          *
        </Typography>
      </Typography>
      <FormControl fullWidth error={!!error}>
        <Select
          data-testid={testId}
          displayEmpty
          value={value}
          onChange={(event) => onChange(event.target.value)}
          sx={{ ...inputStyle, ...selectPlaceholderStyle }}
          IconComponent={ExpandMoreIcon}
        >
          <MenuItem value="" disabled={placeholderDisabled}>
            <em>Please select</em>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    </>
  );
}
