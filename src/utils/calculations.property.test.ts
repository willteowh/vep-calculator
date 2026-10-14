import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  CUTOFF_2027,
  MAX_STAY_DAYS,
  SG_PUBLIC_HOLIDAYS,
  VEHICLE_TYPES,
} from "@/config/constants";
import {
  calculate,
  countErpDays,
  getStayError,
  isDayVEPFree,
  type CalculateParams,
  type CalculationResult,
} from "./calculations";

const MINUTE = 60_000;
const DAY_MINUTES = 24 * 60;
const MAX_STAY_MINUTES = MAX_STAY_DAYS * DAY_MINUTES;
// Entry dates across the two years the rules cover.
const MAX_ENTRY_OFFSET = 730 * DAY_MINUTES;

const at = (minutesFrom2026: number) =>
  new Date(2026, 0, 1, 0, minutesFrom2026);

const vehicle = fc.constantFrom(...Object.values(VEHICLE_TYPES));
const checkpoint = fc.constantFrom("woodlands", "tuas");
const hasIU = fc.constantFrom("yes", "no" as const);

const stay = fc
  .record({
    vehicleCategory: vehicle,
    hasIU,
    entryCheckpoint: checkpoint,
    departCheckpoint: checkpoint,
    entryMin: fc.integer({ min: 0, max: MAX_ENTRY_OFFSET }),
    stayMin: fc.integer({ min: 0, max: MAX_STAY_MINUTES }),
  })
  .map(({ entryMin, stayMin, ...rest }): CalculateParams => {
    const entryDt = at(entryMin);
    return {
      ...rest,
      entryDt,
      departureDt: new Date(entryDt.getTime() + stayMin * MINUTE),
    };
  });

const ok = (params: CalculateParams): CalculationResult => {
  const result = calculate(params);
  if ("error" in result) throw new Error(`unexpected error: ${result.error}`);
  return result;
};

// Deliberately independent of dateUtils so a bug there cannot hide itself.
const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const holidays = new Set<string>(SG_PUBLIC_HOLIDAYS.map((h) => h.date));
const isOffDay = (d: Date) =>
  d.getDay() === 0 || d.getDay() === 6 || holidays.has(iso(d));
const sameDay = (a: Date, b: Date) => iso(a) === iso(b);

const calendarDays = (entry: Date, departure: Date): Date[] => {
  const days: Date[] = [];
  const day = startOfDay(entry);
  const last = startOfDay(departure);
  while (day <= last) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }
  return days;
};

describe("calculate() invariants", () => {
  it("adds up: every total equals the sum of its parts", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const r = ok(params);
        expect(r.vepFees).toBe(r.vepFeePre + r.vepFeePost);
        expect(r.tollTotal).toBeCloseTo(r.entryToll + r.exitToll, 2);
        expect(r.subtotal).toBeCloseTo(r.tollTotal + r.vepFees, 2);
        expect(r.grandTotal).toBeCloseTo(
          r.subtotal + r.rrc + r.psvpFee + r.erpCharge,
          2,
        );
      }),
    );
  });

  it("never charges a negative amount and keeps money to whole cents", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const r = ok(params);
        for (const amount of [
          r.tollTotal,
          r.vepFees,
          r.rrc,
          r.psvpFee,
          r.erpCharge,
          r.subtotal,
          r.grandTotal,
        ]) {
          expect(amount).toBeGreaterThanOrEqual(0);
          expect(Math.round(amount * 100) / 100).toBe(amount);
        }
      }),
    );
  });

  it("splits chargeable days into pre-2027 and from-2027 without losing any", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const r = ok(params);
        expect(r.preDays + r.postDays).toBe(r.totalChargeable);
        expect(r.totalChargeable).toBeLessThanOrEqual(
          calendarDays(params.entryDt, params.departureDt).length,
        );
        if (params.departureDt < CUTOFF_2027) expect(r.postDays).toBe(0);
        if (startOfDay(params.entryDt) >= CUTOFF_2027)
          expect(r.preDays).toBe(0);
      }),
    );
  });

  it("never charges a weekend or public holiday", () => {
    fc.assert(
      fc.property(stay, (params) => {
        for (const day of calendarDays(params.entryDt, params.departureDt)) {
          if (isOffDay(day)) {
            expect(isDayVEPFree(day, params.entryDt, params.departureDt)).toBe(
              true,
            );
          }
        }
      }),
    );
  });

  it("splits every calendar day into ERP days or weekend/holiday days", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const days = calendarDays(params.entryDt, params.departureDt);
        const offDays = days.filter(isOffDay).length;
        const erp = countErpDays(params.entryDt, params.departureDt);
        expect(erp.pre + erp.post + offDays).toBe(days.length);
      }),
    );
  });

  it("only charges VEP on days when ERP operates", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const r = ok(params);
        expect(r.totalChargeable).toBeLessThanOrEqual(
          r.erpDaysPre + r.erpDaysPost,
        );
      }),
    );
  });

  it("from 2027 every ERP day is a charged day (no waivers)", () => {
    fc.assert(
      fc.property(
        stay.filter((p) => startOfDay(p.entryDt) >= CUTOFF_2027),
        (params) => {
          const r = ok(params);
          expect(r.totalChargeable).toBe(r.erpDaysPre + r.erpDaysPost);
        },
      ),
    );
  });

  it("never lowers the fare when the departure moves later", () => {
    const extended = fc
      .tuple(stay, fc.integer({ min: 0, max: MAX_STAY_MINUTES }))
      .map(([params, extra]): [CalculateParams, CalculateParams] => {
        const stayMin =
          (params.departureDt.getTime() - params.entryDt.getTime()) / MINUTE;
        const later = Math.min(stayMin + extra, MAX_STAY_MINUTES);
        return [
          params,
          {
            ...params,
            departureDt: new Date(params.entryDt.getTime() + later * MINUTE),
          },
        ];
      });

    fc.assert(
      fc.property(extended, ([shorter, longer]) => {
        const a = ok(shorter);
        const b = ok(longer);
        expect(b.totalChargeable).toBeGreaterThanOrEqual(a.totalChargeable);
        expect(b.erpDaysPre + b.erpDaysPost).toBeGreaterThanOrEqual(
          a.erpDaysPre + a.erpDaysPost,
        );
        expect(b.grandTotal).toBeGreaterThanOrEqual(a.grandTotal);
      }),
    );
  });

  it("charges every ordinary weekday strictly between entry and departure", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const days = calendarDays(params.entryDt, params.departureDt);
        for (const day of days.slice(1, -1)) {
          if (!isOffDay(day)) {
            expect(isDayVEPFree(day, params.entryDt, params.departureDt)).toBe(
              false,
            );
          }
        }
      }),
    );
  });

  it("charges an ordinary departure day when leaving at or after 02:00", () => {
    fc.assert(
      fc.property(
        stay.filter(
          (p) =>
            !sameDay(p.entryDt, p.departureDt) &&
            !isOffDay(p.departureDt) &&
            p.departureDt.getHours() >= 2,
        ),
        (params) => {
          expect(
            isDayVEPFree(
              startOfDay(params.departureDt),
              params.entryDt,
              params.departureDt,
            ),
          ).toBe(false);
        },
      ),
    );
  });

  it("waives an ordinary entry day for entries from 17:00 before 2027", () => {
    fc.assert(
      fc.property(
        stay.filter(
          (p) =>
            p.entryDt < CUTOFF_2027 &&
            !isOffDay(p.entryDt) &&
            p.entryDt.getHours() >= 17,
        ),
        (params) => {
          expect(
            isDayVEPFree(
              startOfDay(params.entryDt),
              params.entryDt,
              params.departureDt,
            ),
          ).toBe(true);
        },
      ),
    );
  });

  it("charges ERP only without an IU, RRC only for cars, PSVP only for taxis from 2027", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const r = ok(params);
        if (params.hasIU === "yes") expect(r.erpCharge).toBe(0);
        if (params.vehicleCategory !== "cars") expect(r.rrc).toBe(0);
        if (
          params.vehicleCategory !== "taxis" ||
          params.entryDt < CUTOFF_2027
        ) {
          expect(r.psvpFee).toBe(0);
        }
        if (
          params.vehicleCategory !== "cars" &&
          params.vehicleCategory !== "motorcycles"
        ) {
          expect(r.vepFees).toBe(0);
        }
      }),
    );
  });

  it("is pure: same input, same result, and the input dates are untouched", () => {
    fc.assert(
      fc.property(stay, (params) => {
        const entry = params.entryDt.getTime();
        const departure = params.departureDt.getTime();
        expect(calculate(params)).toEqual(calculate(params));
        expect(params.entryDt.getTime()).toBe(entry);
        expect(params.departureDt.getTime()).toBe(departure);
      }),
    );
  });
});

describe("stay validation invariants", () => {
  it("rejects exactly the stays that end before they start or exceed the maximum", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_ENTRY_OFFSET }),
        fc.integer({
          min: -3 * DAY_MINUTES,
          max: MAX_STAY_MINUTES + 3 * DAY_MINUTES,
        }),
        stay,
        (entryMin, stayMin, base) => {
          const entryDt = at(entryMin);
          const departureDt = new Date(entryDt.getTime() + stayMin * MINUTE);
          const invalid = stayMin < 0 || stayMin > MAX_STAY_MINUTES;
          expect(getStayError(entryDt, departureDt) !== null).toBe(invalid);
          expect("error" in calculate({ ...base, entryDt, departureDt })).toBe(
            invalid,
          );
        },
      ),
    );
  });
});
