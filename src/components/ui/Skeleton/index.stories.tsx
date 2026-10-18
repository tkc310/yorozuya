import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { css } from "styled-system/css";
import { Skeleton } from "./index";

const meta = {
  title: "共通部品/スケルトン",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component: "読み込み中に、中身の形だけを先に見せる。読み上げには出さない。",
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "文章",
  decorators: [
    (Story) => (
      <div className={css({ display: "grid", gap: "2", maxWidth: "24rem", p: "4" })}>
        <Story />
        <Skeleton width="90%" />
        <Skeleton width="60%" />
      </div>
    ),
  ],
  args: { height: "1.5em", width: "40%" },
  play: async ({ canvasElement }) => {
    const boxes = canvasElement.querySelectorAll("[aria-hidden='true']");
    await expect(boxes.length).toBe(3);
  },
};
