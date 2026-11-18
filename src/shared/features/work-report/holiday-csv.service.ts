import {
  HOLIDAY_CSV_URL,
  HOLIDAY_FEED_KIND,
  HOLIDAY_FEED_VERSION,
  type HolidayFeed,
} from "./holiday.schema";
import { isoDate } from "./holiday.service";

export type ParsedHolidays = { ok: true; feed: HolidayFeed } | { ok: false; error: string };

// 内閣府の CSV（1 行目が見出し、以降「1955/1/1,元日」）を読む。文字コードは呼び出し側で直してから渡す。
export function parseHolidayCsv(text: string, source: string = HOLIDAY_CSV_URL): ParsedHolidays {
  const lines = text
    .replace(/^﻿/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
  if (lines.length < 2) {
    return { ok: false, error: "祝日の行がありません" };
  }
  const entries: [string, string][] = [];
  for (const [index, line] of lines.slice(1).entries()) {
    const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2}),(.+)$/.exec(line);
    if (!match) {
      return { ok: false, error: `${index + 2} 行目を読めません: ${line}` };
    }
    const [, year, month, day, name] = match;
    const date = isoDate(Number(year), Number(month), Number(day));
    const check = new Date(`${date}T00:00:00Z`);
    if (Number.isNaN(check.getTime()) || check.toISOString().slice(0, 10) !== date) {
      return { ok: false, error: `${index + 2} 行目の日付が正しくありません: ${line}` };
    }
    entries.push([date, (name ?? "").trim()]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const years = entries.map(([date]) => Number(date.slice(0, 4)));
  return {
    ok: true,
    feed: {
      kind: HOLIDAY_FEED_KIND,
      version: HOLIDAY_FEED_VERSION,
      source,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
      holidays: Object.fromEntries(entries),
    },
  };
}

// 年の祝日だけを取り出す。
export function holidaysInYear(feed: HolidayFeed, year: number): Map<string, string> {
  const prefix = `${String(year).padStart(4, "0")}-`;
  return new Map(Object.entries(feed.holidays).filter(([date]) => date.startsWith(prefix)));
}
