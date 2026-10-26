import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../repository";
import { ExperienceSchema } from "../experience.schema";

const AddSkillSchema = v.object({
  groupName: v.pipe(v.string(), v.trim(), v.minLength(1, "グループ名を入力してください")),
  skillName: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名を入力してください")),
  experience: v.optional(v.nullable(ExperienceSchema), null),
});

export const addSkillFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof AddSkillSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(AddSkillSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new SkillSheetRepository(getDb()).addSkill(
      parsed.output.groupName,
      parsed.output.skillName,
      parsed.output.experience,
    );
  });
