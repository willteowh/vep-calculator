import type { FormErrors, FormState } from "@/types/form";

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

  return errors;
}
