import { describe, expect, it } from "vitest";

import type { FormState } from "@/types/form";
import { sanitiseForm } from "./formRules";

const base: FormState = {
  vehicleCategory: "cars",
  hasIU: "no",
  entryDatetime: "2026-12-30T10:00",
  departDatetime: "2026-12-31T10:00",
  entryCheckpoint: "woodlands",
  departCheckpoint: "woodlands",
  erpDays2026: "1",
  erpDays2027: "3",
};

describe("sanitiseForm", () => {
  it("zeroes ERP days for years outside the stay", () => {
    expect(sanitiseForm(base)).toMatchObject({
      erpDays2026: "1",
      erpDays2027: "0",
    });
  });

  it("keeps ERP days for both years when the stay straddles 2027", () => {
    const form = { ...base, departDatetime: "2027-01-02T10:00" };
    expect(sanitiseForm(form)).toMatchObject({
      erpDays2026: "1",
      erpDays2027: "3",
    });
  });

  it("forces hasIU to yes for taxis", () => {
    const form = { ...base, vehicleCategory: "taxis", hasIU: "" };
    expect(sanitiseForm(form).hasIU).toBe("yes");
  });

  it("does not mutate its input", () => {
    const copy = { ...base };
    sanitiseForm(base);
    expect(base).toEqual(copy);
  });
});
