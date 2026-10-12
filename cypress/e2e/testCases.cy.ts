import { parseTestCasesCsv } from "../../src/utils/testCaseCsv";

describe("Test Cases tab", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get('[data-testid="tab-tests"]').click();
  });

  it("passes every built-in test case", () => {
    cy.get('[data-testid="run-all-tests"]').click();
    cy.get('[data-testid="test-summary"]', { timeout: 10000 })
      .invoke("text")
      .should((text) => {
        const match = text.match(/(\d+)\/(\d+) test cases passed/);
        expect(match, "summary text").to.not.equal(null);
        expect(match![1]).to.equal(match![2]);
      });
  });

  it("re-imports the downloaded sample CSV", () => {
    cy.get('[data-testid="download-sample-csv"]').click();
    cy.readFile("cypress/downloads/vep-test-cases-sample.csv", {
      timeout: 10000,
    }).then((csv) => {
      cy.get('[data-testid="csv-input"]').selectFile(
        {
          contents: Cypress.Buffer.from(csv),
          fileName: "sample.csv",
          mimeType: "text/csv",
        },
        { force: true },
      );
    });
    cy.contains("Loaded").should("be.visible");
  });
});

function localDateTime(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

describe("Calculator fare scenarios", () => {
  const caseIds = Array.from({ length: 28 }, (_, index) => index + 1);

  for (const caseId of caseIds) {
    const testName =
      caseId === 25
        ? `rejects reversed dates from comprehensive CSV case #${caseId}`
        : caseId === 27 || caseId === 28
          ? `rejects unsupported checkpoints from comprehensive CSV case #${caseId}`
          : `calculates comprehensive CSV case #${caseId} in the calculator`;

    it(testName, () => {
      cy.readFile("public/vep-test-cases-comprehensive.csv").then((csv) => {
        const testCase = parseTestCasesCsv(csv).find(({ id }) => id === caseId);
        if (!testCase) throw new Error(`Missing comprehensive case #${caseId}`);

        if (caseId === 27 || caseId === 28) {
          cy.visit("/");
          cy.selectOption("vehicle-category", testCase.params.vehicleCategory);
          cy.get('[data-testid="entry-checkpoint"] [role="combobox"]').click();
          cy.get('[role="listbox"] [data-value="unknown"]').should("not.exist");
          cy.get("body").type("{esc}");
          return;
        }

        cy.clock(testCase.params.entryDt.getTime(), ["Date"]);
        cy.visit("/");
        cy.selectOption("vehicle-category", testCase.params.vehicleCategory);
        if (testCase.params.vehicleCategory !== "taxis") {
          cy.selectOption("has-iu", testCase.params.hasIU);
        }

        cy.seedDateTime("entry-datetime");
        cy.setDateTime("entry-datetime", localDateTime(testCase.params.entryDt));
        cy.seedDateTime("depart-datetime");

        if (caseId === 25) {
          cy.get('[data-testid="depart-datetime"] [aria-label="Day"]')
            .click()
            .type("{downarrow}");
          cy.get('[data-testid="depart-datetime"] [aria-label="Day"]').should(
            "have.text",
            String(testCase.params.entryDt.getDate()).padStart(2, "0"),
          );
          return;
        }

        cy.setDateTime(
          "depart-datetime",
          localDateTime(testCase.params.departureDt),
        );
        cy.selectOption("entry-checkpoint", testCase.params.entryCheckpoint);
        cy.selectOption("depart-checkpoint", testCase.params.departCheckpoint);

        if (testCase.params.hasIU === "no") {
          if (
            testCase.params.entryDt.getFullYear() === 2026 &&
            testCase.params.erpDays2026
          ) {
            cy.get('[data-testid="erp-days-2026"] input')
              .clear()
              .type(testCase.params.erpDays2026);
          }
          if (
            testCase.params.departureDt.getFullYear() === 2027 &&
            testCase.params.erpDays2027
          ) {
            cy.get('[data-testid="erp-days-2027"] input')
              .clear()
              .type(testCase.params.erpDays2027);
          }
        }

        cy.get('[data-testid="calculate-button"]').click();
        if (caseId === 26) {
          cy.contains("Stay duration cannot exceed 250 days.", {
            timeout: 5000,
          }).should("be.visible");
          return;
        }

        const expectedTotal = testCase.expectedTotal.toLocaleString("en-SG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        cy.get('[data-testid="grand-total"]', { timeout: 5000 }).should(
          "contain",
          expectedTotal,
        );
      });
    });
  }
});
