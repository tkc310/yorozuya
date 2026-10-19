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

// 以前の工程名。書き出した JSON を読み込むときに今の名前へ置き換える。
const LEGACY_PHASES: Record<string, Phase> = {
  単テスト: "ユニットテスト",
  結テスト: "結合テスト",
  総テスト: "E2Eテスト",
  e2eテスト: "E2Eテスト",
  テスト: "ユニットテスト",
  運用: "保守運用",
  保守: "保守運用",
};

export function normalizePhase(value: string): string {
  return LEGACY_PHASES[value] ?? value;
}

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

export function toSheetFile(sheet: SheetInput, exportedAt: Date): SheetFile {
  return {
    kind: SHEET_FILE_KIND,
    version: SHEET_FILE_VERSION,
    exportedAt: exportedAt.toISOString(),
    sheet,
  };
}

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

const RECENT_CAREER_COUNT = 3;

type Span = {
  start: number;
  end: number;
};

function monthIndex(value: YearMonth): number {
  return value.year * 12 + value.month - 1;
}

function resolveEnd(period: Period, updatedOn: YearMonth | null, calculatedOn: YearMonth): number {
  return monthIndex(period.end ?? updatedOn ?? calculatedOn);
}

function mergedMonths(spans: Span[]): number {
  const ordered = spans
    .filter((span) => span.end > span.start)
    .sort((left, right) => left.start - right.start || left.end - right.end);
  let total = 0;
  let current: Span | undefined;
  for (const span of ordered) {
    if (!current || span.start > current.end) {
      if (current) {
        total += current.end - current.start;
      }
      current = { start: span.start, end: span.end };
    } else if (span.end > current.end) {
      current = { start: current.start, end: span.end };
    }
  }
  if (current) {
    total += current.end - current.start;
  }
  return total;
}

function careerSpans(
  careers: Career[],
  updatedOn: YearMonth | null,
  calculatedOn: YearMonth,
): Span[] {
  return careers.map((item) => ({
    start: monthIndex(item.period.start),
    end: resolveEnd(item.period, updatedOn, calculatedOn),
  }));
}

function toDuration(totalMonths: number): Duration {
  const months = Math.max(0, totalMonths);
  return { years: Math.floor(months / 12), months: months % 12 };
}

function careerHasSkill(career: Career, skillName: string): boolean {
  const needle = skillName.trim();
  return career.environment.some((item) => item.trim() === needle);
}

// 経歴の環境にその技術があれば、自動計算できる。
export function skillInCareers(careers: Career[], skillName: string): boolean {
  return careers.some((item) => careerHasSkill(item, skillName));
}

function skillYears(input: SheetInput, calculatedOn: YearMonth): SkillYears[] {
  const seen = new Set<string>();
  const skills: SkillYears[] = [];
  for (const group of input.skillGroups) {
    for (const skill of group.skills) {
      const name = skill.name.trim();
      if (name.length === 0 || seen.has(name)) {
        continue;
      }
      seen.add(name);
      const featured = Boolean(skill.featured);
      if (!skill.auto) {
        skills.push({ name, duration: skill.experience ?? { years: 0, months: 0 }, featured });
        continue;
      }
      const matched = input.careers.filter((item) => careerHasSkill(item, name));
      skills.push({
        name,
        duration: toDuration(mergedMonths(careerSpans(matched, input.updatedOn, calculatedOn))),
        featured,
      });
    }
  }
  return skills;
}

// 経験年数の長い順。同じ長さなら元の並びのまま。
export function byDuration<T extends { duration: Duration }>(items: T[]): T[] {
  return [...items].sort((left, right) => durationMonths(right.duration) - durationMonths(left.duration));
}

// 主要スキル。選んだものが無ければ、経験年数の長いものから決まった件数を出す。
function featuredSkills(skills: SkillYears[]): SkillYears[] {
  const chosen = skills.filter((skill) => skill.featured);
  if (chosen.length > 0) {
    return byDuration(chosen).slice(0, MAX_FEATURED_SKILLS);
  }
  return byDuration(skills.filter((skill) => durationMonths(skill.duration) > 0)).slice(
    0,
    FALLBACK_FEATURED_SKILLS,
  );
}

function engineerYears(input: SheetInput, calculatedOn: YearMonth): Duration {
  return toDuration(mergedMonths(careerSpans(input.careers, input.updatedOn, calculatedOn)));
}

export function isGender(value: string): value is Gender {
  return (GENDERS as readonly string[]).includes(value);
}

function isSelfPrShort(input: SheetInput): boolean {
  const text = input.selfPr.trim();
  if (text.length === 0 || input.careers.length === 0) {
    return false;
  }
  let longest = 0;
  for (const item of input.careers) {
    longest = Math.max(longest, item.summary.length, item.work.length, item.outcome.length);
  }
  return text.length < longest;
}

// 期間が他の経歴と重なる経歴の数。重なりは並行していた案件とみなす。
function parallelCount(input: SheetInput, calculatedOn: YearMonth): number {
  const spans = careerSpans(input.careers, input.updatedOn, calculatedOn);
  return spans.filter((span, index) =>
    spans.some(
      (other, otherIndex) =>
        otherIndex !== index && span.start < other.end && other.start < span.end,
    ),
  ).length;
}

function phaseCount(careers: Career[]): number {
  const found = new Set<Phase>();
  for (const career of careers) {
    for (const phase of career.phases) {
      found.add(phase);
    }
  }
  return found.size;
}

function compareRecent(updatedOn: YearMonth | null, calculatedOn: YearMonth) {
  return (left: Career, right: Career) => {
    const byStart = monthIndex(right.period.start) - monthIndex(left.period.start);
    if (byStart !== 0) {
      return byStart;
    }
    return (
      resolveEnd(right.period, updatedOn, calculatedOn) -
      resolveEnd(left.period, updatedOn, calculatedOn)
    );
  };
}

// 職務経歴の一覧の並び（開始が新しい順）。番号はこの並びで振る。
export function orderCareers(input: SheetInput, calculatedOn: CalculatedOn): Career[] {
  return [...input.careers].sort(compareRecent(input.updatedOn, calculatedOn));
}

export function formatDuration(duration: Duration): string {
  if (duration.years === 0) {
    return `${duration.months}ヶ月`;
  }
  if (duration.months === 0) {
    return `${duration.years}年`;
  }
  return `${duration.years}年${duration.months}ヶ月`;
}

// 保有技術の年数。選考ではヶ月まで要らないので 0.5 年刻みにする。0 なら空。
export function formatSkillYears(duration: Duration): string {
  const months = durationMonths(duration);
  if (months <= 0) {
    return "";
  }
  if (months < 12) {
    return "1年未満";
  }
  return `${Math.floor(months / 6) / 2}年`;
}

// 期間の書き方（2024/01）。表で幅を取らないよう数字だけにする。
export function formatYearMonth(value: YearMonth): string {
  return `${value.year}/${String(value.month).padStart(2, "0")}`;
}

export function durationToken(duration: Duration): string {
  if (duration.years === 0) {
    return `${duration.months}m`;
  }
  if (duration.months === 0) {
    return `${duration.years}y`;
  }
  return `${duration.years}y${duration.months}m`;
}

export function addCareer(sheet: SheetInput, career: Career): SheetInput {
  return { ...sheet, careers: [...sheet.careers, career] };
}

// 詳細に出す概要。詳細用が空なら一覧用を使う。
export function detailSummaryOf(career: Career): string {
  return career.detailSummary.trim().length > 0 ? career.detailSummary : career.summary;
}

export function updateCareer(sheet: SheetInput, career: Career): SheetInput {
  return {
    ...sheet,
    careers: sheet.careers.map((item) => (item.id === career.id ? career : item)),
  };
}

export function removeCareer(sheet: SheetInput, careerId: string): SheetInput {
  return { ...sheet, careers: sheet.careers.filter((item) => item.id !== careerId) };
}

export function durationMonths(duration: Duration): number {
  return duration.years * 12 + duration.months;
}

export function fromMonths(totalMonths: number): Duration {
  return toDuration(totalMonths);
}

function skillOf(
  name: string,
  experience: Duration | null,
  auto: boolean,
  featured = false,
): Skill {
  const base: Skill = { name, ...(auto ? { auto } : {}), ...(featured ? { featured } : {}) };
  if (!experience || durationMonths(experience) <= 0) {
    return base;
  }
  return { ...base, experience };
}

export function addSkill(
  sheet: SheetInput,
  groupName: string,
  skillName: string,
  experience: Duration | null = null,
  auto = false,
): SheetInput {
  const name = skillName.trim();
  if (name.length === 0) {
    return sheet;
  }
  const already = sheet.skillGroups.some((group) =>
    group.skills.some((skill) => skill.name.trim() === name),
  );
  if (already) {
    return sheet;
  }
  let found = false;
  const skillGroups = sheet.skillGroups.map((group) => {
    if (group.name !== groupName) {
      return group;
    }
    found = true;
    return { ...group, skills: [...group.skills, skillOf(name, experience, auto)] };
  });
  if (!found) {
    skillGroups.push({ name: groupName, skills: [skillOf(name, experience, auto)] });
  }
  return { ...sheet, skillGroups };
}

export function updateSkillExperience(
  sheet: SheetInput,
  skillName: string,
  experience: Duration | null,
  auto: boolean,
): SheetInput {
  const name = skillName.trim();
  return {
    ...sheet,
    skillGroups: sheet.skillGroups.map((group) => ({
      ...group,
      skills: group.skills.map((skill) =>
        skill.name.trim() === name
          ? skillOf(skill.name, experience, auto, Boolean(skill.featured))
          : skill,
      ),
    })),
  };
}

export function featuredCount(sheet: SheetInput): number {
  return sheet.skillGroups.reduce(
    (total, group) => total + group.skills.filter((skill) => skill.featured).length,
    0,
  );
}

// 主要スキルにするか切り替える。上限を超えるときは変えない。
export function setSkillFeatured(
  sheet: SheetInput,
  skillName: string,
  featured: boolean,
): SheetInput {
  const name = skillName.trim();
  if (featured && featuredCount(sheet) >= MAX_FEATURED_SKILLS) {
    return sheet;
  }
  return {
    ...sheet,
    skillGroups: sheet.skillGroups.map((group) => ({
      ...group,
      skills: group.skills.map((skill) =>
        skill.name.trim() === name
          ? skillOf(skill.name, skill.experience ?? null, Boolean(skill.auto), featured)
          : skill,
      ),
    })),
  };
}

// 以前の「得意な技術」「得意な業務」をハイライトに移す。空のものは捨てる。
export function legacyHighlights(strongSkills: string, strongWork: string): string[] {
  return [strongSkills, strongWork]
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .slice(0, MAX_HIGHLIGHTS);
}

// 空のハイライトを除き、上限までにする。
export function cleanHighlights(highlights: string[]): string[] {
  return highlights
    .map((text) => text.trim())
    .filter((text) => text.length > 0)
    .slice(0, MAX_HIGHLIGHTS);
}

export function displayNameOf(input: Pick<SheetInput, "name" | "nameDisplay" | "nameInitials">) {
  const initials = input.nameInitials.trim();
  return input.nameDisplay === "initials" && initials.length > 0 ? initials : input.name.trim();
}

export function removeSkill(sheet: SheetInput, skillName: string): SheetInput {
  const name = skillName.trim();
  return {
    ...sheet,
    skillGroups: sheet.skillGroups
      .map((group) => ({
        ...group,
        skills: group.skills.filter((skill) => skill.name.trim() !== name),
      }))
      .filter((group) => group.skills.length > 0),
  };
}

function effectiveUpdatedOn(input: SheetInput, calculatedOn: CalculatedOn): CalendarDate | null {
  if (!input.updatedAuto) {
    return input.updatedOn;
  }
  return { year: calculatedOn.year, month: calculatedOn.month, day: calculatedOn.day ?? 1 };
}

export function formatDate(value: CalendarDate): string {
  return `${value.year}年${value.month}月${value.day}日`;
}

// 用紙に出す日付（2026/10/18）。
export function formatSlashDate(value: CalendarDate): string {
  return `${formatYearMonth(value)}/${String(value.day).padStart(2, "0")}`;
}

export function present(source: SheetInput, calculatedOn: CalculatedOn): SheetResult {
  const input: SheetInput = { ...source, updatedOn: effectiveUpdatedOn(source, calculatedOn) };
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, error: "氏名がありません" };
  }
  const ordered = orderCareers(input, calculatedOn);
  const skills = skillYears(input, calculatedOn);
  const initials = displayNameOf(input) !== name;
  return {
    ok: true,
    view: {
      name,
      displayName: displayNameOf(input),
      nameKana: initials ? "" : input.nameKana.trim(),
      age: input.age,
      gender: input.gender,
      experience: input.experienceAuto
        ? formatDuration(engineerYears(input, calculatedOn))
        : input.experience.trim(),
      visibility: input.visibility,
      education: input.education,
      station: input.station,
      selfPr: input.selfPr,
      selfPrShort: isSelfPrShort(input),
      links: input.links,
      texts: {
        nameKana: input.nameKana,
        nameInitials: input.nameInitials,
        title: input.title,
        availableFrom: input.availableFrom,
        desiredHours: input.desiredHours,
        desiredRate: input.desiredRate,
        workStyle: input.workStyle,
        desiredEmployment: input.desiredEmployment,
        affiliation: input.affiliation,
      },
      highlights: cleanHighlights(input.highlights),
      featuredSkills: featuredSkills(skills),
      qualifications: input.qualifications.map((item) => item.trim()).filter(Boolean),
      updatedOn: input.updatedOn,
      skills,
      recent: ordered.slice(0, RECENT_CAREER_COUNT),
      older: ordered.slice(RECENT_CAREER_COUNT),
      engineer: engineerYears(input, calculatedOn),
      parallelCount: parallelCount(input, calculatedOn),
      hardCount: input.careers.filter((item) => item.hard).length,
      phaseCount: phaseCount(input.careers),
    },
  };
}

function fixtureCareer(
  input: Pick<Career, "id" | "period" | "projectName" | "environment"> &
    Partial<Pick<Career, "phases" | "hard">>,
): Career {
  return {
    id: input.id,
    period: input.period,
    projectName: input.projectName,
    summary: "月次処理の流れを整理した。",
    detailSummary: "",
    work: "画面とAPIを実装し、結合テストまで担当した。",
    outcome: "手作業の転記を自動化した。",
    role: "エンジニア",
    employment: "業務委託",
    environment: input.environment,
    team: "4名",
    methodology: "スクラム",
    tools: ["Git"],
    phases: input.phases ?? [],
    hard: input.hard ?? false,
  };
}

export function createFixtureSheet(): SheetInput {
  return {
    updatedOn: { year: 2026, month: 10, day: 1 },
    updatedAuto: false,
    name: "新究羅 理定",
    nameDisplay: "full",
    age: 35,
    gender: "男性",
    experience: "",
    experienceAuto: true,
    visibility: { ...ALL_VISIBLE },
    highlights: ["受注から在庫までの業務システムを、設計から実装まで担当"],
    qualifications: [],
    links: [],
    education: "学士",
    station: "相模原",
    selfPr: "設計と実装を担当。",
    ...EMPTY_PROFILE_TEXTS,
    nameKana: "シンギュラ リティ",
    title: "Webエンジニア",
    availableFrom: "即日",
    desiredHours: "週5日",
    workStyle: "リモート中心",
    desiredEmployment: "業務委託",
    skillGroups: [
      {
        name: "言語",
        skills: [
          { name: "Typescript", auto: true },
          { name: "Go", auto: true },
        ],
      },
    ],
    careers: [
      fixtureCareer({
        id: "career-2022-ts",
        projectName: "受注管理",
        period: { start: { year: 2022, month: 1 }, end: { year: 2023, month: 1 } },
        environment: ["Typescript"],
        phases: [...PHASES],
      }),
      fixtureCareer({
        id: "career-2023-go",
        projectName: "在庫照会",
        period: { start: { year: 2023, month: 1 }, end: { year: 2023, month: 7 } },
        environment: ["Go"],
      }),
      fixtureCareer({
        id: "career-2024-ts",
        projectName: "会員基盤",
        period: { start: { year: 2024, month: 1 }, end: { year: 2026, month: 1 } },
        environment: ["Typescript"],
        hard: true,
      }),
      fixtureCareer({
        id: "career-2024-inner",
        projectName: "帳票出力",
        period: { start: { year: 2024, month: 6 }, end: { year: 2025, month: 1 } },
        environment: [],
      }),
      fixtureCareer({
        id: "career-2022-inner",
        projectName: "認証改修",
        period: { start: { year: 2022, month: 6 }, end: { year: 2022, month: 12 } },
        environment: [],
      }),
    ],
  };
}

// 選考で見られやすいのに空の項目。フォームの上に注意として出す。
export function sheetWarnings(input: SheetInput): string[] {
  const warnings: string[] = [];
  if (input.title.trim().length === 0) {
    warnings.push("肩書が未入力です");
  }
  if (input.visibility.availableFrom && input.availableFrom.trim().length === 0) {
    warnings.push("稼働開始が未入力です");
  }
  if (input.visibility.highlights && cleanHighlights(input.highlights).length === 0) {
    warnings.push("ハイライトが未入力です");
  }
  if (featuredCount(input) === 0) {
    warnings.push("主要スキルが選ばれていません（経験年数の長い順に出します）");
  }
  const withoutOutcome = input.careers.filter((career) => career.outcome.trim().length === 0);
  if (withoutOutcome.length > 0) {
    warnings.push(`成果が空の案件が${withoutOutcome.length}件あります`);
  }
  if ([...input.selfPr.trim()].length > SELF_PR_GUIDE_LENGTH) {
    warnings.push(`自己PRが目安の${SELF_PR_GUIDE_LENGTH}字を超えています`);
  }
  const longSummaries = input.careers.filter(
    (career) => [...career.summary.trim()].length > CAREER_SUMMARY_GUIDE_LENGTH,
  );
  if (longSummaries.length > 0) {
    warnings.push(
      `一覧用の概要が目安の${CAREER_SUMMARY_GUIDE_LENGTH}字を超えている案件が${longSummaries.length}件あります`,
    );
  }
  return warnings;
}
