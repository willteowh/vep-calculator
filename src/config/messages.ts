export const ERROR_MESSAGES = {
  INVALID_DATE_RANGE: "Departure date cannot be before entry date.",
  EXCEED_DURATION: "Stay duration cannot exceed 250 days.",
  INVALID_VEHICLE:
    "This calculator supports Cars and Motorcycles registered in Malaysia only.",
} as const;

export const UI_LABELS = {
  VEHICLE_CATEGORY: "Vehicle Category",
  HAS_IU: "In-Vehicle Unit / OBU installed?",
  ENTRY_DATETIME: "Entry Date & Time",
  DEPART_DATETIME: "Departure Date & Time",
  ENTRY_CHECKPOINT: "Entry Checkpoint",
  DEPART_CHECKPOINT: "Departure Checkpoint",
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
