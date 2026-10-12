import { useState } from "react";

import { useCalculatorForm } from "@/hooks/useCalculatorForm";
import type { FormState } from "@/types/form";
import { isHasIU, isVehicleCategory } from "@/types/vep";
import { calculate, type CalculationOutput } from "@/utils/calculations";
import { sanitiseForm } from "@/utils/formRules";
import { generateQuickFillForm } from "@/utils/quickFill";

const CALCULATE_DELAY_MS = 500;

export function useFeeCalculator() {
  const { form, errors, set, setErrors, validate, reset } = useCalculatorForm();
  const [result, setResult] = useState<CalculationOutput | null>(null);
  const [resetVersion, setResetVersion] = useState(0);

  function submit() {
    const sanitisedForm = sanitiseForm(form);

    if (sanitisedForm.hasIU !== form.hasIU) set("hasIU", sanitisedForm.hasIU);

    const validationErrors = validate(sanitisedForm);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setResult(null);

    const { vehicleCategory, hasIU, entryCheckpoint, departCheckpoint } =
      sanitisedForm;
    if (!isVehicleCategory(vehicleCategory) || !isHasIU(hasIU)) {
      setErrors({ _g: "Invalid vehicle category or IU selection." });
      return;
    }

    // Small delay so users see the result being produced.
    setTimeout(() => {
      const entryDt = new Date(sanitisedForm.entryDatetime);
      const departureDt = new Date(sanitisedForm.departDatetime);

      if (departureDt < entryDt) {
        setErrors({ _g: "Departure must be after entry date/time." });
        return;
      }

      setResult(
        calculate({
          vehicleCategory,
          hasIU,
          entryCheckpoint,
          departCheckpoint,
          entryDt,
          departureDt,
        }),
      );
    }, CALCULATE_DELAY_MS);
  }

  function quickFill() {
    const randomForm = generateQuickFillForm();
    (Object.keys(randomForm) as (keyof FormState)[]).forEach((key) => {
      set(key, randomForm[key]);
    });
    setErrors({});
    setResult(null);
  }

  function clear() {
    reset();
    setResetVersion((prev) => prev + 1);
    setResult(null);
  }

  return { form, errors, result, resetVersion, set, submit, quickFill, clear };
}

export type FeeCalculator = ReturnType<typeof useFeeCalculator>;
