import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: false,
    // One retry in headless runs absorbs timing noise; failures that pass on retry are still reported.
    retries: { runMode: 1, openMode: 0 },
  },
});
