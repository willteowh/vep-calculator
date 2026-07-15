import { UI_LABELS } from "@/config/messages";
import { FormState, FormErrors } from "@/hooks/useCalculatorForm";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CALCULATOR_MAX_EXIT_DATE } from "@/config/constants";
import {
  pageHeaderStyle,
  baseButtonStyle,
  tertiaryButtonStyle,
  primaryButtonStyle,
  quickFillButtonStyle,
  labelStyle,
  introParagraphStyle,
  linkStyle,
  inputStyle,
  selectPlaceholderStyle,
  textFieldPlaceholderStyle,
} from "./calculatorFormStyles";

dayjs.extend(utc);
dayjs.extend(timezone);

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

  const minEntryDate = dayjs().subtract(14, "days");
  const maxExitDate = dayjs(CALCULATOR_MAX_EXIT_DATE);
  const minEntryDayjs = minEntryDate;
  const maxExitDayjs = maxExitDate;

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

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .infoBox > * {
          margin-bottom: 20px;
        }
      `}</style>
      <Box className="infoBox">
        <Typography component="h1" style={pageHeaderStyle}>
          Calculate Fees and Charges for Foreign Vehicles in Singapore
        </Typography>
        <Typography sx={introParagraphStyle}>
          You can check your entry and exit toll charges, VEP fees and
          Reciprocal Road Charge to prepare for your next visit to Singapore.
          The values from the calculator are indicative. The actual fees and
          charges may be different depending on any changes that are determined
          by the authorities.
        </Typography>
        <Typography sx={introParagraphStyle}>
          As announced on 6 February 2026, the revised daily VEP fee, cessation
          of free VEP days and hours for cars and motorcycles and daily
          flat-rate ERP fee on ERP operational days for foreign-registered
          vehicles without OBUs, will apply from 1 January 2027.&nbsp;
        </Typography>
        <Typography sx={introParagraphStyle}>
          Refer to the&nbsp;
          <Link
            sx={linkStyle}
            href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/updates-foreign-registered-vehicles-entering-singapore.html"
          >
            news release
          </Link>
          &nbsp;and LTA OneMotoring website for more information.
        </Typography>
      </Box>

      <Box>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.VEHICLE_CATEGORY}*
            </Typography>
            <FormControl fullWidth error={!!errors.vehicleCategory}>
              <Select
                displayEmpty
                size="small"
                value={form.vehicleCategory}
                onChange={(e) =>
                  onFieldChange("vehicleCategory", e.target.value)
                }
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="">Please select</MenuItem>
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

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.HAS_IU}*
            </Typography>
            <FormControl fullWidth error={!!errors.hasIU}>
              <Select
                displayEmpty
                size="small"
                disabled={form.vehicleCategory !== "cars"}
                value={form.hasIU}
                onChange={(e) => onFieldChange("hasIU", e.target.value)}
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="">Please select</MenuItem>
                <MenuItem value="yes">Yes (IU / OBU installed)</MenuItem>
                <MenuItem value="no">No (no IU / OBU)</MenuItem>
              </Select>
              {errors.hasIU && <FormHelperText>{errors.hasIU}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.ENTRY_DATETIME}*
            </Typography>
            <DateTimePicker
              value={form.entryDatetime ? dayjs(form.entryDatetime) : null}
              onChange={handleEntryChange}
              format="DD/MM/YYYY HH:mm"
              minDateTime={minEntryDayjs}
              maxDateTime={maxExitDayjs}
              ampm={false}
              reduceAnimations
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error: !!errors.entryDatetime,
                  helperText: errors.entryDatetime || "",
                  sx: {
                    width: "100%",
                    ...inputStyle,
                    ...textFieldPlaceholderStyle,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.DEPART_DATETIME}*
            </Typography>
            <DateTimePicker
              value={form.departDatetime ? dayjs(form.departDatetime) : null}
              onChange={handleDepartChange}
              format="DD/MM/YYYY HH:mm"
              minDateTime={minEntryDayjs}
              maxDateTime={maxExitDayjs}
              ampm={false}
              reduceAnimations
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  error: !!errors.departDatetime,
                  helperText: errors.departDatetime || "",
                  sx: {
                    width: "100%",
                    ...inputStyle,
                    ...textFieldPlaceholderStyle,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              {UI_LABELS.ENTRY_CHECKPOINT}*
            </Typography>
            <FormControl fullWidth error={!!errors.entryCheckpoint}>
              <Select
                displayEmpty
                size="small"
                value={form.entryCheckpoint}
                onChange={(e) =>
                  onFieldChange("entryCheckpoint", e.target.value)
                }
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="">Please select</MenuItem>
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
              {UI_LABELS.DEPART_CHECKPOINT}*
            </Typography>
            <FormControl fullWidth error={!!errors.departCheckpoint}>
              <Select
                displayEmpty
                size="small"
                value={form.departCheckpoint}
                onChange={(e) =>
                  onFieldChange("departCheckpoint", e.target.value)
                }
                sx={{ ...inputStyle, ...selectPlaceholderStyle }}
                IconComponent={ExpandMoreIcon}
              >
                <MenuItem value="">Please select</MenuItem>
                <MenuItem value="woodlands">Woodlands Checkpoint</MenuItem>
                <MenuItem value="tuas">Tuas Checkpoint</MenuItem>
              </Select>
              {errors.departCheckpoint && (
                <FormHelperText>{errors.departCheckpoint}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography component="label" sx={labelStyle}>
              No. of days using ERP-priced roads*
            </Typography>
            <TextField
              fullWidth
              size="small"
              disabled={form.vehicleCategory !== "cars"}
              type="number"
              value={form.erpDays}
              onChange={(e) => onFieldChange("erpDays", e.target.value)}
              helperText="Only include travel during ERP operating hours"
              sx={{ ...inputStyle, ...textFieldPlaceholderStyle }}
              slotProps={{
                formHelperText: {
                  sx: { fontSize: 16, ml: 0, color: "#6B768A" },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={onCalculate}
                  disabled={loading}
                  sx={primaryButtonStyle}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={16} color="inherit" />
                      Calculating...
                    </Box>
                  ) : (
                    UI_LABELS.CALCULATE
                  )}
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors._g}
        </Alert>
      )}
    </>
  );
}
