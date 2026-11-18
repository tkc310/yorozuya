import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { createFixtureSheet, present } from "@/src/shared/features/skill-sheet/skill.service";
import { sheetMarkdown } from "../sheet-markdown.service";
import { MarkdownDialog } from "./index";

const today = { year: 2026, month: 10, day: 1 };
const sheet = createFixtureSheet();
const presented = present(sheet, today);
const markdown = presented.ok ? sheetMarkdown(sheet, presented.view, today) : null;

const meta = {
  title: "スキルシート/フォーム/Markdownで書き出す",
  component: MarkdownDialog,
  parameters: {
    docs: {
      description: {
        component:
          "AI による書類選考や生成 AI への入力に使う、スキルシートの Markdown 版を見せ、コピーかダウンロードで渡す。",
      },
    },
  },
  args: {
    open: true,
    markdown,
    onDownload: fn(),
    onOpenChange: fn(),
  },
} satisfies Meta<typeof MarkdownDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "書き出す",
  play: async ({ args }) => {
    const body = within(document.body);
    await expect(body.getByRole("dialog", { name: "Markdownで書き出す" })).toBeVisible();
    const output = body.getByRole("textbox", { name: "Markdown" }) as HTMLTextAreaElement;
    await expect(output.value).toContain("# スキルシート：新究羅 理定");
    await expect(output.value).toContain("## 職務経歴詳細");
    await userEvent.click(body.getByRole("button", { name: ".md をダウンロード" }));
    await expect(args.onDownload).toHaveBeenCalled();
  },
};

export const Unavailable: Story = {
  name: "氏名が無く作れない",
  args: {
    markdown: null,
    error: "Markdownを作れません: 氏名がありません",
  },
  play: async () => {
    const body = within(document.body);
    await expect(body.getByText("Markdownを作れません: 氏名がありません")).toBeVisible();
    await expect(body.getByRole("button", { name: "Markdownをコピー" })).toBeDisabled();
    await expect(body.getByRole("button", { name: ".md をダウンロード" })).toBeDisabled();
  },
};
