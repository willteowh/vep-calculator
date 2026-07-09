import {
  RATES_PRE,
  RATES_POST,
  CUTOFF_2027,
  EVENING_ENTRY_HOUR,
  EXIT_CUTOFF_HOUR,
  SCHOOL_HOLIDAY_ENTRY_HOUR,
  TOLLS,
  RRC,
  MAX_STAY_DAYS,
  VEHICLE_TYPES,
} from "@/config/constants";
import { ERROR_MESSAGES } from "@/config/messages";
import {
  isWeekend,
  isPublicHoliday,
  isPost2027,
  isSchoolHoliday,
  getCalendarDate,
  getHourFromDate,
  getDateDifferenceDays,
  isSameDay,
  isNextDay,
  durationDays,
} from "./dateUtils";

export interface CalculationResult {
  vehicleType: string;
  vehicleCategory: string;
  hasIU: string;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
  erpDays: string;
  dur: number;
  totalChargeable: number;
  preDays: number;
  postDays: number;
  vepFeePre: number;
  vepFeePost: number;
  vepFees: number;
  entryToll: number;
  exitToll: number;
  tollTotal: number;
  rrc: number;
  erpCharge: number;
  erpNote: string;
  erpDaysPre: number;
  erpDaysPost: number;
  subtotal: number;
  grandTotal: number;
  rPre: (typeof RATES_PRE)[keyof typeof RATES_PRE];
  rPost: (typeof RATES_POST)[keyof typeof RATES_POST];
  error?: never;
}

export interface CalculationError {
  error: string;
}

export type CalculationOutput = CalculationResult | CalculationError;

export function isDayVEPFree(
  calDay: Date,
  entryDt: Date,
  departureDt: Date,
): boolean {
  // Weekend or PH — always free in both regimes
  if (isWeekend(calDay) || isPublicHoliday(calDay)) return true;

  // Post-2027: no further exemptions
  if (isPost2027(calDay)) return false;

  // Pre-2027 exemptions below - check per calendar day
  const entryHour = getHourFromDate(entryDt);
  const deptHour = getHourFromDate(departureDt);
  const entryDate = getCalendarDate(entryDt);
  const deptDate = getCalendarDate(departureDt);
  const calDayDate = getCalendarDate(calDay);

  // Entry-day exemptions (pre-2027): evenings and school holiday noons
  if (
    calDayDate.getTime() === entryDate.getTime() &&
    (entryHour >= EVENING_ENTRY_HOUR ||
      (isSchoolHoliday(calDay) && entryHour >= SCHOOL_HOLIDAY_ENTRY_HOUR))
  ) {
    return true;
  }

  // Exit short-stay waiver: if departure day and exit <= 02:00 (pre-2027), non-weekend/non-PH
  if (
    calDayDate.getTime() === deptDate.getTime() &&
    deptHour <= EXIT_CUTOFF_HOUR
  ) {
    return true;
  }

  // School-holiday noon waiver: if entry >= 12:00 and exit <= 02:00, exit day is free if school holiday
  if (
    calDayDate.getTime() === deptDate.getTime() &&
    isSchoolHoliday(calDay) &&
    deptHour <= EXIT_CUTOFF_HOUR
  ) {
    return true;
  }

  return false;
}

export function countChargeableDays(entryDt: Date, departureDt: Date): number {
  const entryDate = getCalendarDate(entryDt);
  const deptDate = getCalendarDate(departureDt);
  const totalCal = getDateDifferenceDays(entryDate, deptDate) + 1;
  let charged = 0;
  for (let i = 0; i < totalCal; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (!isDayVEPFree(d, entryDt, departureDt)) charged++;
  }
  return charged;
}

export interface ChargeableDaysSplit {
  pre: number;
  post: number;
}

export function splitChargeableDays(
  entryDt: Date,
  departureDt: Date,
): ChargeableDaysSplit {
  const entryDate = getCalendarDate(entryDt);
  const deptDate = getCalendarDate(departureDt);
  const totalCal = getDateDifferenceDays(entryDate, deptDate) + 1;
  let pre = 0,
    post = 0;
  for (let i = 0; i < totalCal; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (!isDayVEPFree(d, entryDt, departureDt)) {
      if (isPost2027(d)) post++;
      else pre++;
    }
  }
  return { pre, post };
}

interface CalculateParams {
  vehicleCategory: string;
  hasIU: string;
  entryDt: Date;
  departureDt: Date;
  entryCheckpoint: string;
  departCheckpoint: string;
  erpDays: string;
}

export function calculate(params: CalculateParams): CalculationOutput {
  const {
    vehicleCategory,
    hasIU,
    entryDt,
    departureDt,
    entryCheckpoint,
    departCheckpoint,
    erpDays,
  } = params;

  // 1. Stay Duration Check
  const msDiff = departureDt.getTime() - entryDt.getTime();
  const daysDiff = msDiff / (1000 * 60 * 60 * 24);

  if (msDiff < 0) return { error: ERROR_MESSAGES.INVALID_DATE_RANGE };
  if (daysDiff > MAX_STAY_DAYS)
    return { error: ERROR_MESSAGES.EXCEED_DURATION };

  const isCar = vehicleCategory === VEHICLE_TYPES.CARS;
  const isMoto = vehicleCategory === VEHICLE_TYPES.MOTORCYCLES;
  const hasVEPRate = isCar || isMoto;

  const entryCP = (entryCheckpoint || "").toLowerCase();
  const deptCP = (departCheckpoint || "").toLowerCase();
  const tolls = TOLLS[vehicleCategory as keyof typeof TOLLS];

  const entryToll = tolls?.entry[entryCP as keyof typeof tolls.entry] ?? 0;
  const exitToll = tolls?.exit[deptCP as keyof typeof tolls.exit] ?? 0;
  const tollTotal = entryToll + exitToll;

  // Split chargeable days across rate boundary
  const { pre: preDays, post: postDays } = splitChargeableDays(
    entryDt,
    departureDt,
  );
  const totalChargeable = preDays + postDays;

  const rPre = hasVEPRate
    ? RATES_PRE[vehicleCategory as keyof typeof RATES_PRE]
    : null;
  const rPost = hasVEPRate
    ? RATES_POST[vehicleCategory as keyof typeof RATES_POST]
    : null;

  const vepFeePre = hasVEPRate ? preDays * rPre!.vepPerDay : 0;
  const vepFeePost = hasVEPRate ? postDays * rPost!.vepPerDay : 0;
  const vepFees = vepFeePre + vepFeePost;

  const rrcCharge = RRC[vehicleCategory as keyof typeof RRC];

  // ERP calculation (only for vehicles with VEP rates)
  const noIU = hasIU === "no";
  const erpNum = parseInt(erpDays, 10) || 0;
  const totalCalDays = durationDays(entryDt, departureDt) || 1;
  const preCalDays = Math.min(
    totalCalDays,
    Math.max(
      0,
      Math.round((CUTOFF_2027.getTime() - entryDt.getTime()) / 86400000),
    ),
  );
  const erpDaysPre = Math.round(erpNum * (preCalDays / totalCalDays));
  const erpDaysPost = erpNum - erpDaysPre;

  let erpCharge = 0;
  let erpNote = "";
  if (hasVEPRate && noIU) {
    const chargePre = erpDaysPre * rPre!.erpNoIU;
    const chargePost = erpDaysPost * rPost!.erpNoIU;
    erpCharge = chargePre + chargePost;
    const parts = [];
    if (erpDaysPre > 0)
      parts.push(`$${rPre.erpNoIU.toFixed(2)}/day × ${erpDaysPre} day(s)`);
    if (erpDaysPost > 0)
      parts.push(`$${rPost.erpNoIU.toFixed(2)}/day × ${erpDaysPost} day(s)`);
    erpNote = `$${erpCharge.toFixed(2)} — flat rate (no OBU/IU): ${parts.join(" + ")}`;
  } else if (hasVEPRate) {
    erpNote = "Normal charges apply. Please refer to published ERP rates.";
  } else {
    erpNote = "";
  }

  const subtotal = tollTotal + vepFees;
  const grandTotal = subtotal + rrcCharge + erpCharge;
  const dur = durationDays(entryDt, departureDt);

  const getVehicleTypeName = () => {
    switch (vehicleCategory) {
      case VEHICLE_TYPES.CARS:
        return "Cars";
      case VEHICLE_TYPES.MOTORCYCLES:
        return "Motorcycles";
      case VEHICLE_TYPES.VANS:
        return "Vans/Light Goods Vehicles";
      case VEHICLE_TYPES.HEAVY_GOODS:
        return "Heavy Goods Vehicles";
      case VEHICLE_TYPES.TAXIS:
        return "Taxis";
      case VEHICLE_TYPES.BUSES:
        return "Buses";
      default:
        return vehicleCategory;
    }
  };

  return {
    vehicleType: getVehicleTypeName(),
    vehicleCategory,
    hasIU,
    entryDatetime: entryDt.toISOString().slice(0, 16),
    departDatetime: departureDt.toISOString().slice(0, 16),
    entryCheckpoint,
    departCheckpoint,
    erpDays,
    dur,
    totalChargeable,
    preDays,
    postDays,
    vepFeePre,
    vepFeePost,
    vepFees,
    entryToll,
    exitToll,
    tollTotal,
    rrc: rrcCharge,
    erpCharge,
    erpNote,
    erpDaysPre,
    erpDaysPost,
    subtotal,
    grandTotal,
    rPre: rPre || RATES_PRE[VEHICLE_TYPES.CARS],
    rPost: rPost || RATES_POST[VEHICLE_TYPES.CARS],
  };
}
