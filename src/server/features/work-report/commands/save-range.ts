import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { MonthRangeSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { WorkReportRepository } from "../repository";

export const saveRangeFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof MonthRangeSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(MonthRangeSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new WorkReportRepository(getDb()).saveRange(parsed.output);
  });
