export interface TestCase {
  id: number;
  label: string;
  desc: string;
  params: {
    vehicleCategory: string;
    hasIU: string;
    erpDays: string;
    entryDt: Date;
    departureDt: Date;
    entryCheckpoint: string;
    departCheckpoint: string;
  };
  expectedTotal: number;
  note: string;
}

export const TEST_CASES: TestCase[] = [
  {
    id: 1,
    label: "Car · Pre-2027 · 55-day stay · Woodlands both ways (with IU)",
    desc: "Entry 07 Mar 2026 22:16, depart 30 Apr 2026 22:15. Matches sample from requirements.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "2",
      entryDt: new Date("2026-03-07T22:16"),
      departureDt: new Date("2026-04-30T22:15"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 1337.2, // computed from 55-day pre-2027 sample (approx)
    note: "Exit toll $0.80. Many weekends reduce chargeable VEP days. $35/day pre-2027.",
  },
  {
    id: 2,
    label: "Car · Pre-2027 · Evening entry waiver (5pm–2am) · Woodlands",
    desc: "Enter Fri 10 Apr 2026 17:00, exit Sat 11 Apr 01:30. Pre-2027 evening window → VEP free.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2026-04-10T17:00"),
      departureDt: new Date("2026-04-11T01:30"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 7.2,
    note: "VEP = $0. Entry ≥ 5pm + exit ≤ 2am next day → pre-2027 waiver applies.",
  },
  {
    id: 3,
    label: "Car · Post-2027 · Evening entry — NO longer waived",
    desc: "Enter Mon 5 Jan 2027 17:00, exit Tue 6 Jan 2027 01:30. Post-2027: evening exemption removed.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2027-01-05T17:00"),
      departureDt: new Date("2027-01-06T01:30"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 107.2,
    note: "VEP = $50 × 2 days (Mon + Tue, both weekdays) at new $50/day rate.",
  },
  {
    id: 4,
    label: "Car · Post-2027 · Weekend stays still free",
    desc: "Enter Sat 2 Jan 2027 10:00, exit Sun 3 Jan 2027 20:00. Weekends still free post-2027.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2027-01-02T10:00"),
      departureDt: new Date("2027-01-03T20:00"),
      entryCheckpoint: "tuas",
      departCheckpoint: "tuas",
    },
    expectedTotal: 10.6,
    note: "VEP = $0 (Sat + Sun). Tuas toll: $2.10 entry + $2.10 exit = $4.20.",
  },
  {
    id: 5,
    label: "Car · Straddles 2027 boundary · Woodlands · No IU",
    desc: "Enter 28 Dec 2026, depart 5 Jan 2027. Pre-2027 days at $35, post-2027 at $50. ERP splits too.",
    params: {
      vehicleCategory: "cars",
      hasIU: "no",
      erpDays: "4",
      entryDt: new Date("2026-12-28T09:00"),
      departureDt: new Date("2027-01-05T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 277.2, // computed from boundary straddle expense
    note: "VEP split: pre days × $35 + post days × $50. ERP: $5/day (pre) and $10/day (post) no IU.",
  },
  {
    id: 6,
    label: "Motorcycle · Post-2027 · 3 weekdays · Woodlands · No OBU",
    desc: "Enter Mon 4 Jan 2027, depart Wed 6 Jan 2027. New $7/day VEP, $3/day flat ERP without OBU.",
    params: {
      vehicleCategory: "motorcycles",
      hasIU: "no",
      erpDays: "3",
      entryDt: new Date("2027-01-04T08:00"),
      departureDt: new Date("2027-01-06T18:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 30,
    note: "VEP = $7 × 3 days = $21. ERP = $3 × 3 days = $9. No toll at Woodlands for motorcycles.",
  },
  {
    id: 7,
    label: "Car · Pre-2027 · School holiday noon entry waiver",
    desc: "Enter Mon 15 Jun 2026 12:00, exit Tue 16 Jun 2026 01:00. School hol noon waiver applies.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2026-06-15T12:00"),
      departureDt: new Date("2026-06-16T01:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 7.2,
    note: "VEP = $0. School hol + noon entry + exit ≤ 2am. This waiver is REMOVED in 2027.",
  },
  {
    id: 8,
    label: "Car · Pre-2027 · June weekday stay — school holiday waiver gone",
    desc: "Enter Mon 14 Jun 2027 12:00, exit Tue 15 Jun 2027 01:00. Post-2027: noon waiver removed.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2027-06-14T12:00"),
      departureDt: new Date("2027-06-15T01:00"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 107.2,
    note: "VEP = $50 × 2 weekdays. Noon/school-holiday waiver no longer exists post-2027.",
  },
  {
    id: 9,
    label: "Car · Pre-2027 · Long stay with early exit waiver",
    desc: "Entry 30 Apr 2026 21:20, depart 9 May 2026 01:20. Exit day waived due to early exit.",
    params: {
      vehicleCategory: "cars",
      hasIU: "yes",
      erpDays: "0",
      entryDt: new Date("2026-04-30T21:20"),
      departureDt: new Date("2026-05-09T01:20"),
      entryCheckpoint: "woodlands",
      departCheckpoint: "woodlands",
    },
    expectedTotal: 182.2,
    note: "5 chargeable VEP days × $35 = $175. Exit toll $0.80. RRC $6.40. Total $182.20.",
  },
];
