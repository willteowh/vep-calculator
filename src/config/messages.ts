export const ERROR_MESSAGES = {
  INVALID_DATE_RANGE: "Departure date cannot be before entry date.",
  EXCEED_DURATION: "Stay duration cannot exceed 250 days.",
  INVALID_VEHICLE:
    "This calculator supports Cars and Motorcycles registered in Malaysia only.",
} as const;

export const UI_LABELS = {
  VEHICLE_CATEGORY: "Vehicle category",
  HAS_IU: "In-Vehicle Unit / OBU installed?",
  ENTRY_DATETIME: "Entry date & time",
  DEPART_DATETIME: "Departure date & time",
  ENTRY_CHECKPOINT: "Entry checkpoint",
  DEPART_CHECKPOINT: "Departure checkpoint",
  ERP_DAYS: "No. of days using ERP-priced roads (during ERP-operating hours)",
  CALCULATE: "Calculate",
  QUICK_FILL: "⚡ Quick Fill",
  RESET: "Clear",
} as const;

export const CHECKPOINT_LABELS = {
  woodlands: "Woodlands Checkpoint",
  tuas: "Tuas Checkpoint",
} as const;

export const CURRENCY_LOCALE = "en-SG";
export const DATE_LOCALE = "en-GB";
