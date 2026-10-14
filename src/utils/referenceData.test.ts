import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import {
  PSVP_TAXI_POST_2027_ENTRY_FEE,
  RATES_POST,
  RATES_PRE,
  RRC,
  SCHOOL_HOLIDAYS,
  SG_PUBLIC_HOLIDAYS,
  TOLLS,
  VEHICLE_TYPES,
} from "@/config/constants";
import { TEST_CASES } from "@/config/testCases";
import { parseCsvRecords } from "./csv";
import { dateKey } from "./dateUtils";
import { buildTestCasesCsv } from "./testCaseCsv";

const read = (file: string) =>
  readFileSync(resolve(process.cwd(), file), "utf8");

describe("public holidays", () => {
  it("are real, unique, ascending dates within 2026-2027", () => {
    const dates = SG_PUBLIC_HOLIDAYS.map((holiday) => holiday.date);
    for (const date of dates) {
      const [y, m, d] = date.split("-").map(Number);
      expect(dateKey(new Date(y, m - 1, d))).toBe(date);
      expect(y).toBeGreaterThanOrEqual(2026);
      expect(y).toBeLessThanOrEqual(2027);
    }
    expect(new Set(dates).size).toBe(dates.length);
    expect([...dates].sort()).toEqual(dates);
  });

  it("all have a title", () => {
    for (const holiday of SG_PUBLIC_HOLIDAYS) {
      expect(holiday.title.trim()).not.toBe("");
    }
  });
});

describe("school holidays", () => {
  it("are real dates, ordered, and do not overlap", () => {
    let previousEnd = "";
    for (const { start, end } of SCHOOL_HOLIDAYS) {
      for (const date of [start, end]) {
        const [y, m, d] = date.split("-").map(Number);
        expect(dateKey(new Date(y, m - 1, d))).toBe(date);
      }
      expect(start <= end).toBe(true);
      expect(start > previousEnd).toBe(true);
      previousEnd = end;
    }
  });
});

describe("published rates sheet (docs/fare-scenarios/published-rates.csv)", () => {
  // Same keys the sheet uses, built from the constants the app actually runs on.
  const fromConstants = new Map<string, number>();
  for (const vehicle of Object.values(VEHICLE_TYPES)) {
    const pre = RATES_PRE[vehicle];
    const post = RATES_POST[vehicle];
    if ("vepPerDay" in pre)
      fromConstants.set(`VEP per day|${vehicle}|pre-2027`, pre.vepPerDay);
    if ("vepPerDay" in post)
      fromConstants.set(`VEP per day|${vehicle}|from 2027`, post.vepPerDay);
    fromConstants.set(`ERP per day (no IU)|${vehicle}|pre-2027`, pre.erpNoIU);
    fromConstants.set(`ERP per day (no IU)|${vehicle}|from 2027`, post.erpNoIU);
    for (const kind of ["entry", "exit"] as const) {
      for (const checkpoint of ["woodlands", "tuas"] as const) {
        fromConstants.set(
          `Toll ${kind}|${vehicle}|${checkpoint}`,
          TOLLS[vehicle][kind][checkpoint],
        );
      }
    }
    fromConstants.set(`RRC per entry|${vehicle}|-`, RRC[vehicle]);
  }
  fromConstants.set(
    "PSVP per entry|taxis|from 2027",
    PSVP_TAXI_POST_2027_ENTRY_FEE,
  );

  const rows = parseCsvRecords(read("docs/fare-scenarios/published-rates.csv"));

  it.each(rows)("$item / $vehicle / $detail = $amount", (row) => {
    const key = `${row.item}|${row.vehicle}|${row.detail}`;
    expect(fromConstants.get(key), `no constant for ${key}`).toBe(
      Number(row.amount),
    );
  });

  it("covers every rate in the app", () => {
    expect(rows).toHaveLength(fromConstants.size);
  });
});

describe("test-case data", () => {
  it("has unique, consecutive ids", () => {
    expect(TEST_CASES.map((tc) => tc.id)).toEqual(
      TEST_CASES.map((_, index) => index + 1),
    );
  });

  it("matches the downloadable public CSV (no drift)", () => {
    const normalise = (text: string) => text.replace(/\r\n/g, "\n").trim();
    expect(normalise(read("public/vep-test-cases-comprehensive.csv"))).toBe(
      normalise(buildTestCasesCsv(TEST_CASES)),
    );
  });
});

describe("fare scenario sheets", () => {
  const scenarios = parseCsvRecords(
    read("docs/fare-scenarios/fare-scenarios.csv"),
  );
  const days = parseCsvRecords(
    read("docs/fare-scenarios/fare-scenario-days.csv"),
  );

  it("have unique scenario ids", () => {
    const ids = scenarios.map((row) => row.scenario_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only list days for known scenarios", () => {
    const ids = new Set(scenarios.map((row) => row.scenario_id));
    for (const day of days) expect(ids.has(day.scenario_id)).toBe(true);
  });
});
