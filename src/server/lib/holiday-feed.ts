import { err, ok, type Result } from "neverthrow";
import * as v from "valibot";
import {
  HOLIDAY_FEED_URL,
  HolidayFeedSchema,
  type HolidayFeed,
} from "@/src/shared/features/work-report/holiday.schema";
import { ServerFunctionError } from "@/src/error";

// 外へ出る通信はここだけ。公開された祝日の JSON を GET するだけで、利用者のデータは送らない（ADR 0011）。
export async function fetchHolidayFeed(
  url: string = HOLIDAY_FEED_URL,
  timeoutMs = 5000,
): Promise<Result<HolidayFeed, ServerFunctionError>> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      return err(new ServerFunctionError(`祝日データを取得できませんでした（${response.status}）`));
    }
    const parsed = v.safeParse(HolidayFeedSchema, await response.json());
    if (!parsed.success) {
      return err(new ServerFunctionError("祝日データの形が正しくありません"));
    }
    return ok(parsed.output);
  } catch (error) {
    return err(
      new ServerFunctionError(
        error instanceof Error
          ? `祝日データを取得できませんでした: ${error.message}`
          : "祝日データを取得できませんでした",
      ),
    );
  }
}
