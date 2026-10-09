import {
  MS_PER_DAY,
  QUICK_FILL_MAX_DAYS,
  QUICK_FILL_STAY_DAYS_MAX,
} from "@/config/constants";
import type { FormState } from "@/types/form";
import { toLocalDateTimeString } from "./dateUtils";

export function generateQuickFillForm(
  now: Date = new Date(),
  random: () => number = Math.random,
): FormState {
  const entryDate = new Date(
    now.getTime() + random() * QUICK_FILL_MAX_DAYS * MS_PER_DAY,
  );
  const stayDays = Math.floor(random() * QUICK_FILL_STAY_DAYS_MAX) + 1;
  const departDate = new Date(entryDate.getTime() + stayDays * MS_PER_DAY);

  const randomErpDays = Math.floor(random() * (stayDays + 1)).toString();
  const entryYear = entryDate.getFullYear();

  return {
    vehicleCategory: random() > 0.5 ? "cars" : "motorcycles",
    hasIU: random() > 0.5 ? "yes" : "no",
    entryDatetime: toLocalDateTimeString(entryDate),
    departDatetime: toLocalDateTimeString(departDate),
    entryCheckpoint: random() > 0.5 ? "woodlands" : "tuas",
    departCheckpoint: random() > 0.5 ? "woodlands" : "tuas",
    erpDays2026: entryYear === 2026 ? randomErpDays : "",
    erpDays2027: entryYear === 2027 ? randomErpDays : "",
  };
}
