import { useState } from "react";

import {
  INITIAL_FORM_STATE,
  type FormErrors,
  type FormState,
} from "@/types/form";
import { validateCalculatorForm } from "@/utils/formValidation";

export function useCalculatorForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (formData: FormState = form): FormErrors =>
    validateCalculatorForm(formData);

  const reset = () => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
  };

  return { form, errors, set, setErrors, validate, reset };
}
