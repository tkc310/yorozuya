import { ok } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { HolidayFeed } from "@/src/shared/features/work-report/holiday.schema";
import { monthHolidays, refreshHolidaysIfNeeded } from "./holidays";
import type { HolidayCoverage, WorkReportRepository } from "./repository";

const FEED: HolidayFeed = {
  kind: "yorozuya-holidays",
  version: 1,
  source: "test",
  minYear: 1955,
  maxYear: 2027,
  holidays: { "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日" },
};

// 祝日の読み書きだけを持つ偽物のリポジトリ。
function fakeRepository(coverage: HolidayCoverage | null) {
  const state = { coverage, stored: null as HolidayFeed | null };
  const repository = {
    holidayCoverage: () => ok(state.coverage),
    holidaysInMonth: (year: number, month: number) => {
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      return ok(
        Object.fromEntries(
          Object.entries(state.stored?.holidays ?? FEED.holidays).filter(([date]) =>
            date.startsWith(prefix),
          ),
        ),
      );
    },
    replaceHolidays: (feed: HolidayFeed, fetchedAt: string) => {
      state.stored = feed;
      state.coverage = { minYear: feed.minYear, maxYear: feed.maxYear, fetchedAt };
      return ok({ saved: true as const });
    },
  };
  return { repository: repository as unknown as WorkReportRepository, state };
}

function stubFetch(body: unknown, status = 200) {
  const fetch = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("refreshHolidaysIfNeeded", () => {
  it("取り込み済みの範囲にある年なら取りに行かない", async () => {
    const fetch = stubFetch(FEED);
    const { repository } = fakeRepository({ minYear: 1955, maxYear: 2027, fetchedAt: "" });
    expect((await refreshHolidaysIfNeeded(repository, 2026))._unsafeUnwrap()).toEqual({
      refreshed: false,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("範囲の外の年なら取りに行って置き換え、同じ起動の中では繰り返さない", async () => {
    const fetch = stubFetch({ ...FEED, maxYear: 2028 });
    const { repository, state } = fakeRepository({ minYear: 1955, maxYear: 2027, fetchedAt: "" });
    const now = new Date("2028-03-02T00:00:00Z");
    expect((await refreshHolidaysIfNeeded(repository, 2028, now))._unsafeUnwrap()).toEqual({
      refreshed: true,
    });
    expect(state.coverage).toEqual({
      minYear: 1955,
      maxYear: 2028,
      fetchedAt: "2028-03-02T00:00:00.000Z",
    });
    await refreshHolidaysIfNeeded(repository, 2029, now);
    await refreshHolidaysIfNeeded(repository, 2029, now);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("取得に失敗したら理由を返し、取り込み済みのデータは残す", async () => {
    stubFetch({}, 404);
    const { repository, state } = fakeRepository(null);
    const result = await refreshHolidaysIfNeeded(repository, 2031);
    expect(result._unsafeUnwrapErr().message).toContain("404");
    expect(state.coverage).toBeNull();
  });

  it("形の正しくない JSON は取り込まない", async () => {
    stubFetch({ kind: "other" });
    const { repository, state } = fakeRepository(null);
    const result = await refreshHolidaysIfNeeded(repository, 2032);
    expect(result.isErr()).toBe(true);
    expect(state.stored).toBeNull();
  });
});

describe("monthHolidays", () => {
  it("取り込み済みの年は公表データを返す", () => {
    const { repository } = fakeRepository({ minYear: 1955, maxYear: 2027, fetchedAt: "" });
    expect(monthHolidays(repository, 2026, 11)._unsafeUnwrap()).toEqual({
      holidays: { "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日" },
      source: "official",
    });
  });

  it("取り込めていない年は祝日法のルールから推定する", () => {
    const { repository } = fakeRepository(null);
    expect(monthHolidays(repository, 2028, 11)._unsafeUnwrap()).toEqual({
      holidays: { "2028-11-03": "文化の日", "2028-11-23": "勤労感謝の日" },
      source: "estimated",
    });
  });
});
