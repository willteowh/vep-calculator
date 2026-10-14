import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    coverage: {
      provider: "v8",
      // Business logic only; DOM helpers and style objects are exercised by Cypress.
      include: [
        "src/utils/{calculations,csv,dateUtils,formRules,formValidation,quickFill,testCaseCsv,testCaseEvaluation}.ts",
        "src/types/**/*.ts",
      ],
      thresholds: { statements: 95, branches: 90, functions: 95, lines: 95 },
    },
  },
});
