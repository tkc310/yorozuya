import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";

const UpdateSkillFeaturedSchema = v.object({
  skillName: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名を入力してください")),
  featured: v.boolean(),
});

export const updateSkillFeaturedFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof UpdateSkillFeaturedSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(UpdateSkillFeaturedSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new SkillSheetRepository(getDb()).updateSkillFeatured(
      parsed.output.skillName,
      parsed.output.featured,
    );
  });
