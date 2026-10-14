export const SCENARIO_SPEC_DIR = "cypress/e2e/scenarios";
export const ALL_SCENARIOS_SPEC = "cypress/e2e/all-scenarios.cy.ts";

export function scenarioSpecSource(id: string, name: string): string {
  return `// Generated from docs/fare-scenarios/fare-scenarios.csv by \`npm run scenarios:sync\`. Do not edit.
import { runFareScenario } from "../../support/fareScenario";

runFareScenario(${JSON.stringify(id)}, ${JSON.stringify(name)});
`;
}

export function allScenariosSpecSource(
  scenarios: { id: string; name: string }[],
): string {
  const calls = scenarios
    .map(
      ({ id, name }) =>
        `runFareScenario(${JSON.stringify(id)}, ${JSON.stringify(name)});`,
    )
    .join("\n");
  return `// Generated from docs/fare-scenarios/fare-scenarios.csv by \`npm run scenarios:sync\`. Do not edit.
// One-click "run everything" for the Cypress UI; the CLI scripts skip it to avoid running scenarios twice.
import { runFareScenario } from "../support/fareScenario";

${calls}
`;
}
