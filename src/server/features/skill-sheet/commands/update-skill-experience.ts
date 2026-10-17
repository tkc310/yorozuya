import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";
import { ExperienceSchema } from "../experience";

const UpdateSkillExperienceSchema = v.object({
  skillName: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名を入力してください")),
  experience: v.nullable(ExperienceSchema),
  auto: v.boolean(),
});

export const updateSkillExperienceFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof UpdateSkillExperienceSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(UpdateSkillExperienceSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new SkillSheetRepository(getDb()).updateSkillExperience(
      parsed.output.skillName,
      parsed.output.experience,
      parsed.output.auto,
    );
  });
