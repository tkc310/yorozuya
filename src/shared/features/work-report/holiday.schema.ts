import * as v from "valibot";

// 祝日の配信先。内閣府の祝日 CSV を tkc310/jp-holidays が JSON に直して GitHub Pages で配る（ADR 0013）。
export const HOLIDAY_FEED_URL = "https://tkc310.github.io/jp-holidays/holidays.json";

export const HOLIDAY_FEED_KIND = "jp-holidays";

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
