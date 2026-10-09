import { MS_PER_DAY } from "@/config/constants";
import type { FormErrors, FormState } from "@/types/form";

function countOverlapDays(
  rangeStart: Date,
  rangeEnd: Date,
  yearStart: Date,
  yearEnd: Date,
): number {
  const start = rangeStart > yearStart ? rangeStart : yearStart;
  const end = rangeEnd < yearEnd ? rangeEnd : yearEnd;
  if (end < start) return 0;
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

function validateErpDays(formData: FormState): FormErrors {
  const errors: FormErrors = {};
  if (
    !formData.entryDatetime ||
    !formData.departDatetime ||
    formData.hasIU !== "no"
  ) {
    return errors;
  }

  const entryDt = new Date(formData.entryDatetime);
  const departDt = new Date(formData.departDatetime);
  entryDt.setHours(0, 0, 0, 0);
  departDt.setHours(0, 0, 0, 0);

  if (
    Number.isNaN(entryDt.getTime()) ||
    Number.isNaN(departDt.getTime()) ||
    departDt < entryDt
  ) {
    return errors;
  }

  const totalSelectedDays = Math.ceil(
    (departDt.getTime() - entryDt.getTime() + 1) / MS_PER_DAY,
  );
  const erpDays2026 = parseInt(formData.erpDays2026, 10) || 0;
  const erpDays2027 = parseInt(formData.erpDays2027, 10) || 0;

  const max2026Days = countOverlapDays(
    entryDt,
    departDt,
    new Date("2026-01-01T00:00:00"),
    new Date("2026-12-31T00:00:00"),
  );
  const max2027Days = countOverlapDays(
    entryDt,
    departDt,
    new Date("2027-01-01T00:00:00"),
    new Date("2027-12-31T00:00:00"),
  );

  if (erpDays2026 > max2026Days) {
    errors.erpDays2026 =
      "ERP operational days for 2026 cannot exceed selected days in 2026.";
  }
  if (erpDays2027 > max2027Days) {
    errors.erpDays2027 =
      "ERP operational days for 2027 cannot exceed selected days in 2027.";
  }

  if (erpDays2026 + erpDays2027 > totalSelectedDays) {
    const msg =
      "Total ERP operational days must be less or equal than total days stayed in Singapore.";
    errors.erpDays2026 = msg;
    errors.erpDays2027 = msg;
  }

  return errors;
}

export function validateCalculatorForm(formData: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!formData.vehicleCategory) errors.vehicleCategory = "Required";
  if (
    formData.vehicleCategory &&
    formData.vehicleCategory !== "taxis" &&
    !formData.hasIU
  ) {
    errors.hasIU = "Required";
  }
  if (!formData.entryDatetime) errors.entryDatetime = "Required";
  if (!formData.departDatetime) errors.departDatetime = "Required";
  if (!formData.entryCheckpoint) errors.entryCheckpoint = "Required";
  if (!formData.departCheckpoint) errors.departCheckpoint = "Required";

  return { ...errors, ...validateErpDays(formData) };
}
