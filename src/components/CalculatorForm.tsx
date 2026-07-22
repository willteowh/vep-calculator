import { UI_LABELS } from "@/config/messages";
import { FormState, FormErrors } from "@/hooks/useCalculatorForm";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useState } from "react";
import { CALCULATOR_MAX_EXIT_DATE } from "@/config/constants";
import { resultStyles } from "@/utils/resultStyles";
import {
  tertiaryButtonStyle,
  primaryButtonStyle,
  quickFillButtonStyle,
  labelStyle,
  asteriskStyle,
  inputStyle,
  datepickerStyle,
  selectPlaceholderStyle,
  textFieldPlaceholderStyle,
} from "./calculatorFormStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

const dateTimePlaceholderLocaleText = {
  fieldDayPlaceholder: () => "DD",
  fieldMonthPlaceholder: () => "MM",
  fieldYearPlaceholder: () => "YYYY",
  fieldHoursPlaceholder: () => "HH",
  fieldMinutesPlaceholder: () => "MM",
} as const;

interface CalculatorFormProps {
  form: FormState;
  errors: FormErrors;
  loading?: boolean;
  resetVersion: number;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onCalculate: () => void;
  onQuickFill: () => void;
  onReset: () => void;
}

export function CalculatorForm({
  form,
  errors,
  loading = false,
  resetVersion,
  onFieldChange,
  onCalculate,
  onQuickFill,
  onReset,
}: CalculatorFormProps) {
  const hideIfProd = import.meta.env.VITE_INCLUDE_TESTS !== "false";
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [departPickerOpen, setDepartPickerOpen] = useState(false);

  const minEntryDate = dayjs().subtract(14, "days");
  const maxExitDate = dayjs(CALCULATOR_MAX_EXIT_DATE);
  const minEntryDayjs = minEntryDate;
  const maxExitDayjs = maxExitDate;

  const IUApplicable =
    form.vehicleCategory == "cars" || form.vehicleCategory == "motorcycles";

  const handleEntryChange = (value: Dayjs | null) => {
    if (value) {
      const isoString = value.format("YYYY-MM-DDTHH:mm");
      onFieldChange("entryDatetime", isoString);
      if (form.departDatetime && isoString && form.departDatetime < isoString) {
        onFieldChange("departDatetime", isoString);
      }
    }
  };

  const handleDepartChange = (value: Dayjs | null) => {
    if (value) {
      const isoString = value.format("YYYY-MM-DDTHH:mm");
      onFieldChange("departDatetime", isoString);
      if (form.entryDatetime && isoString && form.entryDatetime > isoString) {
        onFieldChange("entryDatetime", isoString);
      }
    }
  };

  const openEntryDateTimePicker = () => {
    if (!form.entryDatetime) {
      handleEntryChange(dayjs());
    }
    setEntryPickerOpen(true);
  };

  const openDepartDateTimePicker = () => {
    if (!form.departDatetime) {
      handleDepartChange(dayjs());
    }
    setDepartPickerOpen(true);
  };

  return (
    <>
      <Box>
        <Grid container spacing={2.5}>
          <Grid container size={{ sm: 12 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.VEHICLE_CATEGORY}
                <Typography component="span" sx={asteriskStyle}>
                  *
                </Typography>
              </Typography>
              <FormControl fullWidth error={!!errors.vehicleCategory}>
                <Select
                  displayEmpty
                  value={form.vehicleCategory}
                  onChange={(e) =>
                    onFieldChange("vehicleCategory", e.target.value)
                  }
                  sx={{
                    ...inputStyle,
                    ...selectPlaceholderStyle,
                  }}
                  IconComponent={ExpandMoreIcon}
                >
                  <MenuItem value="" disabled>
                    <em>Please select</em>
                  </MenuItem>
                  <MenuItem value="cars">Cars</MenuItem>
                  <MenuItem value="motorcycles">Motorcycles</MenuItem>
                  <MenuItem value="vans">Vans/Light Goods Vehicles</MenuItem>
                  <MenuItem value="heavyGoods">Heavy Goods Vehicles</MenuItem>
                  <MenuItem value="taxis">Taxis</MenuItem>
                  <MenuItem value="buses">Buses</MenuItem>
                </Select>
                {errors.vehicleCategory && (
                  <FormHelperText>{errors.vehicleCategory}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            {IUApplicable && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography component="label" sx={labelStyle}>
                  {UI_LABELS.HAS_IU}
                  <Typography component="span" sx={asteriskStyle}>
                    *
                  </Typography>
                </Typography>
                <FormControl fullWidth error={!!errors.hasIU}>
                  <Select
                    displayEmpty
                    disabled={
                      form.vehicleCategory !== "cars" &&
                      form.vehicleCategory !== "motorcycles"
                    }
                    value={form.hasIU}
                    onChange={(e) => onFieldChange("hasIU", e.target.value)}
                    sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                    IconComponent={ExpandMoreIcon}
                  >
                    <MenuItem value="">
                      <em>Please select</em>
                    </MenuItem>
                    <MenuItem value="yes">Yes (IU / OBU installed)</MenuItem>
                    <MenuItem value="no">No (no IU / OBU)</MenuItem>
                  </Select>
                  {errors.hasIU && (
                    <FormHelperText>{errors.hasIU}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.ENTRY_DATETIME}
              <Typography component="span" sx={asteriskStyle}>
                *
              </Typography>
            </Typography>
            <DateTimePicker
              value={form.entryDatetime ? dayjs(form.entryDatetime) : null}
              onChange={handleEntryChange}
              open={entryPickerOpen}
              onOpen={() => setEntryPickerOpen(true)}
              onClose={() => setEntryPickerOpen(false)}
              format="DD/MM/YYYY HH:mm"
              minDateTime={minEntryDayjs}
              maxDateTime={maxExitDayjs}
              ampm={false}
              reduceAnimations
              disableOpenPicker
              localeText={dateTimePlaceholderLocaleText}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  onClick: openEntryDateTimePicker,
                  error: !!errors.entryDatetime,
                  helperText: errors.entryDatetime || "",
                  sx: {
                    width: "100%",
                    ...inputStyle,
                    ...textFieldPlaceholderStyle,
                    ...(form.entryDatetime && {
                      "& .MuiPickersInputBase-sectionsContainer": {
                        color: "#23272E",
                      },
                    }),
                  },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.DEPART_DATETIME}
              <Typography component="span" sx={asteriskStyle}>
                *
              </Typography>
            </Typography>
            <DateTimePicker
              value={form.departDatetime ? dayjs(form.departDatetime) : null}
              onChange={handleDepartChange}
              open={departPickerOpen}
              onOpen={() => setDepartPickerOpen(true)}
              onClose={() => setDepartPickerOpen(false)}
              format="DD/MM/YYYY HH:mm"
              minDateTime={minEntryDayjs}
              maxDateTime={maxExitDayjs}
              ampm={false}
              reduceAnimations
              disableOpenPicker
              sx={datepickerStyle}
              localeText={dateTimePlaceholderLocaleText}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  onClick: openDepartDateTimePicker,
                  error: !!errors.departDatetime,
                  helperText: errors.departDatetime || "",
                  sx: {
                    width: "100%",
                    ...inputStyle,
                    ...textFieldPlaceholderStyle,
                    ...(form.departDatetime && {
                      "& .MuiPickersInputBase-sectionsContainer": {
                        color: "#23272E",
                      },
                    }),
                  },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.ENTRY_CHECKPOINT}
              <Typography component="span" sx={asteriskStyle}>
                *
              </Typography>
            </Typography>
            <FormControl fullWidth error={!!errors.entryCheckpoint}>
              <Select
                displayEmpty
                value={form.entryCheckpoint}
                onChange={(e) =>
                  onFieldChange("entryCheckpoint", e.target.value)
                }
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="" disabled>
                  <em>Please select</em>
                </MenuItem>
                <MenuItem value="woodlands">Woodlands Checkpoint</MenuItem>
                <MenuItem value="tuas">Tuas Checkpoint</MenuItem>
              </Select>
              {errors.entryCheckpoint && (
                <FormHelperText>{errors.entryCheckpoint}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.DEPART_CHECKPOINT}
              <Typography component="span" sx={asteriskStyle}>
                *
              </Typography>
            </Typography>
            <FormControl fullWidth error={!!errors.departCheckpoint}>
              <Select
                displayEmpty
                value={form.departCheckpoint}
                onChange={(e) =>
                  onFieldChange("departCheckpoint", e.target.value)
                }
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="" disabled>
                  <em>Please select</em>
                </MenuItem>
                <MenuItem value="woodlands">Woodlands Checkpoint</MenuItem>
                <MenuItem value="tuas">Tuas Checkpoint</MenuItem>
              </Select>
              {errors.departCheckpoint && (
                <FormHelperText>{errors.departCheckpoint}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {IUApplicable && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography component="label" sx={labelStyle}>
                No. of days using ERP-priced roads
                <Typography component="span" sx={asteriskStyle}>
                  *
                </Typography>
              </Typography>
              <TextField
                fullWidth
                disabled={
                  form.vehicleCategory !== "cars" &&
                  form.vehicleCategory !== "motorcycles"
                }
                type="number"
                value={form.erpDays}
                onChange={(e) => onFieldChange("erpDays", e.target.value)}
                helperText="Only include travel during ERP operating hours"
                sx={{ ...inputStyle, ...textFieldPlaceholderStyle }}
                slotProps={{
                  formHelperText: {
                    sx: { fontSize: "16px", ml: 0, color: "#6B768A" },
                  },
                }}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Centered Clear + Calculate */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Button
                  variant="text"
                  onClick={onReset}
                  sx={tertiaryButtonStyle}
                  disableRipple
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={onCalculate}
                  sx={primaryButtonStyle}
                  disableRipple
                >
                  {UI_LABELS.CALCULATE}
                </Button>
              </Stack>

              {/* Quick Fill floated to the right */}
              {hideIfProd && (
                <Box sx={{ position: "absolute", right: 0 }}>
                  <Button
                    variant="outlined"
                    color="info"
                    onClick={onQuickFill}
                    sx={quickFillButtonStyle}
                    aria-label="Quick Fill"
                    title="Quick Fill"
                  >
                    ⚡
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {errors._g && (
        <Card sx={{ ...resultStyles.warningCard, mt: 2 }}>
          <CardContent sx={resultStyles.noticeContent}>
            <InfoOutlinedIcon sx={resultStyles.InfoIcon} />
            {errors._g}
          </CardContent>
        </Card>
      )}
    </>
  );
}
