import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type DayEntry } from "./report.schema";
import {
  buildMonth,
  emptyEntry,
  formatClock,
  formatHours,
  isEmptyEntry,
  parseClock,
  parseHours,
  summarize,
  workedMinutesOf,
} from "./report.service";

function worked(date: string, start: string, end: string, breakMinutes = 60): DayEntry {
  return {
    ...emptyEntry(date),
    start: parseClock(start),
    end: parseClock(end),
    breakMinutes,
  };
}

describe("buildMonth", () => {
  it("平日・土日・祝日を分け、2026 年 11 月の稼働日は 19 日になる", () => {
    const rows = buildMonth(2026, 11, DEFAULT_SETTINGS, []);
    expect(rows).toHaveLength(30);
    expect(rows[0]).toMatchObject({ date: "2026-11-01", weekday: 0, kind: "weekend" });
    expect(rows[2]).toMatchObject({ date: "2026-11-03", kind: "holiday", holiday: "文化の日" });
    expect(rows.filter((row) => row.workday)).toHaveLength(19);
    expect(rows[1]?.plannedMinutes).toBe(480);
    expect(rows[2]?.plannedMinutes).toBe(0);
  });

  it("祝日を休みにしない設定なら、祝日も曜日の予定どおり稼働日にする", () => {
    const rows = buildMonth(2026, 11, { ...DEFAULT_SETTINGS, holidaysOff: false }, []);
    expect(rows[2]).toMatchObject({ kind: "workday", workday: true, holiday: "文化の日" });
    expect(rows.filter((row) => row.workday)).toHaveLength(21);
  });

  it("曜日ごとの予定時間を反映する", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      weekdayMinutes: [0, 480, 0, 360, 480, 480, 240] as typeof DEFAULT_SETTINGS.weekdayMinutes,
    };
    const rows = buildMonth(2026, 11, settings, []);
    expect(rows.find((row) => row.date === "2026-11-10")).toMatchObject({ workday: false });
    expect(rows.find((row) => row.date === "2026-11-04")?.plannedMinutes).toBe(360);
    expect(rows.find((row) => row.date === "2026-11-07")?.plannedMinutes).toBe(240);
  });

  it("日ごとの切り替えで休みにも稼働にもできる", () => {
    const rows = buildMonth(2026, 11, DEFAULT_SETTINGS, [
      { ...emptyEntry("2026-11-02"), override: "off" },
      { ...emptyEntry("2026-11-07"), override: "work" },
      { ...emptyEntry("2026-11-03"), override: "work" },
    ]);
    expect(rows[1]).toMatchObject({ workday: false, plannedMinutes: 0 });
    // 休みの曜日を稼働にしたら、曜日の予定のうち最も長いものを予定にする。
    expect(rows[6]).toMatchObject({ workday: true, plannedMinutes: 480 });
    expect(rows[2]).toMatchObject({ workday: true, plannedMinutes: 480 });
  });

  it("開始・終了・休憩から実働を出す", () => {
    const rows = buildMonth(2026, 11, DEFAULT_SETTINGS, [worked("2026-11-02", "10:00", "19:30")]);
    expect(rows[1]?.workedMinutes).toBe(510);
    expect(rows[3]?.workedMinutes).toBeNull();
  });
});

describe("summarize", () => {
  const entries = [
    worked("2026-11-02", "10:00", "19:00"),
    worked("2026-11-04", "10:00", "19:30"),
    worked("2026-11-05", "10:00", "19:00"),
  ];
  const rows = buildMonth(2026, 11, DEFAULT_SETTINGS, entries);

  it("実績・残り稼働日・下限と上限までの時間・見込みを出す", () => {
    const summary = summarize(rows, { minMinutes: 140 * 60, maxMinutes: 180 * 60 }, "2026-11-05");
    // 5 日は入力済みなので残りに数えない。6 日以降の稼働日は 16 日。
    expect(summary).toMatchObject({
      workedMinutes: 8 * 60 + 8.5 * 60 + 8 * 60,
      workdays: 19,
      plannedMinutes: 19 * 480,
      remainingWorkdays: 16,
      remainingPlannedMinutes: 16 * 480,
      toMinMinutes: 140 * 60 - 1470,
      toMaxMinutes: 180 * 60 - 1470,
      status: "within",
    });
    expect(summary.forecastMinutes).toBe(1470 + 16 * 480);
    expect(summary.neededPerDayMinutes).toBe(Math.ceil((140 * 60 - 1470) / 16));
  });

  it("今日を含み、入力前の過去の稼働日は残りに数えない", () => {
    const summary = summarize(rows, { minMinutes: null, maxMinutes: null }, "2026-11-30");
    expect(summary.remainingWorkdays).toBe(1);
    expect(summary.status).toBe("unset");
    expect(summary.toMinMinutes).toBeNull();
    expect(summary.neededPerDayMinutes).toBeNull();
  });

  it("見込みが下限に届かなければ below、上限を超えれば over", () => {
    expect(summarize(rows, { minMinutes: 200 * 60, maxMinutes: null }, "2026-11-05").status).toBe(
      "below",
    );
    expect(summarize(rows, { minMinutes: null, maxMinutes: 100 * 60 }, "2026-11-05").status).toBe(
      "over",
    );
  });

  it("上限を超えたら上限までの時間は負になり、下限までは 0 で止まる", () => {
    const summary = summarize(rows, { minMinutes: 10 * 60, maxMinutes: 20 * 60 }, "2026-12-01");
    expect(summary.toMinMinutes).toBe(0);
    expect(summary.toMaxMinutes).toBe(20 * 60 - 1470);
    expect(summary.neededPerDayMinutes).toBeNull();
    expect(summary.remainingWorkdays).toBe(0);
  });
});

describe("時刻と時間の入力", () => {
  it.each([
    ["9:30", 570],
    ["09:30", 570],
    ["0930", 570],
    ["9", 540],
    ["25:00", 1500],
    ["９:３０".normalize("NFKC"), 570],
    ["", null],
    ["9:75", null],
    ["48:00", null],
    ["abc", null],
  ])("parseClock(%s) は %s", (input, expected) => {
    expect(parseClock(input)).toBe(expected);
  });

  it("時刻と時間を書き出す", () => {
    expect(formatClock(570)).toBe("9:30");
    expect(formatClock(null)).toBe("");
    expect(formatHours(510)).toBe("8.5");
    expect(formatHours(480)).toBe("8.0");
    expect(formatHours(null)).toBe("");
    expect(parseHours("7.5")).toBe(450);
    expect(parseHours("x")).toBeNull();
  });

  it("開始か終了が無ければ実働は null", () => {
    expect(workedMinutesOf({ ...emptyEntry("2026-11-02"), start: 600 })).toBeNull();
    expect(workedMinutesOf(null)).toBeNull();
  });

  it("空の入力を見分ける", () => {
    expect(isEmptyEntry(emptyEntry("2026-11-02"))).toBe(true);
    expect(isEmptyEntry({ ...emptyEntry("2026-11-02"), note: "定例" })).toBe(false);
  });
});
