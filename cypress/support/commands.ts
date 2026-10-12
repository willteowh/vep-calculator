declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- required by Cypress typings
  namespace Cypress {
    interface Chainable {
      /** Pick an option from an MUI Select identified by data-testid. */
      selectOption(testId: string, value: string): Chainable<void>;
      /** Open then close a DateTimePicker; the app seeds an empty field with "now". */
      seedDateTime(testId: string): Chainable<void>;
      /** Enter a local ISO date-time into the MUI picker's segmented sections. */
      setDateTime(testId: string, value: string): Chainable<void>;
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

Cypress.Commands.add("setDateTime", (testId: string, value: string) => {
  const date = new Date(value);
  const sections: [string, number][] = [
    ["Year", date.getFullYear()],
    ["Month", date.getMonth() + 1],
    ["Day", date.getDate()],
    ["Hours", date.getHours()],
    ["Minutes", date.getMinutes()],
  ];

  sections.forEach(([label, targetValue]) => {
    const section = `[data-testid="${testId}"] [role="spinbutton"][aria-label="${label}"]`;
    cy.get(section).then(($section) => {
      const currentValue = Number($section.attr("aria-valuenow"));
      let difference = targetValue - currentValue;
      const cycle =
        label === "Month"
          ? 12
          : label === "Hours"
            ? 24
            : label === "Minutes"
              ? 60
              : 0;
      if (cycle) {
        const increment = (targetValue - currentValue + cycle) % cycle;
        const decrement = (currentValue - targetValue + cycle) % cycle;
        difference = increment <= decrement ? increment : -decrement;
      }
      if (difference === 0) return;

      const key = difference > 0 ? "{uparrow}" : "{downarrow}";
      cy.wrap($section)
        .click()
        .type(key.repeat(Math.abs(difference)));
    });
    cy.get(section).should("have.attr", "aria-valuenow", String(targetValue));
  });
});

export {};
