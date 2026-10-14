import { existsSync, readFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import {
  ALL_SCENARIOS_SPEC,
  SCENARIO_SPEC_DIR,
  allScenariosSpecSource,
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
    const expected = scenarios.map((row) => `${row.scenario_id}.cy.ts`).sort();
    expect(files, hint).toEqual(expected);
  });

  it.each(scenarios.map((row) => [row.scenario_id, row.scenario]))(
    "%s spec is up to date with the sheet",
    (id, name) => {
      const content = readFileSync(resolve(dir, `${id}.cy.ts`), "utf8");
      expect(content, hint).toBe(scenarioSpecSource(id, name));
    },
  );

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
