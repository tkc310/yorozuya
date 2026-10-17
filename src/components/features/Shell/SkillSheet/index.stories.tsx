import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, within } from "storybook/test";
import { SkillSheet } from "./index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: "スキルシート/SkillSheet",
  component: SkillSheet,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: "スキルシートのコンテナコンポーネント。クエリとミューテーションを管理。",
      },
    },
  },
} satisfies Meta<typeof SkillSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "読み込み中",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("シートを読み込んでいます")).toBeVisible();
  },
};
