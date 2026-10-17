import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";
import { ProfileSchema } from "../profile";

export const updateProfileFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof ProfileSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(ProfileSchema, ctx.data);
    if (!parsed.success) {
      return err(new ServerFunctionError(parsed.issues[0]?.message ?? "入力が不正です"));
    }
    return new SkillSheetRepository(getDb()).updateProfile(parsed.output);
  });
