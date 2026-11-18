import { daysInMonth, isoDate, weekdayOf } from "./holiday.service";
import type { DayEntry, IsoDate, MonthRange, WorkReportSettings } from "./report.schema";

export type DayKind = "workday" | "weekend" | "holiday";

export type DayRow = {
  date: IsoDate;
  day: number;
  weekday: number;
  holiday: string | null;
  // 曜日と祝日の設定だけで決まる区分。
  kind: DayKind;
  // 日ごとの切り替えを反映した、稼働日として数えるか。
  workday: boolean;
  plannedMinutes: number;
  workedMinutes: number | null;
  entry: DayEntry | null;
};

export type MonthSummary = {
  workedMinutes: number;
  workdays: number;
  plannedMinutes: number;
  remainingWorkdays: number;
  remainingPlannedMinutes: number;
  forecastMinutes: number;
  // 精算幅が未設定なら null。
  toMinMinutes: number | null;
  // 負なら上限を超えている。
  toMaxMinutes: number | null;
  // 下限に届くための残り稼働日 1 日あたりの時間。届いている・残り日数が 0 なら null。
  neededPerDayMinutes: number | null;
  status: "unset" | "below" | "within" | "over";
};

export function emptyEntry(date: IsoDate): DayEntry {
  return { date, start: null, end: null, breakMinutes: 0, override: "none", note: "" };
}

export function isEmptyEntry(entry: DayEntry): boolean {
  return (
    entry.start === null &&
    entry.end === null &&
    entry.breakMinutes === 0 &&
    entry.override === "none" &&
    entry.note === ""
  );
}

export function workedMinutesOf(entry: DayEntry | null): number | null {
  if (!entry || entry.start === null || entry.end === null) {
    return null;
  }
  return Math.max(0, entry.end - entry.start - entry.breakMinutes);
}

// 休みの曜日に稼働へ切り替えた日の予定は、曜日の予定のうち最も長いものにする。
function fallbackMinutes(settings: WorkReportSettings): number {
  return Math.max(0, ...settings.weekdayMinutes);
}

export function buildMonth(
  year: number,
  month: number,
  settings: WorkReportSettings,
  entries: readonly DayEntry[],
  // その月の祝日（日付 → 名称）。
  holidays: Readonly<Record<IsoDate, string>>,
): DayRow[] {
  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const rows: DayRow[] = [];
  for (let day = 1; day <= daysInMonth(year, month); day += 1) {
    const date = isoDate(year, month, day);
    const weekday = weekdayOf(year, month, day);
    const holiday = holidays[date] ?? null;
    const weekdayMinutes = settings.weekdayMinutes[weekday] ?? 0;
    const kind: DayKind =
      holiday && settings.holidaysOff ? "holiday" : weekdayMinutes > 0 ? "workday" : "weekend";
    const entry = byDate.get(date) ?? null;
    const override = entry?.override ?? "none";
    const workday = override === "none" ? kind === "workday" : override === "work";
    const plannedMinutes = workday
      ? weekdayMinutes > 0
        ? weekdayMinutes
        : fallbackMinutes(settings)
      : 0;
    rows.push({
      date,
      day,
      weekday,
      holiday,
      kind,
      workday,
      plannedMinutes,
      workedMinutes: workedMinutesOf(entry),
      entry,
    });
  }
  return rows;
}

// today 以降の稼働日のうち、まだ実働を入れていない日を「残り」とする。
export function summarize(
  rows: readonly DayRow[],
  range: Pick<MonthRange, "minMinutes" | "maxMinutes">,
  today: IsoDate,
): MonthSummary {
  let workedMinutes = 0;
  let workdays = 0;
  let plannedMinutes = 0;
  let remainingWorkdays = 0;
  let remainingPlannedMinutes = 0;
  for (const row of rows) {
    workedMinutes += row.workedMinutes ?? 0;
    if (row.workday) {
      workdays += 1;
      plannedMinutes += row.plannedMinutes;
      if (row.date >= today && row.workedMinutes === null) {
        remainingWorkdays += 1;
        remainingPlannedMinutes += row.plannedMinutes;
      }
    }
  }
  const forecastMinutes = workedMinutes + remainingPlannedMinutes;
  const toMinMinutes =
    range.minMinutes === null ? null : Math.max(0, range.minMinutes - workedMinutes);
  const toMaxMinutes = range.maxMinutes === null ? null : range.maxMinutes - workedMinutes;
  const neededPerDayMinutes =
    toMinMinutes !== null && toMinMinutes > 0 && remainingWorkdays > 0
      ? Math.ceil(toMinMinutes / remainingWorkdays)
      : null;
  return {
    workedMinutes,
    workdays,
    plannedMinutes,
    remainingWorkdays,
    remainingPlannedMinutes,
    forecastMinutes,
    toMinMinutes,
    toMaxMinutes,
    neededPerDayMinutes,
    status: statusOf(forecastMinutes, range),
  };
}

function statusOf(
  forecastMinutes: number,
  range: Pick<MonthRange, "minMinutes" | "maxMinutes">,
): MonthSummary["status"] {
  if (range.minMinutes === null && range.maxMinutes === null) {
    return "unset";
  }
  if (range.minMinutes !== null && forecastMinutes < range.minMinutes) {
    return "below";
  }
  if (range.maxMinutes !== null && forecastMinutes > range.maxMinutes) {
    return "over";
  }
  return "within";
}

// 'H:MM' や 'HHMM'、'H' を分に直す。読めなければ null。
export function parseClock(input: string): number | null {
  const value = input.trim().replace("：", ":");
  if (value === "") {
    return null;
  }
  const match = /^(\d{1,2})(?::?(\d{2}))?$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (minutes >= 60 || hours >= 48) {
    return null;
  }
  return hours * 60 + minutes;
}

export function formatClock(minutes: number | null): string {
  if (minutes === null) {
    return "";
  }
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

// 時間を小数 1 桁で出す（例: 510 分 → '8.5'）。
export function formatHours(minutes: number | null): string {
  if (minutes === null) {
    return "";
  }
  const hours = Math.round((minutes / 60) * 10) / 10;
  return Number.isInteger(hours) ? `${hours}.0` : String(hours);
}

// 時間の入力（小数可）を分に直す。読めなければ null。
export function parseHours(input: string): number | null {
  const value = input.trim();
  if (value === "") {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }
  return Math.round(Number(value) * 60);
}

export function todayIso(now: Date = new Date()): IsoDate {
  return isoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
