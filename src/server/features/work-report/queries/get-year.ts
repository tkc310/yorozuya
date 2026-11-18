import { createServerFn } from "@tanstack/react-start";
import { err, ok } from "neverthrow";
import * as v from "valibot";
import type { WorkReportMonth } from "@/src/shared/features/work-report/report.schema";
import { YearMonthSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { monthHolidays, refreshHolidaysIfNeeded } from "../holidays";
import { WorkReportRepository } from "../repository";

const YearSchema = v.object({ year: YearMonthSchema.entries.year });

export const getYearFn = createServerFn({ method: "GET", strict: false })
  .validator((data: v.InferInput<typeof YearSchema>) => data)
  .handler(async (ctx) => {
    const parsed = v.safeParse(YearSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "年が不正です"));
    }
    const { year } = parsed.output;
    const repository = new WorkReportRepository(getDb());
    // 取得できなくても、推定の祝日で画面は出す。
    const refreshed = await refreshHolidaysIfNeeded(repository, year);
    if (refreshed.isErr()) {
      console.warn(refreshed.error.message);
    }
    const records = repository.readYear(year);
    if (records.isErr()) {
      return err(records.error);
    }
    const months: WorkReportMonth[] = [];
    for (const [index, record] of records.value.entries()) {
      const holidays = monthHolidays(repository, year, index + 1);
      if (holidays.isErr()) {
        return err(holidays.error);
      }
      months.push({
        ...record,
        holidays: holidays.value.holidays,
        holidaySource: holidays.value.source,
      });
    }
    return ok(months);
  });
