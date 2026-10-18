import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ListInput } from "./index";

type ListInputProps = Parameters<typeof ListInput>[0];

// 値を手元に持って、足したり直したりした結果を画面に返す。
function StatefulListInput(props: ListInputProps) {
  const [values, setValues] = useState(props.values);
  return (
    <ListInput
      {...props}
      values={values}
      onChange={(next) => {
        setValues(next);
        props.onChange(next);
      }}
    />
  );
}

const meta = {
  title: "スキルシート/フォーム/一覧の入力",
  component: StatefulListInput,
  parameters: {
    docs: {
      description: {
        component:
          "技術・環境やツールのように 1 つずつ足して並べる入力。各項目は編集ボタンでその場の入力欄に変わる。",
      },
    },
  },
} satisfies Meta<typeof StatefulListInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EditItem: Story = {
  name: "項目をその場で編集",
  args: {
    label: "ツール",
    values: ["Git", "Slack"],
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Gitを編集" }));
    const input = canvas.getByRole("textbox", { name: "Gitの新しい名前" });
    await userEvent.clear(input);
    await userEvent.click(canvas.getByRole("button", { name: "Gitを保存" }));
    await expect(canvas.getByText("入力してください")).toBeVisible();
    await userEvent.type(input, "Slack");
    await userEvent.click(canvas.getByRole("button", { name: "Gitを保存" }));
    await expect(canvas.getByText("すでにあります")).toBeVisible();
    await userEvent.clear(input);
    await userEvent.type(input, "GitHub{Enter}");
    await expect(args.onChange).toHaveBeenLastCalledWith(["GitHub", "Slack"]);
    await expect(canvas.getByRole("button", { name: "GitHubを編集" })).toBeVisible();
  },
};
