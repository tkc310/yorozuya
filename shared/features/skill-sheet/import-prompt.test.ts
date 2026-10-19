import { describe, expect, it } from "vitest";
import {
  CAREER_FIELD_GUIDE,
  PROFILE_FIELD_GUIDE,
  REFERENCE_KINDS,
  SKILL_FIELD_GUIDE,
  VISIBILITY_GUIDE,
  buildImportPrompt,
  createImportExample,
} from "./import-prompt";
import { PHASES, PROFILE_ITEMS, SHEET_FILE_VERSION, createFixtureSheet } from "./sheet";

function sorted(values: string[]): string[] {
  return [...values].sort();
}

// 見本の JSON を取り出す。プロンプトの最後に置いている。
function exampleOf(prompt: string): unknown {
  return JSON.parse(prompt.slice(prompt.indexOf("## 出力の見本") + "## 出力の見本".length));
}

describe("インポート用のプロンプト", () => {
  it("参照情報が空なら作らない", () => {
    expect(buildImportPrompt("text", "  ")).toBeNull();
  });

  it("参照の仕方ごとに、参照情報を入れる", () => {
    for (const kind of REFERENCE_KINDS) {
      const prompt = buildImportPrompt(kind, "参照情報の中身");
      expect(prompt).toContain("参照情報の中身");
    }
    expect(buildImportPrompt("file", "sheet.xlsx")).toContain("添付したファイル「sheet.xlsx」");
    expect(buildImportPrompt("url", "https://example.com")).toContain("URL");
  });

  it("シートのすべての項目を説明する", () => {
    const prompt = buildImportPrompt("text", "本文") ?? "";
    const keys = [
      ...Object.keys(PROFILE_FIELD_GUIDE),
      ...Object.keys(SKILL_FIELD_GUIDE),
      ...Object.keys(CAREER_FIELD_GUIDE),
      ...PROFILE_ITEMS,
      "skillGroups",
      "careers",
    ];
    for (const key of keys) {
      expect(prompt).toContain(`\`${key}\``);
    }
    for (const phase of PHASES) {
      expect(prompt).toContain(phase);
    }
    expect(prompt).toContain(`"version": ${SHEET_FILE_VERSION}`);
  });

  it("説明の項目はシートの項目と一致する", () => {
    const { skillGroups: _skillGroups, careers: _careers, ...profile } = createFixtureSheet();
    expect(sorted(Object.keys(PROFILE_FIELD_GUIDE))).toEqual(sorted(Object.keys(profile)));
    expect(sorted(Object.keys(VISIBILITY_GUIDE))).toEqual(sorted([...PROFILE_ITEMS]));
    const { id: _id, ...career } = createFixtureSheet().careers[0] ?? { id: "" };
    expect(sorted(Object.keys(CAREER_FIELD_GUIDE))).toEqual(sorted(Object.keys(career)));
  });

  it("見本はすべての項目を持ち、プロンプトにそのまま載る", () => {
    const example = createImportExample();
    const { skillGroups: _skillGroups, careers: _careers, ...profile } = example.sheet;
    expect(sorted(Object.keys(profile))).toEqual(sorted(Object.keys(PROFILE_FIELD_GUIDE)));
    const skills = example.sheet.skillGroups.flatMap((group) => group.skills);
    const skillKeys = new Set(skills.flatMap((skill) => Object.keys(skill)));
    expect(sorted([...skillKeys])).toEqual(sorted(Object.keys(SKILL_FIELD_GUIDE)));
    expect(example.version).toBe(SHEET_FILE_VERSION);
    expect(exampleOf(buildImportPrompt("text", "本文") ?? "")).toEqual(example);
  });
});
