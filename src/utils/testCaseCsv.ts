import { TestCase } from "@/config/testCases";

const CSV_HEADERS = [
  "id",
  "label",
  "desc",
  "vehicleCategory",
  "hasIU",
  "erpDays2026",
  "erpDays2027",
  "entryDt",
  "departureDt",
  "entryCheckpoint",
  "departCheckpoint",
  "expectedTotal",
  "note",
] as const;

function escapeCsvValue(value: string): string {
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toLocalIso(dt: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  values.push(current);
  return values;
}

export function buildTestCasesCsv(testCases: TestCase[]): string {
  const lines = [CSV_HEADERS.join(",")];

  for (const tc of testCases) {
    const row = [
      String(tc.id),
      tc.label,
      tc.desc,
      tc.params.vehicleCategory,
      tc.params.hasIU,
      tc.params.erpDays2026,
      tc.params.erpDays2027,
      toLocalIso(tc.params.entryDt),
      toLocalIso(tc.params.departureDt),
      tc.params.entryCheckpoint,
      tc.params.departCheckpoint,
      String(tc.expectedTotal),
      tc.note,
    ].map((value) => escapeCsvValue(String(value ?? "")));

    lines.push(row.join(","));
  }

  return lines.join("\n");
}

export function parseTestCasesCsv(csvText: string): TestCase[] {
  const lines = csvText
    .replace(/\uFEFF/g, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error(
      "CSV file must include a header row and at least one data row.",
    );
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const missingHeaders = CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(
      `Missing required CSV columns: ${missingHeaders.join(", ")}`,
    );
  }

  const col = (name: (typeof CSV_HEADERS)[number]) => headers.indexOf(name);

  const parsedCases: TestCase[] = [];
  const usedIds = new Set<number>();

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const raw = parseCsvLine(lines[lineIndex]);
    const get = (name: (typeof CSV_HEADERS)[number]) =>
      (raw[col(name)] ?? "").trim();

    const label = get("label");
    const vehicleCategory = get("vehicleCategory");
    const hasIU = get("hasIU");
    const entryCheckpoint = get("entryCheckpoint");
    const departCheckpoint = get("departCheckpoint");
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
        erpDays2026: get("erpDays2026"),
        erpDays2027: get("erpDays2027"),
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
