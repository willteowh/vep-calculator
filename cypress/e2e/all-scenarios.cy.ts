// Generated from docs/fare-scenarios/fare-scenarios.csv by `npm run scenarios:sync`. Do not edit.
// One-click "run everything" for the Cypress UI; the CLI scripts skip it to avoid running scenarios twice.
import { runFareScenario } from "../support/fareScenario";

runFareScenario("S01", "car, two weekdays pre-2027");
runFareScenario("S02", "car, Friday entry at 17:00 is waived (evening entry)");
runFareScenario("S03", "car, Friday entry at 16:59 is charged");
runFareScenario("S04", "car, school-holiday weekday entry at 12:00 is waived");
runFareScenario("S05", "car, school-holiday weekday entry at 11:59 is charged");
runFareScenario("S06", "car, exit at 01:59 waives the departure day");
runFareScenario("S07", "car, exit at 02:00 charges the departure day");
runFareScenario("S08", "car, same-minute stay on a weekday");
runFareScenario("S09", "car, two weekdays from 2027");
runFareScenario("S10", "car, 2027 has no evening-entry or early-exit waiver");
runFareScenario("S11", "car, Tuas both ways over a weekend");
runFareScenario("S12", "car without IU, straddling 1 Jan 2027");
runFareScenario("S13", "car without IU, public holiday and weekend inside the stay");
runFareScenario("S14", "car without IU, weekend-only stay has no ERP days");
runFareScenario("S15", "car, entry 31 Dec 23:59 to 1 Jan 00:01");
runFareScenario("S16", "car, long stay with a holiday and weekends");
runFareScenario("S17", "motorcycle without IU from 2027, three weekdays");
runFareScenario("S18", "motorcycle with IU before 2027, one weekday");
runFareScenario("S19", "taxi from 2027 pays PSVP and exit toll");
runFareScenario("S20", "taxi before 2027 pays no PSVP");
runFareScenario("S21", "van without IU from 2027 at Tuas pays ERP");
runFareScenario("S22", "heavy goods vehicle without IU, Tuas in and Woodlands out");
runFareScenario("S23", "bus without IU before 2027 has no ERP charge");
