import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Tooltip } from "./index";

const meta = {
  title: "共通部品/ツールチップ",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "項目名の横に置く「?」の補足。マウスを乗せる・フォーカスする・押す、のどれでも開く。項目名だけでは伝わらない意味を補う。",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "項目名の補足",
  args: {
    label: "精算幅の説明",
    children: "契約で決めた、月の稼働時間の下限と上限です。",
  },
  render: (args) => (
    <p style={{ alignItems: "center", display: "flex", gap: "4px", margin: "4rem" }}>
      精算幅
      <Tooltip {...args} />
    </p>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "精算幅の説明" }));
    // 中身は Portal で body に出る。
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      await body.findByText("契約で決めた、月の稼働時間の下限と上限です。"),
    ).toBeInTheDocument();
  },
};
