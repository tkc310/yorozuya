import {
  WEEKDAY_LABELS,
  type WorkReportMonth,
} from "@/src/shared/features/work-report/report.schema";
import {
  buildMonth,
  formatClock,
  summarize,
  type DayRow,
} from "@/src/shared/features/work-report/report.service";
import { columnName, type Cell, type SheetData } from "./xlsx.service";

// 画面と書き出しで同じ言い方にする。
export function dayLabel(row: DayRow): string {
  const override = row.entry?.override ?? "none";
  if (override === "off") {
    return "休み";
  }
  if (override === "work") {
    return row.holiday ? `稼働（${row.holiday}）` : "稼働";
  }
  if (row.holiday) {
    return row.holiday;
  }
  return row.kind === "workday" ? "" : "休み";
}

function hours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

function rangeText(min: number | null, max: number | null): string {
  if (min === null && max === null) {
    return "";
  }
  const show = (value: number | null) => (value === null ? "" : `${hours(value)}h`);
  return `${show(min)}〜${show(max)}`;
}

export function monthSheetName(month: number): string {
  return `${month}月`;
}

const HEADER = ["日付", "曜日", "区分", "開始", "終了", "休憩(h)", "実働(h)", "作業内容"];

// 1 か月分の作業報告書を表にする。
export function monthSheet(year: number, month: number, data: WorkReportMonth): SheetData {
  const rows = buildMonth(year, month, data.settings, data.entries);
  const summary = summarize(rows, data.range, "9999-12-31");
  const bold = (value: string): Cell => ({ value, style: "bold" });
  const head: Cell[][] = [
    [{ value: "作業報告書", style: "bold" }],
    [bold("対象月"), `${year}年${month}月`],
    [bold("氏名"), data.settings.name],
    [bold("提出先"), data.settings.client],
    [bold("案件名"), data.settings.project],
    [bold("精算幅"), rangeText(data.range.minMinutes, data.range.maxMinutes)],
    [],
    HEADER.map(bold),
  ];
  const firstDayRow = head.length + 1;
  const body: Cell[][] = rows.map((row) => {
    const entry = row.entry;
    const worked = row.workedMinutes;
    return [
      `${year}/${String(month).padStart(2, "0")}/${String(row.day).padStart(2, "0")}`,
      WEEKDAY_LABELS[row.weekday] ?? "",
      dayLabel(row),
      formatClock(entry?.start ?? null),
      formatClock(entry?.end ?? null),
      worked === null ? null : { value: hours(entry?.breakMinutes ?? 0), style: "hours" },
      worked === null ? null : { value: hours(worked), style: "hours" },
      entry?.note ?? "",
    ];
  });
  const lastDayRow = firstDayRow + body.length - 1;
  const workedColumn = columnName(6);
  const workedDays = rows.filter((row) => row.workedMinutes !== null).length;
  const foot: Cell[][] = [
    [
      bold("合計"),
      null,
      null,
      null,
      null,
      null,
      {
        formula: `SUM(${workedColumn}${firstDayRow}:${workedColumn}${lastDayRow})`,
        value: hours(summary.workedMinutes),
        style: "boldHours",
      },
    ],
    [
      bold("稼働日数"),
      null,
      null,
      null,
      null,
      null,
      {
        formula: `COUNT(${workedColumn}${firstDayRow}:${workedColumn}${lastDayRow})`,
        value: workedDays,
        style: "bold",
      },
    ],
  ];
  return {
    name: monthSheetName(month),
    columns: [12, 6, 16, 8, 8, 9, 9, 48],
    rows: [...head, ...body, ...foot],
  };
}

// 日本語のファイル名はブラウザによって「download」に置き換わるため、英数字だけにする。
export function exportFileName(year: number, month: number | null): string {
  const period = month === null ? `${year}` : `${year}-${String(month).padStart(2, "0")}`;
  return `work-report-${period}.xlsx`;
}
