import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Breadcrumb, BreadcrumbCurrent, BreadcrumbItem } from "./index";

const meta = {
  title: "共通部品/パンくずリスト",
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component: "いまの画面までの道筋。最後の項目は今いる画面で、リンクにしない。",
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "2 階層",
  args: {
    children: (
      <>
        <BreadcrumbItem>
          <a href="#top">トップ</a>
        </BreadcrumbItem>
        <BreadcrumbCurrent>スキルシート</BreadcrumbCurrent>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation", { name: "パンくずリスト" });
    await expect(within(nav).getByRole("link", { name: "トップ" })).toBeVisible();
    await expect(within(nav).getByText("スキルシート")).toHaveAttribute("aria-current", "page");
  },
};
