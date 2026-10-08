declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required by Cypress typings
  namespace Cypress {
    interface Chainable {
      /** Pick an option from an MUI Select identified by data-testid. */
      selectOption(testId: string, value: string): Chainable<void>;
      /** Open then close a DateTimePicker; the app seeds an empty field with "now". */
      seedDateTime(testId: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("selectOption", (testId: string, value: string) => {
  cy.get(`[data-testid="${testId}"] [role="combobox"]`).click();
  cy.get(`[role="listbox"] [data-value="${value}"]`).click();
});

Cypress.Commands.add("seedDateTime", (testId: string) => {
  cy.get(`[data-testid="${testId}"] button`).click();
  cy.get("body").type("{esc}");
});

export {};
