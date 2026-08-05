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

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.vehicleCategory) e.vehicleCategory = "Required";
    if (form.vehicleCategory === "cars" && !form.hasIU) e.hasIU = "Required";
    if (!form.entryDatetime) e.entryDatetime = "Required";
    if (!form.departDatetime) e.departDatetime = "Required";
    if (!form.entryCheckpoint) e.entryCheckpoint = "Required";
    if (!form.departCheckpoint) e.departCheckpoint = "Required";

    if (form.entryDatetime && form.departDatetime && form.hasIU === "no") {
      const entryDt = new Date(form.entryDatetime);
      const departDt = new Date(form.departDatetime);

      entryDt.setHours(0, 0, 0, 0);
      departDt.setHours(0, 0, 0, 0);

      if (
        !Number.isNaN(entryDt.getTime()) &&
        !Number.isNaN(departDt.getTime()) &&
        departDt >= entryDt
      ) {
        const totalSelectedDays = Math.ceil(
          (departDt.getTime() - entryDt.getTime() + 1) / 86400000,
        );

        const erpDays2026 = parseInt(form.erpDays2026, 10) || 0;
        const erpDays2027 = parseInt(form.erpDays2027, 10) || 0;
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
