import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../repository";
import { CareerInputSchema } from "../career-schema";

const UpdateCareerSchema = v.object({
  careerId: v.pipe(v.string(), v.minLength(1, "経歴がありません")),
  career: CareerInputSchema,
});

export const updateCareerFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof UpdateCareerSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(UpdateCareerSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new SkillSheetRepository(getDb()).updateCareer(
      parsed.output.careerId,
      parsed.output.career,
    );
  });
