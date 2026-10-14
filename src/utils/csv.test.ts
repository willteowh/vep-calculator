import { describe, expect, it } from "vitest";

import { buildCsv, parseCsv, parseCsvRecords } from "./csv";

describe("parseCsv", () => {
  it("parses plain rows", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("accepts Windows line endings and a trailing newline", () => {
    expect(parseCsv("a,b\r\n1,2\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("strips a byte-order mark (Excel 'CSV UTF-8')", () => {
    expect(parseCsv("\uFEFFa,b\n1,2")[0]).toEqual(["a", "b"]);
  });

  it("keeps commas inside quoted fields", () => {
    expect(parseCsv('a,"x, y",c')).toEqual([["a", "x, y", "c"]]);
  });

  it("keeps line breaks inside quoted fields", () => {
    expect(parseCsv('a,"line 1\nline 2"\n1,2')).toEqual([
      ["a", "line 1\nline 2"],
      ["1", "2"],
    ]);
  });

  it("unescapes doubled quotes", () => {
    expect(parseCsv('"say ""hi"""')).toEqual([['say "hi"']]);
  });

  it("skips blank lines but keeps empty fields", () => {
    expect(parseCsv("a,b,c\n\n1,,3\n\n")).toEqual([
      ["a", "b", "c"],
      ["1", "", "3"],
    ]);
  });

  it("rejects an unterminated quoted field", () => {
    expect(() => parseCsv('a,"oops\n1,2')).toThrow(/unterminated/);
  });
});

describe("buildCsv", () => {
  it("round-trips awkward values", () => {
    const rows = [
      ["id", "note"],
      ["1", 'comma, "quote" and\nnewline'],
      ["2", ""],
    ];
    expect(parseCsv(buildCsv(rows))).toEqual(rows);
  });
});

describe("parseCsvRecords", () => {
  it("keys each row by trimmed header names and trims values", () => {
    expect(parseCsvRecords(" a , b \n 1 , 2 ")).toEqual([{ a: "1", b: "2" }]);
  });

  it("returns no records for empty text", () => {
    expect(parseCsvRecords("")).toEqual([]);
  });

  it("fills missing trailing cells with empty strings", () => {
    expect(parseCsvRecords("a,b\n1")).toEqual([{ a: "1", b: "" }]);
  });
});
