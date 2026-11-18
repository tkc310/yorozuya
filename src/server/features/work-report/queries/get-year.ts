import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { YearMonthSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { WorkReportRepository } from "../repository";

const YearSchema = v.object({ year: YearMonthSchema.entries.year });

export const getYearFn = createServerFn({ method: "GET", strict: false })
  .validator((data: v.InferInput<typeof YearSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(YearSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "年が不正です"));
    }
    return new WorkReportRepository(getDb()).readYear(parsed.output.year);
  });
