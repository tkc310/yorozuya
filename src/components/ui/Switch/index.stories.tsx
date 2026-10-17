import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Switch, type SwitchProps } from "./index";

const meta = {
  title: "共通部品/スイッチ",
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          "デジタル庁デザインシステムのオン／オフスイッチ。プレビューに出すかや、自動計算するかを切り替える。",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

function Controlled(props: SwitchProps) {
  const [checked, setChecked] = useState(props.checked);
  return <Switch {...props} checked={checked} onCheckedChange={setChecked} />;
}

export const Example: Story = {
  name: "オン",
  args: {
    label: "表示",
    checked: true,
    onCheckedChange: () => undefined,
  },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("switch", { name: "表示" });
    await expect(control).toBeChecked();
    await userEvent.click(canvas.getByText("表示"));
    await expect(control).not.toBeChecked();
  },
};

export const Unchecked: Story = {
  name: "オフ",
  args: {
    label: "表示",
    checked: false,
    onCheckedChange: () => undefined,
  },
};
