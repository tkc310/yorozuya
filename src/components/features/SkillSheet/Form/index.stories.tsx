import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  createFixtureSheet,
  type Career,
  type SheetInput,
} from "@/shared/features/skill-sheet/sheet";
import { Form } from "./index";

const meta = {
  title: "スキルシート/フォーム",
  component: Form,
  parameters: {
    docs: {
      description: {
        component:
          "左の入力。氏名や経歴、保有技術を編集する。経験年数は自動計算か自由入力を選べ、項目ごとにプレビューへの表示を切り替えられる。",
      },
    },
  },
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

const noopSheet = (_value: SheetInput) => undefined;
const noopCareer = (_career: Omit<Career, "id">) => undefined;

export const Example: Story = {
  name: "入力済み",
  args: {
    initial: createFixtureSheet(),
    onValues: noopSheet,
    onSaveProfile: noopSheet,
    autoExperience: "3年6ヶ月",
    today: { year: 2026, month: 10, day: 17 },
    onAddSkill: () => undefined,
    onUpdateSkillExperience: () => undefined,
    onUpdateSkillFeatured: () => undefined,
    onRemoveSkill: () => undefined,
    onAddCareer: noopCareer,
    onUpdateCareer: () => undefined,
    onRemoveCareer: () => undefined,
    onImport: () => undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "氏名" });
    await userEvent.clear(name);
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    await userEvent.tab();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(name, "佐藤");
    await expect(name).toHaveValue("佐藤");
    const experience = canvas.getByRole("textbox", { name: "経験年数" });
    await expect(experience).toBeDisabled();
    await expect(experience).toHaveValue("3年6ヶ月");
    await userEvent.click(canvas.getByRole("switch", { name: "経験年数を職務経歴から自動計算" }));
    await expect(experience).toBeEnabled();
    await expect(canvas.getByRole("switch", { name: "年齢をプレビューに表示" })).toBeChecked();
    await expect(canvas.getByRole("textbox", { name: "フリガナ" })).toHaveValue(
      "シンギュラ リティ",
    );
    await expect(canvas.getByRole("textbox", { name: "肩書" })).toHaveValue("Webエンジニア");
    // 希望単価は出したい人だけ出す項目だが、見本では表示にしている。
    await expect(canvas.getByRole("switch", { name: "希望単価をプレビューに表示" })).toBeChecked();
    // ハイライトは 3 件まで。文字数の目安を出す。
    const highlight = canvas.getByRole("textbox", { name: "ハイライト 2" });
    await userEvent.type(highlight, "要件定義から運用まで担当");
    await expect(canvas.getByText("12 / 60字")).toBeVisible();
    await expect(
      canvas.getByRole("checkbox", { name: "Typescriptを主要スキルにする" }),
    ).not.toBeChecked();
    // 選考で見られやすい項目の抜けを知らせる。
    await expect(
      canvas.getByText("主要スキルが選ばれていません（経験年数の長い順に出します）"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "リンクを追加" }));
    const linkUrl = canvas.getByRole("textbox", { name: "URL" });
    await expect(linkUrl).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(linkUrl, "github.com");
    await userEvent.click(canvas.getByRole("button", { name: "リンクを追加" }));
    await expect(
      canvas.getByText("http:// か https:// で始まる URL を入力してください"),
    ).toBeVisible();
    const skillName = canvas.getByRole("textbox", { name: "技術名" });
    await expect(skillName).not.toHaveAttribute("aria-invalid", "true");
    await userEvent.click(canvas.getByRole("button", { name: "技術を追加" }));
    await expect(skillName).toHaveAttribute("aria-invalid", "true");
    await expect(skillName).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "経歴を追加" }));
    const body = within(document.body);
    await expect(body.getByRole("dialog", { name: "経歴を追加" })).toBeVisible();
    await userEvent.click(body.getByRole("button", { name: "追加" }));
    await expect(body.getByRole("alert")).toHaveTextContent("企業・案件名：入力してください");
    const projectName = body.getByRole("textbox", { name: "企業・案件名" });
    await expect(projectName).toHaveFocus();
    await expect(projectName).toHaveAttribute("aria-invalid", "true");
    const startYear = body.getByRole("textbox", { name: "開始年" });
    await userEvent.type(startYear, "2O24");
    await expect(body.getAllByText("数字で入力してください").length).toBeGreaterThan(0);
    await userEvent.click(body.getByRole("button", { name: "取り消し" }));
  },
};

export const Saving: Story = {
  name: "保存中",
  args: { ...Example.args, pending: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("保存しています");
    await expect(canvas.getByRole("button", { name: "JSONを読み込む" })).toBeDisabled();
  },
};
