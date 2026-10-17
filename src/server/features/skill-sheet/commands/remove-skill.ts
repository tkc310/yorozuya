import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { deleteSkill } from "../../../lib/skill-sheet/remove-skill";

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
    return deleteSkill(parsed.output.skillName);
  });
