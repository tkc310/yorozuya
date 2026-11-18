import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  DayEntry,
  MonthRange,
  WorkReportSettings,
} from "@/src/shared/features/work-report/report.schema";
import { QUERY_KEY, callServerFunction } from "@/src/lib/request";

// 作業報告書を書き換えるコマンドをまとめる。失敗したらメッセージに出し、成功したら読み直す。
export function useWorkReportCommands() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);

  function useCommand<T>(run: (input: T) => Promise<unknown>) {
    return useMutation({
      mutationFn: run,
      onSuccess: async () => {
        setMessage(null);
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY.WORK_REPORT });
      },
      onError: (error: Error) => setMessage(error.message),
    });
  }

  const saveDay = useCommand(async (entry: DayEntry) => {
    const { saveDayFn } = await import("@/src/server/features/work-report/commands/save-day");
    return callServerFunction(saveDayFn({ data: entry }));
  });
  const saveRange = useCommand(async (range: MonthRange) => {
    const { saveRangeFn } = await import("@/src/server/features/work-report/commands/save-range");
    return callServerFunction(saveRangeFn({ data: range }));
  });
  const saveSettings = useCommand(async (settings: WorkReportSettings) => {
    const { saveSettingsFn } =
      await import("@/src/server/features/work-report/commands/save-settings");
    return callServerFunction(saveSettingsFn({ data: settings }));
  });

  return {
    saveDay: (entry: DayEntry) => saveDay.mutate(entry),
    saveRange: (range: MonthRange) => saveRange.mutate(range),
    saveSettings: (settings: WorkReportSettings) => saveSettings.mutateAsync(settings),
    message,
    setMessage,
    pending: saveDay.isPending || saveRange.isPending || saveSettings.isPending,
  };
}
