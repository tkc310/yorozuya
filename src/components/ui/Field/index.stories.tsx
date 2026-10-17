import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./index";
import { Input } from "../Input/index";

const meta = {
  title: "共通部品/フィールド",
  component: Field,
  parameters: {
    docs: {
      description: {
        component: "ラベルと入力を組にする。",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "氏名",
  args: {
    label: "氏名",
    children: <Input />,
  },
};
