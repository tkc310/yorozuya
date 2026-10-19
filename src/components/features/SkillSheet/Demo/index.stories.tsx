import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DemoSkillSheet, loadDemoSheet } from "./index";

const meta = {
  title: "スキルシート/デモ",
  component: DemoSkillSheet,
  parameters: {
    docs: {
      description: {
        component:
          "見本の JSON を読み込んだスキルシート。サーバを使わず、入力はその場のプレビューにだけ映る。製品紹介のスクリーンショットと操作動画はこのストーリーから撮る。",
      },
    },
  },
} satisfies Meta<typeof DemoSkillSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

// 製品紹介の撮影に使う（scripts/site/capture.mjs）。撮影の邪魔をしないよう play は置かない。
export const Example: Story = {
  name: "見本",
  args: { initial: loadDemoSheet() },
};

export const Typing: Story = {
  name: "入力するとプレビューに映る",
  args: { initial: loadDemoSheet() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: /^新究羅 理定/, level: 2 })).toBeVisible();
    const title = canvas.getByRole("textbox", { name: "肩書" });
    await userEvent.clear(title);
    await userEvent.type(title, "テックリード");
    await expect(canvas.getAllByText("テックリード").length).toBeGreaterThan(0);
  },
};
