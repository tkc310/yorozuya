import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./index";

const meta = {
  title: "共通部品/ボタン",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "保存と削除に使うボタン。実線は確定、枠線は取り消し、テキストは補助の操作。",
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "実線",
  args: {
    children: "保存",
    type: "button",
  },
};

export const Outline: Story = {
  name: "枠線",
  args: {
    children: "取り消し",
    type: "button",
    variant: "outline",
  },
};

export const Text: Story = {
  name: "テキスト",
  args: {
    children: "詳しく見る",
    type: "button",
    variant: "text",
  },
};

export const Small: Story = {
  name: "小",
  args: {
    children: "削除",
    size: "sm",
    type: "button",
    variant: "outline",
  },
};

export const Disabled: Story = {
  name: "無効",
  args: {
    children: "保存",
    disabled: true,
    type: "button",
  },
};
