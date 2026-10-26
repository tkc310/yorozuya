export const PHASES = [
  "要件定義",
  "基本設計",
  "詳細設計",
  "実装",
  "ユニットテスト",
  "結合テスト",
  "E2Eテスト",
  "保守運用",
] as const;

export type Phase = (typeof PHASES)[number];

// 担当工程のチップに出す短い名前。工程を足したら型検査で漏れに気づけるよう Record にする。
export const PHASE_SHORT: Record<Phase, string> = {
  要件定義: "要件",
  基本設計: "基本",
  詳細設計: "詳細",
  実装: "実装",
  ユニットテスト: "単テ",
  結合テスト: "結テ",
  E2Eテスト: "E2E",
  保守運用: "保守",
};

// 書き出す JSON の目印と版。読み込むときに確かめる。
export const SHEET_FILE_KIND = "yorozuya-skill-sheet";

export const SHEET_FILE_VERSION = 2;

// 読み込める版。古い版は読み込むときに今の形へ直す。
export const SHEET_FILE_VERSIONS = [1, 2] as const;

export type SheetFile = {
  kind: typeof SHEET_FILE_KIND;
  version: typeof SHEET_FILE_VERSION;
  exportedAt: string;
  sheet: SheetInput;
};

export type YearMonth = {
  year: number;
  month: number;
};

export type CalendarDate = YearMonth & {
  day: number;
};

// 計算の基準日。日が無ければその月の1日として扱う。
export type CalculatedOn = YearMonth & {
  day?: number;
};

export type Period = {
  start: YearMonth;
  end: YearMonth | null;
};

export type Career = {
  id: string;
  period: Period;
  projectName: string;
  // 職務経歴の一覧に出す概要。
  summary: string;
  // 職務経歴の詳細に出す概要。空なら summary を使う。
  detailSummary: string;
  work: string;
  outcome: string;
  role: string;
  employment: string;
  environment: string[];
  team: string;
  methodology: string;
  tools: string[];
  phases: Phase[];
  hard: boolean;
};

export const GENDERS = ["男性", "女性"] as const;

export type Gender = (typeof GENDERS)[number];

// 氏名の出し方。イニシャルにするとフリガナは出さない。
export const NAME_DISPLAYS = ["full", "initials"] as const;

export type NameDisplay = (typeof NAME_DISPLAYS)[number];

// 勤務形態の入力候補。自由入力もできる。
export const WORK_STYLES = ["フルリモート", "リモート中心", "ハイブリッド", "常駐可"] as const;

export const MAX_HIGHLIGHTS = 3;

// ハイライト 1 件の目安の文字数。超えても保存はできる。
export const HIGHLIGHT_GUIDE_LENGTH = 60;

export const MAX_FEATURED_SKILLS = 8;

// 主要スキルを選んでいないときに、経験年数の長い順に出す件数。
export const FALLBACK_FEATURED_SKILLS = 6;

export const SELF_PR_GUIDE_LENGTH = 400;

export const CAREER_SUMMARY_GUIDE_LENGTH = 40;

// プレビューに出すかを切り替えられる項目。
export const PROFILE_ITEMS = [
  "age",
  "gender",
  "experience",
  "education",
  "station",
  "availableFrom",
  "desiredHours",
  "desiredRate",
  "workStyle",
  "desiredEmployment",
  "affiliation",
  "highlights",
  "selfPr",
] as const;

export type ProfileItem = (typeof PROFILE_ITEMS)[number];

export type ProfileVisibility = Record<ProfileItem, boolean>;

export const ALL_VISIBLE: ProfileVisibility = {
  age: true,
  gender: true,
  experience: true,
  education: true,
  station: true,
  availableFrom: true,
  desiredHours: true,
  desiredRate: true,
  workStyle: true,
  desiredEmployment: true,
  affiliation: true,
  highlights: true,
  selfPr: true,
};

// 新しく作るシートの表示。希望単価は出したい人だけ出す。
export const DEFAULT_VISIBILITY: ProfileVisibility = { ...ALL_VISIBLE, desiredRate: false };

// 人物と希望条件。どれも自由入力。
export type ProfileTexts = {
  nameKana: string;
  nameInitials: string;
  title: string;
  availableFrom: string;
  desiredHours: string;
  desiredRate: string;
  workStyle: string;
  desiredEmployment: string;
  affiliation: string;
};

export const EMPTY_PROFILE_TEXTS: ProfileTexts = {
  nameKana: "",
  nameInitials: "",
  title: "",
  availableFrom: "",
  desiredHours: "",
  desiredRate: "",
  workStyle: "",
  desiredEmployment: "",
  affiliation: "",
};

export type Skill = {
  name: string;
  // 手で入れた経験年数。
  experience?: Duration;
  // 真なら職務経歴から数える。該当する経歴が無ければ数えない。
  auto?: boolean;
  // 真なら主要スキルとして 1 ページ目に出す。
  featured?: boolean;
};

export type SkillGroup = {
  name: string;
  skills: Skill[];
};

// ポートフォリオなどのリンク。名前が空なら URL をそのまま出す。
export type ProfileLink = {
  label: string;
  url: string;
};

export type SheetInput = {
  updatedOn: CalendarDate | null;
  // 真なら更新日を基準日（今日）にする。
  updatedAuto: boolean;
  name: string;
  nameDisplay: NameDisplay;
  age: number | null;
  gender: Gender | null;
  // 自由入力の経験年数。experienceAuto が真なら使わず職務経歴から数える。
  experience: string;
  experienceAuto: boolean;
  education: string;
  station: string;
  selfPr: string;
  visibility: ProfileVisibility;
  // 1 ページ目に出す強み。最大 MAX_HIGHLIGHTS 件。
  highlights: string[];
  qualifications: string[];
  links: ProfileLink[];
  skillGroups: SkillGroup[];
  careers: Career[];
} & ProfileTexts;

export type Duration = {
  years: number;
  months: number;
};

export type SkillYears = {
  name: string;
  duration: Duration;
  featured: boolean;
};

export type SheetView = {
  name: string;
  // 用紙に出す氏名。イニシャル表示ならイニシャル。
  displayName: string;
  // イニシャル表示のときは空。
  nameKana: string;
  age: number | null;
  gender: Gender | null;
  // 表示する経験年数。自動なら計算した値、そうでなければ自由入力。
  experience: string;
  visibility: ProfileVisibility;
  education: string;
  station: string;
  selfPr: string;
  selfPrShort: boolean;
  updatedOn: CalendarDate | null;
  skills: SkillYears[];
  recent: Career[];
  older: Career[];
  engineer: Duration;
  parallelCount: number;
  texts: ProfileTexts;
  highlights: string[];
  // 1 ページ目に出す主要スキル。選んでいなければ経験年数の長い順。
  featuredSkills: SkillYears[];
  qualifications: string[];
  links: ProfileLink[];
  hardCount: number;
  phaseCount: number;
};

export type SheetResult = { ok: true; view: SheetView } | { ok: false; error: string };
