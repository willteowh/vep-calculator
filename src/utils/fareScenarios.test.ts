import { describe, expect, it } from "vitest";

import { calculate, countErpDays, isDayVEPFree } from "./calculations";
import { getCalendarDate, dateKey } from "./dateUtils";
import { loadFareScenarios } from "./__fixtures__/loadFareScenarios";

const FARE_SCENARIOS = loadFareScenarios();

const calendarDays = (entry: Date, departure: Date): string[] => {
  const days: string[] = [];
  const day = getCalendarDate(entry);
  const last = getCalendarDate(departure);
  while (day <= last) {
    days.push(dateKey(day));
    day.setDate(day.getDate() + 1);
  }
  return days;
};

describe.each(FARE_SCENARIOS)("fare scenario $id: $name", (scenario) => {
  const { params, days, expected } = scenario;

  it("has a ledger that covers every calendar day of the stay", () => {
    expect(days.map((day) => day.date)).toEqual(
      calendarDays(params.entryDt, params.departureDt),
    );
  });

  it("has expected counts that agree with its own ledger", () => {
    const charged = days.filter((day) => day.vep === "charged");
    expect(charged.filter((day) => day.date < "2027-01-01")).toHaveLength(
      expected.vepDaysPre,
    );
    expect(charged.filter((day) => day.date >= "2027-01-01")).toHaveLength(
      expected.vepDaysPost,
    );
    if (expected.erpDaysPre !== undefined) {
      const erp = days.filter((day) => day.erp);
      expect(erp.filter((day) => day.date < "2027-01-01")).toHaveLength(
        expected.erpDaysPre,
      );
      expect(erp.filter((day) => day.date >= "2027-01-01")).toHaveLength(
        expected.erpDaysPost ?? 0,
      );
    }
  });

  it.each(days)("classifies $date as VEP $vep", ({ date, vep }) => {
    const calDay = new Date(`${date}T00:00`);
    expect(isDayVEPFree(calDay, params.entryDt, params.departureDt)).toBe(
      vep === "free",
    );
  });

  it("counts the ledger's ERP days", () => {
    const erp = days.filter((day) => day.erp);
    expect(countErpDays(params.entryDt, params.departureDt)).toEqual({
      pre: erp.filter((day) => day.date < "2027-01-01").length,
      post: erp.filter((day) => day.date >= "2027-01-01").length,
    });
  });

  it("produces every expected fare component", () => {
    const result = calculate(params);
    expect(result).not.toHaveProperty("error");
    const { vepDaysPre, vepDaysPost, erpDaysPre, erpDaysPost, ...components } =
      expected;

    expect(result).toMatchObject({
      ...components,
      preDays: vepDaysPre,
      postDays: vepDaysPost,
      ...(erpDaysPre !== undefined && { erpDaysPre, erpDaysPost }),
    });
  });
});
