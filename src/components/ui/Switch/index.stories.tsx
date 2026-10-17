import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./index";

const meta = {
  title: "共通部品/スイッチ",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component: "プレビューに出すかを切り替える。項目名の横に置く。",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "表示",
  args: {
    label: "表示",
    defaultChecked: true,
  },
};

export const Unchecked: Story = {
  name: "非表示",
  args: {
    label: "表示",
  },
};
