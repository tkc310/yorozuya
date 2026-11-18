import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { YearMonthSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { WorkReportRepository } from "../repository";

export const getMonthFn = createServerFn({ method: "GET", strict: false })
  .validator((data: v.InferInput<typeof YearMonthSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(YearMonthSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "年月が不正です"));
    }
    return new WorkReportRepository(getDb()).readMonth(parsed.output.year, parsed.output.month);
  });
