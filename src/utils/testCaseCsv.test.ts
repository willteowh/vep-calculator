import { describe, expect, it } from "vitest";

import { TEST_CASES } from "@/config/testCases";
import { buildTestCasesCsv, parseTestCasesCsv } from "./testCaseCsv";

describe("test case CSV", () => {
  it("round-trips every built-in test case", () => {
    const parsed = parseTestCasesCsv(buildTestCasesCsv(TEST_CASES));
    expect(parsed).toEqual(TEST_CASES);
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
});
