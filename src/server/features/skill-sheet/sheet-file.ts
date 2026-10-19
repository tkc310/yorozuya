import * as v from "valibot";
import {
  SHEET_FILE_KIND,
  SHEET_FILE_VERSIONS,
  cleanHighlights,
  legacyHighlights,
} from "@/shared/features/skill-sheet/sheet";
import { CareerSchema } from "./career";
import { ExperienceSchema } from "./experience";
import { ProfileSchema } from "./profile";

const SkillSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1, "技術名が空です")),
  experience: v.optional(ExperienceSchema),
  auto: v.optional(v.boolean()),
  featured: v.optional(v.boolean()),
});

// 書き出した JSON の形。読み込むときにこれで確かめ、古い版は今の形に直す。
export const SheetFileSchema = v.pipe(
  v.object({
    kind: v.literal(SHEET_FILE_KIND, "スキルシートの JSON ではありません"),
    version: v.picklist(SHEET_FILE_VERSIONS, "対応していない版の JSON です"),
    sheet: v.object({
      ...ProfileSchema.entries,
      // 版 1 の「得意な技術」「得意な業務」。ハイライトに移す。
      strongSkills: v.optional(v.string(), ""),
      strongWork: v.optional(v.string(), ""),
      skillGroups: v.array(
        v.object({
          name: v.pipe(v.string(), v.trim(), v.minLength(1, "グループ名が空です")),
          skills: v.array(SkillSchema),
        }),
      ),
      careers: v.array(v.object({ ...CareerSchema.entries, id: v.optional(v.string()) })),
    }),
  }),
  v.transform(({ sheet: { strongSkills, strongWork, ...sheet }, ...file }) => ({
    ...file,
    sheet: {
      ...sheet,
      highlights:
        file.version === 1
          ? legacyHighlights(strongSkills, strongWork)
          : cleanHighlights(sheet.highlights),
    },
  })),
);

export type SheetFileOutput = v.InferOutput<typeof SheetFileSchema>;
