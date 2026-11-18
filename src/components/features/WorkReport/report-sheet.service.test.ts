import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/src/shared/features/work-report/report.schema";
import { buildMonth, emptyEntry } from "@/src/shared/features/work-report/report.service";
import { dayLabel, exportFileName, monthSheet } from "./report-sheet.service";

const data = {
  settings: { ...DEFAULT_SETTINGS, name: "見本 太郎", client: "株式会社見本", project: "EC" },
  range: { year: 2026, month: 11, minMinutes: 140 * 60, maxMinutes: 180 * 60 },
  entries: [
    { ...emptyEntry("2026-11-02"), start: 600, end: 1140, breakMinutes: 60, note: "設計" },
    { ...emptyEntry("2026-11-04"), start: 600, end: 1170, breakMinutes: 60, note: "実装" },
    { ...emptyEntry("2026-11-05"), override: "off" as const },
  ],
};

describe("monthSheet", () => {
  const sheet = monthSheet(2026, 11, data);

  it("見出しに対象月・氏名・提出先・案件名・精算幅を載せる", () => {
    expect(sheet.name).toBe("11月");
    expect(sheet.rows[1]).toEqual([{ value: "対象月", style: "bold" }, "2026年11月"]);
    expect(sheet.rows[2]?.[1]).toBe("見本 太郎");
    expect(sheet.rows[5]?.[1]).toBe("140h〜180h");
  });

  it("日ごとの行を月の日数だけ並べ、実働を時間で書く", () => {
    const days = sheet.rows.slice(8, 38);
    expect(days).toHaveLength(30);
    expect(days[1]).toEqual([
      "2026/11/02",
      "月",
      "",
      "10:00",
      "19:00",
      { value: 1, style: "hours" },
      { value: 8, style: "hours" },
      "設計",
    ]);
    expect(days[2]?.[2]).toBe("文化の日");
    expect(days[4]?.[2]).toBe("休み");
  });

  it("合計は式と計算済みの値を持つ", () => {
    const total = sheet.rows[38];
    expect(total?.[6]).toEqual({ formula: "SUM(G9:G38)", value: 16.5, style: "boldHours" });
    expect(sheet.rows[39]?.[6]).toEqual({ formula: "COUNT(G9:G38)", value: 2, style: "bold" });
  });
});

describe("dayLabel", () => {
  it("祝日に稼働へ切り替えた日は祝日名を添える", () => {
    const rows = buildMonth(2026, 11, DEFAULT_SETTINGS, [
      { ...emptyEntry("2026-11-03"), override: "work" },
    ]);
    expect(dayLabel(rows[2]!)).toBe("稼働（文化の日）");
    expect(dayLabel(rows[0]!)).toBe("休み");
    expect(dayLabel(rows[1]!)).toBe("");
  });
});

describe("exportFileName", () => {
  it("期間を英数字の名前に入れる", () => {
    expect(exportFileName(2026, 11)).toBe("work-report-2026-11.xlsx");
    expect(exportFileName(2026, null)).toBe("work-report-2026.xlsx");
  });
});
