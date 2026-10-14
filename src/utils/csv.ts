/** RFC 4180 parser: quoted fields may contain commas, quotes ("") and line breaks; CRLF and a BOM are tolerated. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    // A blank line parses as a single empty field; skip it.
    if (row.length > 1 || row[0].trim() !== "") rows.push(row);
    row = [];
  };

  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      endField();
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i++;
      endRow();
    } else {
      field += ch;
    }
  }
  if (inQuotes) throw new Error("CSV has an unterminated quoted field.");
  if (field !== "" || row.length > 0) endRow();

  return rows;
}

export function escapeCsvValue(value: string): string {
  return /[,"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

/** Maps each data row to an object keyed by the (trimmed) header names. */
export function parseCsvRecords(text: string): Record<string, string>[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const names = header.map((name) => name.trim());
  return rows.map((row) =>
    Object.fromEntries(names.map((name, i) => [name, (row[i] ?? "").trim()])),
  );
}
