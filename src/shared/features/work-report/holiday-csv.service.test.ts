import { describe, expect, it } from "vitest";
import { holidaysInYear, parseHolidayCsv } from "./holiday-csv.service";

// 内閣府の CSV と同じ形（見出し 1 行、「年/月/日,名称」、CRLF）。
const CSV = [
  "国民の祝日・休日月日,国民の祝日・休日名称",
  "2026/1/1,元日",
  "2026/1/12,成人の日",
  "2026/11/3,文化の日",
  "2027/1/1,元日",
  "2025/11/24,休日",
  "",
].join("\r\n");

describe("parseHolidayCsv", () => {
  it("日付を YYYY-MM-DD にそろえ、日付順に並べ、範囲を出す", () => {
    const parsed = parseHolidayCsv(`﻿${CSV}`, "https://example.test/holidays.csv");
    expect(parsed).toEqual({
      ok: true,
      feed: {
        kind: "yorozuya-holidays",
        version: 1,
        source: "https://example.test/holidays.csv",
        minYear: 2025,
        maxYear: 2027,
        holidays: {
          "2025-11-24": "休日",
          "2026-01-01": "元日",
          "2026-01-12": "成人の日",
          "2026-11-03": "文化の日",
          "2027-01-01": "元日",
        },
      },
    });
  });

  it("読めない行や、ありえない日付があれば失敗する", () => {
    expect(parseHolidayCsv("見出し\n2026-01-01,元日")).toEqual({
      ok: false,
      error: "2 行目を読めません: 2026-01-01,元日",
    });
    expect(parseHolidayCsv("見出し\n2026/2/30,元日").ok).toBe(false);
    expect(parseHolidayCsv("見出しだけ").ok).toBe(false);
  });
});

describe("holidaysInYear", () => {
  it("その年の祝日だけを取り出す", () => {
    const parsed = parseHolidayCsv(CSV);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    expect([...holidaysInYear(parsed.feed, 2026).keys()]).toEqual([
      "2026-01-01",
      "2026-01-12",
      "2026-11-03",
    ]);
  });
});
