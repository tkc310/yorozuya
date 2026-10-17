import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { createFixtureSheet } from "@/shared/features/skill-sheet/sheet";
import { Preview } from "./index";

const meta = {
  title: "スキルシート/プレビュー",
  component: Preview,
  parameters: {
    docs: {
      description: {
        component:
          "右の書類。A4 で印刷できる表組みにする。年数は期間から計算し、詳細は全件を出す。",
      },
    },
  },
} satisfies Meta<typeof Preview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "山田",
  args: {
    sheet: createFixtureSheet(),
    calculatedOn: { year: 2026, month: 10 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "スキルシート" })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "山田" })).toBeVisible();
    await expect(canvas.getByText("3年6ヶ月")).toBeVisible();
    await expect(canvas.getByText("Typescript: 3年 / Go: 6ヶ月")).toBeVisible();
    await expect(canvas.getAllByRole("row")).toHaveLength(14);
    for (const name of ["基本情報", "職務経歴の一覧", "職務経歴の詳細"]) {
      await expect(canvas.getByRole("heading", { name, level: 3 })).toBeVisible();
    }
    await expect(canvas.getAllByRole("article")).toHaveLength(5);
    await expect(canvas.getByText(/並行していた案件になります/)).toBeVisible();
    await expect(canvas.getByText(/企業・案件名の末尾に \(※\) と記載しています/)).toBeVisible();
  },
};

// 期間の重なりも高難易度の経歴も無ければ、注記は出さない。
const single = createFixtureSheet();

export const WithLinks: Story = {
  name: "リンクあり",
  args: {
    sheet: {
      ...createFixtureSheet(),
      links: [
        { label: "GitHub", url: "https://github.com/example" },
        { label: "", url: "https://example.com/portfolio" },
      ],
    },
    calculatedOn: { year: 2026, month: 10 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("rowheader", { name: "GitHub" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "https://example.com/portfolio" })).toBeVisible();
    await expect(canvas.getByRole("rowheader", { name: "リンク" })).toBeVisible();
  },
};

export const WithoutNotes: Story = {
  name: "注記なし",
  args: {
    sheet: {
      ...single,
      careers: single.careers
        .filter((career) => career.id === "career-2023-go")
        .map((career) => ({ ...career, hard: false })),
    },
    calculatedOn: { year: 2026, month: 10 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/並行していた案件になります/)).toBeNull();
    await expect(canvas.queryByText(/と記載しています/)).toBeNull();
  },
};
