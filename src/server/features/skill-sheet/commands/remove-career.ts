import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { deleteCareer } from "../../../lib/skill-sheet/remove-career";

const RemoveCareerSchema = v.object({
  careerId: v.pipe(v.string(), v.minLength(1)),
});

export const removeCareerFn = createServerFn({ method: "POST", strict: false })
  .validator((data: v.InferInput<typeof RemoveCareerSchema>) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(RemoveCareerSchema, ctx.data);
    if (!parsed.success) {
      return err({ message: parsed.issues[0]?.message ?? "入力が不正です" });
    }
    return deleteCareer(parsed.output.careerId);
  });
