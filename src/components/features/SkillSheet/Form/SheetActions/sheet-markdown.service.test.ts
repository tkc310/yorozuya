import { describe, expect, it } from "vitest";
import type { SheetInput } from "@/src/shared/features/skill-sheet/sheet.schema";
import { createFixtureSheet, present } from "@/src/shared/features/skill-sheet/skill.service";
import { sheetMarkdown } from "./sheet-markdown.service";

const today = { year: 2026, month: 10, day: 1 };

function markdownOf(sheet: SheetInput): string {
  const presented = present(sheet, today);
  if (!presented.ok) {
    throw new Error(presented.error);
  }
  return sheetMarkdown(sheet, presented.view, today);
}

describe("AI スクリーニング用の Markdown", () => {
  it("プレビューと同じ並びで見出しを書く", () => {
    const text = markdownOf(createFixtureSheet());
    const headings = text.split("\n").filter((line) => /^##? /.test(line));
    expect(headings).toEqual([
      "# スキルシート：新究羅 理定",
      "## 基本情報",
      "## ハイライト",
      "## 主要スキル",
      "## 保有技術",
      "## 自己PR",
      "## 職務経歴サマリー",
      "## 職務経歴詳細",
    ]);
    expect(text.endsWith("\n")).toBe(true);
  });

  it("人物と条件を項目名つきの箇条書きにする", () => {
    const text = markdownOf(createFixtureSheet());
    expect(text).toContain("- フリガナ: シンギュラ リティ");
    expect(text).toContain("- 年齢: 35歳");
    expect(text).toContain("- 肩書: Webエンジニア");
    expect(text).toContain("- 更新日: 2026/10/01");
    expect(text).toContain("- 稼働開始: 即日");
    expect(text).toContain("- 契約形態: 業務委託");
  });

  it("表示をオフにした項目は書かない", () => {
    const sheet = createFixtureSheet();
    sheet.visibility = { ...sheet.visibility, age: false, selfPr: false, highlights: false };
    const text = markdownOf(sheet);
    expect(text).not.toContain("年齢");
    expect(text).not.toContain("## 自己PR");
    expect(text).not.toContain("## ハイライト");
  });

  it("イニシャル表示ならフリガナを書かない", () => {
    const sheet = {
      ...createFixtureSheet(),
      nameDisplay: "initials" as const,
      nameInitials: "S.R",
    };
    const text = markdownOf(sheet);
    expect(text).toContain("# スキルシート：S.R");
    expect(text).not.toContain("フリガナ");
    expect(text).not.toContain("新究羅");
  });

  it("職務経歴は新しい順の表と、案件ごとの詳細にする。抜粋は文字で示す", () => {
    const text = markdownOf(createFixtureSheet());
    expect(text).toContain("| No | 期間 | 案件 / 業務概要 | 役割 | 主な技術 |");
    expect(text).toContain(
      "| 2 | 2024/01 – 2026/01（2年） | 会員基盤（抜粋）：月次処理の流れを整理した。 | エンジニア / 業務委託 | Typescript |",
    );
    expect(text).toContain("### 2. 会員基盤（抜粋）");
    expect(text).toContain(
      "- 担当工程: 要件定義、基本設計、詳細設計、実装、ユニットテスト、結合テスト、E2Eテスト、保守運用",
    );
    expect(text).toContain("#### 成果\n\n手作業の転記を自動化した。");
  });

  it("表の中の改行と縦線で表を崩さない", () => {
    const sheet = createFixtureSheet();
    sheet.careers = sheet.careers.map((career) =>
      career.id === "career-2024-ts" ? { ...career, projectName: "会員|基盤\n刷新" } : career,
    );
    const text = markdownOf(sheet);
    expect(text).toContain("| 会員\\|基盤 刷新（抜粋）：月次処理の流れを整理した。 |");
  });

  it("リンクは名前と URL を書く", () => {
    const sheet = {
      ...createFixtureSheet(),
      links: [
        { label: "GitHub", url: "https://github.com/example" },
        { label: "", url: "https://example.com" },
      ],
    };
    const text = markdownOf(sheet);
    expect(text).toContain("- GitHub: <https://github.com/example>");
    expect(text).toContain("- <https://example.com>");
  });
});
