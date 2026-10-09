import type { FormState } from "@/types/form";

/** Applies cross-field rules: ERP days only apply to years in the stay; taxis always have an IU. */
export function sanitiseForm(form: FormState): FormState {
  const entryYear = form.entryDatetime.slice(0, 4);
  const departYear = form.departDatetime.slice(0, 4);
  const has2026Period = entryYear === "2026" || departYear === "2026";
  const has2027Period = entryYear === "2027" || departYear === "2027";

  return {
    ...form,
    erpDays2026: has2026Period ? form.erpDays2026 : "0",
    erpDays2027: has2027Period ? form.erpDays2027 : "0",
    hasIU: form.vehicleCategory === "taxis" ? "yes" : form.hasIU,
  };
}
