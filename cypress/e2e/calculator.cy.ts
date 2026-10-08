describe("Fee Calculator tab", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("shows required errors when submitting an empty form", () => {
    cy.get('[data-testid="calculate-button"]').click();
    cy.contains("Required").should("be.visible");
    cy.get('[data-testid="grand-total"]').should("not.exist");
  });

  it("calculates a pre-2027 car evening entry (matches TEST_CASES #2 total)", () => {
    // Freeze "now" at Fri 10 Apr 2026 17:00 so the picker seeds a known time.
    cy.clock(new Date(2026, 3, 10, 17, 0).getTime(), ["Date"]);
    cy.visit("/");

    cy.selectOption("vehicle-category", "cars");
    cy.selectOption("has-iu", "yes");
    cy.seedDateTime("entry-datetime");
    cy.seedDateTime("depart-datetime");
    cy.selectOption("entry-checkpoint", "woodlands");
    cy.selectOption("depart-checkpoint", "woodlands");
    cy.get('[data-testid="calculate-button"]').click();

    // Woodlands exit toll 0.80 + RRC 6.40; evening entry day is VEP-free.
    cy.get('[data-testid="grand-total"]', { timeout: 5000 }).should(
      "contain",
      "7.20",
    );
  });

  it("clears the form", () => {
    cy.selectOption("vehicle-category", "cars");
    cy.get('[data-testid="clear-button"]').click();
    cy.get('[data-testid="vehicle-category"]').should("not.contain", "Cars");
  });

  it("hides the IU question for taxis", () => {
    cy.selectOption("vehicle-category", "taxis");
    cy.get('[data-testid="has-iu"]').should("not.exist");
  });

  it("fills the form with Quick Fill and calculates", () => {
    cy.get('[data-testid="quick-fill-button"]').click();
    cy.get('[data-testid="calculate-button"]').click();
    cy.get('[data-testid="grand-total"]', { timeout: 5000 }).should("exist");
  });
});
