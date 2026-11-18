import * as v from "valibot";

// PDF にする印刷用の画面。プレビューだけを出す。
export const PRINT_PATH = "/skill-sheet/print";

// 経験年数を数える基準日。画面で見ていた日と同じにするため、呼び出し側から渡す。
export const PrintSearchSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(1900), v.maxValue(9999)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
  day: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(31)),
});

export type PrintSearch = v.InferOutput<typeof PrintSearchSchema>;
