import { describe, expect, it } from "vitest";

import { TEST_CASES } from "@/config/testCases";
import { buildTestCasesCsv, parseTestCasesCsv } from "./testCaseCsv";

describe("test case CSV", () => {
  it("round-trips every built-in test case", () => {
    const parsed = parseTestCasesCsv(buildTestCasesCsv(TEST_CASES));
    expect(parsed).toEqual(TEST_CASES);
  });

  it("rejects a file with no data rows", () => {
    expect(() => parseTestCasesCsv("")).toThrow(/at least one data row/);
    expect(() => parseTestCasesCsv("id,label")).toThrow(
      /at least one data row/,
    );
  });

  it("rejects a missing header", () => {
    expect(() => parseTestCasesCsv("a,b\n1,2")).toThrow(/Missing required/);
  });

  it("rejects an invalid vehicle category", () => {
    const lines = buildTestCasesCsv(TEST_CASES.slice(0, 1)).split("\n");
    lines[1] = lines[1].replace("cars", "spaceship");
    expect(() => parseTestCasesCsv(lines.join("\n"))).toThrow(
      /invalid vehicleCategory/,
    );
  });

  it("round-trips a note containing a comma, quotes and a line break", () => {
    const [first] = TEST_CASES;
    const tricky = { ...first, note: 'checked, "twice"\nthen signed off' };
    expect(parseTestCasesCsv(buildTestCasesCsv([tricky]))).toEqual([tricky]);
  });

  it("imports a file saved with Windows line endings and a BOM", () => {
    const csv = "\uFEFF" + buildTestCasesCsv(TEST_CASES).replace(/\n/g, "\r\n");
    expect(parseTestCasesCsv(csv)).toEqual(TEST_CASES);
  });

  describe("row validation", () => {
    const header =
      "id,label,desc,vehicleCategory,hasIU,entryDt,departureDt,entryCheckpoint,departCheckpoint,expectedTotal,note";
    const good = [
      "1",
      "case",
      "d",
      "cars",
      "yes",
      "2026-04-13T10:00",
      "2026-04-14T18:00",
      "woodlands",
      "woodlands",
      "77.2",
      "n",
    ];
    const withCell = (index: number, value: string) =>
      [
        header,
        good.map((cell, i) => (i === index ? value : cell)).join(","),
      ].join("\n");

    it("accepts the baseline row", () => {
      expect(
        parseTestCasesCsv([header, good.join(",")].join("\n")),
      ).toHaveLength(1);
    });

    it.each([
      [1, "label is required"],
      [3, "vehicleCategory is required"],
      [4, "hasIU is required"],
      [7, "entryCheckpoint is required"],
      [8, "departCheckpoint is required"],
      [3, "invalid vehicleCategory", "spaceship"],
      [4, 'hasIU must be "yes" or "no"', "maybe"],
      [5, "invalid entryDt", "not-a-date"],
      [6, "invalid departureDt", "not-a-date"],
      [9, "expectedTotal must be a number", "abc"],
    ])("rejects a bad cell (column %i): %s", (index, message, value = "") => {
      expect(() =>
        parseTestCasesCsv(withCell(index as number, value as string)),
      ).toThrow(new RegExp(`Row 2: ${message}`));
    });

    it("renumbers duplicate ids instead of dropping rows", () => {
      const csv = [header, good.join(","), good.join(",")].join("\n");
      expect(parseTestCasesCsv(csv).map((tc) => tc.id)).toEqual([1, 2]);
    });
  });
});
