import { parseCsvRecords } from "../../src/utils/csv";

const SCENARIOS_CSV = "docs/fare-scenarios/fare-scenarios.csv";
const CUTOFF_2027 = new Date("2027-01-01T00:00");

const money = (amount: number) =>
  amount.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const text = (testId: string) => cy.get(`[data-testid="${testId}"]`);
const absent = (testId: string) =>
  cy.get(`[data-testid="${testId}"]`).should("not.exist");

/**
 * Drives the real calculator with one row of the hand-derived scenario sheet and checks every
 * line of the breakdown on screen. A screenshot of the form plus result is kept as evidence.
 */
export function runFareScenario(id: string, name: string) {
  describe(`${id}: ${name}`, () => {
    it("shows the hand-derived fare breakdown", () => {
      cy.readFile(SCENARIOS_CSV).then((csv: string) => {
        const row = parseCsvRecords(csv).find((r) => r.scenario_id === id);
        if (!row) throw new Error(`${id} is not in ${SCENARIOS_CSV}`);

        const num = (column: string) => Number(row[column]);
        const entry = new Date(row.entry_datetime);
        const departure = new Date(row.departure_datetime);
        const noIU = row.has_iu === "no";

        // Freeze "now" at the entry so the picker's minimum-date rule never rejects the input.
        cy.clock(entry.getTime(), ["Date"]);
        cy.visit("/");
        cy.selectOption("vehicle-category", row.vehicle);
        if (row.vehicle !== "taxis") cy.selectOption("has-iu", row.has_iu);
        cy.seedDateTime("entry-datetime");
        cy.setDateTime("entry-datetime", row.entry_datetime);
        cy.seedDateTime("depart-datetime");
        cy.setDateTime("depart-datetime", row.departure_datetime);
        cy.selectOption("entry-checkpoint", row.entry_checkpoint);
        cy.selectOption("depart-checkpoint", row.departure_checkpoint);
        cy.get('[data-testid="calculate-button"]').click();

        cy.get('[data-testid="result-table"]', { timeout: 5000 }).should(
          "be.visible",
        );

        // Tolls and VEP
        text("charge-toll").should(
          "have.text",
          money(num("expected_toll_total")),
        );
        text("charge-vep").should("have.text", money(num("expected_vep_fees")));
        const vepFees = num("expected_vep_fees");
        for (const [key, column] of [
          ["pre", "expected_vep_days_pre_2027"],
          ["post", "expected_vep_days_from_2027"],
        ] as const) {
          const days = num(column);
          if (vepFees > 0 && days > 0) {
            text(`charge-vep-${key}`).should("contain.text", `${days} day(s)`);
          } else {
            absent(`charge-vep-${key}`);
          }
        }
        text("charge-subtotal").should(
          "have.text",
          money(num("expected_subtotal_toll_plus_vep")),
        );

        // RRC and PSVP rows only exist when they apply
        const rrc = num("expected_rrc");
        if (rrc > 0) text("charge-rrc").should("have.text", money(rrc));
        else absent("charge-rrc");
        const psvp = num("expected_psvp");
        if (psvp > 0) text("charge-psvp").should("have.text", money(psvp));
        else absent("charge-psvp");

        // The page shows an ERP amount for flat-rate vehicles, and a pointer to published rates for IU vehicles.
        const erpCharge = num("expected_erp_charge");
        const flatRateShown =
          noIU || (row.vehicle === "motorcycles" && departure < CUTOFF_2027);
        if (flatRateShown) {
          text("charge-erp").should("have.text", money(erpCharge));
        } else {
          text("charge-erp").should("contain.text", "Normal ERP charges apply");
        }
        for (const [key, column] of [
          ["pre", "expected_erp_days_pre_2027"],
          ["post", "expected_erp_days_from_2027"],
        ] as const) {
          const days = Number(row[column] || 0);
          if (flatRateShown && erpCharge > 0 && days > 0) {
            text(`charge-erp-${key}`).should("contain.text", `${days} day(s)`);
          } else {
            absent(`charge-erp-${key}`);
          }
        }

        text("grand-total").should(
          "have.text",
          money(num("expected_grand_total")),
        );

        cy.log(`Derivation: ${row.derivation}`);
        // The long legal disclaimer adds nothing to the evidence image.
        cy.get('[data-testid="disclaimer"]').invoke("hide");
        cy.get('[data-testid="calculator-card"]').screenshot(`${id} ${name}`, {
          overwrite: true,
        });
      });
    });
  });
}
