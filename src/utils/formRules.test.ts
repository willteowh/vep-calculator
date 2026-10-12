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
};

describe("sanitiseForm", () => {
  it("forces hasIU to yes for taxis", () => {
    const form = { ...base, vehicleCategory: "taxis", hasIU: "" };
    expect(sanitiseForm(form).hasIU).toBe("yes");
  });

  it("keeps hasIU for other vehicles", () => {
    expect(sanitiseForm(base).hasIU).toBe("no");
  });

  it("does not mutate its input", () => {
    const copy = { ...base };
    sanitiseForm(base);
    expect(base).toEqual(copy);
  });
});
