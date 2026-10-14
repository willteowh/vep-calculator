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
