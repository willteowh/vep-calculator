import { useState } from "react";
import moment from "moment";

export interface FormState {
  vehicleCategory: string;
  hasIU: string;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
  erpDays2026: string;
  erpDays2027: string;
}

export interface FormErrors {
  vehicleCategory?: string;
  hasIU?: string;
  entryDatetime?: string;
  departDatetime?: string;
  entryCheckpoint?: string;
  departCheckpoint?: string;
  erpDays2026?: string;
  erpDays2027?: string;
  _g?: string;
}

const INITIAL_FORM_STATE: FormState = {
  vehicleCategory: "",
  hasIU: "",
  entryDatetime: "",
  departDatetime: "",
  entryCheckpoint: "",
  departCheckpoint: "",
  erpDays2026: "",
  erpDays2027: "",
};

export function useCalculatorForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (formData: FormState = form): FormErrors => {
    const e: FormErrors = {};
    if (!formData.vehicleCategory) e.vehicleCategory = "Required";
    if (
      formData.vehicleCategory &&
      formData.vehicleCategory !== "taxis" &&
      !formData.hasIU
    )
      e.hasIU = "Required";
    if (!formData.entryDatetime) e.entryDatetime = "Required";
    if (!formData.departDatetime) e.departDatetime = "Required";
    if (!formData.entryCheckpoint) e.entryCheckpoint = "Required";
    if (!formData.departCheckpoint) e.departCheckpoint = "Required";

    if (
      formData.entryDatetime &&
      formData.departDatetime &&
      formData.hasIU === "no"
    ) {
      const entryDt = new Date(formData.entryDatetime);
      const departDt = new Date(formData.departDatetime);

      entryDt.setHours(0, 0, 0, 0);
      departDt.setHours(0, 0, 0, 0);

      if (
        !Number.isNaN(entryDt.getTime()) &&
        !Number.isNaN(departDt.getTime()) &&
        departDt >= entryDt
      ) {
        const MS_PER_DAY = 86400000;
        const countOverlapDays = (
          rangeStart: Date,
          rangeEnd: Date,
          yearStart: Date,
          yearEnd: Date,
        ): number => {
          const start =
            rangeStart.getTime() > yearStart.getTime() ? rangeStart : yearStart;
          const end =
            rangeEnd.getTime() < yearEnd.getTime() ? rangeEnd : yearEnd;

          if (end.getTime() < start.getTime()) {
            return 0;
          }

          return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
        };

        const totalSelectedDays = Math.ceil(
          (departDt.getTime() - entryDt.getTime() + 1) / 86400000,
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
          e.erpDays2026 = `ERP operational days for 2026 cannot exceed selected days in 2026.`;
        }
        if (erpDays2027 > max2027Days) {
          e.erpDays2027 = `ERP operational days for 2027 cannot exceed selected days in 2027.`;
        }

        const totalErpDays = erpDays2026 + erpDays2027;

        if (totalErpDays > totalSelectedDays) {
          const msg =
            "Total ERP operational days must be less or equal than total days stayed in Singapore.";
          e.erpDays2026 = msg;
          e.erpDays2027 = msg;
        }
      }
    }

    return e;
  };

  const reset = () => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
  };

  return {
    form,
    errors,
    set,
    setErrors,
    validate,
    reset,
  };
}
