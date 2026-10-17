import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "共通部品/複数行入力",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: "自己PRや案件の文章に使う複数行の入力。",
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "空欄",
  args: {
    "aria-label": "自己PR",
  },
};
