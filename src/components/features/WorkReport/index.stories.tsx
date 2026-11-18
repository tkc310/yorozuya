import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, within } from "storybook/test";
import {
  DEFAULT_SETTINGS,
  type DayEntry,
  type WorkReportMonth,
} from "@/src/shared/features/work-report/report.schema";
import { emptyEntry } from "@/src/shared/features/work-report/report.service";
import { QUERY_KEY } from "@/src/lib/request";
import { WorkReport } from "./index";

const TODAY = "2026-11-18";

const NOTES = ["要件定義レビュー", "API 設計", "API 実装", "結合テスト", "不具合対応", "画面実装"];

// 11 月 2 日〜17 日の平日（祝日を除く）に入力済みの見本。
function sampleEntries(): DayEntry[] {
  const days = [2, 4, 5, 6, 9, 10, 11, 12, 13, 16, 17];
  return days.map((day, index) => ({
    ...emptyEntry(`2026-11-${String(day).padStart(2, "0")}`),
    start: 600,
    end: index % 3 === 0 ? 1170 : 1140,
    breakMinutes: 60,
    note: NOTES[index % NOTES.length] ?? "",
  }));
}

const SAMPLE: WorkReportMonth = {
  settings: { ...DEFAULT_SETTINGS, name: "見本 太郎", client: "株式会社見本", project: "EC 刷新" },
  range: { year: 2026, month: 11, minMinutes: 140 * 60, maxMinutes: 180 * 60 },
  entries: sampleEntries(),
  holidays: { "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日" },
  holidaySource: "official",
};

function client(data: WorkReportMonth | null) {
  const queryClient = new QueryClient({
    defaultOptions: {
      // ストーリーではサーバ関数（bun:sqlite）を呼ばない。見本のデータか、読み込み中のままにする。
      queries: { retry: false, enabled: false },
    },
  });
  if (data) {
    queryClient.setQueryData([...QUERY_KEY.WORK_REPORT, 2026, 11], data);
  }
  return queryClient;
}

const meta = {
  title: "作業報告書/画面",
  component: WorkReport,
  args: { today: TODAY },
  parameters: {
    docs: {
      description: {
        component:
          "月ごとの稼働を記録する画面。月をタブで切り替え、日ごとの入力と、精算幅までの残り時間・残り稼働日数を並べる。",
      },
    },
  },
} satisfies Meta<typeof WorkReport>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Example: Story = {
  name: "見本の内容",
  decorators: [
    (Story) => {
      const [queryClient] = useState(() => client(SAMPLE));
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "作業報告書", level: 1 })).toBeVisible();
    await expect(canvas.getByRole("tab", { name: "11月" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // 文化の日は祝日として出し、稼働日に数えない。
    await expect(canvas.getAllByText("文化の日").length).toBeGreaterThan(0);
    await expect(canvas.getByText("今月の稼働日").nextSibling).toHaveTextContent("19 日");
    // 18 日（今日）以降の稼働日のうち未入力の 8 日が残り。
    await expect(canvas.getByText("残り稼働日").nextSibling).toHaveTextContent("8 日");
  },
};

export const Estimated: Story = {
  name: "祝日が推定のとき",
  decorators: [
    (Story) => {
      const [queryClient] = useState(() => client({ ...SAMPLE, holidaySource: "estimated" }));
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/祝日法のルールから推定しています/)).toBeVisible();
  },
};

export const Loading: Story = {
  name: "読み込み中",
  decorators: [
    (Story) => {
      const [queryClient] = useState(() => client(null));
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("読み込んでいます");
  },
};
