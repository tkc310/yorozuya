import { createServerFn } from "@tanstack/react-start";
import { err, ok } from "neverthrow";
import * as v from "valibot";
import { YearMonthSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { monthHolidays, refreshHolidaysIfNeeded } from "../holidays";
import { WorkReportRepository } from "../repository";

export const getMonthFn = createServerFn({ method: "GET", strict: false })
  .validator((data: v.InferInput<typeof YearMonthSchema>) => data)
  .handler(async (ctx) => {
    const parsed = v.safeParse(YearMonthSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "年月が不正です"));
    }
    const { year, month } = parsed.output;
    const repository = new WorkReportRepository(getDb());
    // 取得できなくても、推定の祝日で画面は出す。
    const refreshed = await refreshHolidaysIfNeeded(repository, year);
    if (refreshed.isErr()) {
      console.warn(refreshed.error.message);
    }
    const record = repository.readMonth(year, month);
    if (record.isErr()) {
      return err(record.error);
    }
    const holidays = monthHolidays(repository, year, month);
    if (holidays.isErr()) {
      return err(holidays.error);
    }
    return ok({
      ...record.value,
      holidays: holidays.value.holidays,
      holidaySource: holidays.value.source,
    });
  });
