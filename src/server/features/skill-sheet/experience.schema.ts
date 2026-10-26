import * as v from "valibot";

// 経験年数。年は 0〜99、月は 0〜11。
export const ExperienceSchema = v.object({
  years: v.pipe(
    v.number(),
    v.integer("経験年数は整数で入力してください"),
    v.minValue(0, "経験年数は0以上で入力してください"),
    v.maxValue(99, "経験年数は99年以下で入力してください"),
  ),
  months: v.pipe(
    v.number(),
    v.integer("経験月数は整数で入力してください"),
    v.minValue(0, "経験月数は0以上で入力してください"),
    v.maxValue(11, "経験月数は11以下で入力してください"),
  ),
});
