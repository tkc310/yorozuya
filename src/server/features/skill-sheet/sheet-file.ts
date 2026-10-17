import * as v from "valibot";
import { SHEET_FILE_KIND, SHEET_FILE_VERSION } from "@/shared/features/skill-sheet/sheet";
import { CareerSchema } from "./career";
import { ExperienceSchema } from "./experience";
import { ProfileSchema } from "./profile";

const SkillSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名が空です")),
  experience: v.optional(ExperienceSchema),
  auto: v.optional(v.boolean()),
});

// 書き出した JSON の形。読み込むときにこれで確かめる。
export const SheetFileSchema = v.object({
  kind: v.literal(SHEET_FILE_KIND, "スキルシートの JSON ではありません"),
  version: v.literal(SHEET_FILE_VERSION, "対応していない版の JSON です"),
  sheet: v.object({
    ...ProfileSchema.entries,
    skillGroups: v.array(
      v.object({
        name: v.pipe(v.string(), v.trim(), v.minLength(1, "グループ名が空です")),
        skills: v.array(SkillSchema),
      }),
    ),
    careers: v.array(v.object({ ...CareerSchema.entries, id: v.optional(v.string()) })),
  }),
});
