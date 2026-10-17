import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { createFixtureSheet, type Career, type SheetInput } from "../../../../shared/features/skill-sheet/sheet";
import { SkillSheetForm } from "./form";

const meta = {
  title: "スキルシート/フォーム",
  component: SkillSheetForm,
  parameters: {
    docs: {
      description: {
        component: "左の入力。氏名、経歴、保有技術を編集し、経験年数は入力しない。",
      },
    },
  },
} satisfies Meta<typeof SkillSheetForm>;

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
    onAddSkill: () => undefined,
    onRemoveSkill: () => undefined,
    onAddCareer: noopCareer,
    onRemoveCareer: () => undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name = canvas.getByRole("textbox", { name: "氏名" });
    await userEvent.clear(name);
    await userEvent.type(name, "佐藤");
    await expect(name).toHaveValue("佐藤");
    await expect(canvas.queryByLabelText("経験年数")).toBeNull();
  },
};
