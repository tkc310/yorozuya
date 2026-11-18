import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { SettingsSchema } from "@/src/shared/features/work-report/report.schema";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { WorkReportRepository } from "../repository";

export const saveSettingsFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof SettingsSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(SettingsSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new WorkReportRepository(getDb()).saveSettings(parsed.output);
  });
