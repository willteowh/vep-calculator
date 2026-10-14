import { readFileSync } from "fs";
import { resolve } from "path";

import { isHasIU, isVehicleCategory } from "../../types/vep";
import type { CalculateParams } from "../calculations";
import { parseCsvRecords } from "../csv";

/**
 * Hand-derived fare scenarios live in docs/fare-scenarios/*.csv so business users can review
 * them in a spreadsheet. Expected values must come from the rules, never from calculator output.
 */
const DIR = resolve(process.cwd(), "docs/fare-scenarios");

export interface LedgerDay {
  date: string;
  vep: "charged" | "free";
  reason: string;
  /** Whether ERP operates on this day (not a weekend or public holiday). */
  erp: boolean;
}

export interface FareScenario {
  id: string;
  name: string;
  params: CalculateParams;
  days: LedgerDay[];
  expected: {
    tollTotal: number;
    vepDaysPre: number;
    vepDaysPost: number;
    vepFees: number;
    rrc: number;
    psvpFee: number;
    /** Blank in the sheet for vehicles with an IU. */
    erpDaysPre?: number;
    erpDaysPost?: number;
    erpCharge: number;
    subtotal: number;
    grandTotal: number;
  };
  derivation: string;
}

const read = (file: string) =>
  parseCsvRecords(readFileSync(resolve(DIR, file), "utf8"));

const num = (row: Record<string, string>, column: string): number => {
  const value = Number(row[column]);
  if (row[column] === "" || !Number.isFinite(value)) {
    throw new Error(`${row.scenario_id}: ${column} must be a number.`);
  }
  return value;
};

const optionalNum = (row: Record<string, string>, column: string) =>
  row[column] === "" ? undefined : num(row, column);

const dateTime = (row: Record<string, string>, column: string): Date => {
  const value = new Date(row[column].replace(" ", "T"));
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${row.scenario_id}: ${column} is not a valid date-time.`);
  }
  return value;
};

export function loadFareScenarios(): FareScenario[] {
  const days = read("fare-scenario-days.csv");

  return read("fare-scenarios.csv").map((row) => {
    const { vehicle, has_iu: hasIU } = row;
    if (!isVehicleCategory(vehicle) || !isHasIU(hasIU)) {
      throw new Error(`${row.scenario_id}: invalid vehicle or has_iu.`);
    }

    const ledger = days
      .filter((day) => day.scenario_id === row.scenario_id)
      .map((day): LedgerDay => {
        if (day.vep_status !== "charged" && day.vep_status !== "free") {
          throw new Error(
            `${row.scenario_id} ${day.date}: invalid vep_status.`,
          );
        }
        return {
          date: day.date,
          vep: day.vep_status,
          reason: day.reason,
          erp: day.erp_operational.toLowerCase() === "yes",
        };
      });

    return {
      id: row.scenario_id,
      name: row.scenario,
      params: {
        vehicleCategory: vehicle,
        hasIU,
        entryDt: dateTime(row, "entry_datetime"),
        departureDt: dateTime(row, "departure_datetime"),
        entryCheckpoint: row.entry_checkpoint,
        departCheckpoint: row.departure_checkpoint,
      },
      days: ledger,
      expected: {
        tollTotal: num(row, "expected_toll_total"),
        vepDaysPre: num(row, "expected_vep_days_pre_2027"),
        vepDaysPost: num(row, "expected_vep_days_from_2027"),
        vepFees: num(row, "expected_vep_fees"),
        rrc: num(row, "expected_rrc"),
        psvpFee: num(row, "expected_psvp"),
        erpDaysPre: optionalNum(row, "expected_erp_days_pre_2027"),
        erpDaysPost: optionalNum(row, "expected_erp_days_from_2027"),
        erpCharge: num(row, "expected_erp_charge"),
        subtotal: num(row, "expected_subtotal_toll_plus_vep"),
        grandTotal: num(row, "expected_grand_total"),
      },
      derivation: row.derivation,
    };
  });
}
