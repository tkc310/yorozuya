import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./index";

const meta = {
  title: "共通部品/チェックボックス",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: "担当工程や進行中の印に使う。ラベルを押しても切り替わる。",
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "未選択",
  args: {
    children: "進行中",
  },
};

export const Checked: Story = {
  name: "選択",
  args: {
    children: "進行中",
    defaultChecked: true,
  },
};
