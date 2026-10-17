import { createServerFn } from "@tanstack/react-start";
import { err } from "neverthrow";
import * as v from "valibot";
import { ServerFunctionError } from "@/src/error";
import { getDb } from "@/src/server/lib/db";
import { SkillSheetRepository } from "../../repository";
import { SheetFileSchema } from "../sheet-file";

function issueMessage(issues: v.BaseIssue<unknown>[]): string {
  const issue = issues[0];
  if (!issue) {
    return "JSON の内容が正しくありません";
  }
  const path = issue.path?.map((item) => String(item.key)).join(".");
  return path ? `JSON の内容が正しくありません（${path}: ${issue.message}）` : issue.message;
}

export const importSheetFn = createServerFn({ method: "POST", strict: false })
  .validator((data: { file: unknown }) => data)
  .handler((ctx) => {
    const parsed = v.safeParse(SheetFileSchema, ctx.data.file);
    if (!parsed.success) {
      return err(new ServerFunctionError(issueMessage(parsed.issues)));
    }
    return new SkillSheetRepository(getDb()).replaceSheet(parsed.output.sheet);
  });
