// Singapore Public Holidays (2025–2027)
export const SG_PUBLIC_HOLIDAYS = new Set([
  // 2025
  "2025-01-01",
  "2025-01-29",
  "2025-01-30",
  "2025-03-31",
  "2025-04-18",
  "2025-05-01",
  "2025-05-12",
  "2025-06-07",
  "2025-08-09",
  "2025-10-20",
  "2025-12-25",
  // 2026
  "2026-01-01",
  "2026-02-17",
  "2026-02-18",
  "2026-03-21",
  "2026-04-03",
  "2026-05-01",
  "2026-05-27",
  "2026-06-01",
  "2026-08-09",
  "2026-08-10",
  "2026-11-08",
  "2026-11-09",
  "2026-12-25",
  // 2027 (approximate – confirmed where known)
  "2027-01-01",
  "2027-01-27",
  "2027-01-28",
  "2027-03-20",
  "2027-03-26",
  "2027-05-01",
  "2027-05-20",
  "2027-05-16",
  "2027-08-09",
  "2027-10-09",
  "2027-12-25",
]);

// June & December school holidays (approximate annual ranges)
export const SCHOOL_HOLIDAYS = [
  { start: new Date("2025-05-31"), end: new Date("2025-06-29") },
  { start: new Date("2025-11-22"), end: new Date("2025-12-31") },
  { start: new Date("2026-05-30"), end: new Date("2026-06-28") },
  { start: new Date("2026-11-21"), end: new Date("2026-12-31") },
  { start: new Date("2027-05-29"), end: new Date("2027-06-27") },
  { start: new Date("2027-11-20"), end: new Date("2027-12-31") },
];

export const CUTOFF_2027 = new Date("2027-01-01T00:00:00");

// Vehicle Types
export const VEHICLE_TYPES = {
  CARS: "cars",
  MOTORCYCLES: "motorcycles",
} as const;

// Checkpoints
export const CHECKPOINTS = {
  WOODLANDS: "woodlands",
  TUAS: "tuas",
} as const;

// VEP Time Windows (Pre-2027)
export const EVENING_ENTRY_HOUR = 17; // 5 PM
export const EXIT_CUTOFF_HOUR = 2; // 2 AM
export const SCHOOL_HOLIDAY_ENTRY_HOUR = 12; // Noon

// Calculation Limits
export const MAX_STAY_DAYS = 250;
export const QUICK_FILL_MAX_DAYS = 30;
export const QUICK_FILL_STAY_DAYS_MAX = 10;

// PRE-2027 rates (current)
export const RATES_PRE = {
  cars: { vepPerDay: 35, erpNoIU: 5 },
  motorcycles: { vepPerDay: 4, erpNoIU: 0 },
} as const;

// POST-2027 rates (from 1 Jan 2027)
export const RATES_POST = {
  cars: { vepPerDay: 50, erpNoIU: 10 },
  motorcycles: { vepPerDay: 7, erpNoIU: 3 },
} as const;

// Toll charges — unchanged across periods
export const TOLLS = {
  cars: {
    entry: { woodlands: 0, tuas: 2.1 },
    exit: { woodlands: 0.8, tuas: 2.1 },
  },
  motorcycles: {
    entry: { woodlands: 0, tuas: 0 },
    exit: { woodlands: 0, tuas: 0 },
  },
} as const;

// RRC — cars only, per entry
export const RRC = {
  cars: 6.4,
  motorcycles: 0,
} as const;
