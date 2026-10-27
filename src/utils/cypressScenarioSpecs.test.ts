import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import {
  ALL_SCENARIOS_SPEC,
  SCENARIO_SPEC_DIR,
  allScenariosSpecSource,
  scenarioSpecName,
  scenarioSpecSource,
} from "../../scripts/scenarioSpec";
import { parseCsvRecords } from "./csv";

const dir = resolve(process.cwd(), SCENARIO_SPEC_DIR);
const scenarios = parseCsvRecords(
  readFileSync(
    resolve(process.cwd(), "docs/fare-scenarios/fare-scenarios.csv"),
    "utf8",
  ),
);
const hint =
  "Run `npm run scenarios:sync` to regenerate the Cypress scenario specs.";

describe("Cypress scenario specs", () => {
  it("has exactly one spec per scenario in the sheet", () => {
    const files = existsSync(dir) ? readdirSync(dir).sort() : [];
    const expected = scenarios
      .map((_, index) => scenarioSpecName(index + 1))
      .sort();
    expect(files, hint).toEqual(expected);
  });

  it.each(
    scenarios.map(
      (row, index) => [index + 1, row.scenario_id, row.scenario] as const,
    ),
  )("spec index %i is up to date for fare scenario %s", (index, id, name) => {
    const content = readFileSync(resolve(dir, scenarioSpecName(index)), "utf8");
    expect(content, hint).toBe(scenarioSpecSource(id, name));
  });

  it("all-scenarios spec is up to date with the sheet", () => {
    const content = readFileSync(
      resolve(process.cwd(), ALL_SCENARIOS_SPEC),
      "utf8",
    );
    const expected = allScenariosSpecSource(
      scenarios.map((row) => ({ id: row.scenario_id, name: row.scenario })),
    );
    expect(content, hint).toBe(expected);
  });
});
