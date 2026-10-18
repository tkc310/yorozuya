import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { withRouter } from "@/.storybook/withRouter";
import { Home } from "./index";

const meta = {
  title: "トップ/画面",
  component: Home,
  decorators: [withRouter],
  parameters: {
    docs: {
      description: {
        component: "アプリの紹介と、各機能への入口。",
      },
    },
  },
} satisfies Meta<typeof Home>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "トップ",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "よろずや", level: 1 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "スキルシートを開く" })).toHaveAttribute(
      "href",
      "/skill-sheet",
    );
  },
};
