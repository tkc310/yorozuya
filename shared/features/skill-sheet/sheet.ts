export const PHASES = [
  "要件定義",
  "基本設計",
  "詳細設計",
  "実装",
  "テスト",
  "運用",
  "保守",
] as const;

export type Phase = (typeof PHASES)[number];

export type YearMonth = {
  year: number;
  month: number;
};

export type Period = {
  start: YearMonth;
  end: YearMonth | null;
};

export type Career = {
  id: string;
  period: Period;
  projectName: string;
  summary: string;
  work: string;
  outcome: string;
  role: string;
  employment: string;
  environment: string[];
  position: string;
  team: string;
  methodology: string;
  tools: string[];
  phases: Phase[];
  parallel: boolean;
  hard: boolean;
};

export type Skill = {
  name: string;
};

export type SkillGroup = {
  name: string;
  skills: Skill[];
};

export type SheetInput = {
  updatedOn: YearMonth | null;
  name: string;
  workStyle: string;
  education: string;
  station: string;
  selfPr: string;
  skillGroups: SkillGroup[];
  careers: Career[];
};

export type Duration = {
  years: number;
  months: number;
};

export type SkillYears = {
  name: string;
  duration: Duration;
};

export type SheetView = {
  name: string;
  workStyle: string;
  education: string;
  station: string;
  selfPr: string;
  selfPrShort: boolean;
  updatedOn: YearMonth | null;
  skills: SkillYears[];
  recent: Career[];
  older: Career[];
  engineer: Duration;
  parallelCount: number;
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
      const matched = input.careers.filter((item) => careerHasSkill(item, name));
      skills.push({
        name,
        duration: toDuration(mergedMonths(careerSpans(matched, input.updatedOn, calculatedOn))),
      });
    }
  }
  return skills;
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

export function formatDuration(duration: Duration): string {
  if (duration.years === 0) {
    return `${duration.months}ヶ月`;
  }
  if (duration.months === 0) {
    return `${duration.years}年`;
  }
  return `${duration.years}年${duration.months}ヶ月`;
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

export function removeCareer(sheet: SheetInput, careerId: string): SheetInput {
  return { ...sheet, careers: sheet.careers.filter((item) => item.id !== careerId) };
}

export function addSkill(sheet: SheetInput, groupName: string, skillName: string): SheetInput {
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
    return { ...group, skills: [...group.skills, { name }] };
  });
  if (!found) {
    skillGroups.push({ name: groupName, skills: [{ name }] });
  }
  return { ...sheet, skillGroups };
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

export function present(input: SheetInput, calculatedOn: YearMonth): SheetResult {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, error: "氏名がありません" };
  }
  const ordered = [...input.careers].sort(compareRecent(input.updatedOn, calculatedOn));
  return {
    ok: true,
    view: {
      name,
      workStyle: input.workStyle,
      education: input.education,
      station: input.station,
      selfPr: input.selfPr,
      selfPrShort: isSelfPrShort(input),
      updatedOn: input.updatedOn,
      skills: skillYears(input, calculatedOn),
      recent: ordered.slice(0, RECENT_CAREER_COUNT),
      older: ordered.slice(RECENT_CAREER_COUNT),
      engineer: toDuration(mergedMonths(careerSpans(input.careers, input.updatedOn, calculatedOn))),
      parallelCount: input.careers.filter((item) => item.parallel).length,
      hardCount: input.careers.filter((item) => item.hard).length,
      phaseCount: phaseCount(input.careers),
    },
  };
}

function fixtureCareer(
  input: Pick<Career, "id" | "period" | "projectName" | "environment"> &
    Partial<Pick<Career, "phases" | "parallel" | "hard">>,
): Career {
  return {
    id: input.id,
    period: input.period,
    projectName: input.projectName,
    summary: "月次処理の流れを整理した。",
    work: "画面とAPIを実装し、結合テストまで担当した。",
    outcome: "手作業の転記を自動化した。",
    role: "エンジニア",
    employment: "業務委託",
    environment: input.environment,
    position: "メンバー",
    team: "4名",
    methodology: "スクラム",
    tools: ["Git"],
    phases: input.phases ?? [],
    parallel: input.parallel ?? false,
    hard: input.hard ?? false,
  };
}

export function createFixtureSheet(): SheetInput {
  return {
    updatedOn: { year: 2026, month: 10 },
    name: "山田",
    workStyle: "業務委託",
    education: "学士",
    station: "京急長沢",
    selfPr: "設計と実装を担当。",
    skillGroups: [{ name: "言語", skills: [{ name: "Typescript" }, { name: "Go" }] }],
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
        parallel: true,
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
