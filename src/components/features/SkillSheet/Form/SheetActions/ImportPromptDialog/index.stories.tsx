import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ImportPromptDialog } from "./index";

const meta = {
  title: "スキルシート/フォーム/インポート用のプロンプト",
  component: ImportPromptDialog,
  parameters: {
    docs: {
      description: {
        component:
          "元のスキルシートの渡し方と参照情報から、生成 AI に読み込み用の JSON を作ってもらうプロンプトを作る。",
      },
    },
  },
  args: {
    open: true,
    onOpenChange: fn(),
  },
} satisfies Meta<typeof ImportPromptDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "本文を貼り付ける",
  play: async () => {
    const body = within(document.body);
    await expect(
      body.getByRole("dialog", { name: "インポート用のプロンプトを作る" }),
    ).toBeVisible();
    const copy = body.getByRole("button", { name: "プロンプトをコピー" });
    await expect(copy).toBeDisabled();
    await expect(body.getByText("参照情報を入れるとプロンプトができます")).toBeVisible();
    await userEvent.type(body.getByRole("textbox", { name: "参照情報" }), "氏名: 山田 太郎");
    await expect(copy).toBeEnabled();
    const prompt = body.getByRole("textbox", { name: "プロンプト" });
    await expect((prompt as HTMLTextAreaElement).value).toContain("氏名: 山田 太郎");
    await expect((prompt as HTMLTextAreaElement).value).toContain('"kind": "yorozuya-skill-sheet"');
  },
};

export const FromFile: Story = {
  name: "ファイルを添付する",
  play: async () => {
    const body = within(document.body);
    await userEvent.selectOptions(
      body.getByRole("combobox", { name: "元のスキルシートの渡し方" }),
      "file",
    );
    await userEvent.type(body.getByRole("textbox", { name: "参照情報" }), "sheet.xlsx");
    const prompt = body.getByRole("textbox", { name: "プロンプト" }) as HTMLTextAreaElement;
    await expect(prompt.value).toContain("添付したファイル「sheet.xlsx」");
  },
};
