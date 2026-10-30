# Functional Specification – VEP Fee Calculator 
---

## 1. Document Purpose

Describe what the VEP Calculator does and how it behaves for users, so that developers, testers and business owners share one reference. Implementation detail is confined to Section 17.

## 2. Scope

### 2.1 Business purpose

Give foreign-registered vehicle owners an indicative estimate of the charges payable on a Singapore land-checkpoint visit (Woodlands or Tuas): tolls, Vehicle Entry Permit (VEP) fees, Reciprocal Road Charge (RRC), taxi PSVP fee (per trip, since year 2027) and flat-rate ERP charges, including the rate change from 1 January 2027. 

### 2.2 In scope

| Function | Description |
|---|---|
| Trip input | Vehicle category, IU/OBU status, entry and departure date-time, entry and departure checkpoint |
| Calculation | Chargeable VEP days, tolls, RRC, PSVP, flat-rate ERP, subtotal and grand total |
| Result display | Trip summary, charge breakdown, informational notices, disclaimer |
| Clear | Reset the form and result |
| Quick Fill | Fill the form with random values (only when the dev-tooling flag is on; see 12) |

### 2.3 Out of scope (not provided by this tab)

User accounts, saving or sharing results, permit application or payment, GVP/PSBP-bus fee, actual ERP gantry charges for vehicles with an IU, fines or outstanding charges, VEP-fee-free days allowance (stated as not considered in the disclaimer), insurance/road-tax validity.

### 2.4 Actors

| Actor | Role |
|---|---|
| Visitor / vehicle owner | Anonymous public user; enters a trip and reads the estimate. No login required. |
| Business / rule owner | Maintains configurations such as rates, holidays and school-holiday dates. Update of such configurations require code change by developers. |

### 2.5 Preconditions and dependencies

- A modern browser; the user's device clock and time zone are used (see G-02).
- Static reference data bundled with the app: rates, tolls, public holidays and school holidays for 2026–2027.
- External links only (OneMotoring pages); no live interface. Hosted as a static site.

---

## 3. Business & Design Principles

| ID | Principle | Basis |
|---|---|---|
| BP-01 | Estimates are indicative only; actual charges may differ. | Evidenced (page and disclaimer text) |
| BP-02 | Two rate regimes: trip days before 2027-01-01 00:00 use current rates; days on or after use new rates. A trip is split day by day. | Evidenced |
| BP-03 | Only Cars and Motorcycles pay VEP. Vans, Heavy Goods, Taxis and Buses pay no VEP. | Evidenced (rate tables; confirmed by business in this project) |
| BP-04 | Saturdays, Sundays and listed public holidays are always VEP-free, in both regimes. | Evidenced |
| BP-05 | Before 2027 additional VEP-free waivers exist (evening entry, school-holiday noon entry, early-morning departure); from 2027 there are none. | Evidenced |
| BP-06 | Flat-rate ERP is charged per ERP-operating day (every calendar day of the stay except weekends and public holidays) when no IU/OBU is installed. VEP waivers do not affect ERP days. | Evidenced |
| BP-07 | Taxis are always treated as having an IU. | Evidenced |
| BP-08 | RRC applies to Cars only, once per trip. | Evidenced |
| BP-09 | Taxi PSVP fee ($15) applies when the departure date-time is on or after 2027-01-01 00:00, irrespective of the entry date. | Evidenced (business change, Oct 2026) |
| BP-10 | Money is rounded to whole cents. | Evidenced |
| BP-11 | Maximum stay is 90 days. | Evidenced |
| BP-12 | Vehicles with an IU pay ERP according to actual gantry use, which this tool does not calculate. | Evidenced (result text) |

Rules not determinable from code: the origin of the school-holiday date ranges ("approximate" per source comment), the basis for non-car ERP and toll rates, and whether weekend/holiday ERP exemption applies to all vehicle types. See Section 18.

---

## 5. Functional Overview

The user completes six inputs and presses **Calculate**. After a short delay the system shows either a result (trip summary + charge table + notices + disclaimer) or an error message. All processing is in the browser; nothing is stored or transmitted.

(Section 4 is incorporated into Sections 3 and 8 so that each rule appears once.)

## 6. End-to-End Process Flow

1. User opens the page; an empty form is shown (Section 10, state S0).
2. User selects vehicle category. For any category except Taxis, an IU/OBU question appears.
3. User selects entry and departure date-time and both checkpoints.
4. User presses Calculate.
5. System fills in Taxi IU = Yes, checks required fields. If any is missing, per-field "Required" errors are shown and processing stops.
6. Otherwise the previous result and errors are cleared, and after about 0.5 seconds the system validates the stay length and computes the charges.
7. The system shows the result block (success) or a message (failure).
8. User may change inputs, recalculate, or Clear.

Alternative flows: validation failure (6 → step 5); stay longer than 90 days; trip straddling 2027; trip containing holidays; stay over 14 calendar days. Details in Section 7.

---

## 7. Detailed Functional Requirements

### 7.1 Inputs and date handling (FS-INP)

| ID | Requirement | Evidence |
|---|---|---|
| FS-INP-001 | The system shall offer vehicle categories: Cars, Motorcycles, Vans/Light Goods Vehicles, Heavy Goods Vehicles, Taxis, Buses. | Evidenced |
| FS-INP-002 | The system shall ask whether an IU/OBU is installed (Yes/No) for every category except Taxis, and shall hide the question for Taxis. | Evidenced |
| FS-INP-003 | On Calculate, the system shall treat Taxis as IU = Yes. | Evidenced |
| FS-INP-004 | The system shall offer entry and departure checkpoints: Woodlands and Tuas. | Evidenced |
| FS-INP-005 | Date-times shall be entered in DD/MM/YYYY HH:mm (24-hour) format with one-minute precision. | Evidenced |
| FS-INP-006 | The earliest selectable date-time shall be 14 days before the current moment; the latest shall be 2027-12-31 23:59:59. Values outside this range shall be automatically replaced by the nearest limit (no error shown). | Evidenced |
| FS-INP-007 | The earliest selectable departure shall be the entry date-time (or the 14-day limit if later). | Evidenced |
| FS-INP-008 | When the entry is changed to a time later than the current departure, the system shall set departure equal to the new entry. When the departure is chosen earlier than the entry, the system shall set departure equal to the entry. | Evidenced |
| FS-INP-009 | When the user opens an empty entry picker, the system shall pre-fill it with the current date-time (clamped). When the user opens an empty departure picker, it shall be pre-filled with the entry (or current date-time if no entry). | Evidenced |

### 7.2 Stay validation (FS-STY)

| ID | Requirement | Evidence |
|---|---|---|
| FS-STY-001 | If departure is before entry, the system shall show "Departure date cannot be before entry date." | Evidenced (practically unreachable, G-07) |
| FS-STY-002 | If the stay exceeds 90 days (exactly 90 days is accepted; 90 days and 1 minute is rejected), the system shall show "Stay duration cannot exceed 90 days." and no charges. | Evidenced |
| FS-STY-003 | A departure equal to the entry (same minute) shall be accepted. | Evidenced |

### 7.3 VEP (FS-VEP)

| ID | Requirement | Evidence |
|---|---|---|
| FS-VEP-001 | The system shall evaluate each calendar day from the entry date to the departure date inclusive as VEP-free or VEP-chargeable. | Evidenced |
| FS-VEP-002 | A day shall be VEP-free if it is a Saturday, Sunday or listed public holiday. | Evidenced |
| FS-VEP-003 | Day on or after 2027-01-01 not covered by FS-VEP-002 shall be chargeable. | Evidenced |
| FS-VEP-004 | Before 2027, the entry day shall be free if entry time is 17:00 or later. | Evidenced |
| FS-VEP-005 | Before 2027, the entry day shall be free if it falls within a school holiday and entry time is 12:00 or later. | Evidenced |
| FS-VEP-006 | Before 2027, the departure day shall be free if the departure time is before 02:00, regardless of entry time. | Evidenced (README previously stated otherwise; updated) |
| FS-VEP-007 | All other pre-2027 days shall be chargeable. | Evidenced |
| FS-VEP-008 | VEP fee = chargeable days × daily rate of the applicable regime. Cars $35 (before 2027) / $50 (from 2027); Motorcycles $4 / $7. Other categories $0. | Evidenced |
| FS-VEP-009 | Days before and from 2027 shall be counted and priced separately and shown as separate lines. | Evidenced |

### 7.4 Tolls (FS-TOL)

| ID | Requirement | Evidence |
|---|---|---|
| FS-TOL-001 | Toll total = entry toll (by entry checkpoint) + exit toll (by departure checkpoint), per vehicle category. Values in Section 12. | Evidenced |
| FS-TOL-002 | Entry via Woodlands has no toll for any category. | Evidenced |

### 7.5 RRC and PSVP (FS-RRC, FS-PSV)

| ID | Requirement | Evidence |
|---|---|---|
| FS-RRC-001 | For Cars, the system shall add a Reciprocal Road Charge of $6.40 once per trip, shown as a separate line. No other category pays RRC and the line is hidden. | Evidenced |
| FS-PSV-001 | For Taxis whose departure date-time is on or after 2027-01-01 00:00, the system shall add a PSVP fee of $15.00 once per trip ("PSVP Fee (per trip)"). | Evidenced |
| FS-PSV-002 | For Taxis departing before that moment, and for all other categories, no PSVP line shall be shown. | Evidenced |

### 7.6 ERP (FS-ERP)

| ID | Requirement | Evidence |
|---|---|---|
| FS-ERP-001 | An ERP-operating day is any calendar day of the stay (entry day to departure day inclusive) that is not a Saturday, Sunday or listed public holiday. | Evidenced |
| FS-ERP-002 | When IU = No, the flat-rate ERP charge = ERP-operating days × daily flat rate of the regime, priced separately before and from 2027. Rates in Section 12. | Evidenced |
| FS-ERP-003 | When IU = Yes, the calculated ERP charge is $0.00 and no ERP amount is included in totals. | Evidenced |
| FS-ERP-004 | The display shall show "Normal ERP charges apply" with a link when IU = Yes, except a Motorcycle departing before 2027 with IU = Yes (see G-04). | Evidenced |
| FS-ERP-005 | The display shall show "Flat-rate ERP Charges (indicative)" with day-by-rate lines when IU = No, and the amount even if $0.00. | Evidenced |

### 7.7 Totals and result display (FS-RES)

| ID | Requirement | Evidence |
|---|---|---|
| FS-RES-001 | Subtotal ("Total (excluding other charges)") = toll total + VEP fee. | Evidenced |
| FS-RES-002 | Grand total = subtotal + RRC + PSVP + flat-rate ERP, rounded to cents. | Evidenced |
| FS-RES-003 | The result shall show vehicle type, entry and departure date-time with checkpoint, and "Duration of Stay" as the number of calendar days from entry date to departure date inclusive ("1 day" / "N days"). | Evidenced |
| FS-RES-004 | Amounts shall be shown with two decimals and thousands separators (en-SG). | Evidenced |
| FS-RES-005 | If entry is before 2027-01-01 and departure is on or after it, a notice shall explain the split between current and new rates. | Evidenced |
| FS-RES-006 | If the stay spans more than 14 calendar days, a notice shall state that foreign cars and motorcycles are allowed up to 14 days from last entry (or earlier insurance/road-tax expiry). The notice is shown for every vehicle category. | Evidenced |
| FS-RES-007 | If any day of the stay is a listed public holiday, a notice shall name the distinct holidays (or "Public Holiday" if a name is missing). | Evidenced |
| FS-RES-008 | A disclaimer block with LTA reference links shall always accompany a successful result. | Evidenced |

### 7.8 Clear and Quick Fill (FS-CLR, FS-QFL)

| ID | Requirement | Evidence |
|---|---|---|
| FS-CLR-001 | Clear shall reset all inputs, errors and the result and close any open picker. | Evidenced |
| FS-QFL-001 | Where the dev-tooling flag is on, Quick Fill shall fill the form with random values: Cars or Motorcycles, IU yes/no, entry up to 30 days from now, stay 1–10 days, random checkpoints; and clear errors and result. It does not calculate. | Evidenced |

---

## 8. User Actions & System Behaviour

**UA-01 Select vehicle category**
- Precondition: none. Validation: none (selection from a list).
- Processing: store value; if Taxis, hide the IU question.
- Data/State: form changes; any existing result and errors remain visible (not cleared).
- Response: field shows selection. Next state: S1.

**UA-02 Select IU/OBU**
- Precondition: category is not Taxis (question visible). Processing: store Yes/No. Next state: S1.

**UA-03 Enter / pick entry or departure date-time**
- Precondition: none. Validation triggered: range clamping (FS-INP-006/007) and entry/departure consistency (FS-INP-008).
- If invalid or out-of-range: value is silently replaced by the nearest permitted value; invalid/incomplete typing is ignored.
- Processing: store local date-time as DD/MM/YYYY HH:mm.
- Response: field shows the stored value. Next state: S1.

**UA-04 Select checkpoint**
- Same pattern as UA-01. Next state: S1.

**UA-05 Calculate**
- Precondition: none (button always enabled).
- Validation triggered: required-field check (V-01 to V-05).
- If passes: errors and previous result are cleared; after ≈0.5 s the stay-length validation runs (V-06). On success the result is computed and shown (S4); on stay-length failure an error banner is shown (S5).
- If fails: "Required" appears under each missing field; result is not changed except nothing is recalculated; Taxi IU forced to Yes. Next state: S2.
- Data/State: in-memory result replaced; nothing persisted.
- Next state: S3 (calculating) → S4 or S5.

**UA-06 Clear**
- Precondition: none. Processing: reset all fields, errors, result, close pickers. Response: empty form. Next state: S0.

**UA-07 Quick Fill** (dev-tooling only)
- Processing per FS-QFL-001. Next state: S1 (inputs filled, no result).

**UA-08 Open external links (news release, ERP rates, disclaimer links)**
- Opens LTA pages in a new tab; no effect on calculator state.

---

## 9. Validation Rules

| ID | Rule | Trigger | Input | Pass | Fail → outcome | Message |
|---|---|---|---|---|---|---|
| V-01 | Vehicle category required | Calculate | Vehicle category | Non-empty | Field error, no calculation | "Required" |
| V-02 | IU/OBU required for non-Taxi | Calculate (after Taxi override) | IU/OBU | Non-empty or Taxi | Field error | "Required" |
| V-03 | Entry date-time required | Calculate | Entry | Non-empty | Field error | "Required" |
| V-04 | Departure date-time required | Calculate | Departure | Non-empty | Field error | "Required" |
| V-05 | Checkpoints required | Calculate | Entry/departure checkpoint | Non-empty | Field error | "Required" |
| V-06 | Stay ≤ 90 days | After delay on Calculate | Entry, departure | Departure − entry ≤ 90 days | Error banner, no charges | "Stay duration cannot exceed 90 days." |
| V-07 | Departure not before entry | After delay on Calculate | Entry, departure | Departure ≥ entry | Error banner, no charges | "Departure date cannot be before entry date." |
| V-08 | Date range limits | On input | Entry, departure | Within now−14 days … 2027-12-31 23:59:59 | Silent replacement with limit | none |
| V-09 | Valid vehicle/IU values | Calculate | Vehicle, IU | Recognised values | General warning | "Invalid vehicle category or IU selection." (unreachable from UI) |
| V-10 | Departure after entry (second check) | Calculate | Entry, departure | Departure ≥ entry | General warning | "Departure must be after entry date/time." (unreachable from UI; wording differs from V-07) |

Distinction: validations V-01…V-10 are rules; the computations in Section 7 are functions.

---

## 10. State Models

### 10.1 Calculator session (the only business entity; held in memory)

| State | Description | Reached by | Allowed user actions | System actions | Next states | Exit |
|---|---|---|---|---|---|---|
| S0 Empty | No inputs, no result | Page load; Clear | Any input; Quick Fill | – | S1 | First input |
| S1 Editing | Some or all inputs entered; no result or a stale result | Any input change | Edit, Calculate, Clear | Clamp dates; adjust departure | S1, S2, S3, S0 | Calculate or Clear |
| S2 Field errors | "Required" shown | Calculate with missing input | Edit, Calculate, Clear | – | S1, S3, S0 | Next Calculate or Clear (errors persist while editing) |
| S3 Calculating | ≈0.5 s wait | Calculate with complete inputs | Any (not blocked) | Run calculation after delay | S4, S5, S6 | Delay ends |
| S4 Result shown | Result block visible | Successful calculation | Edit, Calculate, Clear | – | S1 (edit, result stays), S3, S0 | Clear or next Calculate |
| S5 Calculation error | Error banner (stay length / date order) | Failed V-06/V-07 | Edit, Calculate, Clear | – | S1, S3, S0 | Next Calculate or Clear |
| S6 General warning | Warning card (V-09/V-10) | Failed V-09/V-10 | Same as S5 | – | – | Next Calculate or Clear |

Notes: editing inputs after S4 does **not** clear the result (it becomes stale; G-06). Prohibited/unsafe transitions evident: none enforced; Clear during S3 does not cancel the pending calculation (G-08).

---

## 11. Data Behaviour / Persistence

| Information | Created | Retrieved | Updated | Persisted | Deleted |
|---|---|---|---|---|---|
| Form inputs | On first entry | On Calculate | On every change | **No** – browser memory only | On Clear or page reload |
| Calculation result | On successful Calculate | For display | Replaced on each Calculate | **No** | On Clear, next Calculate, reload |
| Rates, tolls, holidays, school holidays | – | On each calculation | Only by code change | Bundled with the app | – |

No storage, cookies, analytics or network calls were found in the application source (Evidenced). Nothing is archived.

---

## 12. Configurable Functions / Parameters

All values are fixed in application source; changing them requires a new release. No runtime configuration screen exists.

| Behaviour | Reference | Effect of change |
|---|---|---|
| Rate cut-over | `CUTOFF_2027` = 2027-01-01 00:00 | Moves the pre/post regime split, the PSVP trigger and the straddle notice. |
| VEP daily rate (pre / post) | `RATES_PRE`, `RATES_POST` : Cars 35 / 50; Motorcycles 4 / 7; others none | Changes VEP fees. |
| ERP flat rate, no IU (pre / post) | `RATES_PRE`, `RATES_POST` : Cars 5 / 10; Motorcycles 0 / 3; Vans, Heavy Goods, Buses 0 / 10; Taxis 0 / 0 | Changes flat-rate ERP. |
| Tolls by category / checkpoint | `TOLLS` (entry/exit): Cars W 0/0.80, T 2.10/2.10; Motorcycles all 0; Vans W 0/1.50, T 5.60/5.60; Heavy Goods W 0/2.00, T 11.30/11.30; Taxis W 0/0.40, T 1.60/1.60; Buses W 0/0.60, T 2.50/2.50 (W = Woodlands, T = Tuas) | Changes tolls. |
| RRC | `RRC` : Cars 6.40, others 0 | Changes RRC. |
| PSVP | `PSVP_TAXI_POST_2027_EXIT_FEE` = 15 | Changes taxi PSVP. |
| Waiver times | `EVENING_ENTRY_HOUR` 17, `SCHOOL_HOLIDAY_ENTRY_HOUR` 12, `EXIT_CUTOFF_HOUR` 2 | Changes pre-2027 VEP-free rules. |
| Maximum stay | `MAX_STAY_DAYS` = 90 | Changes V-06. |
| Latest selectable date | `CALCULATOR_MAX_EXIT_DATE` = 2027-12-31T23:59:59 | Changes the date limit; holiday data must also cover it. |
| Earliest selectable date | Fixed 14 days before now | Changes the past-entry window. |
| Public holidays | `SG_PUBLIC_HOLIDAYS` (2026–2027 list) | Changes VEP/ERP-free days and holiday notice. |
| School holidays | `SCHOOL_HOLIDAYS` (2026–2027 ranges) | Changes the pre-2027 noon-entry waiver. |
| Calculate delay | `CALCULATE_DELAY_MS` = 500 | Changes the pause before result display. |
| Quick Fill / tab bar | Build mode (`export` hides dev tooling) | Hides Quick Fill in exported build. |

---

## 13. Interfaces & Dependencies

| Interface | Trigger | Purpose | Failure behaviour |
|---|---|---|---|
| LTA website links (news release, ERP rates, VEP-free days, entry/exit info) | User clicks a link | Reference information | Opens in a new tab; not under this application's control. No retry. |
| Browser clock / time zone | Every date computation and the 14-day lower limit | "Now" and day boundaries | No fallback; see G-02. |

No server, API or database is used.

## 14. Notifications

No emails, SMS or alerts exist. In-page notices only: straddle notice, 14-day notice, public-holiday notice, error banner and warning card (Sections 7.7, 9). Shown on the same page; no failure mode.

---

## 15. Exception & Recovery Behaviour

| Scenario | Behaviour | Evidence |
|---|---|---|
| Missing inputs | "Required" per field; no calculation | Evidenced |
| Duplicate / repeated Calculate | Each click schedules its own delayed calculation from the values at click time; the last to finish is shown. Same inputs give an identical result. | Evidenced |
| Edit during the 0.5 s wait | The pending calculation uses the values at click time, not the edit | Evidenced |
| Clear during the 0.5 s wait | The result still appears afterwards (G-08) | Evidenced by code reading |
| Stay > 90 days | Error banner, no charges | Evidenced |
| Date outside permitted window | Silently replaced by nearest limit | Evidenced |
| Departure earlier than entry | Departure auto-set equal to entry | Evidenced |
| Edit after a result | Old result remains until recalculated | Evidenced |
| Error shown, then user fixes field | Error text remains until next Calculate | Evidenced |
| Browser reload / close | All data lost | Evidenced |
| Unexpected exception in calculation | No handler found; outcome undefined (e.g. blank or stuck screen) | Inferred – requires confirmation |
| Date outside holiday data coverage | Cannot occur through the picker (limit 2027-12-31) | Evidenced |

---

## 16. Functional Traceability Matrix

| Business rule | Requirement | Action | Validation | State | Code reference (Section 17) | Suggested SIT/UAT scenario |
|---|---|---|---|---|---|---|
| BP-02 | FS-VEP-003/009, FS-RES-005 | UA-05 | – | S4 | calculations.ts `splitChargeableDays`; ResultTable.tsx | Trip 28 Dec 2026 – 5 Jan 2027: pre/post lines and notice shown |
| BP-03 | FS-VEP-008 | UA-05 | – | S4 | calculations.ts `calculate` | Van, Taxi, Bus: VEP = $0.00 |
| BP-04 | FS-VEP-002 | UA-05 | – | S4 | `isDayVEPFree` | Weekend/public-holiday-only trip: VEP $0.00 |
| BP-05 | FS-VEP-004/005/006/007 | UA-05 | – | S4 | `isDayVEPFree` | Entry 16:59 vs 17:00; 11:59 vs 12:00 (school holiday); departure 01:59 vs 02:00; same times in 2027 (no waiver) |
| BP-06 | FS-ERP-001/002/003/005 | UA-05 | – | S4 | `countErpDays`; ChargeBreakdownTable.tsx | Car IU=No over a weekend and a holiday: ERP days exclude them; IU=Yes: "Normal ERP" |
| BP-07 | FS-INP-002/003 | UA-01, UA-05 | V-02 | S1, S4 | CalculatorForm.tsx; formRules.ts | Select Taxi: IU question hidden; calculate succeeds |
| BP-08 | FS-RRC-001 | UA-05 | – | S4 | `calculate`; `appliesRRC` | Car shows $6.40; Motorcycle shows no RRC line |
| BP-09 | FS-PSV-001/002 | UA-05 | – | S4 | `calculate` | Taxi 31 Dec 2026 23:59 → 1 Jan 2027 00:00 charges $15; departing 31 Dec 23:59 does not |
| BP-10 | FS-RES-002/004 | UA-05 | – | S4 | `roundMoney`, `fmt` | Totals show two decimals; no float artefacts |
| BP-11 | FS-STY-002 | UA-05 | V-06 | S5 | `getStayError` | 90 days accepted; 90 days + 1 minute rejected |
| – | FS-INP-006/007/008 | UA-03 | V-08 | S1 | CalculatorForm.tsx | Pick entry > 14 days ago; departure before entry; entry after departure |
| – | FS-INP-001…005 | UA-01…04, UA-05 | V-01…V-05 | S2 | formValidation.ts | Calculate with empty form: five "Required" messages (four for Taxi) |
| – | FS-RES-006/007 | UA-05 | – | S4 | ResultTable.tsx | 15-day stay; stay containing 1 May |
| – | FS-CLR-001 | UA-06 | – | S0 | useFeeCalculator.ts `clear` | Clear after a result |

---

## 17. Technical Traceability Appendix

| Area | Source file | Item |
|---|---|---|
| Tab shell, state ownership | `src/VEPCalculator.tsx`, `src/components/CalculatorTab.tsx` | Tab bar, page text, form + result composition |
| Calculate / Clear / Quick Fill orchestration | `src/hooks/useFeeCalculator.ts` | `submit`, `clear`, `quickFill`, `CALCULATE_DELAY_MS` |
| Form state and errors | `src/hooks/useCalculatorForm.ts`, `src/types/form.ts` | `set`, `reset`, `validate` |
| Required-field rules | `src/utils/formValidation.ts` | `validateCalculatorForm` |
| Taxi IU override | `src/utils/formRules.ts` | `sanitiseForm` |
| Inputs, date limits, auto-adjustment | `src/components/CalculatorForm.tsx`, `CalculatorDateTimeField.tsx`, `CalculatorSelectField.tsx` | `clampToAllowedRange`, `handleEntryChange`, `handleDepartChange`, picker seeding |
| Quick Fill | `src/utils/quickFill.ts`; `src/config/features.ts` | `generateQuickFillForm`, `INCLUDE_TESTS` |
| Calculation engine | `src/utils/calculations.ts` | `calculate`, `getStayError`, `isDayVEPFree`, `splitChargeableDays`, `countErpDays`, `roundMoney` |
| Date helpers | `src/utils/dateUtils.ts` | weekend, public holiday, school holiday, regime test |
| Reference data and rates | `src/config/constants.ts` | Rates, tolls, RRC, PSVP, holidays, limits |
| Messages and labels | `src/config/messages.ts` | Error text, field labels, locale |
| Result presentation | `src/components/ResultTable.tsx`, `ChargeBreakdownTable.tsx`, `src/utils/formatters.ts` | Notices, trip summary, charge table, disclaimer |
| Fare-rule reference data for business review | `docs/fare-scenarios/*.csv` | Published rates and hand-derived scenarios |

---

## 18. Functional Gaps / Clarifications Required

| ID | Area | Observed behaviour | Unclear | Question for business | Potential impact |
|---|---|---|---|---|---|
| G-01 | VEP-free days allowance | Disclaimer says the "10 VEP-fee free days" are not considered. | Whether the free-days allowance is still current from 2027, and whether the estimate should include it. | Is the 10-day allowance still valid, and should it be modelled? | Over-statement of VEP for frequent visitors. |
| G-02 | Time zone | All date logic uses the browser's local time; no Singapore time conversion. Project notes say the tool is for Singapore time only. | Behaviour for users in other time zones (e.g. day boundaries, 17:00/02:00 rules, 2027 cut-over). | Should times be interpreted as Singapore time regardless of device? | Wrong day classification near midnight for non-SG devices. |
| G-03 | School-holiday dates | Ranges 2026–2027 are labelled "approximate". | Authoritative source and whether ranges are exact. | Provide official dates. | Wrong waiver on boundary days. |
| G-04 | Motorcycle with IU, departing before 2027 | Display shows "Flat-rate ERP Charges (indicative)" with $0.00, while calculation yields $0.00 for any IU = Yes. | Whether flat-rate ERP should apply to motorcycles with an IU before 2027 (display suggests yes, calculation says no). | What ERP treatment applies? | Misleading label or understated charge. |
| G-05 | Motorcycle ERP rate | $0 before 2027, $3 from 2027 (IU = No). | Rationale; whether Vans/Heavy Goods/Buses ($0 before, $10 from 2027) and Taxis ($0) are correct. | Confirm non-car ERP rules and the "separate ERP charges" wording (a branch for this exists but is never active). | Under/over-statement of ERP. |
| G-06 | Stale result | Editing inputs leaves the previous result and error text on screen. | Whether results should be cleared on change. | Should changes invalidate the result? | User may read an out-of-date estimate. |
| G-07 | Unreachable validations | "Departure before entry" cannot occur through the UI (auto-adjustment); the two general-warning checks are unreachable; two messages differ ("before" vs "must be after") while equal times are allowed. | Whether auto-adjusting is intended instead of an error. | Show an error or keep auto-adjust? | Inconsistent messages if the UI changes. |
| G-08 | Clear during the 0.5 s wait | The pending calculation is not cancelled; a result can appear after Clear. | Whether intended. | Should Clear cancel pending work? | Unexpected result on an empty form. |
| G-09 | Disclaimer wording | States a flat ERP rate of "S$5 daily" and RRC from 2017 as fixed text; rates for 2027 differ ($10 for cars). Text is hard-coded and not driven by rates. | Which text is authoritative post-2027. | Provide approved disclaimer text per regime. | Contradiction between disclaimer and result. |
| G-10 | 14-day notice | Shown whenever calendar days > 14, for all vehicle categories; the text refers to cars and motorcycles. | Whether to show for other categories; basis (calendar days vs 24-hour periods). | Confirm audience and counting. | Irrelevant or inaccurate notice. |
| G-11 | Duration of stay | Displayed as inclusive calendar days; a stay of one minute shows "1 day"; the 90-day limit uses elapsed time instead. | Whether two different measures are intended. | Define duration consistently. | Differences between displayed duration and limit check. |
| G-12 | Early-exit waiver | Any pre-2027 departure before 02:00 frees the departure day regardless of entry (README previously required evening entry). A school-holiday exit rule is redundant and never reached. | Whether broader waiver is intended. | Confirm the exact rule. | Under-charging if the narrower rule applies. |
| G-13 | ERP on entry/departure days | Whole calendar days are counted, including partial days and days with a VEP waiver. | Whether ERP applies to partial days. | Confirm counting. | Over-statement of ERP. |
| G-14 | Entry-date lower limit | 14 days before "now" is a code constant, not a stated business rule. | Rationale. | Confirm whether past trips are supported. | Past trips blocked or allowed unintentionally. |
| G-15 | Data coverage | Holidays, school holidays and the date limit stop at 2027-12-31; no process for extending is evident. | Maintenance ownership and schedule. | Who updates yearly? | Wrong results once data lapses. |
| G-16 | Persisting errors / hidden IU value | Field error text persists after correction until the next Calculate. A hidden IU value (taxi) remains when switching to another category. | Whether intended. | Confirm. | Minor usability confusion. |
| G-17 | Unused or contradictory text | `INVALID_VEHICLE` message and "No. of days using ERP-priced roads" label are unused; a code comment states ERP only applies to vehicles with VEP rates although the code charges ERP to other categories. | Residual from earlier design. | Confirm removal. | Documentation drift. |
| G-18 | Error handling | No handler for unexpected calculation errors. | Expected behaviour. | Define fallback message. | Blank or broken page. |

---

## Quality check (summary)

- User actions traced to outcomes: UA-01 to UA-08 (Section 8). Business rules explicit: BP-01 to BP-12.
- Validations unambiguous with messages: V-01 to V-10. Normal and exception flows: Sections 6, 8, 15.
- States and transitions: Section 10. Persistence: Section 11 (none). Configurable behaviour: Section 12, each with its source reference.
- SIT/UAT cases derivable from the matrix in Section 16. Implementation detail kept in Section 17.
- Assumptions and unknowns listed: BP notes, "Inferred" labels, G-01 to G-18.
- Not independently re-verified: runtime behaviour was inferred from reading the source; Gaps G-06, G-08 and G-16 should be confirmed by running the app.
