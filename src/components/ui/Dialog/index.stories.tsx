import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Button } from "../Button/index";
import { Dialog } from "./index";

const meta = {
  title: "共通部品/ダイアログ",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component: "画面の上に重ねて入力させる。経歴の追加と編集に使う。",
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "開いた状態",
  args: {
    open: true,
    title: "経歴を編集",
    children: <p>本文</p>,
    footer: <Button type="button">保存</Button>,
    onOpenChange: () => undefined,
  },
  play: async () => {
    const body = within(document.body);
    await expect(body.getByRole("dialog", { name: "経歴を編集" })).toBeVisible();
  },
};
