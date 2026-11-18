import * as v from "valibot";

// 曜日は Date#getUTCDay と同じ並び（0 が日曜）。
export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

// 日ごとの切り替え。none は曜日と祝日の設定に従う。
export const DAY_OVERRIDES = ["none", "off", "work"] as const;

export type DayOverride = (typeof DAY_OVERRIDES)[number];

// 1 日の上限。日をまたぐ作業は 25:00 のように 24 時以降で書く。
export const MAX_CLOCK_MINUTES = 48 * 60;

export const MAX_DAY_MINUTES = 24 * 60;

// 精算幅の上限。月 744 時間（31 日 × 24 時間）を超える値は入力の誤りとみなす。
export const MAX_MONTH_MINUTES = 744 * 60;

// 'YYYY-MM-DD'
export type IsoDate = string;

export type WorkReportSettings = {
  // 曜日ごとの予定（分）。0 の曜日は休み。
  weekdayMinutes: [number, number, number, number, number, number, number];
  holidaysOff: boolean;
  defaultStart: number;
  defaultBreak: number;
  name: string;
  client: string;
  project: string;
};

export type MonthRange = {
  year: number;
  month: number;
  // 精算幅（分）。未設定なら null。
  minMinutes: number | null;
  maxMinutes: number | null;
};

export type DayEntry = {
  date: IsoDate;
  // 開始・終了（その日の 0:00 からの分）。
  start: number | null;
  end: number | null;
  breakMinutes: number;
  override: DayOverride;
  note: string;
};

export type WorkReportMonth = {
  settings: WorkReportSettings;
  range: MonthRange;
  entries: DayEntry[];
};

export const DEFAULT_SETTINGS: WorkReportSettings = {
  weekdayMinutes: [0, 480, 480, 480, 480, 480, 0],
  holidaysOff: true,
  defaultStart: 10 * 60,
  defaultBreak: 60,
  name: "",
  client: "",
  project: "",
};

const minutes = (max: number, label: string) =>
  v.pipe(
    v.number(),
    v.integer(`${label}は分の整数で入力してください`),
    v.minValue(0, `${label}は 0 以上で入力してください`),
    v.maxValue(max, `${label}が大きすぎます`),
  );

const text = (max: number, label: string) =>
  v.pipe(v.string(), v.trim(), v.maxLength(max, `${label}は ${max} 文字以内で入力してください`));

export const IsoDateSchema = v.pipe(
  v.string(),
  v.regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形が正しくありません"),
);

export const YearMonthSchema = v.object({
  year: v.pipe(v.number(), v.integer(), v.minValue(2000), v.maxValue(2099)),
  month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)),
});

export const SettingsSchema = v.object({
  weekdayMinutes: v.tuple([
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
    minutes(MAX_DAY_MINUTES, "予定時間"),
  ]),
  holidaysOff: v.boolean(),
  defaultStart: minutes(MAX_DAY_MINUTES, "既定の開始"),
  defaultBreak: minutes(MAX_DAY_MINUTES, "既定の休憩"),
  name: text(100, "氏名"),
  client: text(100, "提出先"),
  project: text(100, "案件名"),
});

export const MonthRangeSchema = v.pipe(
  v.object({
    ...YearMonthSchema.entries,
    minMinutes: v.nullable(minutes(MAX_MONTH_MINUTES, "精算幅の下限")),
    maxMinutes: v.nullable(minutes(MAX_MONTH_MINUTES, "精算幅の上限")),
  }),
  v.check(
    (range) =>
      range.minMinutes === null ||
      range.maxMinutes === null ||
      range.minMinutes <= range.maxMinutes,
    "精算幅の下限は上限以下にしてください",
  ),
);

export const DayEntrySchema = v.pipe(
  v.object({
    date: IsoDateSchema,
    start: v.nullable(minutes(MAX_CLOCK_MINUTES, "開始")),
    end: v.nullable(minutes(MAX_CLOCK_MINUTES, "終了")),
    breakMinutes: minutes(MAX_DAY_MINUTES, "休憩"),
    override: v.picklist(DAY_OVERRIDES),
    note: text(200, "作業内容"),
  }),
  v.check(
    (entry) => entry.start === null || entry.end === null || entry.start <= entry.end,
    "終了は開始より後にしてください",
  ),
  v.check(
    (entry) =>
      entry.start === null || entry.end === null || entry.breakMinutes <= entry.end - entry.start,
    "休憩が作業時間より長くなっています",
  ),
);
