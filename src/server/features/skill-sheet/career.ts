import * as v from "valibot";
import { PHASES } from "@/shared/features/skill-sheet/sheet";

const YearMonthSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(1)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
});

// 経歴の形。JSON の読み込みで使う。
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

const required = (label: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, `${label}を入力してください`));

const requiredList = (label: string) =>
  v.pipe(v.array(v.string()), v.minLength(1, `${label}を1つ以上追加してください`));

// 画面からの追加・編集で使う。JSON の読み込みは以前のデータも受け付けるため CareerSchema のまま。
export const CareerInputSchema = v.object({
  ...CareerSchema.entries,
  role: required("担当職種"),
  team: required("チーム構成"),
  methodology: required("開発手法"),
  environment: requiredList("技術・環境"),
  tools: requiredList("ツール"),
});
