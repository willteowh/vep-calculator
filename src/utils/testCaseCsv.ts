import type { TestCase } from "../config/testCases";
import { buildCsv, parseCsv } from "./csv";
import { toLocalDateTimeString } from "./dateUtils";
import { isHasIU, isVehicleCategory } from "../types/vep";

const CSV_HEADERS = [
  "id",
  "label",
  "desc",
  "vehicleCategory",
  "hasIU",
  "entryDt",
  "departureDt",
  "entryCheckpoint",
  "departCheckpoint",
  "expectedTotal",
  "note",
] as const;

export function buildTestCasesCsv(testCases: TestCase[]): string {
  const rows: string[][] = [[...CSV_HEADERS]];

  for (const tc of testCases) {
    rows.push([
      String(tc.id),
      tc.label,
      tc.desc,
      tc.params.vehicleCategory,
      tc.params.hasIU,
      toLocalDateTimeString(tc.params.entryDt),
      toLocalDateTimeString(tc.params.departureDt),
      tc.params.entryCheckpoint,
      tc.params.departCheckpoint,
      String(tc.expectedTotal),
      tc.note,
    ]);
  }

  return buildCsv(rows);
}

export function parseTestCasesCsv(csvText: string): TestCase[] {
  const rows = parseCsv(csvText);

  if (rows.length < 2) {
    throw new Error(
      "CSV file must include a header row and at least one data row.",
    );
  }

  const headers = rows[0].map((h) => h.trim());
  const missingHeaders = CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing required CSV columns: ${missingHeaders.join(", ")}`,
    );
  }

  const col = (name: (typeof CSV_HEADERS)[number]) => headers.indexOf(name);

  const parsedCases: TestCase[] = [];
  const usedIds = new Set<number>();

  for (let lineIndex = 1; lineIndex < rows.length; lineIndex++) {
    const raw = rows[lineIndex];
    const get = (name: (typeof CSV_HEADERS)[number]) =>
      (raw[col(name)] ?? "").trim();

    const label = get("label");
    const vehicleCategory = get("vehicleCategory");
    const hasIU = get("hasIU").toLowerCase();
    const entryCheckpoint = get("entryCheckpoint").toLowerCase();
    const departCheckpoint = get("departCheckpoint").toLowerCase();
    const entryDt = new Date(get("entryDt"));
    const departureDt = new Date(get("departureDt"));
    const expectedTotal = Number(get("expectedTotal"));

    if (!label) throw new Error(`Row ${lineIndex + 1}: label is required.`);
    if (!vehicleCategory) {
      throw new Error(`Row ${lineIndex + 1}: vehicleCategory is required.`);
    }
    if (!hasIU) throw new Error(`Row ${lineIndex + 1}: hasIU is required.`);
    if (!entryCheckpoint) {
      throw new Error(`Row ${lineIndex + 1}: entryCheckpoint is required.`);
    }
    if (!departCheckpoint) {
      throw new Error(`Row ${lineIndex + 1}: departCheckpoint is required.`);
    }
    if (!isVehicleCategory(vehicleCategory)) {
      throw new Error(`Row ${lineIndex + 1}: invalid vehicleCategory.`);
    }
    if (!isHasIU(hasIU)) {
      throw new Error(`Row ${lineIndex + 1}: hasIU must be "yes" or "no".`);
    }
    if (Number.isNaN(entryDt.getTime())) {
      throw new Error(`Row ${lineIndex + 1}: invalid entryDt.`);
    }
    if (Number.isNaN(departureDt.getTime())) {
      throw new Error(`Row ${lineIndex + 1}: invalid departureDt.`);
    }
    if (!Number.isFinite(expectedTotal)) {
      throw new Error(`Row ${lineIndex + 1}: expectedTotal must be a number.`);
    }

    const csvId = Number(get("id"));
    let id = Number.isInteger(csvId) && csvId > 0 ? csvId : lineIndex;
    while (usedIds.has(id)) id++;
    usedIds.add(id);

    parsedCases.push({
      id,
      label,
      desc: get("desc"),
      params: {
        vehicleCategory,
        hasIU,
        entryDt,
        departureDt,
        entryCheckpoint,
        departCheckpoint,
      },
      expectedTotal,
      note: get("note"),
    });
  }

  return parsedCases;
}
