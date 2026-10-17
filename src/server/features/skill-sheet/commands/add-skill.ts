import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";

const AddSkillSchema = v.object({
  groupName: v.pipe(v.string(), v.trim(), v.minLength(1, "グループ名を入れてください")),
  skillName: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名を入れてください")),
});

export const addSkillFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof AddSkillSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(AddSkillSchema, ctx.data);
    if (!parsed.success) {
      return err({ message: parsed.issues[0]?.message ?? "入力が不正です" });
    }
    return new SkillSheetRepository(getDb()).addSkill(parsed.output.groupName, parsed.output.skillName);
  });
