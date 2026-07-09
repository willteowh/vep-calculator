import { useState } from "react";
import moment from "moment";

export interface FormState {
  vehicleCategory: string;
  hasIU: string;
  entryDatetime: string;
  departDatetime: string;
  entryCheckpoint: string;
  departCheckpoint: string;
  erpDays: string;
}

export interface FormErrors {
  vehicleCategory?: string;
  hasIU?: string;
  entryDatetime?: string;
  departDatetime?: string;
  entryCheckpoint?: string;
  departCheckpoint?: string;
  _g?: string;
}

const INITIAL_FORM_STATE: FormState = {
  vehicleCategory: "",
  hasIU: "",
  entryDatetime: "",
  departDatetime: "",
  entryCheckpoint: "",
  departCheckpoint: "",
  erpDays: "",
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
    if (!form.hasIU) e.hasIU = "Required";
    if (!form.entryDatetime) e.entryDatetime = "Required";
    if (!form.departDatetime) e.departDatetime = "Required";
    if (!form.entryCheckpoint) e.entryCheckpoint = "Required";
    if (!form.departCheckpoint) e.departCheckpoint = "Required";
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
