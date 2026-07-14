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
import { CALCULATOR_MAX_EXIT_DATE } from "@/config/constants";

interface CalculatorFormProps {
  form: FormState;
  errors: FormErrors;
  straddlesBoundary: boolean;
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
  straddlesBoundary,
  loading = false,
  resetVersion,
  onFieldChange,
  onCalculate,
  onQuickFill,
  onReset,
}: CalculatorFormProps) {
  const hideIfProd = import.meta.env.VITE_INCLUDE_TESTS !== "false";
  const pageHeaderStyle = {
    fontSize: 30,
    fontFamily: '"Noto Sans", sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
  } as const;

  const formatDateTimeLocal = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const minEntryDate = new Date();
  minEntryDate.setDate(minEntryDate.getDate() - 14);

  const minEntry = formatDateTimeLocal(minEntryDate);
  const maxExit = formatDateTimeLocal(new Date(CALCULATOR_MAX_EXIT_DATE));
  const maxEntry = form.departDatetime || maxExit;
  const minDepart = form.entryDatetime || minEntry;

  const handleEntryChange = (value: string) => {
    onFieldChange("entryDatetime", value);
    if (form.departDatetime && value && form.departDatetime < value) {
      onFieldChange("departDatetime", value);
    }
  };

  const handleDepartChange = (value: string) => {
    onFieldChange("departDatetime", value);
    if (form.entryDatetime && value && form.entryDatetime > value) {
      onFieldChange("entryDatetime", value);
    }
  };

  const formCardStyle = {
    backgroundColor: "#fff",
    border: "1px solid #e1e5eb",
    borderRadius: 4,
    padding: { xs: 2, md: 3 },
    mt: 4,
    mb: 4,
  } as const;

  const tertiaryButtonStyle = {
    color: "#2c2f36",
    borderColor: "transparent",
    backgroundColor: "transparent",
    fontWeight: 700,
    textTransform: "none",
    px: 3,
    py: 1.5,
    borderRadius: 999,
    "&:hover": {
      borderColor: "transparent",
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
  } as const;

  const primaryButtonStyle = {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 700,
    px: 5,
    py: 1.5,
    backgroundColor: "#4546a9",
    "&:hover": {
      backgroundColor: "#3d3f97",
    },
  } as const;

  const quickFillButtonStyle = {
    minWidth: 40,
    width: 40,
    height: 40,
    borderRadius: 999,
    p: 0,
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
  } as const;

  const labelStyle = {
    display: "block",
    mb: 0.75,
    color: "#4b5563",
    fontSize: 14,
    fontWeight: 600,
  } as const;

  const introParagraphStyle = {
    fontWeight: 400,
  } as const;

  const linkStyle = {
    color: "#3B3A99",
    textDecoration: "underline",
  } as const;

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

      {straddlesBoundary && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Your trip straddles the 1 January 2027 rate change.</strong>{" "}
          Days before 2027 will be charged at current rates; days from 1 Jan
          2027 will be charged at the new rates. The breakdown is shown
          separately in the results.
        </Alert>
      )}
      <Box>
        <Box sx={formCardStyle}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.VEHICLE_CATEGORY}*
              </Typography>
              <FormControl fullWidth error={!!errors.vehicleCategory}>
                <Select
                  displayEmpty
                  value={form.vehicleCategory}
                  onChange={(e) =>
                    onFieldChange("vehicleCategory", e.target.value)
                  }
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.HAS_IU}*
              </Typography>
              <FormControl fullWidth error={!!errors.hasIU}>
                <Select
                  displayEmpty
                  disabled={form.vehicleCategory !== "cars"}
                  value={form.hasIU}
                  onChange={(e) => onFieldChange("hasIU", e.target.value)}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.ENTRY_DATETIME}*
              </Typography>
              <TextField
                fullWidth
                error={!!errors.entryDatetime}
                helperText={errors.entryDatetime || ""}
                type="datetime-local"
                value={form.entryDatetime}
                onChange={(e) => handleEntryChange(e.target.value)}
                slotProps={{
                  htmlInput: {
                    min: minEntry,
                    max: maxEntry,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.DEPART_DATETIME}*
              </Typography>
              <TextField
                fullWidth
                error={!!errors.departDatetime}
                helperText={errors.departDatetime || ""}
                type="datetime-local"
                value={form.departDatetime}
                onChange={(e) => handleDepartChange(e.target.value)}
                slotProps={{
                  htmlInput: {
                    min: minDepart,
                    max: maxExit,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.ENTRY_CHECKPOINT}*
              </Typography>
              <FormControl fullWidth error={!!errors.entryCheckpoint}>
                <Select
                  displayEmpty
                  value={form.entryCheckpoint}
                  onChange={(e) =>
                    onFieldChange("entryCheckpoint", e.target.value)
                  }
                >
                  <MenuItem value="">
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                {UI_LABELS.DEPART_CHECKPOINT}*
              </Typography>
              <FormControl fullWidth error={!!errors.departCheckpoint}>
                <Select
                  displayEmpty
                  value={form.departCheckpoint}
                  onChange={(e) =>
                    onFieldChange("departCheckpoint", e.target.value)
                  }
                >
                  <MenuItem value="">
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="label" sx={labelStyle}>
                No. of days using ERP-priced roads*
              </Typography>
              <TextField
                fullWidth
                disabled={form.vehicleCategory !== "cars"}
                value={form.erpDays}
                onChange={(e) => onFieldChange("erpDays", e.target.value)}
                helperText="Only include travel during ERP operating hours"
              />
            </Grid>
          </Grid>

          <Box
            mt={3}
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
              alignItems="center"
            >
              <Button variant="text" onClick={onReset} sx={tertiaryButtonStyle}>
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={onCalculate}
                disabled={loading}
                sx={primaryButtonStyle}
              >
                {loading ? (
                  <Box display="flex" alignItems="center" gap={1}>
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
        </Box>
      </Box>

      {errors._g && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors._g}
        </Alert>
      )}
    </>
  );
}
