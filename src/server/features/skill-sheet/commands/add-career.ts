import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { PHASES } from "../../../../../shared/features/skill-sheet/sheet";
import { insertCareer } from "../../../lib/skill-sheet/add-career";

const YearMonthSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(1)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
});

const CareerSchema = v.object({
  period: v.object({
    start: YearMonthSchema,
    end: v.nullable(YearMonthSchema),
  }),
  projectName: v.pipe(v.string(), v.trim(), v.minLength(1, "案件名を入れてください")),
  summary: v.string(),
  work: v.string(),
  outcome: v.string(),
  role: v.string(),
  employment: v.string(),
  environment: v.array(v.string()),
  position: v.string(),
  team: v.string(),
  methodology: v.string(),
  tools: v.array(v.string()),
  phases: v.array(v.picklist(PHASES)),
  parallel: v.boolean(),
  hard: v.boolean(),
});

export const addCareerFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof CareerSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(CareerSchema, ctx.data);
    if (!parsed.success) {
      return err({ message: parsed.issues[0]?.message ?? "入力が不正です" });
    }
    return insertCareer(parsed.output);
  });
