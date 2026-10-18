import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SkillSheetSkeleton } from "./index";

const meta = {
  title: "スキルシート/読み込み中",
  component: SkillSheetSkeleton,
  parameters: {
    docs: {
      description: {
        component: "シートを読み込むあいだのスケルトン。フォームとプレビューの形だけを先に出す。",
      },
    },
  },
} satisfies Meta<typeof SkillSheetSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "スケルトン",
  args: { breadcrumb: <span>トップ / スキルシート</span> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("シートを読み込んでいます");
    await expect(canvas.getByText("トップ / スキルシート")).toBeVisible();
  },
};
