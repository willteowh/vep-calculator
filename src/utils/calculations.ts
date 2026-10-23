import {
  RATES_PRE,
  RATES_POST,
  CUTOFF_2027,
  EVENING_ENTRY_HOUR,
  EXIT_CUTOFF_HOUR,
  SCHOOL_HOLIDAY_ENTRY_HOUR,
  TOLLS,
  RRC,
  PSVP_TAXI_POST_2027_EXIT_FEE,
  MAX_STAY_DAYS,
  MS_PER_DAY,
  VEHICLE_TYPES,
} from "@/config/constants";
import { ERROR_MESSAGES } from "@/config/messages";
import { isCheckpoint, type HasIU, type VehicleCategory } from "@/types/vep";
import {
  isWeekend,
  isPublicHoliday,
  isPost2027,
  isSchoolHoliday,
  getCalendarDate,
  getHourFromDate,
  getDateDifferenceDays,
  durationDays,
  toLocalDateTimeString,
} from "./dateUtils";

/** Sums of decimal rates accumulate float error (35 + 0.8 + 6.4); keep money to whole cents. */
const roundMoney = (amount: number) => Math.round(amount * 100) / 100;

export interface CalculationResult {
  vehicleCategory: VehicleCategory;
  hasIU: HasIU;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
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
  psvpFee: number;
  erpCharge: number;
  erpNote: string;
  erpDaysPre: number;
  erpDaysPost: number;
  subtotal: number;
  grandTotal: number;
  rPre: (typeof RATES_PRE)[keyof typeof RATES_PRE];
  rPost: (typeof RATES_POST)[keyof typeof RATES_POST];
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

  // Exit short-stay waiver: if departure day and exit < 02:00 (pre-2027), non-weekend/non-PH
  if (
    calDayDate.getTime() === deptDate.getTime() &&
    deptHour < EXIT_CUTOFF_HOUR
  ) {
    return true;
  }

  // School-holiday noon waiver: if entry >= 12:00 and exit < 02:00, exit day is free if school holiday
  if (
    calDayDate.getTime() === deptDate.getTime() &&
    isSchoolHoliday(calDay) &&
    deptHour < EXIT_CUTOFF_HOUR
  ) {
    return true;
  }

  return false;
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

/** ERP runs on every calendar day except weekends and public holidays. */
export function countErpDays(
  entryDt: Date,
  departureDt: Date,
): ChargeableDaysSplit {
  const entryDate = getCalendarDate(entryDt);
  const totalCal =
    getDateDifferenceDays(entryDate, getCalendarDate(departureDt)) + 1;
  let pre = 0,
    post = 0;
  for (let i = 0; i < totalCal; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (isWeekend(d) || isPublicHoliday(d)) continue;
    if (isPost2027(d)) post++;
    else pre++;
  }
  return { pre, post };
}

export interface CalculateParams {
  vehicleCategory: VehicleCategory;
  hasIU: HasIU;
  entryDt: Date;
  departureDt: Date;
  entryCheckpoint: string;
  departCheckpoint: string;
}

export function getStayError(entryDt: Date, departureDt: Date): string | null {
  const msDiff = departureDt.getTime() - entryDt.getTime();
  if (msDiff < 0) return ERROR_MESSAGES.INVALID_DATE_RANGE;
  if (msDiff / MS_PER_DAY > MAX_STAY_DAYS)
    return ERROR_MESSAGES.EXCEED_DURATION;
  return null;
}

export function calculate(params: CalculateParams): CalculationOutput {
  const {
    vehicleCategory,
    hasIU,
    entryDt,
    departureDt,
    entryCheckpoint,
    departCheckpoint,
  } = params;

  const stayError = getStayError(entryDt, departureDt);
  if (stayError) return { error: stayError };

  const isCar = vehicleCategory === VEHICLE_TYPES.CARS;
  const isMoto = vehicleCategory === VEHICLE_TYPES.MOTORCYCLES;
  const hasVEPRate = isCar || isMoto;
  const hasERPFlatRate = true;

  const tolls = TOLLS[vehicleCategory];

  // Unrecognised checkpoints are charged no toll.
  const entryToll = isCheckpoint(entryCheckpoint)
    ? tolls.entry[entryCheckpoint]
    : 0;
  const exitToll = isCheckpoint(departCheckpoint)
    ? tolls.exit[departCheckpoint]
    : 0;
  const tollTotal = roundMoney(entryToll + exitToll);

  // Split chargeable days across rate boundary
  const { pre: preDays, post: postDays } = splitChargeableDays(
    entryDt,
    departureDt,
  );
  const totalChargeable = preDays + postDays;

  const rPre = RATES_PRE[vehicleCategory];
  const rPost = RATES_POST[vehicleCategory];
  const vepPerDayPre = "vepPerDay" in rPre ? rPre.vepPerDay : 0;
  const vepPerDayPost = "vepPerDay" in rPost ? rPost.vepPerDay : 0;

  const vepFeePre = hasVEPRate ? preDays * vepPerDayPre : 0;
  const vepFeePost = hasVEPRate ? postDays * vepPerDayPost : 0;
  const vepFees = vepFeePre + vepFeePost;

  const rrcCharge = RRC[vehicleCategory];
  const psvpFee =
    vehicleCategory === VEHICLE_TYPES.TAXIS && departureDt >= CUTOFF_2027
      ? PSVP_TAXI_POST_2027_EXIT_FEE
      : 0;

  // ERP calculation (only for vehicles with VEP rates)
  const noIU = hasIU === "no";
  const { pre: erpDaysPre, post: erpDaysPost } = countErpDays(
    entryDt,
    departureDt,
  );

  let erpCharge = 0;
  let erpNote = "";
  if (hasERPFlatRate && noIU) {
    const chargePre = erpDaysPre * rPre.erpNoIU;
    const chargePost = erpDaysPost * rPost.erpNoIU;
    erpCharge = chargePre + chargePost;
    const parts: string[] = [];
    if (erpDaysPre > 0)
      parts.push(`$${rPre.erpNoIU.toFixed(2)}/day × ${erpDaysPre} day(s)`);
    if (erpDaysPost > 0)
      parts.push(`$${rPost.erpNoIU.toFixed(2)}/day × ${erpDaysPost} day(s)`);
    erpNote = `$${erpCharge.toFixed(2)} — flat rate (no OBU/IU): ${parts.join(" + ")}`;
  } else if (hasVEPRate) {
    erpNote = "Normal charges apply. Please refer to ERP rates published.";
  } else {
    erpNote = "";
  }

  const subtotal = roundMoney(tollTotal + vepFees);
  const grandTotal = roundMoney(subtotal + rrcCharge + psvpFee + erpCharge);
  const dur = durationDays(entryDt, departureDt);

  return {
    vehicleCategory,
    hasIU,
    entryDatetime: toLocalDateTimeString(entryDt),
    departDatetime: toLocalDateTimeString(departureDt),
    entryCheckpoint,
    departCheckpoint,
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
    psvpFee,
    erpCharge,
    erpNote,
    erpDaysPre,
    erpDaysPost,
    subtotal,
    grandTotal,
    rPre,
    rPost,
  };
}
