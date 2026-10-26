import {
  CAREER_SUMMARY_GUIDE_LENGTH,
  GENDERS,
  HIGHLIGHT_GUIDE_LENGTH,
  MAX_FEATURED_SKILLS,
  MAX_HIGHLIGHTS,
  NAME_DISPLAYS,
  PHASES,
  PROFILE_ITEMS,
  SELF_PR_GUIDE_LENGTH,
  SHEET_FILE_KIND,
  SHEET_FILE_VERSION,
  WORK_STYLES,
  DEFAULT_VISIBILITY,
  type Career,
  type ProfileItem,
  type SheetFile,
  type SheetInput,
  type Skill,
  type SkillGroup,
} from "@/src/shared/features/skill-sheet/sheet.schema";

// 手元にある元のスキルシート（Excel・PDF・Web ページなど）から、このアプリに読み込める JSON を
// 生成 AI に作ってもらうためのプロンプト。
//
// 項目の説明は型から漏れなく作る。SheetInput などに項目を足すと、下の Record に説明を
// 書くまで型検査が通らない。読み込みの検査（valibot）と説明がずれていないかはテストで確かめる。

// 元のスキルシートをどう渡すか。
export const REFERENCE_KINDS = ["text", "url", "file"] as const;

export type ReferenceKind = (typeof REFERENCE_KINDS)[number];

export const REFERENCE_KIND_LABELS: Record<ReferenceKind, string> = {
  text: "本文を貼り付ける",
  url: "URL を渡す",
  file: "ファイルを添付する",
};

// 参照情報の入力欄の説明。
export const REFERENCE_PLACEHOLDERS: Record<ReferenceKind, string> = {
  text: "元のスキルシートの本文を貼り付けます",
  url: "例: https://example.com/skill-sheet",
  file: "例: skill-sheet_2026.xlsx（生成 AI のチャットに添付するファイル名）",
};

type FieldGuide = {
  // JSON での形。
  type: string;
  description: string;
};

// プロフィールの各項目。skillGroups と careers は下で別に説明する。
type ProfileKey = Exclude<keyof SheetInput, "skillGroups" | "careers">;

export const PROFILE_FIELD_GUIDE: Record<ProfileKey, FieldGuide> = {
  updatedOn: {
    type: "{ year, month, day } | null",
    description: "元のシートの更新日。分からなければ null",
  },
  updatedAuto: {
    type: "boolean",
    description: "true なら更新日を読み込んだ日にする。元のシートに更新日が無ければ true",
  },
  name: { type: "string", description: "氏名（必須）。姓と名の間は半角スペース" },
  nameKana: { type: "string", description: "氏名のフリガナ（全角カタカナ）。分からなければ空" },
  nameInitials: { type: "string", description: "氏名のイニシャル（例: T.Y）。分からなければ空" },
  nameDisplay: {
    type: `${NAME_DISPLAYS.map((value) => `"${value}"`).join(" | ")}`,
    description: "元のシートがイニシャル表記なら initials、それ以外は full",
  },
  title: {
    type: "string",
    description: "肩書・職種（例: バックエンドエンジニア / テックリード）",
  },
  age: { type: "number | null", description: "年齢（整数）。分からなければ null" },
  gender: {
    type: `${GENDERS.map((value) => `"${value}"`).join(" | ")} | null`,
    description: "性別。書かれていなければ null",
  },
  experience: {
    type: "string",
    description: "経験年数の自由記述（例: 10年以上）。experienceAuto が true なら空でよい",
  },
  experienceAuto: {
    type: "boolean",
    description: "true なら経験年数を職務経歴の期間から計算する。原則 true",
  },
  education: { type: "string", description: "最終学歴" },
  station: { type: "string", description: "最寄駅" },
  selfPr: {
    type: "string",
    description: `自己PR。改行は \\n。目安 ${SELF_PR_GUIDE_LENGTH} 字`,
  },
  visibility: {
    type: "object（下の「表示の切り替え」）",
    description: "各項目を用紙に出すか",
  },
  highlights: {
    type: "string[]",
    description: `書類選考で最初に読まれる強み。最大 ${MAX_HIGHLIGHTS} 件、1 件 ${HIGHLIGHT_GUIDE_LENGTH} 字目安。直近の実績を 1 件入れる`,
  },
  qualifications: {
    type: "string[]",
    description: "資格・語学（例: 応用情報技術者試験、TOEIC 820）",
  },
  links: {
    type: "{ label: string, url: string }[]",
    description: "ポートフォリオなどのリンク。url は http:// か https:// で始まるもの",
  },
  availableFrom: { type: "string", description: "稼働開始（例: 即日、2026年12月〜）" },
  desiredHours: { type: "string", description: "稼働量（例: 週4日（月130h程度））" },
  desiredRate: { type: "string", description: "希望単価。書かれていなければ空" },
  workStyle: {
    type: "string",
    description: `勤務形態（例: ${WORK_STYLES.join(" / ")}。補足を括弧で足してよい）`,
  },
  desiredEmployment: { type: "string", description: "希望雇用形態（例: 業務委託）" },
  affiliation: { type: "string", description: "所属（例: フリーランス、株式会社〇〇）" },
};

export const VISIBILITY_GUIDE: Record<ProfileItem, string> = {
  age: "年齢",
  gender: "性別",
  experience: "経験年数",
  education: "最終学歴",
  station: "最寄駅",
  availableFrom: "稼働開始",
  desiredHours: "稼働量",
  desiredRate: "希望単価",
  workStyle: "勤務形態",
  desiredEmployment: "希望雇用形態",
  affiliation: "所属",
  highlights: "ハイライト",
  selfPr: "自己PR",
};

export const SKILL_GROUP_FIELD_GUIDE: Record<keyof SkillGroup, FieldGuide> = {
  name: { type: "string", description: "グループ名（例: 言語、フレームワーク、インフラ）" },
  skills: { type: "skill[]", description: "グループに入る技術" },
};

export const SKILL_FIELD_GUIDE: Record<keyof Skill, FieldGuide> = {
  name: { type: "string", description: "技術名。同じ名前は 1 回だけ" },
  experience: {
    type: "{ years, months }（省略可）",
    description: "元のシートに経験年数が書かれているときだけ入れる。months は 0〜11",
  },
  auto: {
    type: "boolean（省略可）",
    description:
      "true なら職務経歴の environment から経験年数を数える。年数が書かれていなければ true",
  },
  featured: {
    type: "boolean（省略可）",
    description: `主要スキル。経験が長く、本人の強みと言える技術を ${MAX_FEATURED_SKILLS} 件まで true`,
  },
};

export const CAREER_FIELD_GUIDE: Record<keyof Omit<Career, "id">, FieldGuide> = {
  period: {
    type: "{ start: { year, month }, end: { year, month } | null }",
    description: "期間。現在も続いている案件は end を null",
  },
  projectName: { type: "string", description: "企業・案件名（必須）" },
  summary: {
    type: "string",
    description: `職務経歴サマリーに出す 1 行の概要。目安 ${CAREER_SUMMARY_GUIDE_LENGTH} 字`,
  },
  detailSummary: {
    type: "string",
    description: "職務経歴詳細に出す概要。summary と同じでよければ空",
  },
  work: { type: "string", description: "担当業務。箇条書きは「・」で始め、改行は \\n" },
  outcome: {
    type: "string",
    description: "成果。数値で示せる実績を優先する。箇条書きは「・」で始め、改行は \\n",
  },
  role: { type: "string", description: "担当職種" },
  employment: { type: "string", description: "雇用形態（例: 正社員、業務委託）" },
  environment: {
    type: "string[]",
    description:
      "技術・環境（言語・フレームワーク・DB・クラウドなど）。保有技術の name と表記を揃える",
  },
  team: { type: "string", description: "チーム構成（例: 5名（PM 1、エンジニア 4））" },
  methodology: { type: "string", description: "開発手法（例: スクラム、ウォーターフォール）" },
  tools: { type: "string[]", description: "ツール（例: GitHub、Jira、Figma）" },
  phases: {
    type: "string[]",
    description: `担当工程。次の中から選ぶ: ${PHASES.join(" / ")}`,
  },
  hard: {
    type: "boolean",
    description: "高難易度な案件やスキルアップできた案件なら true（用紙で「抜粋」タグになる）",
  },
};

// プロンプトに載せる見本。型で SheetFile と一致させ、テストで読み込めることを確かめる。
export function createImportExample(): SheetFile {
  return {
    kind: SHEET_FILE_KIND,
    version: SHEET_FILE_VERSION,
    exportedAt: "2026-01-01T00:00:00.000Z",
    sheet: {
      updatedOn: { year: 2026, month: 1, day: 1 },
      updatedAuto: false,
      name: "山田 太郎",
      nameKana: "ヤマダ タロウ",
      nameInitials: "T.Y",
      nameDisplay: "full",
      title: "バックエンドエンジニア",
      age: 35,
      gender: null,
      experience: "",
      experienceAuto: true,
      education: "〇〇大学 情報工学科 卒業",
      station: "新宿駅",
      selfPr: "Web アプリの設計から運用まで一貫して担当してきました。",
      visibility: { ...DEFAULT_VISIBILITY },
      highlights: ["直近の案件で決済基盤の刷新をリードし、障害件数を半減"],
      qualifications: ["応用情報技術者試験"],
      links: [{ label: "GitHub", url: "https://github.com/example" }],
      availableFrom: "即日",
      desiredHours: "週5日",
      desiredRate: "",
      workStyle: "リモート中心",
      desiredEmployment: "業務委託",
      affiliation: "フリーランス",
      skillGroups: [
        {
          name: "言語",
          skills: [
            { name: "Go", auto: true, featured: true },
            { name: "SQL", experience: { years: 8, months: 0 } },
          ],
        },
      ],
      careers: [
        {
          id: "career-1",
          period: { start: { year: 2024, month: 4 }, end: null },
          projectName: "決済サービス企業の決済基盤刷新",
          summary: "決済基盤を Go で作り直し、運用を自動化",
          detailSummary: "",
          work: "・API の設計と実装\n・監視とアラートの整備",
          outcome: "・障害件数を前年比で半減",
          role: "バックエンドエンジニア",
          employment: "業務委託",
          environment: ["Go", "PostgreSQL", "AWS"],
          team: "6名（PM 1、エンジニア 5）",
          methodology: "スクラム",
          tools: ["GitHub", "Datadog"],
          phases: ["基本設計", "詳細設計", "実装", "ユニットテスト", "結合テスト"],
          hard: true,
        },
      ],
    },
  };
}

function guideLines(guide: Record<string, FieldGuide>): string {
  return Object.entries(guide)
    .map(([key, value]) => `- \`${key}\`（${value.type}）: ${value.description}`)
    .join("\n");
}

function referenceSection(kind: ReferenceKind, reference: string): string {
  const text = reference.trim();
  switch (kind) {
    case "url":
      return `元のスキルシートは次の URL にあります。内容を読んでから変換してください。\n\n${text}`;
    case "file":
      return `元のスキルシートは、このメッセージに添付したファイル「${text}」です。`;
    case "text":
      return `元のスキルシートの本文は次のとおりです。\n\n<source>\n${text}\n</source>`;
  }
}

// 参照情報が空のときは null を返す。
export function buildImportPrompt(kind: ReferenceKind, reference: string): string | null {
  if (reference.trim().length === 0) {
    return null;
  }
  const visibility = PROFILE_ITEMS.map(
    (item) => `- \`${item}\`: ${VISIBILITY_GUIDE[item]}（既定値 ${DEFAULT_VISIBILITY[item]}）`,
  ).join("\n");
  return `あなたはフリーランスエンジニアのスキルシートを整理するアシスタントです。
元のスキルシートの内容を、スキルシート作成アプリ「よろずや」に読み込める JSON に変換してください。

## 元のスキルシート

${referenceSection(kind, reference)}

## 出力のルール

- 出力は JSON だけにしてください。前後に説明文やコードブロックの記号を付けないでください。
- 一番外側は \`{ "kind": "${SHEET_FILE_KIND}", "version": ${SHEET_FILE_VERSION}, "exportedAt": "<ISO 8601 の日時>", "sheet": { ... } }\` の形です。
- 元のシートに書かれていない事実は作らないでください。分からない文字列は ""、配列は []、数値や日付は null にします。
- 文章は元の内容を保ったまま、書類選考で読みやすいように短く整えてかまいません。
- 年月は数値で書きます（例: { "year": 2024, "month": 4 }）。
- 職務経歴（careers）は元のシートの案件ごとに 1 件ずつ作り、id は "career-1" から順に振ります。
- 職務経歴の environment に出てくる技術は、保有技術（skillGroups）にも同じ表記で入れてください。

## sheet の項目

${guideLines(PROFILE_FIELD_GUIDE)}
- \`skillGroups\`（skillGroup[]）: 保有技術。下の「保有技術」
- \`careers\`（career[]）: 職務経歴。新しい順でなくてよい。下の「職務経歴」

### 表示の切り替え（visibility）

すべて boolean です。元のシートで伏せている項目は false にします。

${visibility}

### 保有技術（skillGroups の要素）

${guideLines(SKILL_GROUP_FIELD_GUIDE)}

skills の要素:

${guideLines(SKILL_FIELD_GUIDE)}

### 職務経歴（careers の要素）

- \`id\`（string）: "career-1" から順に振る
${guideLines(CAREER_FIELD_GUIDE)}

## 出力の見本

${JSON.stringify(createImportExample(), null, 2)}
`;
}
