import type { CalculateParams } from "../calculations";

/**
 * Hand-derived fare scenarios. Expected values come from the published rules and
 * rates (see README), worked out day by day, NOT from the calculator's output.
 * Changes here need business sign-off; never regenerate them from code.
 *
 * Published rates used (per day unless noted):
 *   VEP  pre-2027: car 35, motorcycle 4        from 2027: car 50, motorcycle 7
 *   ERP (no IU) pre-2027: car 5, others 0      from 2027: car 10, motorcycle 3, van/HGV/bus 10, taxi 0
 *   Tolls (entry / exit): car W 0 / 0.80, T 2.10 / 2.10; van W 0 / 1.50, T 5.60 / 5.60;
 *     HGV W 0 / 2.00, T 11.30 / 11.30; taxi W 0 / 0.40, T 1.60 / 1.60;
 *     bus W 0 / 0.60, T 2.50 / 2.50; motorcycle 0
 *   RRC 6.40 per entry (cars). PSVP 15 per taxi entry from 1 Jan 2027.
 *   Free VEP days: Sat, Sun, public holidays; before 2027 also entry day from 17:00,
 *   school-holiday entry day from 12:00, and departure day before 02:00.
 *   ERP days: every calendar day except Sat, Sun and public holidays.
 */

export interface LedgerDay {
  date: string;
  vep: "charged" | "free";
  /** Why a VEP day is free. */
  reason?: string;
  /** Whether ERP operates on this day (not a weekend or public holiday). */
  erp: boolean;
}

export interface FareScenario {
  name: string;
  params: CalculateParams;
  days: LedgerDay[];
  expected: {
    tollTotal: number;
    /** Days charged before / from 2027 (counted for every vehicle, even without a VEP rate). */
    vepDaysPre: number;
    vepDaysPost: number;
    vepFees: number;
    rrc: number;
    psvpFee: number;
    /** Only asserted for vehicles without an IU. */
    erpDaysPre?: number;
    erpDaysPost?: number;
    erpCharge: number;
    /** Tolls + VEP. */
    subtotal: number;
    grandTotal: number;
  };
  derivation: string;
}

const charged = (date: string): LedgerDay => ({
  date,
  vep: "charged",
  erp: true,
});
const free = (date: string, reason: string): LedgerDay => ({
  date,
  vep: "free",
  reason,
  erp: reason !== "weekend" && reason !== "public holiday",
});

const car = (
  entry: string,
  departure: string,
  hasIU: "yes" | "no" = "yes",
  checkpoints: [string, string] = ["woodlands", "woodlands"],
): CalculateParams => ({
  vehicleCategory: "cars",
  hasIU,
  entryDt: new Date(entry),
  departureDt: new Date(departure),
  entryCheckpoint: checkpoints[0],
  departCheckpoint: checkpoints[1],
});

export const FARE_SCENARIOS: FareScenario[] = [
  {
    name: "car, two weekdays pre-2027",
    params: car("2026-04-13T10:00", "2026-04-14T18:00"),
    days: [charged("2026-04-13"), charged("2026-04-14")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 2,
      vepDaysPost: 0,
      vepFees: 70,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 70.8,
      grandTotal: 77.2,
    },
    derivation: "2 x 35 = 70; toll 0.80; RRC 6.40 => 77.20",
  },
  {
    name: "car, Friday entry at 17:00 is waived (evening entry)",
    params: car("2026-04-10T17:00", "2026-04-11T01:30"),
    days: [free("2026-04-10", "evening entry"), free("2026-04-11", "weekend")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 0.8,
      grandTotal: 7.2,
    },
    derivation:
      "Fri free (entry >= 17:00), Sat weekend; toll 0.80 + RRC 6.40 => 7.20",
  },
  {
    name: "car, Friday entry at 16:59 is charged",
    params: car("2026-04-10T16:59", "2026-04-11T01:30"),
    days: [charged("2026-04-10"), free("2026-04-11", "weekend")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 35,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 35.8,
      grandTotal: 42.2,
    },
    derivation: "Fri 35; Sat weekend; toll 0.80 + RRC 6.40 => 42.20",
  },
  {
    name: "car, school-holiday weekday entry at 12:00 is waived",
    params: car("2026-06-15T12:00", "2026-06-16T01:00"),
    days: [
      free("2026-06-15", "school holiday noon entry"),
      free("2026-06-16", "exit before 02:00"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 0.8,
      grandTotal: 7.2,
    },
    derivation:
      "Mon free (school holiday, entry >= 12:00), Tue free (exit < 02:00) => 7.20",
  },
  {
    name: "car, school-holiday weekday entry at 11:59 is charged",
    params: car("2026-06-15T11:59", "2026-06-16T01:00"),
    days: [charged("2026-06-15"), free("2026-06-16", "exit before 02:00")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 35,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 35.8,
      grandTotal: 42.2,
    },
    derivation:
      "Mon 35; Tue free (exit < 02:00); toll 0.80 + RRC 6.40 => 42.20",
  },
  {
    name: "car, exit at 01:59 waives the departure day",
    params: car("2026-04-14T18:00", "2026-04-15T01:59"),
    days: [
      free("2026-04-14", "evening entry"),
      free("2026-04-15", "exit before 02:00"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 0.8,
      grandTotal: 7.2,
    },
    derivation: "Tue free (entry >= 17:00), Wed free (exit < 02:00) => 7.20",
  },
  {
    name: "car, exit at 02:00 charges the departure day",
    params: car("2026-04-14T18:00", "2026-04-15T02:00"),
    days: [free("2026-04-14", "evening entry"), charged("2026-04-15")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 35,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 35.8,
      grandTotal: 42.2,
    },
    derivation:
      "Tue free; Wed 35 (exit not before 02:00); toll 0.80 + RRC 6.40 => 42.20",
  },
  {
    name: "car, same-minute stay on a weekday",
    params: car("2026-04-14T10:00", "2026-04-14T10:00"),
    days: [charged("2026-04-14")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 35,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 35.8,
      grandTotal: 42.2,
    },
    derivation: "1 x 35 + 0.80 + 6.40 => 42.20",
  },
  {
    name: "car, two weekdays from 2027",
    params: car("2027-01-04T10:00", "2027-01-05T18:00"),
    days: [charged("2027-01-04"), charged("2027-01-05")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 2,
      vepFees: 100,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 100.8,
      grandTotal: 107.2,
    },
    derivation: "2 x 50 = 100; toll 0.80; RRC 6.40 => 107.20",
  },
  {
    name: "car, 2027 has no evening-entry or early-exit waiver",
    params: car("2027-01-05T17:00", "2027-01-06T01:30"),
    days: [charged("2027-01-05"), charged("2027-01-06")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 2,
      vepFees: 100,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 100.8,
      grandTotal: 107.2,
    },
    derivation: "No waivers from 2027: 2 x 50 + 0.80 + 6.40 => 107.20",
  },
  {
    name: "car, Tuas both ways over a weekend",
    params: car("2027-01-02T10:00", "2027-01-03T20:00", "yes", [
      "tuas",
      "tuas",
    ]),
    days: [free("2027-01-02", "weekend"), free("2027-01-03", "weekend")],
    expected: {
      tollTotal: 4.2,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 4.2,
      grandTotal: 10.6,
    },
    derivation: "Weekend free; toll 2.10 + 2.10 = 4.20; RRC 6.40 => 10.60",
  },
  {
    name: "car without IU, straddling 1 Jan 2027",
    params: car("2026-12-28T09:00", "2027-01-05T18:00", "no"),
    days: [
      charged("2026-12-28"),
      charged("2026-12-29"),
      charged("2026-12-30"),
      charged("2026-12-31"),
      free("2027-01-01", "public holiday"),
      free("2027-01-02", "weekend"),
      free("2027-01-03", "weekend"),
      charged("2027-01-04"),
      charged("2027-01-05"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 4,
      vepDaysPost: 2,
      vepFees: 240,
      rrc: 6.4,
      psvpFee: 0,
      erpDaysPre: 4,
      erpDaysPost: 2,
      erpCharge: 40,
      subtotal: 240.8,
      grandTotal: 287.2,
    },
    derivation:
      "VEP 4 x 35 + 2 x 50 = 240; ERP 4 x 5 + 2 x 10 = 40; toll 0.80; RRC 6.40 => 287.20",
  },
  {
    name: "car without IU, public holiday and weekend inside the stay",
    params: car("2026-04-30T10:00", "2026-05-04T10:00", "no"),
    days: [
      charged("2026-04-30"),
      free("2026-05-01", "public holiday"),
      free("2026-05-02", "weekend"),
      free("2026-05-03", "weekend"),
      charged("2026-05-04"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 2,
      vepDaysPost: 0,
      vepFees: 70,
      rrc: 6.4,
      psvpFee: 0,
      erpDaysPre: 2,
      erpDaysPost: 0,
      erpCharge: 10,
      subtotal: 70.8,
      grandTotal: 87.2,
    },
    derivation: "VEP 2 x 35 = 70; ERP 2 x 5 = 10; toll 0.80; RRC 6.40 => 87.20",
  },
  {
    name: "car without IU, weekend-only stay has no ERP days",
    params: car("2026-04-11T10:00", "2026-04-12T18:00", "no"),
    days: [free("2026-04-11", "weekend"), free("2026-04-12", "weekend")],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpDaysPre: 0,
      erpDaysPost: 0,
      erpCharge: 0,
      subtotal: 0.8,
      grandTotal: 7.2,
    },
    derivation: "Weekend: no VEP, no ERP; toll 0.80 + RRC 6.40 => 7.20",
  },
  {
    name: "car, entry 31 Dec 23:59 to 1 Jan 00:01",
    params: car("2026-12-31T23:59", "2027-01-01T00:01"),
    days: [
      free("2026-12-31", "evening entry"),
      free("2027-01-01", "public holiday"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 0,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 0.8,
      grandTotal: 7.2,
    },
    derivation: "31 Dec free (entry >= 17:00); 1 Jan public holiday => 7.20",
  },
  {
    name: "car, long stay with a holiday and weekends",
    params: car("2026-04-30T21:20", "2026-05-09T01:20"),
    days: [
      free("2026-04-30", "evening entry"),
      free("2026-05-01", "public holiday"),
      free("2026-05-02", "weekend"),
      free("2026-05-03", "weekend"),
      charged("2026-05-04"),
      charged("2026-05-05"),
      charged("2026-05-06"),
      charged("2026-05-07"),
      charged("2026-05-08"),
      free("2026-05-09", "weekend"),
    ],
    expected: {
      tollTotal: 0.8,
      vepDaysPre: 5,
      vepDaysPost: 0,
      vepFees: 175,
      rrc: 6.4,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 175.8,
      grandTotal: 182.2,
    },
    derivation:
      "Charged Mon-Fri 4-8 May = 5 x 35 = 175; toll 0.80; RRC 6.40 => 182.20",
  },
  {
    name: "motorcycle without IU from 2027, three weekdays",
    params: {
      vehicleCategory: "motorcycles",
      hasIU: "no",
      entryDt: new Date("2027-01-04T08:00"),
      departureDt: new Date("2027-01-06T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    days: [charged("2027-01-04"), charged("2027-01-05"), charged("2027-01-06")],
    expected: {
      tollTotal: 0,
      vepDaysPre: 0,
      vepDaysPost: 3,
      vepFees: 21,
      rrc: 0,
      psvpFee: 0,
      erpDaysPre: 0,
      erpDaysPost: 3,
      erpCharge: 9,
      subtotal: 21,
      grandTotal: 30,
    },
    derivation: "VEP 3 x 7 = 21; ERP 3 x 3 = 9; no tolls, no RRC => 30",
  },
  {
    name: "motorcycle with IU before 2027, one weekday",
    params: {
      vehicleCategory: "motorcycles",
      hasIU: "yes",
      entryDt: new Date("2026-04-13T10:00"),
      departureDt: new Date("2026-04-13T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    days: [charged("2026-04-13")],
    expected: {
      tollTotal: 0,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 4,
      rrc: 0,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 4,
      grandTotal: 4,
    },
    derivation: "VEP 1 x 4 = 4; no tolls, no RRC => 4",
  },
  {
    name: "taxi from 2027 pays PSVP and exit toll",
    params: {
      vehicleCategory: "taxis",
      hasIU: "yes",
      entryDt: new Date("2027-01-04T10:00"),
      departureDt: new Date("2027-01-04T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    days: [charged("2027-01-04")],
    expected: {
      tollTotal: 0.4,
      vepDaysPre: 0,
      vepDaysPost: 1,
      vepFees: 0,
      rrc: 0,
      psvpFee: 15,
      erpCharge: 0,
      subtotal: 0.4,
      grandTotal: 15.4,
    },
    derivation: "No VEP for taxis; toll 0.40; PSVP 15 => 15.40",
  },
  {
    name: "taxi before 2027 pays no PSVP",
    params: {
      vehicleCategory: "taxis",
      hasIU: "yes",
      entryDt: new Date("2026-12-30T10:00"),
      departureDt: new Date("2026-12-30T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    days: [charged("2026-12-30")],
    expected: {
      tollTotal: 0.4,
      vepDaysPre: 1,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 0,
      psvpFee: 0,
      erpCharge: 0,
      subtotal: 0.4,
      grandTotal: 0.4,
    },
    derivation: "No VEP, no PSVP before 2027; toll 0.40 => 0.40",
  },
  {
    name: "van without IU from 2027 at Tuas pays ERP",
    params: {
      vehicleCategory: "vans",
      hasIU: "no",
      entryDt: new Date("2027-01-04T08:00"),
      departureDt: new Date("2027-01-04T17:00"),
      entryCheckpoint: "tuas",
      departCheckpoint: "tuas",
    },
    days: [charged("2027-01-04")],
    expected: {
      tollTotal: 11.2,
      vepDaysPre: 0,
      vepDaysPost: 1,
      vepFees: 0,
      rrc: 0,
      psvpFee: 0,
      erpDaysPre: 0,
      erpDaysPost: 1,
      erpCharge: 10,
      subtotal: 11.2,
      grandTotal: 21.2,
    },
    derivation: "Toll 5.60 + 5.60 = 11.20; ERP 1 x 10 => 21.20",
  },
  {
    name: "heavy goods vehicle without IU, Tuas in and Woodlands out",
    params: {
      vehicleCategory: "heavyGoods",
      hasIU: "no",
      entryDt: new Date("2027-01-04T08:00"),
      departureDt: new Date("2027-01-04T17:00"),
      entryCheckpoint: "tuas",
      departCheckpoint: "woodlands",
    },
    days: [charged("2027-01-04")],
    expected: {
      tollTotal: 13.3,
      vepDaysPre: 0,
      vepDaysPost: 1,
      vepFees: 0,
      rrc: 0,
      psvpFee: 0,
      erpDaysPre: 0,
      erpDaysPost: 1,
      erpCharge: 10,
      subtotal: 13.3,
      grandTotal: 23.3,
    },
    derivation: "Toll 11.30 + 2.00 = 13.30; ERP 1 x 10 => 23.30",
  },
  {
    name: "bus without IU before 2027 has no ERP charge",
    params: {
      vehicleCategory: "buses",
      hasIU: "no",
      entryDt: new Date("2026-11-03T09:00"),
      departureDt: new Date("2026-11-04T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "tuas",
    },
    days: [charged("2026-11-03"), charged("2026-11-04")],
    expected: {
      tollTotal: 2.5,
      vepDaysPre: 2,
      vepDaysPost: 0,
      vepFees: 0,
      rrc: 0,
      psvpFee: 0,
      erpDaysPre: 2,
      erpDaysPost: 0,
      erpCharge: 0,
      subtotal: 2.5,
      grandTotal: 2.5,
    },
    derivation: "Toll 0 + 2.50; ERP rate is 0 before 2027 => 2.50",
  },
];
