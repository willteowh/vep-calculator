// Stay-length rules enforced by the calculator form.
describe("Stay validation", () => {
  const start = (entry: string) => {
    // Freeze "now" at the entry so the picker's minimum-date rule never rejects the input.
    cy.clock(new Date(entry).getTime(), ["Date"]);
    cy.visit("/");
    cy.selectOption("vehicle-category", "cars");
    cy.selectOption("has-iu", "yes");
    cy.seedDateTime("entry-datetime");
    cy.setDateTime("entry-datetime", entry);
    cy.seedDateTime("depart-datetime");
  };
  const checkpoints = () => {
    cy.selectOption("entry-checkpoint", "woodlands");
    cy.selectOption("depart-checkpoint", "woodlands");
  };

  it("does not let the departure go before the entry", () => {
    start("2027-01-05T10:00");
    cy.get('[data-testid="depart-datetime"] [aria-label="Day"]')
      .click()
      .type("{downarrow}");
    cy.get('[data-testid="depart-datetime"] [aria-label="Day"]').should(
      "have.text",
      "05",
    );
  });

  it("accepts a stay of exactly 90 days", () => {
    start("2026-01-01T00:00");
    cy.setDateTime("depart-datetime", "2026-04-01T00:00");
    checkpoints();
    cy.get('[data-testid="calculate-button"]').click();
    cy.get('[data-testid="grand-total"]', { timeout: 5000 }).should("exist");
  });

  it("rejects a stay longer than 90 days", () => {
    start("2026-01-01T00:00");
    cy.setDateTime("depart-datetime", "2026-04-01T00:01");
    checkpoints();
    cy.get('[data-testid="calculate-button"]').click();
    cy.contains("Stay duration cannot exceed 90 days.", {
      timeout: 5000,
    }).should("be.visible");
    cy.get('[data-testid="grand-total"]').should("not.exist");
  });
});
