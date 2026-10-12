import type { FormState } from "@/types/form";

/** Applies cross-field rules: taxis always have an IU. */
export function sanitiseForm(form: FormState): FormState {
  return {
    ...form,
    hasIU: form.vehicleCategory === "taxis" ? "yes" : form.hasIU,
  };
}
