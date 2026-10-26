import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  CAREER_FIELD_GUIDE,
  PROFILE_FIELD_GUIDE,
  SKILL_FIELD_GUIDE,
  VISIBILITY_GUIDE,
  createImportExample,
} from "@/src/components/features/SkillSheet/Form/SheetActions/ImportPromptDialog/import-prompt.schema";
import { CareerSchema } from "./career.schema";
import { ProfileSchema } from "./profile.schema";
import { ImportJsonSchema, SkillSchema } from "./import-json.schema";

function sorted(values: string[]): string[] {
  return [...values].sort();
}

// プロンプトの説明と、読み込みの検査（valibot）がずれていないかを確かめる。
// 検査に項目を足して説明を書き忘れると、ここで失敗する。
describe("インポート用のプロンプトと読み込みの検査", () => {
  it("見本の JSON は読み込める", () => {
    const parsed = v.safeParse(ImportJsonSchema, createImportExample());
    expect(parsed.success).toBe(true);
  });

  it("プロフィールの項目は検査と同じ", () => {
    expect(sorted(Object.keys(PROFILE_FIELD_GUIDE))).toEqual(
      sorted(Object.keys(ProfileSchema.entries)),
    );
    expect(sorted(Object.keys(VISIBILITY_GUIDE))).toEqual(
      sorted(Object.keys(ProfileSchema.entries.visibility.entries)),
    );
  });

  it("保有技術と職務経歴の項目は検査と同じ", () => {
    expect(sorted(Object.keys(SKILL_FIELD_GUIDE))).toEqual(
      sorted(Object.keys(SkillSchema.entries)),
    );
    expect(sorted(Object.keys(CAREER_FIELD_GUIDE))).toEqual(
      sorted(Object.keys(CareerSchema.entries)),
    );
  });
});
