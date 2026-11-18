import * as v from "valibot";

// 祝日の公表元。内閣府「国民の祝日について」の CSV（Shift_JIS）。e-Gov データポータルにも同じ URL で載っている。
export const HOLIDAY_CSV_URL = "https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv";

// CSV を変換した JSON の配信先（GitHub Pages）。アプリはここから取得する。
export const HOLIDAY_FEED_URL = "https://tkc310.github.io/yorozuya/holidays.json";

export const HOLIDAY_FEED_KIND = "yorozuya-holidays";

export const HOLIDAY_FEED_VERSION = 1;

// 祝日の出どころ。official は公表データ、estimated は祝日法のルールから計算した推定。
export const HOLIDAY_SOURCES = ["official", "estimated"] as const;

export type HolidaySource = (typeof HOLIDAY_SOURCES)[number];

export const HolidayFeedSchema = v.object({
  kind: v.literal(HOLIDAY_FEED_KIND),
  version: v.literal(HOLIDAY_FEED_VERSION),
  source: v.string(),
  minYear: v.pipe(v.number(), v.integer()),
  maxYear: v.pipe(v.number(), v.integer()),
  // 'YYYY-MM-DD' → 名称。日付順。
  holidays: v.record(v.pipe(v.string(), v.regex(/^\d{4}-\d{2}-\d{2}$/)), v.string()),
});

export type HolidayFeed = v.InferOutput<typeof HolidayFeedSchema>;
