import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { css } from "styled-system/css";
import { createFixtureSheet, type SheetInput } from "@/shared/features/skill-sheet/sheet";
import { sheetColumns } from "./SkillSheet/index";
import { Form } from "./SkillSheet/Form/index";
import { Preview } from "./SkillSheet/Preview/index";
import { Shell } from "./index";

const meta = {
  title: "画面/シェル",
  component: Shell,
  parameters: {
    docs: {
      description: {
        component: "ツール一覧と、選んだツールの画面。一覧の出所は登録配列だけ。",
      },
    },
  },
} satisfies Meta<typeof Shell>;

export default meta;

type Story = StoryObj<typeof meta>;

function FixturePanel() {
  const [value, setValue] = useState<SheetInput>(createFixtureSheet());
  return (
    <div className={sheetColumns}>
      <div className="sheet-form">
        <Form
          initial={value}
          onValues={setValue}
          onSaveProfile={() => undefined}
          autoExperience="3年6ヶ月"
          today={{ year: 2026, month: 10, day: 17 }}
          onAddSkill={() => undefined}
          onUpdateSkillExperience={() => undefined}
          onRemoveSkill={() => undefined}
          onAddCareer={() => undefined}
          onUpdateCareer={() => undefined}
          onRemoveCareer={() => undefined}
          onImport={() => undefined}
        />
      </div>
      <Preview sheet={value} calculatedOn={{ year: 2026, month: 10 }} />
    </div>
  );
}

export const Example: Story = {
  name: "スキルシート",
  args: {
    tools: [
      {
        id: "skill-sheet",
        name: "スキルシート",
        Panel: FixturePanel,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className={css({ background: "#f3efe6" })}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "スキルシート", level: 1 })).toBeVisible();
    await expect(canvas.getByRole("cell", { name: "山田" })).toBeVisible();
  },
};
