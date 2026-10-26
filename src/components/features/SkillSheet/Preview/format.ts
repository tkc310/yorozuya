import {
  type Duration,
  type Period,
  type YearMonth,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import { formatYearMonth } from "@/src/shared/features/skill-sheet/skill.service";

// 一覧と詳細で共通に使う、期間の書き方。

function monthIndex(value: YearMonth): number {
  return value.year * 12 + value.month - 1;
}

export function periodDuration(period: Period, until: YearMonth): Duration {
  const months = Math.max(0, monthIndex(period.end ?? until) - monthIndex(period.start));
  return { years: Math.floor(months / 12), months: months % 12 };
}

export function endLabel(period: Period): string {
  return period.end ? formatYearMonth(period.end) : "現在";
}

export function startLabel(period: Period): string {
  return formatYearMonth(period.start);
}
