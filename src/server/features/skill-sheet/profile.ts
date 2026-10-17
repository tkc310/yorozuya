import * as v from "valibot";
import { GENDERS } from "@/shared/features/skill-sheet/sheet";

const DateSchema = v.pipe(
  v.object({
    year: v.pipe(v.number(), v.integer(), v.minValue(1)),
    month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
    day: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(31)),
  }),
  v.check(
    (value) => new Date(value.year, value.month, 0).getDate() >= value.day,
    "更新日が正しくありません",
  ),
);

const LinkSchema = v.object({
  label: v.pipe(v.string(), v.trim(), v.maxLength(50, "リンク名は50文字以内で入力してください")),
  url: v.pipe(
    v.string(),
    v.trim(),
    v.url("URL の形式で入力してください"),
    v.regex(/^https?:\/\//, "URL は http:// か https:// で始めてください"),
  ),
});

// プロフィールの保存と JSON の読み込みで使う。
export const ProfileSchema = v.object({
  updatedOn: v.nullable(DateSchema),
  updatedAuto: v.boolean(),
  name: v.string(),
  age: v.nullable(
    v.pipe(
      v.number(),
      v.integer("年齢は整数で入力してください"),
      v.minValue(0, "年齢は0以上で入力してください"),
      v.maxValue(150, "年齢は150以下で入力してください"),
    ),
  ),
  gender: v.nullable(v.picklist(GENDERS, "性別は男性か女性を選んでください")),
  experience: v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(50, "経験年数は50文字以内で入力してください"),
  ),
  experienceAuto: v.boolean(),
  visibility: v.object({
    age: v.boolean(),
    gender: v.boolean(),
    experience: v.boolean(),
    education: v.boolean(),
    station: v.boolean(),
    desiredHours: v.boolean(),
    desiredEmployment: v.boolean(),
    affiliation: v.boolean(),
    selfPr: v.boolean(),
  }),
  education: v.string(),
  station: v.string(),
  selfPr: v.string(),
  desiredHours: v.pipe(v.string(), v.maxLength(100, "希望稼働時間は100文字以内で入力してください")),
  desiredEmployment: v.pipe(
    v.string(),
    v.maxLength(100, "希望雇用形態は100文字以内で入力してください"),
  ),
  affiliation: v.pipe(v.string(), v.maxLength(100, "所属は100文字以内で入力してください")),
  strongSkills: v.string(),
  strongWork: v.string(),
  // 以前に書き出した JSON には無いので、無ければ空にする。
  links: v.optional(v.array(LinkSchema), []),
});
