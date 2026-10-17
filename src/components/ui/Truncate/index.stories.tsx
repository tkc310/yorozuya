import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Truncate } from "./index";

const meta = {
  title: "共通部品/省略表示",
  component: Truncate,
  parameters: {
    docs: {
      description: {
        component: "1 行に収まらない文字を … で省略し、マウスを乗せると全文をツールチップで出す。",
      },
    },
  },
} satisfies Meta<typeof Truncate>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "長い技術名",
  args: {
    children: "AWS (EC2 / ECS(fargate) / RDS / DynamoDB / ElastiCache / S3 / CloudFront / lambda)",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "12rem" }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/^AWS \(EC2/)).toBeVisible();
  },
};
