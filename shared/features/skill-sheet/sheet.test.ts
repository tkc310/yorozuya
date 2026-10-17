import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PHASES,
  addCareer,
  addSkill,
  createFixtureSheet,
  formatDuration,
  present,
  removeCareer,
  removeSkill,
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
    work: "画面とAPIを実装し、結合テストまで担当した。",
    outcome: "手作業の転記を自動化した。",
    role: "エンジニア",
    employment: "業務委託",
    environment: [],
    position: "メンバー",
    team: "4名",
    methodology: "スクラム",
    tools: ["Git"],
    phases: [],
    parallel: false,
    hard: false,
    ...input,
  };
}

function sheet(careers: Career[], extra?: Partial<SheetInput>): SheetInput {
  return {
    updatedOn: null,
    name: "山田",
    workStyle: "業務委託",
    education: "学士",
    station: "相模原",
    selfPr: "設計と実装を担当。",
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
              { name: "言語", skills: [{ name: "Typescript" }, { name: "typescript" }] },
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
      present(sheet([openCareer], { updatedOn: { year: 2024, month: 7 } }), calculatedOn),
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

  it("フィクスチャは氏名、短い自己PR、並行、難度、7工程を持つ", () => {
    const view = viewOf(present(createFixtureSheet(), calculatedOn));
    expect(view.name).toBe("山田");
    expect(view.station).toBe("相模原");
    expect(view.selfPrShort).toBe(true);
    expect(view.parallelCount).toBe(1);
    expect(view.hardCount).toBe(1);
    expect(view.phaseCount).toBe(PHASES.length);
    expect(PHASES).toHaveLength(7);
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
