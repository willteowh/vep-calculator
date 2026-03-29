import {
  SG_PUBLIC_HOLIDAYS,
  SCHOOL_HOLIDAYS,
  CUTOFF_2027,
} from "@/config/constants";

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isPublicHoliday(d: Date): boolean {
  return SG_PUBLIC_HOLIDAYS.has(dateKey(d));
}

export function isWeekend(d: Date): boolean {
  const w = d.getDay();
  return w === 0 || w === 6;
}

export function isSchoolHoliday(d: Date): boolean {
  return SCHOOL_HOLIDAYS.some((r) => d >= r.start && d <= r.end);
}

export function isPost2027(d: Date): boolean {
  return d >= CUTOFF_2027;
}

export function getCalendarDate(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function getHourFromDate(dt: Date): number {
  return dt.getHours() + dt.getMinutes() / 60;
}

export function getDateDifferenceDays(date1: Date, date2: Date): number {
  return Math.round((date2.getTime() - date1.getTime()) / 86400000);
}

export function isSameDay(dt1: Date, dt2: Date): boolean {
  return getDateDifferenceDays(dt1, dt2) === 0;
}

export function isNextDay(dt1: Date, dt2: Date): boolean {
  return getDateDifferenceDays(dt1, dt2) === 1;
}

export function durationDays(entryDt: Date, departureDt: Date): number {
  const ms = departureDt.getTime() - entryDt.getTime();
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}
