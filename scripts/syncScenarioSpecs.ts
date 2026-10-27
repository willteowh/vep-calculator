// Run with: npm run scenarios:sync (writes one Cypress spec per fare scenario).
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
  scenarioSpecName,
  scenarioSpecSource,
} from "./scenarioSpec.ts";

const scenarios = parseCsvRecords(
  readFileSync("docs/fare-scenarios/fare-scenarios.csv", "utf8"),
);
const dir = resolve(SCENARIO_SPEC_DIR);
mkdirSync(dir, { recursive: true });

const wanted = new Set(
  scenarios.map((_, index) => scenarioSpecName(index + 1)),
);
for (const file of readdirSync(dir)) {
  if (/^(?:S\d{2}|TC\d{2,3})\.cy\.ts$/.test(file) && !wanted.has(file)) {
    rmSync(resolve(dir, file));
    console.log(`removed ${file}`);
  }
}
for (const [index, row] of scenarios.entries()) {
  writeFileSync(
    resolve(dir, scenarioSpecName(index + 1)),
    scenarioSpecSource(row.scenario_id, row.scenario),
  );
}
writeFileSync(
  resolve(ALL_SCENARIOS_SPEC),
  allScenariosSpecSource(
    scenarios.map((row) => ({ id: row.scenario_id, name: row.scenario })),
  ),
);
console.log(
  `wrote ${scenarios.length} fare scenario specs to ${SCENARIO_SPEC_DIR}`,
);
