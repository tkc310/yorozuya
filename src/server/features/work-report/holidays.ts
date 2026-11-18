import { err, ok, type Result } from "neverthrow";
import type { HolidaySource } from "@/src/shared/features/work-report/holiday.schema";
import { holidaysOf } from "@/src/shared/features/work-report/holiday.service";
import { ServerFunctionError } from "@/src/error";
import { fetchHolidayFeed } from "@/src/server/lib/holiday-feed";
import type { WorkReportRepository } from "./repository";

export type MonthHolidays = { holidays: Record<string, string>; source: HolidaySource };

// 取得を試した年。起動ごとに 1 回だけ試し、失敗しても同じ起動の中では繰り返さない。
const attempted = new Set<number>();

// 取り込み済みの祝日がその年を含まないときだけ、配信先から取り直す。
// 起動して最初に作業報告書を開いたとき（今年）と、取り込み済みの範囲の外の年を開いたときに当たる。
export async function refreshHolidaysIfNeeded(
  repository: WorkReportRepository,
  year: number,
  now: Date = new Date(),
): Promise<Result<{ refreshed: boolean }, ServerFunctionError>> {
  const coverage = repository.holidayCoverage();
  if (coverage.isErr()) {
    return err(coverage.error);
  }
  const covered =
    coverage.value !== null && year >= coverage.value.minYear && year <= coverage.value.maxYear;
  if (covered || attempted.has(year)) {
    return ok({ refreshed: false });
  }
  attempted.add(year);
  const feed = await fetchHolidayFeed();
  if (feed.isErr()) {
    return err(feed.error);
  }
  // 取り込み済みより狭いデータでは置き換えない。
  if (coverage.value !== null && feed.value.maxYear < coverage.value.maxYear) {
    return ok({ refreshed: false });
  }
  const saved = repository.replaceHolidays(feed.value, now.toISOString());
  return saved.isErr() ? err(saved.error) : ok({ refreshed: true });
}

// 公表済みの年は取り込んだ祝日を、まだの年（取り込めていない年）は祝日法のルールから推定した祝日を返す。
export function monthHolidays(
  repository: WorkReportRepository,
  year: number,
  month: number,
): Result<MonthHolidays, ServerFunctionError> {
  const coverage = repository.holidayCoverage();
  if (coverage.isErr()) {
    return err(coverage.error);
  }
  if (coverage.value && year >= coverage.value.minYear && year <= coverage.value.maxYear) {
    const official = repository.holidaysInMonth(year, month);
    return official.map((holidays) => ({ holidays, source: "official" as const }));
  }
  const prefix = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-`;
  const estimated = Object.fromEntries(
    [...holidaysOf(year)].filter(([date]) => date.startsWith(prefix)),
  );
  return ok({ holidays: estimated, source: "estimated" });
}
