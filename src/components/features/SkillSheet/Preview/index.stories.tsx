import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { type SheetInput } from "@/src/shared/features/skill-sheet/sheet.schema";
import { createFixtureSheet } from "@/src/shared/features/skill-sheet/skill.service";
import { Preview } from "./index";

const meta = {
  title: "スキルシート/プレビュー",
  component: Preview,
  parameters: {
    docs: {
      description: {
        component:
          "右の書類。A4 で印刷できる。上から人物・基本情報・強み・保有技術・資格とリンク・自己PR・職務経歴サマリー・職務経歴詳細の順に並べる。",
      },
    },
  },
} satisfies Meta<typeof Preview>;

export default meta;

type Story = StoryObj<typeof meta>;

const calculatedOn = { year: 2026, month: 10 };

function withSkills(sheet: SheetInput): SheetInput {
  return {
    ...sheet,
    skillGroups: [
      {
        name: "言語",
        skills: [
          { name: "Typescript", auto: true, featured: true },
          { name: "Go", auto: true },
        ],
      },
    ],
  };
}

export const Example: Story = {
  name: "見本",
  args: {
    sheet: withSkills(createFixtureSheet()),
    calculatedOn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // 氏名の横にフリガナを括弧書きで出す。
    const name = canvas.getByRole("heading", { name: /^新究羅 理定/, level: 2 });
    await expect(name).toHaveTextContent("新究羅 理定（シンギュラ リティ）");
    await expect(canvas.getByText("35歳")).toBeVisible();
    await expect(canvas.getByText("経験 3年6ヶ月")).toBeVisible();
    for (const name of [
      "基本情報",
      "ハイライト",
      "主要スキル",
      "保有技術",
      "自己PR",
      "職務経歴サマリー",
      "職務経歴詳細",
    ]) {
      await expect(
        canvas.getByRole("heading", { name: new RegExp(`^${name}`), level: 3 }),
      ).toBeVisible();
    }
    // 契約形態は希望雇用形態と所属をまとめる。
    const basic = within(canvas.getByRole("region", { name: "基本情報" }));
    await expect(basic.getByText("業務委託")).toBeVisible();
    await expect(basic.getByText("リモート中心")).toBeVisible();
    // 保有技術は 0.5 年刻みで、主要スキルには「主要」タグを付ける。
    await expect(canvas.getAllByText("主要").length).toBeGreaterThan(0);
    await expect(canvas.getAllByText("3年").length).toBeGreaterThan(0);
    await expect(canvas.getByText("1年未満")).toBeVisible();
    await expect(canvas.getAllByRole("article")).toHaveLength(5);
    await expect(canvas.getByText("期間の重なりは並行案件")).toBeVisible();
    await expect(canvas.getByText("は高難易度な案件やスキルアップできた案件など")).toBeVisible();
    // 担当工程は短い名前で出す。
    await expect(canvas.getAllByText("単テ").length).toBe(5);
  },
};

export const WithLinks: Story = {
  name: "資格とリンクあり",
  args: {
    sheet: {
      ...createFixtureSheet(),
      qualifications: ["応用情報技術者試験"],
      links: [
        { label: "GitHub", url: "https://github.com/example" },
        { label: "", url: "https://example.com/portfolio" },
      ],
    },
    calculatedOn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "資格・語学", level: 3 })).toBeVisible();
    await expect(canvas.getByText("応用情報技術者試験")).toBeVisible();
    await expect(canvas.getByText("GitHub")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "https://example.com/portfolio" })).toBeVisible();
  },
};

export const Initials: Story = {
  name: "イニシャル表示",
  args: {
    sheet: { ...createFixtureSheet(), nameDisplay: "initials", nameInitials: "S.R" },
    calculatedOn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // イニシャルのときはフリガナを出さない。
    await expect(canvas.getByRole("heading", { name: "S.R", level: 2 })).toBeVisible();
    await expect(canvas.queryByText(/シンギュラ/)).toBeNull();
  },
};

const single = createFixtureSheet();

export const WithoutNotes: Story = {
  name: "注記なし",
  args: {
    sheet: {
      ...single,
      careers: single.careers
        .filter((career) => career.id === "career-2023-go")
        .map((career) => ({ ...career, hard: false })),
    },
    calculatedOn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("期間の重なりは並行案件")).toBeNull();
    await expect(canvas.queryByText("は高難易度な案件やスキルアップできた案件など")).toBeNull();
    await expect(canvas.queryByText("抜粋")).toBeNull();
  },
};

export const HiddenItems: Story = {
  name: "項目をすべて隠す",
  args: {
    sheet: {
      ...createFixtureSheet(),
      careers: [],
      highlights: [],
      selfPr: "",
      skillGroups: [],
      visibility: Object.fromEntries(
        Object.keys(createFixtureSheet().visibility).map((key) => [key, false]),
      ) as SheetInput["visibility"],
    },
    calculatedOn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("heading", { name: "基本情報" })).toBeNull();
    await expect(canvas.queryByRole("heading", { name: "ハイライト" })).toBeNull();
    await expect(canvas.queryByText("35歳")).toBeNull();
    await expect(canvas.getByText("職務経歴はありません")).toBeVisible();
  },
};
