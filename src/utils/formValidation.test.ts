import { describe, expect, it } from "vitest";

import { INITIAL_FORM_STATE, type FormState } from "@/types/form";
import { validateCalculatorForm } from "./formValidation";

const validForm: FormState = {
  vehicleCategory: "cars",
  hasIU: "no",
  entryDatetime: "2026-03-10T10:00",
  departDatetime: "2026-03-12T10:00",
  entryCheckpoint: "woodlands",
  departCheckpoint: "woodlands",
};

describe("validateCalculatorForm", () => {
  it("requires every field on an empty form (hasIU only after a vehicle is chosen)", () => {
    expect(validateCalculatorForm(INITIAL_FORM_STATE)).toEqual({
      vehicleCategory: "Required",
      entryDatetime: "Required",
      departDatetime: "Required",
      entryCheckpoint: "Required",
      departCheckpoint: "Required",
    });
  });

  it("requires hasIU for non-taxi vehicles only", () => {
    const cars = { ...validForm, hasIU: "" };
    const taxis = { ...validForm, vehicleCategory: "taxis", hasIU: "" };
    expect(validateCalculatorForm(cars).hasIU).toBe("Required");
    expect(validateCalculatorForm(taxis).hasIU).toBeUndefined();
  });

  it("accepts a valid form", () => {
    expect(validateCalculatorForm(validForm)).toEqual({});
  });
});
