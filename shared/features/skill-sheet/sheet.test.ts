import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ALL_VISIBLE,
  EMPTY_PROFILE_TEXTS,
  PHASES,
  addCareer,
  addSkill,
  createFixtureSheet,
  detailSummaryOf,
  formatDate,
  formatDuration,
  normalizePhase,
  present,
  removeCareer,
  removeSkill,
  skillInCareers,
  updateSkillExperience,
  type Career,
  type SheetInput,
  type SheetResult,
  type SheetView,
  type YearMonth,
} from "./sheet.ts";

const calculatedOn: YearMonth = { year: 2026, month: 10 };

function viewOf(result: SheetResult): SheetView {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.view;
}

function career(input: Pick<Career, "id" | "period"> & Partial<Career>): Career {
  return {
    projectName: "案件",
    summary: "月次処理の流れを整理した。",
    detailSummary: "",
    work: "画面とAPIを実装し、結合テストまで担当した。",
    outcome: "手作業の転記を自動化した。",
    role: "エンジニア",
    employment: "業務委託",
    environment: [],
    team: "4名",
    methodology: "スクラム",
    tools: ["Git"],
    phases: [],
    hard: false,
    ...input,
  };
}

function sheet(careers: Career[], extra?: Partial<SheetInput>): SheetInput {
  return {
    updatedOn: null,
    updatedAuto: false,
    name: "山田",
    age: null,
    gender: null,
    experience: "",
    experienceAuto: true,
    visibility: { ...ALL_VISIBLE },
    links: [],
    education: "学士",
    station: "相模原",
    selfPr: "設計と実装を担当。",
    ...EMPTY_PROFILE_TEXTS,
    skillGroups: [],
    careers,
    ...extra,
  };
}

describe("スキルシート", () => {
  it("直近3件と、それより前を分ける", () => {
    const view = viewOf(present(createFixtureSheet(), calculatedOn));
    expect(view.recent).toHaveLength(3);
    expect(view.older).toHaveLength(2);
    expect(view.recent.map((item) => item.period.start)).toEqual([
      { year: 2024, month: 6 },
      { year: 2024, month: 1 },
      { year: 2023, month: 1 },
    ]);
    expect(view.older.map((item) => item.period.start)).toEqual([
      { year: 2022, month: 6 },
      { year: 2022, month: 1 },
    ]);
  });

  it("重なった月を1回にして3年6ヶ月にする", () => {
    const fixture = createFixtureSheet();
    const view = viewOf(present(fixture, calculatedOn));
    const outer = viewOf(
      present(
        {
          ...fixture,
          careers: fixture.careers.filter((item) => item.environment.length > 0),
        },
        calculatedOn,
      ),
    );
    expect(view.engineer).toEqual({ years: 3, months: 6 });
    expect(view.engineer).toEqual(outer.engineer);
    expect(formatDuration(view.engineer)).toBe("3年6ヶ月");
  });

  it("部分的な重なりと空きを月数にする", () => {
    const overlap = viewOf(
      present(
        sheet([
          career({
            id: "left",
            period: { start: { year: 2022, month: 1 }, end: { year: 2023, month: 1 } },
          }),
          career({
            id: "right",
            period: { start: { year: 2022, month: 7 }, end: { year: 2023, month: 7 } },
          }),
        ]),
        calculatedOn,
      ),
    );
    const gap = viewOf(
      present(
        sheet([
          career({
            id: "early",
            period: { start: { year: 2022, month: 1 }, end: { year: 2022, month: 7 } },
          }),
          career({
            id: "late",
            period: { start: { year: 2023, month: 1 }, end: { year: 2023, month: 7 } },
          }),
        ]),
        calculatedOn,
      ),
    );
    expect(overlap.engineer).toEqual({ years: 1, months: 6 });
    expect(gap.engineer).toEqual({ years: 1, months: 0 });
    expect(formatDuration(gap.engineer)).toBe("1年");
  });

  it("Typescript を3年、Go を6ヶ月にする", () => {
    const view = viewOf(present(createFixtureSheet(), calculatedOn));
    const typescript = view.skills.find((item) => item.name === "Typescript");
    const go = view.skills.find((item) => item.name === "Go");
    expect(typescript?.duration).toEqual({ years: 3, months: 0 });
    expect(go?.duration).toEqual({ years: 0, months: 6 });
    expect(formatDuration(typescript?.duration ?? { years: 0, months: 0 })).toBe("3年");
    expect(formatDuration(go?.duration ?? { years: 0, months: 0 })).toBe("6ヶ月");
  });

  it("技術名は空白を除いた完全一致", () => {
    const view = viewOf(
      present(
        sheet(
          [
            career({
              id: "padded",
              period: { start: { year: 2022, month: 1 }, end: { year: 2023, month: 1 } },
              environment: [" Typescript "],
            }),
          ],
          {
            skillGroups: [
              {
                name: "言語",
                skills: [
                  { name: "Typescript", auto: true },
                  { name: "typescript", auto: true },
                ],
              },
            ],
          },
        ),
        calculatedOn,
      ),
    );
    expect(view.skills.find((item) => item.name === "Typescript")?.duration).toEqual({
      years: 1,
      months: 0,
    });
    expect(view.skills.find((item) => item.name === "typescript")?.duration).toEqual({
      years: 0,
      months: 0,
    });
    expect(formatDuration({ years: 0, months: 0 })).toBe("0ヶ月");
  });

  it("進行中の終了月は更新日、無ければ計算日", () => {
    const openCareer = career({
      id: "open",
      period: { start: { year: 2024, month: 1 }, end: null },
    });
    const fromUpdate = viewOf(
      present(sheet([openCareer], { updatedOn: { year: 2024, month: 7, day: 1 } }), calculatedOn),
    );
    const fromClock = viewOf(present(sheet([openCareer]), { year: 2024, month: 7 }));
    expect(fromUpdate.engineer).toEqual({ years: 0, months: 6 });
    expect(fromClock.engineer).toEqual({ years: 0, months: 6 });
  });

  it("経歴を追加し、削除すると年数を戻す", () => {
    const base = createFixtureSheet();
    const added = addCareer(
      base,
      career({
        id: "extra",
        period: { start: { year: 2026, month: 1 }, end: { year: 2026, month: 7 } },
        environment: ["Go"],
      }),
    );
    const addedView = viewOf(present(added, calculatedOn));
    const goCareer = base.careers.find((item) => item.environment.includes("Go"));
    expect(goCareer).toBeDefined();
    if (!goCareer) {
      return;
    }
    const removed = removeCareer(added, "extra");
    const withoutGo = removeCareer(base, goCareer.id);
    const withoutGoView = viewOf(present(withoutGo, calculatedOn));

    expect(base.careers).toHaveLength(5);
    expect(added.careers).toHaveLength(6);
    expect(addedView.engineer).toEqual({ years: 4, months: 0 });
    expect(addedView.skills.find((item) => item.name === "Go")?.duration).toEqual({
      years: 1,
      months: 0,
    });
    expect(removed.careers).toHaveLength(5);
    expect(viewOf(present(removed, calculatedOn)).engineer).toEqual({ years: 3, months: 6 });
    expect(withoutGoView.engineer).toEqual({ years: 3, months: 0 });
    expect(withoutGoView.skills.find((item) => item.name === "Go")?.duration).toEqual({
      years: 0,
      months: 0,
    });
    expect(withoutGo.careers.some((item) => item.environment.includes("Go"))).toBe(false);
  });

  it("氏名が無いと失敗する", () => {
    const blank = present({ ...createFixtureSheet(), name: "  " }, calculatedOn);
    expect(blank).toEqual({ ok: false, error: "氏名がありません" });
  });

  it("案件がゼロなら経験は0ヶ月", () => {
    const view = viewOf(present({ ...createFixtureSheet(), careers: [] }, calculatedOn));
    expect(view.recent).toHaveLength(0);
    expect(view.older).toHaveLength(0);
    expect(view.engineer).toEqual({ years: 0, months: 0 });
    expect(formatDuration(view.engineer)).toBe("0ヶ月");
    expect(view.skills.find((item) => item.name === "Typescript")?.duration).toEqual({
      years: 0,
      months: 0,
    });
  });

  it("フィクスチャは氏名、短い自己紹介、並行する期間、難度、7工程を持つ", () => {
    const view = viewOf(present(createFixtureSheet(), calculatedOn));
    expect(view.name).toBe("山田");
    expect(view.station).toBe("相模原");
    expect(view.selfPrShort).toBe(true);
    expect(view.parallelCount).toBe(4);
    expect(view.hardCount).toBe(1);
    expect(view.phaseCount).toBe(PHASES.length);
    expect(PHASES).toHaveLength(8);
  });

  it("技術を消しても経歴の環境は残る", () => {
    const base = createFixtureSheet();
    const removed = removeSkill(base, "Go");
    const view = viewOf(present(removed, calculatedOn));
    const added = addSkill(removed, "言語", "Rust");
    const addedView = viewOf(present(added, calculatedOn));
    expect(view.skills.map((item) => item.name)).not.toContain("Go");
    expect(removed.careers.some((item) => item.environment.includes("Go"))).toBe(true);
    expect(addedView.skills.find((item) => item.name === "Rust")?.duration).toEqual({
      years: 0,
      months: 0,
    });
  });

  it("経験年数を入れた技術はその年数を使い、入れない技術は経歴から数える", () => {
    const added = addSkill(createFixtureSheet(), "言語", "Node.js", { years: 5, months: 3 });
    const view = viewOf(present(added, calculatedOn));
    expect(view.skills.find((item) => item.name === "Node.js")?.duration).toEqual({
      years: 5,
      months: 3,
    });
    expect(view.skills.find((item) => item.name === "Go")?.duration).toEqual({
      years: 0,
      months: 6,
    });
  });

  it("自動計算を切ると手入力の年数を使い、入れると職務経歴から数える", () => {
    const base = createFixtureSheet();
    const goOf = (sheet: SheetInput) =>
      viewOf(present(sheet, calculatedOn)).skills.find((item) => item.name === "Go")?.duration;
    const manual = updateSkillExperience(base, "Go", { years: 2, months: 0 }, false);
    expect(goOf(manual)).toEqual({ years: 2, months: 0 });
    const auto = updateSkillExperience(manual, "Go", { years: 2, months: 0 }, true);
    expect(goOf(auto)).toEqual({ years: 0, months: 6 });
    const empty = updateSkillExperience(base, "Go", null, false);
    expect(goOf(empty)).toEqual({ years: 0, months: 0 });
    const zero = updateSkillExperience(manual, "Go", { years: 0, months: 0 }, false);
    expect(zero.skillGroups[0]?.skills.find((item) => item.name === "Go")?.experience).toBe(
      undefined,
    );
  });

  it("経歴の環境に無い技術は自動計算できない", () => {
    const base = createFixtureSheet();
    expect(skillInCareers(base.careers, "Go")).toBe(true);
    expect(skillInCareers(base.careers, "Node.js")).toBe(false);
  });

  it("経験年数は自動計算なら職務経歴から数え、切れば自由入力を使う", () => {
    const base = { ...createFixtureSheet(), experience: "10年以上" };
    expect(viewOf(present(base, calculatedOn)).experience).toBe("3年6ヶ月");
    const manual = { ...base, experienceAuto: false };
    expect(viewOf(present(manual, calculatedOn)).experience).toBe("10年以上");
    expect(viewOf(present(manual, calculatedOn)).engineer).toEqual({ years: 3, months: 6 });
  });

  it("年齢と性別を表示用に渡す", () => {
    const view = viewOf(present(createFixtureSheet(), calculatedOn));
    expect(view.age).toBe(35);
    expect(view.gender).toBe("男性");
    expect(view.visibility).toEqual(ALL_VISIBLE);
  });

  it("更新日を自動にすると基準日を更新日にし、切れば入力した日を使う", () => {
    const base = createFixtureSheet();
    const today = { year: 2026, month: 11, day: 17 };
    expect(viewOf(present(base, today)).updatedOn).toEqual({ year: 2026, month: 10, day: 1 });
    const auto = { ...base, updatedAuto: true };
    expect(viewOf(present(auto, today)).updatedOn).toEqual(today);
    expect(viewOf(present(auto, { year: 2026, month: 11 })).updatedOn).toEqual({
      year: 2026,
      month: 11,
      day: 1,
    });
    expect(formatDate(today)).toBe("2026年11月17日");
  });

  it("詳細用の概要が空なら一覧用の概要を使う", () => {
    const base = career({ id: "c", period: { start: { year: 2024, month: 1 }, end: null } });
    expect(detailSummaryOf(base)).toBe(base.summary);
    expect(detailSummaryOf({ ...base, detailSummary: "詳しい説明" })).toBe("詳しい説明");
  });

  it("期間が重なる経歴を並行として数える", () => {
    const first = career({
      id: "a",
      period: { start: { year: 2024, month: 1 }, end: { year: 2024, month: 6 } },
    });
    const second = career({
      id: "b",
      period: { start: { year: 2024, month: 3 }, end: { year: 2024, month: 9 } },
    });
    const third = career({
      id: "c",
      period: { start: { year: 2024, month: 9 }, end: { year: 2024, month: 12 } },
    });
    expect(viewOf(present(sheet([first, second, third]), calculatedOn)).parallelCount).toBe(2);
  });

  it("以前の工程名を今の名前に置き換える", () => {
    expect(normalizePhase("単テスト")).toBe("ユニットテスト");
    expect(normalizePhase("結テスト")).toBe("結合テスト");
    expect(normalizePhase("総テスト")).toBe("E2Eテスト");
    expect(normalizePhase("e2eテスト")).toBe("E2Eテスト");
    expect(normalizePhase("保守")).toBe("保守運用");
    expect(normalizePhase("実装")).toBe("実装");
  });

  it("シートの実装は禁止されたモジュールを import しない", () => {
    const source = readFileSync(new URL("./sheet.ts", import.meta.url), "utf8");
    const banned = [
      "react",
      "drizzle-orm",
      "@libsql/client",
      "neverthrow",
      "@tanstack/",
      "src/server",
      "src/lib",
    ];
    for (const name of banned) {
      expect(source.includes(name)).toBe(false);
    }
  });
});
