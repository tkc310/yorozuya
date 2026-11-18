import {
  type CalculatedOn,
  type Career,
  type SheetInput,
  type SheetView,
  type YearMonth,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import {
  byDuration,
  detailSummaryOf,
  formatDuration,
  formatSkillYears,
  formatSlashDate,
} from "@/src/shared/features/skill-sheet/skill.service";
import { basicItems } from "../../Preview/BasicInfo/index";
import { endLabel, periodDuration, startLabel } from "../../Preview/format";

// AI による書類選考（スクリーニング）に渡す Markdown。
// 用紙と同じ項目・同じ並び・同じ表示設定で書き、段組みや色の代わりに見出しと箇条書きで構造を示す。
// タグ（抜粋・主要）は記号にせず、文字で書く。

// 改行や Markdown の記号で表や見出しが崩れないよう、1 行に収める値を整える。
function inline(text: string): string {
  return text.replace(/\s*\n\s*/g, " ").trim();
}

function cell(text: string): string {
  return inline(text).replace(/\|/g, "\\|");
}

function headerLines(view: SheetView): string[] {
  const lines = [`# スキルシート：${inline(view.displayName)}`, ""];
  const facts: string[] = [];
  if (view.nameKana) {
    facts.push(`- フリガナ: ${inline(view.nameKana)}`);
  }
  if (view.visibility.age && view.age !== null) {
    facts.push(`- 年齢: ${view.age}歳`);
  }
  if (view.visibility.gender && view.gender) {
    facts.push(`- 性別: ${view.gender}`);
  }
  if (view.texts.title.trim()) {
    facts.push(`- 肩書: ${inline(view.texts.title)}`);
  }
  if (view.visibility.experience && view.experience.trim()) {
    facts.push(`- 経験年数: ${inline(view.experience)}`);
  }
  facts.push(`- 更新日: ${view.updatedOn ? formatSlashDate(view.updatedOn) : "未設定"}`);
  return [...lines, ...facts];
}

function section(title: string, body: string[]): string[] {
  return body.length > 0 ? ["", `## ${title}`, "", ...body] : [];
}

function basicLines(view: SheetView): string[] {
  return basicItems(view).map((item) => `- ${item.label}: ${inline(item.value)}`);
}

function highlightLines(view: SheetView): string[] {
  return view.visibility.highlights ? view.highlights.map((text) => `- ${inline(text)}`) : [];
}

function featuredLines(view: SheetView): string[] {
  return view.featuredSkills.map((skill) => {
    const years = formatSkillYears(skill.duration);
    return `- ${inline(skill.name)}${years ? `: ${years}` : ""}`;
  });
}

// 保有技術はグループごとの小見出しにする。年数はプレビューと同じ 0.5 年単位。
function skillLines(input: SheetInput, view: SheetView): string[] {
  const known = new Map(view.skills.map((skill) => [skill.name, skill]));
  const lines: string[] = [];
  for (const group of input.skillGroups) {
    const skills = byDuration(
      group.skills
        .map((skill) => known.get(skill.name.trim()))
        .filter((skill) => skill !== undefined),
    );
    if (skills.length === 0) {
      continue;
    }
    if (lines.length > 0) {
      lines.push("");
    }
    lines.push(`### ${inline(group.name)}`, "");
    for (const skill of skills) {
      const years = formatSkillYears(skill.duration);
      const tag = skill.featured ? "（主要）" : "";
      lines.push(`- ${inline(skill.name)}${tag}${years ? `: ${years}` : ""}`);
    }
  }
  return lines;
}

function listLines(items: string[]): string[] {
  return items.map((item) => `- ${inline(item)}`);
}

function linkLines(view: SheetView): string[] {
  return view.links.map((link) => {
    const url = link.url.trim();
    const label = inline(link.label);
    return label ? `- ${label}: <${url}>` : `- <${url}>`;
  });
}

function periodText(career: Career, until: YearMonth): string {
  return `${startLabel(career.period)} – ${endLabel(career.period)}（${formatDuration(periodDuration(career.period, until))}）`;
}

function careerTable(careers: Career[], until: YearMonth): string[] {
  if (careers.length === 0) {
    return ["職務経歴はありません"];
  }
  return [
    "新しい順。期間が重なるものは並行案件。「抜粋」は高難易度な案件やスキルアップできた案件など。",
    "",
    "| No | 期間 | 案件 / 業務概要 | 役割 | 主な技術 |",
    "| --- | --- | --- | --- | --- |",
    ...careers.map((career, index) => {
      const summary = cell(career.summary);
      const name = `${cell(career.projectName)}${career.hard ? "（抜粋）" : ""}${summary ? `：${summary}` : ""}`;
      const role = [career.role, career.employment].map(cell).filter(Boolean).join(" / ");
      return `| ${index + 1} | ${cell(periodText(career, until))} | ${name} | ${role} | ${cell(career.environment.join(" / "))} |`;
    }),
  ];
}

function detailLines(careers: Career[], until: YearMonth): string[] {
  const lines: string[] = [];
  careers.forEach((career, index) => {
    if (index > 0) {
      lines.push("");
    }
    lines.push(
      `### ${index + 1}. ${inline(career.projectName)}${career.hard ? "（抜粋）" : ""}`,
      "",
      `- 期間: ${periodText(career, until)}`,
    );
    const facts: [string, string][] = [
      ["役割", career.role],
      ["契約", career.employment],
      ["体制", career.team],
      ["手法", career.methodology],
      ["技術・環境", career.environment.join(" / ")],
      ["ツール", career.tools.join(" / ")],
      ["担当工程", career.phases.join("、")],
    ];
    for (const [label, value] of facts) {
      if (value.trim()) {
        lines.push(`- ${label}: ${inline(value)}`);
      }
    }
    const prose: [string, string][] = [
      ["概要", detailSummaryOf(career)],
      ["担当業務", career.work],
      ["成果", career.outcome],
    ];
    for (const [label, value] of prose) {
      if (value.trim()) {
        lines.push("", `#### ${label}`, "", value.trim());
      }
    }
  });
  return lines;
}

// シートを Markdown にする。最後は改行で終える。
export function sheetMarkdown(
  input: SheetInput,
  view: SheetView,
  calculatedOn: CalculatedOn,
): string {
  const until = view.updatedOn ?? calculatedOn;
  const careers = [...view.recent, ...view.older];
  const selfPr = view.visibility.selfPr && view.selfPr.trim() ? [view.selfPr.trim()] : [];
  const lines = [
    ...headerLines(view),
    ...section("基本情報", basicLines(view)),
    ...section("ハイライト", highlightLines(view)),
    ...section("主要スキル", featuredLines(view)),
    ...section("保有技術", skillLines(input, view)),
    ...section("資格・語学", listLines(view.qualifications)),
    ...section("リンク", linkLines(view)),
    ...section("自己PR", selfPr),
    ...section("職務経歴サマリー", careerTable(careers, until)),
    ...section("職務経歴詳細", detailLines(careers, until)),
  ];
  return `${lines.join("\n")}\n`;
}
