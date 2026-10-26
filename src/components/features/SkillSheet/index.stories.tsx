import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";
import { createFixtureSheet } from "@/src/shared/features/skill-sheet/skill.service";
import { QUERY_KEY } from "@/src/lib/request";
import { SkillSheet } from "./index";

function client(withSheet: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // ストーリーではサーバ関数（bun:sqlite）を呼ばない。見本のデータか、読み込み中のままにする。
        enabled: false,
      },
    },
  });
  if (withSheet) {
    queryClient.setQueryData(QUERY_KEY.SKILL_SHEET, createFixtureSheet());
  }
  return queryClient;
}

const meta = {
  title: "スキルシート/画面",
  component: SkillSheet,
  parameters: {
    docs: {
      description: {
        component:
          "スキルシートの画面。左にフォーム、右にプレビューを並べる。クエリとミューテーションを管理。",
      },
    },
  },
} satisfies Meta<typeof SkillSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "見本の内容",
  decorators: [
    (Story) => {
      const [queryClient] = useState(() => client(true));
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "スキルシート", level: 1 })).toBeVisible();
    await expect(
      await canvas.findByRole("heading", { name: /^新究羅 理定/, level: 2 }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  name: "読み込み中",
  decorators: [
    (Story) => {
      const [queryClient] = useState(() => client(false));
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("シートを読み込んでいます");
  },
};
