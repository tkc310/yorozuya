import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { createFixtureSheet } from "../../../../shared/features/skill-sheet/sheet";
import { SkillPreview } from "./preview";

const meta = {
  title: "スキルシート/プレビュー",
  component: SkillPreview,
  parameters: {
    docs: {
      description: {
        component: "右の書類。年数は期間から計算し、直近3件だけを長く出す。",
      },
    },
  },
} satisfies Meta<typeof SkillPreview>;

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
    await expect(canvas.getByRole("heading", { name: "山田" })).toBeVisible();
    await expect(canvas.getByText("エンジニア経験 3年6ヶ月")).toBeVisible();
    await expect(canvas.getByText("Typescript 3年")).toBeVisible();
    await expect(canvas.getByText("Go 6ヶ月")).toBeVisible();
  },
};
