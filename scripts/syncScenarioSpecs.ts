// Run with: npm run scenarios:sync (writes one Cypress spec per row of the scenario sheet).
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

import { parseCsvRecords } from "../src/utils/csv.ts";
import {
  ALL_SCENARIOS_SPEC,
  SCENARIO_SPEC_DIR,
  allScenariosSpecSource,
  scenarioSpecSource,
} from "./scenarioSpec.ts";

const scenarios = parseCsvRecords(
  readFileSync("docs/fare-scenarios/fare-scenarios.csv", "utf8"),
);
const dir = resolve(SCENARIO_SPEC_DIR);
mkdirSync(dir, { recursive: true });

const wanted = new Set(scenarios.map((row) => `${row.scenario_id}.cy.ts`));
for (const file of readdirSync(dir)) {
  if (!wanted.has(file)) {
    rmSync(resolve(dir, file));
    console.log(`removed ${file}`);
  }
}
for (const row of scenarios) {
  writeFileSync(
    resolve(dir, `${row.scenario_id}.cy.ts`),
    scenarioSpecSource(row.scenario_id, row.scenario),
  );
}
writeFileSync(
  resolve(ALL_SCENARIOS_SPEC),
  allScenariosSpecSource(
    scenarios.map((row) => ({ id: row.scenario_id, name: row.scenario })),
  ),
);
console.log(`wrote ${scenarios.length} scenario specs to ${SCENARIO_SPEC_DIR}`);
