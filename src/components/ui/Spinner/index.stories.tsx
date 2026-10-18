import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Spinner } from "./index";

const meta = {
  title: "共通部品/スピナー",
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component: "読み込みや保存の最中を示す。読み上げには status として伝える。",
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "文言つき",
  args: { label: "保存しています", children: "保存しています", size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("保存しています");
  },
};

export const IconOnly: Story = {
  name: "アイコンだけ",
  args: { label: "読み込んでいます" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "読み込んでいます" })).toBeVisible();
  },
};
