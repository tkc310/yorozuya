import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";

const RemoveSkillSchema = v.object({
  skillName: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名を入れてください")),
});

export const removeSkillFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof RemoveSkillSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(RemoveSkillSchema, ctx.data);
    if (!parsed.success) {
      return err({ message: parsed.issues[0]?.message ?? "入力が不正です" });
    }
    return new SkillSheetRepository(getDb()).removeSkill(parsed.output.skillName);
  });
