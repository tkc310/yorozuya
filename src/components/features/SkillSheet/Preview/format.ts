import type { Career, Duration, Period, YearMonth } from "@/shared/features/skill-sheet/sheet";

// 一覧と詳細で共通に使う、期間や案件名の書き方。

export function formatMonth(value: YearMonth): string {
  return `${value.year}年${value.month}月`;
}

function monthIndex(value: YearMonth): number {
  return value.year * 12 + value.month - 1;
}

export function periodDuration(period: Period, until: YearMonth): Duration {
  const months = Math.max(0, monthIndex(period.end ?? until) - monthIndex(period.start));
  return { years: Math.floor(months / 12), months: months % 12 };
}

export function endLabel(period: Period): string {
  return period.end ? formatMonth(period.end) : "現在";
}

export function careerName(item: Career): string {
  return item.hard ? `${item.projectName} (※)` : item.projectName;
}
