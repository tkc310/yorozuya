import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { writeProfile } from "../../../lib/skill-sheet/update-profile";

const YearMonthSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(1)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
});

const ProfileSchema = v.object({
  updatedOn: v.nullable(YearMonthSchema),
  name: v.string(),
  workStyle: v.string(),
  education: v.string(),
  station: v.string(),
  selfPr: v.string(),
});

export const updateProfileFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof ProfileSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(ProfileSchema, ctx.data);
    if (!parsed.success) {
      return err({ message: parsed.issues[0]?.message ?? "入力が不正です" });
    }
    return writeProfile(parsed.output);
  });
