import { INCLUDE_TESTS } from "@/config/features";
import { UI_LABELS } from "@/config/messages";
import type { FormState, FormErrors } from "@/types/form";
import { Box, Button, Card, CardContent, Grid, Stack } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useEffect, useState } from "react";
import { CALCULATOR_MAX_EXIT_DATE } from "@/config/constants";
import { resultStyles } from "@/utils/resultStyles";
import { CalculatorDateTimeField } from "./CalculatorDateTimeField";
import { CalculatorSelectField } from "./CalculatorSelectField";
import {
  tertiaryButtonStyle,
  primaryButtonStyle,
  quickFillButtonStyle,
} from "./calculatorFormStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CalculatorFormProps {
  form: FormState;
  errors: FormErrors;
  resetVersion: number;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onCalculate: () => void;
  onQuickFill: () => void;
  onReset: () => void;
}

export function CalculatorForm({
  form,
  errors,
  resetVersion,
  onFieldChange,
  onCalculate,
  onQuickFill,
  onReset,
}: CalculatorFormProps) {
  const [entryPickerOpen, setEntryPickerOpen] = useState(false);
  const [departPickerOpen, setDepartPickerOpen] = useState(false);

  useEffect(() => {
    setEntryPickerOpen(false);
    setDepartPickerOpen(false);
  }, [resetVersion]);

  const minEntryDayjs = dayjs().subtract(14, "days");
  const maxExitDayjs = dayjs(CALCULATOR_MAX_EXIT_DATE);

  const clampToAllowedRange = (value: Dayjs): Dayjs => {
    if (value.isBefore(minEntryDayjs)) return minEntryDayjs;
    if (value.isAfter(maxExitDayjs)) return maxExitDayjs;
    return value;
  };

  const normaliseAndApplyDateTime = (
    field: "entryDatetime" | "departDatetime",
    rawValue: Dayjs | null,
  ): string | null => {
    if (!rawValue || !rawValue.isValid()) {
      return null;
    }

    const clamped = clampToAllowedRange(rawValue);
    const isoString = clamped.format("YYYY-MM-DDTHH:mm");
    onFieldChange(field, isoString);
    return isoString;
  };

  const IUApplicable =
    !!form.vehicleCategory && form.vehicleCategory !== "taxis";
  const handleEntryChange = (value: Dayjs | null) => {
    const isoString = normaliseAndApplyDateTime("entryDatetime", value);
    if (isoString && form.departDatetime && form.departDatetime < isoString) {
      onFieldChange("departDatetime", isoString);
    }
  };

  const handleDepartChange = (value: Dayjs | null) => {
    const isoString = normaliseAndApplyDateTime("departDatetime", value);
    if (isoString && form.entryDatetime && form.entryDatetime > isoString) {
      onFieldChange("departDatetime", form.entryDatetime);
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
      const seedDepartValue = form.entryDatetime
        ? dayjs(form.entryDatetime)
        : dayjs();
      normaliseAndApplyDateTime("departDatetime", seedDepartValue);
    }
    setDepartPickerOpen(true);
  };

  return (
    <>
      <Box>
        <Grid container spacing={2.5}>
          <Grid container size={{ xs: 12 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CalculatorSelectField
                label={UI_LABELS.VEHICLE_CATEGORY}
                testId="vehicle-category"
                value={form.vehicleCategory}
                error={errors.vehicleCategory}
                onChange={(value) => onFieldChange("vehicleCategory", value)}
                options={[
                  { value: "cars", label: "Cars" },
                  { value: "motorcycles", label: "Motorcycles" },
                  { value: "vans", label: "Vans/Light Goods Vehicles" },
                  { value: "heavyGoods", label: "Heavy Goods Vehicles" },
                  { value: "taxis", label: "Taxis" },
                  { value: "buses", label: "Buses" },
                ]}
              />
            </Grid>
            {IUApplicable && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <CalculatorSelectField
                  label={UI_LABELS.HAS_IU}
                  testId="has-iu"
                  value={form.hasIU}
                  error={errors.hasIU}
                  placeholderDisabled={false}
                  onChange={(value) => onFieldChange("hasIU", value)}
                  options={[
                    { value: "yes", label: "Yes (IU / OBU installed)" },
                    { value: "no", label: "No (no IU / OBU)" },
                  ]}
                />
              </Grid>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CalculatorDateTimeField
              label={UI_LABELS.ENTRY_DATETIME}
              testId="entry-datetime"
              value={form.entryDatetime ? dayjs(form.entryDatetime) : null}
              error={errors.entryDatetime}
              resetVersion={resetVersion}
              open={entryPickerOpen}
              minDateTime={minEntryDayjs}
              maxDateTime={maxExitDayjs}
              onChange={handleEntryChange}
              onOpen={openEntryDateTimePicker}
              onClose={() => setEntryPickerOpen(false)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CalculatorDateTimeField
              label={UI_LABELS.DEPART_DATETIME}
              testId="depart-datetime"
              value={form.departDatetime ? dayjs(form.departDatetime) : null}
              error={errors.departDatetime}
              resetVersion={resetVersion}
              open={departPickerOpen}
              minDateTime={
                form.entryDatetime
                  ? dayjs(form.entryDatetime).isAfter(minEntryDayjs)
                    ? dayjs(form.entryDatetime)
                    : minEntryDayjs
                  : minEntryDayjs
              }
              maxDateTime={maxExitDayjs}
              onChange={handleDepartChange}
              onOpen={openDepartDateTimePicker}
              onClose={() => setDepartPickerOpen(false)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CalculatorSelectField
              label={UI_LABELS.ENTRY_CHECKPOINT}
              testId="entry-checkpoint"
              value={form.entryCheckpoint}
              error={errors.entryCheckpoint}
              onChange={(value) => onFieldChange("entryCheckpoint", value)}
              options={[
                { value: "woodlands", label: "Woodlands Checkpoint" },
                { value: "tuas", label: "Tuas Checkpoint" },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CalculatorSelectField
              label={UI_LABELS.DEPART_CHECKPOINT}
              testId="depart-checkpoint"
              value={form.departCheckpoint}
              error={errors.departCheckpoint}
              onChange={(value) => onFieldChange("departCheckpoint", value)}
              options={[
                { value: "woodlands", label: "Woodlands Checkpoint" },
                { value: "tuas", label: "Tuas Checkpoint" },
              ]}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pt: 2,
              }}
            >
              {/* Centered Clear + Calculate */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Button
                  data-testid="clear-button"
                  variant="text"
                  onClick={onReset}
                  sx={tertiaryButtonStyle}
                  disableRipple
                >
                  Clear
                </Button>
                <Button
                  data-testid="calculate-button"
                  variant="contained"
                  onClick={onCalculate}
                  sx={primaryButtonStyle}
                  disableRipple
                >
                  {UI_LABELS.CALCULATE}
                </Button>
              </Stack>

              {/* Quick Fill floated to the right */}
              {INCLUDE_TESTS && (
                <Box sx={{ position: "absolute", right: 0 }}>
                  <Button
                    data-testid="quick-fill-button"
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
