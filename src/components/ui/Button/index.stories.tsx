import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./index";

const meta = {
  title: "共通部品/ボタン",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: "保存と削除に使うボタン。実線は確定、枠線は取り消し。",
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
