import * as v from "valibot";
import { PHASES } from "@/shared/features/skill-sheet/sheet";

const YearMonthSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(1)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
});

// 経歴の追加と編集で使う。
export const CareerSchema = v.object({
  period: v.object({
    start: YearMonthSchema,
    end: v.nullable(YearMonthSchema),
  }),
  projectName: v.pipe(v.string(), v.trim(), v.minLength(1, "企業・案件名を入力してください")),
  summary: v.string(),
  detailSummary: v.string(),
  work: v.string(),
  outcome: v.string(),
  role: v.string(),
  employment: v.string(),
  environment: v.array(v.string()),
  team: v.string(),
  methodology: v.string(),
  tools: v.array(v.string()),
  phases: v.array(v.picklist(PHASES)),
  hard: v.boolean(),
});
