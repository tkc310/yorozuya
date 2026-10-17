import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./index";

const meta = {
  title: "共通部品/入力",
  component: Input,
  parameters: {
    docs: {
      description: {
        component: "1行の文字入力。氏名や技術名に使う。",
      },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "空欄",
  args: {
    "aria-label": "氏名",
  },
};
