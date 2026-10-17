import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./index";

const meta = {
  title: "共通部品/選択",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: "決まった選択肢から1つ選ぶ。性別に使う。",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "未選択",
  args: {
    "aria-label": "性別",
    children: (
      <>
        <option value="">未選択</option>
        <option value="男性">男性</option>
        <option value="女性">女性</option>
      </>
    ),
  },
};
