import { describe, expect, it } from "vitest";

import { validateCalculatorForm } from "./formValidation";
import { generateQuickFillForm } from "./quickFill";

describe("generateQuickFillForm", () => {
  it("produces a form that passes validation for many random seeds", () => {
    const now = new Date("2026-06-01T09:00");
    for (let i = 0; i < 200; i++) {
      const form = generateQuickFillForm(now);
      expect(validateCalculatorForm(form)).toEqual({});
      expect(form.departDatetime >= form.entryDatetime).toBe(true);
    }
  });

  it("is deterministic for a fixed random source", () => {
    const now = new Date("2026-06-01T09:00");
    const first = generateQuickFillForm(now, () => 0.9);
    const second = generateQuickFillForm(now, () => 0.9);
    expect(first).toEqual(second);
    expect(first.vehicleCategory).toBe("cars");
  });

  it("only fills the ERP year matching the entry year", () => {
    const form = generateQuickFillForm(new Date("2027-02-01T09:00"), () => 0);
    expect(form.erpDays2026).toBe("");
  });
});
