import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  SHEET_FILE_VERSION,
  createFixtureSheet,
  toSheetFile,
} from "@/shared/features/skill-sheet/sheet";
import { SheetFileSchema } from "./sheet-file";

function sample(): unknown {
  return JSON.parse(
    // 画面のテストと同じ環境（happy-dom）で動くので、import.meta.url ではなく作業ディレクトリから読む。
    readFileSync(join(process.cwd(), "fixtures/dummy-skill-sheet.json"), "utf8"),
  );
}

describe("書き出した JSON", () => {
  it("今の版で書き出したシートを読み込める", () => {
    const sheet = createFixtureSheet();
    const parsed = v.safeParse(SheetFileSchema, toSheetFile(sheet, new Date(0)));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.output.version).toBe(SHEET_FILE_VERSION);
      expect(parsed.output.sheet.highlights).toEqual(sheet.highlights);
      expect(parsed.output.sheet.nameKana).toBe(sheet.nameKana);
    }
  });

  it("見本の JSON は今の版で、読み込める", () => {
    const parsed = v.safeParse(SheetFileSchema, sample());
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.output.version).toBe(SHEET_FILE_VERSION);
      expect(parsed.output.sheet.name).toBe("新究羅 理定");
    }
  });

  it("版 1 の JSON は、得意な技術・業務をハイライトに移し、新しい項目を既定値にする", () => {
    const {
      highlights: _highlights,
      qualifications: _qualifications,
      nameKana: _nameKana,
      nameInitials: _nameInitials,
      nameDisplay: _nameDisplay,
      title: _title,
      availableFrom: _availableFrom,
      desiredRate: _desiredRate,
      workStyle: _workStyle,
      visibility,
      ...rest
    } = createFixtureSheet();
    const {
      availableFrom: _showAvailableFrom,
      desiredRate: _showDesiredRate,
      workStyle: _showWorkStyle,
      highlights: _showHighlights,
      ...oldVisibility
    } = visibility;
    const parsed = v.safeParse(SheetFileSchema, {
      kind: "yorozuya-skill-sheet",
      version: 1,
      exportedAt: "2026-01-01T00:00:00.000Z",
      sheet: {
        ...rest,
        visibility: oldVisibility,
        strongSkills: "TypeScript",
        strongWork: "",
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const sheet = parsed.output.sheet;
      expect(sheet.highlights).toEqual(["TypeScript"]);
      expect(sheet.qualifications).toEqual([]);
      expect(sheet.nameDisplay).toBe("full");
      expect(sheet.title).toBe("");
      // 希望単価は出したい人だけ出す。
      expect(sheet.visibility.desiredRate).toBe(false);
      expect(sheet.visibility.highlights).toBe(true);
      expect("strongSkills" in sheet).toBe(false);
    }
  });

  it("対応していない版は読み込まない", () => {
    const parsed = v.safeParse(SheetFileSchema, {
      ...toSheetFile(createFixtureSheet(), new Date(0)),
      version: 99,
    });
    expect(parsed.success).toBe(false);
  });

  it("ハイライトは 3 件まで", () => {
    const file = toSheetFile(
      { ...createFixtureSheet(), highlights: ["a", "b", "c", "d"] },
      new Date(0),
    );
    expect(v.safeParse(SheetFileSchema, file).success).toBe(false);
  });
});
