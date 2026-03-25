"use client";
import { useState } from "react";

// ─── Singapore Public Holidays (2025–2027) ────────────────────────────────────
const SG_PUBLIC_HOLIDAYS = new Set([
  // 2025
  "2025-01-01",
  "2025-01-29",
  "2025-01-30",
  "2025-03-31",
  "2025-04-18",
  "2025-05-01",
  "2025-05-12",
  "2025-06-07",
  "2025-08-09",
  "2025-10-20",
  "2025-12-25",
  // 2026
  "2026-01-01",
  "2026-02-17",
  "2026-02-18",
  "2026-03-21",
  "2026-04-03",
  "2026-05-01",
  "2026-05-27",
  "2026-06-01",
  "2026-08-09",
  "2026-08-10",
  "2026-11-08",
  "2026-11-09",
  "2026-12-25",
  // 2027 (approximate – confirmed where known)
  "2027-01-01",
  "2027-01-27",
  "2027-01-28",
  "2027-03-20",
  "2027-03-26",
  "2027-05-01",
  "2027-05-20",
  "2027-05-16",
  "2027-08-09",
  "2027-10-09",
  "2027-12-25",
]);

// June & December school holidays (approximate annual ranges)
const SCHOOL_HOLIDAYS = [
  { start: new Date("2025-05-31"), end: new Date("2025-06-29") },
  { start: new Date("2025-11-22"), end: new Date("2025-12-31") },
  { start: new Date("2026-05-30"), end: new Date("2026-06-28") },
  { start: new Date("2026-11-21"), end: new Date("2026-12-31") },
  { start: new Date("2027-05-29"), end: new Date("2027-06-27") },
  { start: new Date("2027-11-20"), end: new Date("2027-12-31") },
];

const CUTOFF_2027 = new Date("2027-01-01T00:00:00");

function dateKey(d) {
  return d.toISOString().slice(0, 10);
}
function isPublicHoliday(d) {
  return SG_PUBLIC_HOLIDAYS.has(dateKey(d));
}
function isWeekend(d) {
  const w = d.getDay();
  return w === 0 || w === 6;
}
function isSchoolHoliday(d) {
  return SCHOOL_HOLIDAYS.some((r) => d >= r.start && d <= r.end);
}
function isPost2027(d) {
  return d >= CUTOFF_2027;
}

// ─── Rate Sets ────────────────────────────────────────────────────────────────
// PRE-2027 rates (current)
const RATES_PRE = {
  cars: { vepPerDay: 35, erpNoIU: 5 },
  motorcycles: { vepPerDay: 4, erpNoIU: 0 },
};
// POST-2027 rates (from 1 Jan 2027)
const RATES_POST = {
  cars: { vepPerDay: 50, erpNoIU: 10 },
  motorcycles: { vepPerDay: 7, erpNoIU: 3 },
};

// Toll charges — unchanged across periods
const TOLLS = {
  cars: {
    entry: { woodlands: 0, tuas: 2.1 },
    exit: { woodlands: 0.8, tuas: 2.1 },
  },
  motorcycles: {
    entry: { woodlands: 0, tuas: 0 },
    exit: { woodlands: 0, tuas: 0 },
  },
};

// RRC — cars only, per entry
const RRC = { cars: 6.4, motorcycles: 0 };

// ─── VEP Day Waiver Rules ─────────────────────────────────────────────────────
// PRE-2027: free on Sat/Sun/PH, evening entry (≥17:00, exit ≤02:00 next day),
//           school-holiday noon entry (≥12:00, exit ≤02:00 next day)
// POST-2027: free on Sat/Sun/PH ONLY — all other exemptions removed
function isDayVEPFree(calDay, entryDt, departureDt) {
  // Weekend or PH — always free in both regimes
  if (isWeekend(calDay) || isPublicHoliday(calDay)) return true;

  // Post-2027: no further exemptions
  if (isPost2027(calDay)) return false;

  // Pre-2027 exemptions below ─────────────────────────────────────
  const entryHour = entryDt.getHours() + entryDt.getMinutes() / 60;
  const deptHour = departureDt.getHours() + departureDt.getMinutes() / 60;
  const entryDate = new Date(
    entryDt.getFullYear(),
    entryDt.getMonth(),
    entryDt.getDate(),
  );
  const deptDate = new Date(
    departureDt.getFullYear(),
    departureDt.getMonth(),
    departureDt.getDate(),
  );
  const diffDays = Math.round((deptDate - entryDate) / 86400000);
  const isSameDay = diffDays === 0;
  const isNextDay = diffDays === 1;
  const deptBy2am = deptHour <= 2;

  // Evening window: entry ≥ 17:00, exit ≤ 02:00 next calendar day (or same day)
  if (entryHour >= 17 && (isSameDay || (isNextDay && deptBy2am))) return true;

  // School-holiday noon window: entry ≥ 12:00, exit ≤ 02:00 next calendar day
  if (
    isSchoolHoliday(calDay) &&
    entryHour >= 12 &&
    (isSameDay || (isNextDay && deptBy2am))
  )
    return true;

  return false;
}

// ─── Count chargeable VEP days ───────────────────────────────────────────────
function countChargeableDays(entryDt, departureDt) {
  const entryDate = new Date(
    entryDt.getFullYear(),
    entryDt.getMonth(),
    entryDt.getDate(),
  );
  const deptDate = new Date(
    departureDt.getFullYear(),
    departureDt.getMonth(),
    departureDt.getDate(),
  );
  const totalCal = Math.round((deptDate - entryDate) / 86400000) + 1;
  let charged = 0;
  for (let i = 0; i < totalCal; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (!isDayVEPFree(d, entryDt, departureDt)) charged++;
  }
  return charged;
}

// ─── Split days across the 2027 boundary ─────────────────────────────────────
// Returns { pre: <chargeable days before 1 Jan 2027>,
//           post: <chargeable days from 1 Jan 2027 onwards> }
function splitChargeableDays(entryDt, departureDt) {
  const entryDate = new Date(
    entryDt.getFullYear(),
    entryDt.getMonth(),
    entryDt.getDate(),
  );
  const deptDate = new Date(
    departureDt.getFullYear(),
    departureDt.getMonth(),
    departureDt.getDate(),
  );
  const totalCal = Math.round((deptDate - entryDate) / 86400000) + 1;
  let pre = 0,
    post = 0;
  for (let i = 0; i < totalCal; i++) {
    const d = new Date(entryDate);
    d.setDate(entryDate.getDate() + i);
    if (!isDayVEPFree(d, entryDt, departureDt)) {
      if (isPost2027(d)) post++;
      else pre++;
    }
  }
  return { pre, post };
}

// ─── Duration of stay (ceiling to nearest day) ───────────────────────────────
function durationDays(entryDt, departureDt) {
  const ms = departureDt - entryDt;
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

// ─── Main calculation ────────────────────────────────────────────────────────
function calculate({
  vehicleCategory,
  hasIU,
  entryDt,
  departureDt,
  entryCheckpoint,
  departCheckpoint,
  erpDays,
}) {
  const isCar = vehicleCategory === "cars";
  const isMoto = vehicleCategory === "motorcycles";
  if (!isCar && !isMoto) {
    return {
      error:
        "This calculator supports Cars and Motorcycles registered in Malaysia only.",
    };
  }

  const entryCP = (entryCheckpoint || "").toLowerCase();
  const deptCP = (departCheckpoint || "").toLowerCase();
  const tolls = TOLLS[vehicleCategory];

  const entryToll = tolls.entry[entryCP] ?? 0;
  const exitToll = tolls.exit[deptCP] ?? 0;
  const tollTotal = entryToll + exitToll;

  // Split chargeable days across rate boundary
  const { pre: preDays, post: postDays } = splitChargeableDays(
    entryDt,
    departureDt,
  );
  const totalChargeable = preDays + postDays;

  const rPre = RATES_PRE[vehicleCategory];
  const rPost = RATES_POST[vehicleCategory];

  const vepFeePre = preDays * rPre.vepPerDay;
  const vepFeePost = postDays * rPost.vepPerDay;
  const vepFees = vepFeePre + vepFeePost;

  const rrc = RRC[vehicleCategory];

  // ERP — split by period; no OBU → flat rate per period
  const noIU = hasIU === "no";
  const erpNum = parseInt(erpDays, 10) || 0;
  // For simplicity: user enters total ERP days; we pro-rata across periods
  // based on proportion of calendar presence in each period, but since
  // user inputs total ERP days we apply the per-period rate to days proportionally.
  // Simpler & more honest: apply the rate of the majority period, or split by chargeable ratio.
  // We'll apply pre-rate to ERP days in pre period, post-rate to ERP days in post period.
  const totalCalDays = durationDays(entryDt, departureDt) || 1;
  const preCalDays = Math.min(
    totalCalDays,
    Math.max(0, Math.round((CUTOFF_2027 - entryDt) / 86400000)),
  );
  const postCalDays = totalCalDays - preCalDays;
  const erpDaysPre = Math.round(erpNum * (preCalDays / totalCalDays));
  const erpDaysPost = erpNum - erpDaysPre;

  let erpCharge = 0;
  let erpNote = "";
  if (noIU) {
    const chargePre = erpDaysPre * rPre.erpNoIU;
    const chargePost = erpDaysPost * rPost.erpNoIU;
    erpCharge = chargePre + chargePost;
    const parts = [];
    if (erpDaysPre > 0)
      parts.push(
        `$${rPre.erpNoIU.toFixed(2)}/day × ${erpDaysPre} day(s) [pre-2027]`,
      );
    if (erpDaysPost > 0)
      parts.push(
        `$${rPost.erpNoIU.toFixed(2)}/day × ${erpDaysPost} day(s) [from 2027]`,
      );
    erpNote = `${fmt(erpCharge)} — flat rate (no OBU/IU): ${parts.join(" + ")}`;
  } else {
    erpNote =
      "Normal charges apply based on actual gantry usage. Please refer to published ERP rates.";
  }

  const subtotal = tollTotal + vepFees;
  const grandTotal = subtotal + rrc + erpCharge;
  const dur = durationDays(entryDt, departureDt);

  return {
    vehicleType: isCar ? "Cars" : "Motorcycles",
    dur,
    totalChargeable,
    preDays,
    postDays,
    vepFeePre,
    vepFeePost,
    vepFees,
    entryToll,
    exitToll,
    tollTotal,
    rrc,
    erpCharge,
    erpNote,
    erpDaysPre,
    erpDaysPost,
    subtotal,
    grandTotal,
    rPre,
    rPost,
  };
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function fmt(n) {
  return `$ ${n.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDt(dt, cp) {
  const d = dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const t = dt.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const label =
    cp === "woodlands"
      ? "Woodlands Checkpoint"
      : cp === "tuas"
        ? "Tuas Checkpoint"
        : cp;
  return `${d} ${t} at ${label}`;
}

// ─── Test Cases ───────────────────────────────────────────────────────────────
const TEST_CASES = [
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
    note: "VEP = $0. School hol + noon entry + exit ≤ 2am. This waiver is REMOVED in 2027.",
  },
  {
    id: 8,
    label: "Car · Post-2027 · June weekday stay — school holiday waiver gone",
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
    note: "VEP = $50 × 2 weekdays. Noon/school-holiday waiver no longer exists post-2027.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function VEPCalculator() {
  const [form, setForm] = useState({
    vehicleCategory: "",
    hasIU: "",
    entryDatetime: "",
    departDatetime: "",
    entryCheckpoint: "",
    departCheckpoint: "",
    erpDays: "",
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState("calc");
  const [testRes, setTestRes] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (!form.vehicleCategory) e.vehicleCategory = "Required";
    if (!form.hasIU) e.hasIU = "Required";
    if (!form.entryDatetime) e.entryDatetime = "Required";
    if (!form.departDatetime) e.departDatetime = "Required";
    if (!form.entryCheckpoint) e.entryCheckpoint = "Required";
    if (!form.departCheckpoint) e.departCheckpoint = "Required";
    return e;
  }

  function handleCalculate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    const entryDt = new Date(form.entryDatetime);
    const departureDt = new Date(form.departDatetime);
    if (departureDt <= entryDt) {
      setErrors({ _g: "Departure must be after entry date/time." });
      return;
    }
    const res = calculate({ ...form, entryDt, departureDt });
    setResult({
      ...res,
      _form: form,
      _entryDt: entryDt,
      _departureDt: departureDt,
    });
  }

  function handleReset() {
    setForm({
      vehicleCategory: "",
      hasIU: "",
      entryDatetime: "",
      departDatetime: "",
      entryCheckpoint: "",
      departCheckpoint: "",
      erpDays: "",
    });
    setResult(null);
    setErrors({});
  }

  function runTest(tc) {
    setTestRes((p) => ({ ...p, [tc.id]: calculate(tc.params) }));
  }

  // ── Styles ──
  const RED = "#c8202e";
  const s = {
    wrap: {
      fontFamily: "'Segoe UI','Noto Sans',Arial,sans-serif",
      fontSize: 14,
      color: "#222",
      maxWidth: 840,
      margin: "0 auto",
      padding: 16,
    },
    tabs: {
      display: "flex",
      borderBottom: `2px solid ${RED}`,
      marginBottom: 24,
    },
    tab: (a) => ({
      padding: "9px 22px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 13,
      background: a ? RED : "#f0f0f0",
      color: a ? "#fff" : "#555",
      border: `1px solid ${a ? RED : "#ddd"}`,
      borderBottom: "none",
      borderRadius: "4px 4px 0 0",
      marginRight: 4,
    }),
    card: {
      border: "1px solid #ddd",
      borderRadius: 4,
      padding: "24px 28px",
      background: "#fafafa",
    },
    row: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: 16,
      gap: 12,
    },
    lbl: {
      width: 265,
      flexShrink: 0,
      fontSize: 13,
      fontWeight: 600,
      color: "#333",
      paddingTop: 8,
      lineHeight: 1.4,
    },
    ctrl: { flex: 1, minWidth: 0 },
    sel: (e) => ({
      width: "100%",
      padding: "7px 10px",
      border: `1px solid ${e ? RED : "#bbb"}`,
      borderRadius: 3,
      fontSize: 13,
      background: "#fff",
      outline: "none",
      cursor: "pointer",
    }),
    inp: (e) => ({
      width: "100%",
      padding: "7px 10px",
      border: `1px solid ${e ? RED : "#bbb"}`,
      borderRadius: 3,
      fontSize: 13,
      background: "#fff",
      outline: "none",
      boxSizing: "border-box",
    }),

    err: { color: RED, fontSize: 11, marginTop: 3 },
    info: {
      background: "#fff8e1",
      border: "1px solid #ffe082",
      borderLeft: `4px solid #f9a825`,
      padding: "11px 14px",
      borderRadius: 2,
      fontSize: 12,
      marginBottom: 16,
      lineHeight: 1.7,
    },
    warn2027: {
      background: "#e8f4fd",
      border: "1px solid #90caf9",
      borderLeft: "4px solid #1976d2",
      padding: "11px 14px",
      borderRadius: 2,
      fontSize: 12,
      marginBottom: 16,
      lineHeight: 1.7,
    },
    errBanner: {
      background: "#ffeaea",
      border: "1px solid #f5c6c6",
      borderLeft: `4px solid ${RED}`,
      padding: "10px 14px",
      borderRadius: 2,
      fontSize: 13,
      marginBottom: 16,
      color: RED,
    },
    btnP: {
      background: RED,
      color: "#fff",
      border: "none",
      borderRadius: 3,
      padding: "10px 28px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      marginRight: 10,
    },
    btnS: {
      background: "#fff",
      color: "#555",
      border: "1px solid #bbb",
      borderRadius: 3,
      padding: "10px 20px",
      fontSize: 14,
      cursor: "pointer",
    },

    // Result
    rWrap: { marginTop: 28 },
    rTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: "#1a1a1a",
      marginBottom: 12,
      borderBottom: `2px solid ${RED}`,
      paddingBottom: 6,
    },
    tbl: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
      background: RED,
      color: "#fff",
      padding: "9px 12px",
      textAlign: "left",
      fontWeight: 600,
    },
    tdL: {
      padding: "8px 12px",
      borderBottom: "1px solid #eee",
      fontWeight: 600,
      color: "#333",
      width: "52%",
      background: "#fafafa",
      verticalAlign: "top",
    },
    tdV: {
      padding: "8px 12px",
      borderBottom: "1px solid #eee",
      verticalAlign: "top",
    },
    subTr: { background: "#fff3cd" },
    gTr: { background: RED },
    gTd: { padding: "10px 12px", color: "#fff", fontWeight: 700, fontSize: 15 },
    pill: (c) => ({
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 700,
      background: c === "pre" ? "#e8f5e9" : c === "post" ? "#e3f2fd" : "#eee",
      color: c === "pre" ? "#2e7d32" : c === "post" ? "#1565c0" : "#555",
      marginLeft: 6,
    }),

    // Test cases
    tcCard: {
      border: "1px solid #ddd",
      borderRadius: 4,
      padding: "16px 20px",
      marginBottom: 12,
      background: "#fafafa",
    },
    tcT: { fontWeight: 700, fontSize: 13, marginBottom: 4 },
    tcD: { fontSize: 12, color: "#555", marginBottom: 8 },
    tcN: {
      fontSize: 12,
      color: "#336",
      background: "#eef2ff",
      padding: "6px 10px",
      borderRadius: 3,
      marginBottom: 8,
    },
    tcB: {
      background: "#0056a6",
      color: "#fff",
      border: "none",
      borderRadius: 3,
      padding: "6px 16px",
      fontSize: 12,
      cursor: "pointer",
    },
    tcR: (ok) => ({
      marginTop: 10,
      fontSize: 12,
      padding: "10px 12px",
      borderRadius: 3,
      background: ok ? "#f0faf0" : "#fff3f3",
      border: `1px solid ${ok ? "#b2dfb2" : "#f5c6c6"}`,
    }),
  };

  function VEPBreakdownCell({ r }) {
    return (
      <td style={s.tdV}>
        {r.preDays > 0 && (
          <div>
            {r.preDays} day(s) × ${r.rPre.vepPerDay}/day
            <span style={s.pill("pre")}>pre-2027</span> = {fmt(r.vepFeePre)}
          </div>
        )}
        {r.postDays > 0 && (
          <div>
            {r.postDays} day(s) × ${r.rPost.vepPerDay}/day
            <span style={s.pill("post")}>from 2027</span> = {fmt(r.vepFeePost)}
          </div>
        )}
        {r.preDays === 0 && r.postDays === 0 && (
          <div>$0.00 (all days waived)</div>
        )}
        {(r.preDays > 0 || r.postDays > 0) && (
          <div style={{ fontWeight: 600, marginTop: 4 }}>
            Total: {fmt(r.vepFees)}
          </div>
        )}
      </td>
    );
  }

  function ResultTable({ r }) {
    return (
      <div style={s.rWrap}>
        <div style={s.rTitle}>Result: For Foreign-registered vehicles only</div>
        <table style={s.tbl}>
          <thead>
            <tr>
              <th style={s.th} colSpan={2}>
                Fee Breakdown
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={s.tdL}>Vehicle Type</td>
              <td style={s.tdV}>{r.vehicleType}</td>
            </tr>
            <tr>
              <td style={s.tdL}>Entry</td>
              <td style={s.tdV}>
                {fmtDt(r._entryDt, r._form.entryCheckpoint)}
              </td>
            </tr>
            <tr>
              <td style={s.tdL}>Departure</td>
              <td style={s.tdV}>
                {fmtDt(r._departureDt, r._form.departCheckpoint)}
              </td>
            </tr>
            <tr>
              <td style={s.tdL}>Duration of Stay</td>
              <td style={s.tdV}>{r.dur} day(s)</td>
            </tr>
            <tr>
              <td style={s.tdL}>
                Chargeable VEP Days
                <br />
                <span style={{ fontWeight: 400, fontSize: 11, color: "#777" }}>
                  (excl. weekends, PH
                  {r.preDays > 0 ? ", & pre-2027 waivers" : ""})
                </span>
              </td>
              <td style={s.tdV}>
                {r.totalChargeable} total
                {r.preDays > 0 && (
                  <span>
                    <span style={s.pill("pre")}>{r.preDays} pre-2027</span>
                  </span>
                )}
                {r.postDays > 0 && (
                  <span>
                    <span style={s.pill("post")}>{r.postDays} from 2027</span>
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td style={s.tdL}>Entry Toll</td>
              <td style={s.tdV}>{fmt(r.entryToll)}</td>
            </tr>
            <tr>
              <td style={s.tdL}>Exit Toll</td>
              <td style={s.tdV}>{fmt(r.exitToll)}</td>
            </tr>
            <tr>
              <td style={s.tdL}>Toll Charges</td>
              <td style={s.tdV}>{fmt(r.tollTotal)}</td>
            </tr>
            <tr>
              <td style={s.tdL}>VEP Charges</td>
              <VEPBreakdownCell r={r} />
            </tr>
            <tr style={s.subTr}>
              <td style={{ ...s.tdL, fontWeight: 700 }}>
                Total (excl. RRC &amp; ERP)
              </td>
              <td style={{ ...s.tdV, fontWeight: 700 }}>{fmt(r.subtotal)}</td>
            </tr>
            <tr>
              <td style={s.tdL}>Reciprocal Road Charge (RRC)</td>
              <td style={s.tdV}>
                {r.rrc > 0 ? `${fmt(r.rrc)} (per entry)` : "—"}
              </td>
            </tr>
            <tr>
              <td style={s.tdL}>ERP Charges</td>
              <td style={s.tdV}>{r.erpNote}</td>
            </tr>
            <tr style={s.gTr}>
              <td style={s.gTd}>Total (incl. RRC &amp; ERP)</td>
              <td style={s.gTd}>{fmt(r.grandTotal)}</td>
            </tr>
          </tbody>
        </table>
        <p
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          * Values are indicative. Actual fees may differ based on authority
          decisions. ERP charges for vehicles with OBU/IU depend on actual
          gantry usage and are not included here. RRC applies per entry for cars
          only. From 1 Jan 2027: VEP rates increase, evening/noon/10-day
          exemptions removed; only weekends &amp; PH remain free.
        </p>
      </div>
    );
  }

  function TestResult({ res, tc }) {
    if (!res) return null;
    const ok = !res.error;
    return (
      <div style={s.tcR(ok)}>
        {res.error ? (
          <strong>{res.error}</strong>
        ) : (
          <>
            <div>
              <strong>Duration:</strong> {res.dur} day(s) &nbsp;|&nbsp;
              <strong> Chargeable:</strong> {res.totalChargeable}
              {res.preDays > 0 && (
                <span style={s.pill("pre")}> {res.preDays} pre-2027</span>
              )}
              {res.postDays > 0 && (
                <span style={s.pill("post")}> {res.postDays} from 2027</span>
              )}
            </div>
            <div>
              <strong>Tolls:</strong> {fmt(res.tollTotal)} &nbsp;|&nbsp;{" "}
              <strong>VEP:</strong> {fmt(res.vepFees)}
              {res.preDays > 0 && ` (pre: ${fmt(res.vepFeePre)})`}
              {res.postDays > 0 && ` (post: ${fmt(res.vepFeePost)})`}
            </div>
            <div>
              <strong>RRC:</strong> {res.rrc > 0 ? fmt(res.rrc) : "—"}{" "}
              &nbsp;|&nbsp; <strong>ERP:</strong> {res.erpNote}
            </div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>
              Subtotal (excl RRC/ERP): {fmt(res.subtotal)}
            </div>
            <div
              style={{
                fontWeight: 700,
                color: ok ? "#1a6e2e" : RED,
                fontSize: 13,
              }}
            >
              Grand Total: {fmt(res.grandTotal)}
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#555" }}>
              ℹ {tc.note}
            </div>
          </>
        )}
      </div>
    );
  }

  const straddlesBoundary = (() => {
    if (!form.entryDatetime || !form.departDatetime) return false;
    const entry = new Date(form.entryDatetime);
    const dept = new Date(form.departDatetime);
    return entry < CUTOFF_2027 && dept >= CUTOFF_2027;
  })();

  return (
    <div style={s.wrap}>
      <div style={s.tabs}>
        <button style={s.tab(tab === "calc")} onClick={() => setTab("calc")}>
          Fee Calculator
        </button>
        <button style={s.tab(tab === "tests")} onClick={() => setTab("tests")}>
          Test Cases
        </button>
      </div>

      {/* ── Calculator ── */}
      {tab === "calc" && (
        <>
          <div style={s.info}>
            <strong>Applicable to:</strong> Cars &amp; Motorcycles registered in
            Malaysia.
            <br />
            <strong>Pre-2027:</strong> VEP Cars $35/day · Motorcycles $4/day.
            Free on: Sat/Sun/PH, weekday evenings (entry ≥5pm, exit ≤2am),
            school-holiday noons (entry ≥12pm, exit ≤2am).
            <br />
            <strong>From 1 Jan 2027:</strong> VEP Cars $50/day · Motorcycles
            $7/day. Free on: Sat/Sun/PH <em>only</em> (all other exemptions
            removed). ERP flat rate without OBU: Cars $10/day, Motorcycles
            $3/day.
          </div>

          {straddlesBoundary && (
            <div style={s.warn2027}>
              ⚠️{" "}
              <strong>
                Your trip straddles the 1 January 2027 rate change.
              </strong>{" "}
              Days before 2027 will be charged at current rates; days from 1 Jan
              2027 will be charged at the new higher rates. The breakdown is
              shown separately in the results.
            </div>
          )}

          {errors._g && <div style={s.errBanner}>{errors._g}</div>}

          <div style={s.card}>
            {/* Vehicle Category */}
            <div style={s.row}>
              <label style={s.lbl}>Vehicle Category</label>
              <div style={s.ctrl}>
                <select
                  style={s.sel(errors.vehicleCategory)}
                  value={form.vehicleCategory}
                  onChange={(e) => set("vehicleCategory", e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="cars">Cars</option>
                  <option value="motorcycles">Motorcycles</option>
                  <option value="vans">Vans/Light Goods Vehicles</option>
                  <option value="hgv">Heavy Goods Vehicles</option>
                  <option value="taxis">Taxis</option>
                  <option value="buses">Buses</option>
                </select>
                {errors.vehicleCategory && (
                  <div style={s.err}>{errors.vehicleCategory}</div>
                )}
              </div>
            </div>

            {/* IU / OBU */}
            <div style={s.row}>
              <label style={s.lbl}>In-Vehicle Unit / OBU installed?</label>
              <div style={s.ctrl}>
                <select
                  style={s.sel(errors.hasIU)}
                  value={form.hasIU}
                  onChange={(e) => set("hasIU", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes (IU / OBU installed)</option>
                  <option value="no">No (no IU / OBU)</option>
                </select>
                {errors.hasIU && <div style={s.err}>{errors.hasIU}</div>}
              </div>
            </div>

            {/* Entry Date & Time */}
            <div style={s.row}>
              <label style={s.lbl}>Entry Date &amp; Time</label>
              <div style={s.ctrl}>
                <input
                  type="datetime-local"
                  style={s.inp(errors.entryDatetime)}
                  value={form.entryDatetime}
                  onChange={(e) => set("entryDatetime", e.target.value)}
                />
                {errors.entryDatetime && (
                  <div style={s.err}>{errors.entryDatetime}</div>
                )}
              </div>
            </div>

            {/* Departure Date & Time */}
            <div style={s.row}>
              <label style={s.lbl}>Departure Date &amp; Time</label>
              <div style={s.ctrl}>
                <input
                  type="datetime-local"
                  style={s.inp(errors.departDatetime)}
                  value={form.departDatetime}
                  min={form.entryDatetime || undefined}
                  onChange={(e) => set("departDatetime", e.target.value)}
                />
                {errors.departDatetime && (
                  <div style={s.err}>{errors.departDatetime}</div>
                )}
              </div>
            </div>

            {/* Entry Checkpoint */}
            <div style={s.row}>
              <label style={s.lbl}>Entry Checkpoint</label>
              <div style={s.ctrl}>
                <select
                  style={s.sel(errors.entryCheckpoint)}
                  value={form.entryCheckpoint}
                  onChange={(e) => set("entryCheckpoint", e.target.value)}
                >
                  <option value="">Select Entry Checkpoint</option>
                  <option value="woodlands">Woodlands Checkpoint</option>
                  <option value="tuas">Tuas Checkpoint</option>
                </select>
                {errors.entryCheckpoint && (
                  <div style={s.err}>{errors.entryCheckpoint}</div>
                )}
              </div>
            </div>

            {/* Departure Checkpoint */}
            <div style={s.row}>
              <label style={s.lbl}>Departure Checkpoint</label>
              <div style={s.ctrl}>
                <select
                  style={s.sel(errors.departCheckpoint)}
                  value={form.departCheckpoint}
                  onChange={(e) => set("departCheckpoint", e.target.value)}
                >
                  <option value="">Select Departure Checkpoint</option>
                  <option value="woodlands">Woodlands Checkpoint</option>
                  <option value="tuas">Tuas Checkpoint</option>
                </select>
                {errors.departCheckpoint && (
                  <div style={s.err}>{errors.departCheckpoint}</div>
                )}
              </div>
            </div>

            {/* ERP Days */}
            <div style={s.row}>
              <label style={s.lbl}>
                No. of days using ERP-priced roads
                <br />
                <span style={{ fontWeight: 400, fontSize: 11, color: "#888" }}>
                  (during ERP-operating hours — only relevant if no IU/OBU)
                </span>
              </label>
              <div style={s.ctrl}>
                <input
                  type="number"
                  min="0"
                  style={s.inp(false)}
                  value={form.erpDays}
                  onChange={(e) => set("erpDays", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button style={s.btnP} onClick={handleCalculate}>
                Calculate
              </button>
              <button style={s.btnS} onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          {result && !result.error && <ResultTable r={result} />}
          {result?.error && (
            <div style={{ ...s.errBanner, marginTop: 16 }}>{result.error}</div>
          )}
        </>
      )}

      {/* ── Test Cases ── */}
      {tab === "tests" && (
        <div>
          <div style={s.info}>
            8 test cases covering pre-2027, post-2027, and boundary-straddling
            scenarios. Click <strong>▶ Run</strong> to execute each one against
            the calculation engine.
          </div>
          {TEST_CASES.map((tc) => (
            <div key={tc.id} style={s.tcCard}>
              <div style={s.tcT}>
                #{tc.id} — {tc.label}
                <span
                  style={s.pill(
                    tc.params.entryDt >= CUTOFF_2027
                      ? "post"
                      : tc.params.departureDt >= CUTOFF_2027
                        ? "pre"
                        : "pre",
                  )}
                >
                  {tc.params.entryDt >= CUTOFF_2027
                    ? "post-2027"
                    : tc.params.departureDt >= CUTOFF_2027
                      ? "straddles 2027"
                      : "pre-2027"}
                </span>
              </div>
              <div style={s.tcD}>{tc.desc}</div>
              <div style={s.tcN}>
                <strong>Expected:</strong> {tc.note}
              </div>
              <button style={s.tcB} onClick={() => runTest(tc)}>
                ▶ Run
              </button>
              <TestResult res={testRes[tc.id]} tc={tc} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
