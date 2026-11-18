import { useState } from "react";
import { css, cx } from "styled-system/css";
import { input } from "styled-system/recipes";
import type { MonthRange } from "@/src/shared/features/work-report/report.schema";
import {
  formatHours,
  parseHours,
  type MonthSummary,
} from "@/src/shared/features/work-report/report.service";
import { Tooltip } from "@/src/components/ui/Tooltip/index";

const root = css({
  borderColor: "border.divider",
  borderRadius: "12",
  borderWidth: "1px",
  display: "grid",
  gap: "4",
  p: "4",
});

const heading = css({
  margin: "0",
  textStyle: "std-18B-160",
});

const label = css({
  alignItems: "center",
  color: "fg.sub",
  display: "flex",
  gap: "1",
  margin: "0",
  textStyle: "std-14N-170",
});

const big = css({
  fontVariantNumeric: "tabular-nums",
  lineHeight: "1.2",
  margin: "0",
  textStyle: "std-32B-150",
});

const unit = css({
  ml: "1",
  textStyle: "std-16N-170",
});

const stats = css({
  display: "grid",
  gap: "2",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  margin: "0",
});

const stat = css({
  background: "bg.subtle",
  borderRadius: "8",
  display: "grid",
  px: "3",
  py: "2",
  "& dt": { color: "fg.sub", textStyle: "std-14N-170" },
  "& dd": { fontVariantNumeric: "tabular-nums", margin: "0", textStyle: "std-16B-170" },
});

const meter = css({
  display: "grid",
  gap: "1",
});

const track = css({
  background: "bg.subtle",
  borderColor: "border.divider",
  borderRadius: "full",
  borderWidth: "1px",
  height: "14px",
  overflow: "hidden",
  position: "relative",
});

const bar = css({
  bottom: "0",
  left: "0",
  position: "absolute",
  top: "0",
});

const workedBar = css({ background: "key" });

const forecastBar = css({ background: "blue.200" });

const band = css({
  borderColor: "warning",
  borderLeftWidth: "2px",
  borderRightWidth: "2px",
  bottom: "0",
  position: "absolute",
  top: "0",
});

const legend = css({
  color: "fg.sub",
  display: "flex",
  flexWrap: "wrap",
  columnGap: "3",
  rowGap: "1",
  listStyle: "none",
  margin: "0",
  p: "0",
  textStyle: "std-14N-170",
  "& li": { alignItems: "center", display: "inline-flex", gap: "1" },
});

const chip = css({
  borderRadius: "4",
  display: "inline-block",
  height: "10px",
  width: "14px",
});

const bandChip = css({
  display: "inline-block",
  height: "10px",
  width: "14px",
  borderColor: "warning",
  borderLeftWidth: "2px",
  borderRightWidth: "2px",
});

const status = css({
  borderLeftWidth: "4px",
  borderRadius: "4",
  margin: "0",
  px: "3",
  py: "2",
  textStyle: "std-14N-170",
  fontWeight: "bold",
});

const STATUS_STYLE: Record<MonthSummary["status"], string> = {
  unset: css({ background: "bg.subtle", borderColor: "border", color: "fg.sub" }),
  below: css({ background: "yellow.50", borderColor: "warning", color: "warning" }),
  within: css({ background: "green.50", borderColor: "success", color: "green.800" }),
  over: css({ background: "red.50", borderColor: "error", color: "error" }),
};

const rangeBox = css({
  borderColor: "border.divider",
  borderTopWidth: "1px",
  display: "grid",
  gap: "2",
  pt: "4",
});

const rangeRow = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
  textStyle: "std-14N-170",
});

const rangeInput = css({
  textAlign: "right",
  width: "5.5rem",
});

const error = css({
  color: "error",
  fontWeight: "bold",
  margin: "0",
  textStyle: "std-14N-170",
});

function statusText(summary: MonthSummary): string {
  const forecast = `${formatHours(summary.forecastMinutes)}h`;
  switch (summary.status) {
    case "unset":
      return "精算幅を入力すると、下限・上限までの残り時間が分かります";
    case "below":
      return `残りを予定どおり働いても月末は ${forecast} で、下限に届きません`;
    case "over":
      return `残りを予定どおり働くと月末は ${forecast} で、上限を超えます`;
    case "within":
      return `残りを予定どおり働くと月末は ${forecast} で、精算幅に収まります`;
  }
}

function hoursText(minutes: number | null): string {
  return minutes === null ? "—" : `${formatHours(minutes)}h`;
}

function rangeText(range: MonthRange): string {
  const show = (minutes: number | null) => (minutes === null ? "" : formatHours(minutes));
  return `${show(range.minMinutes)}〜${show(range.maxMinutes)}h`;
}

function percent(minutes: number, scale: number): string {
  return `${Math.min(100, (minutes / scale) * 100)}%`;
}

export function Summary({
  month,
  range,
  summary,
  onSaveRange,
}: {
  month: number;
  range: MonthRange;
  summary: MonthSummary;
  onSaveRange: (range: MonthRange) => void;
}) {
  const [min, setMin] = useState(() => formatHours(range.minMinutes));
  const [max, setMax] = useState(() => formatHours(range.maxMinutes));
  const [problem, setProblem] = useState<string | null>(null);

  function save() {
    const minMinutes = parseHours(min);
    const maxMinutes = parseHours(max);
    if ((min.trim() !== "" && minMinutes === null) || (max.trim() !== "" && maxMinutes === null)) {
      setProblem("精算幅は 140 や 162.5 のように時間で入力してください");
      return;
    }
    if (minMinutes !== null && maxMinutes !== null && minMinutes > maxMinutes) {
      setProblem("下限は上限以下にしてください");
      return;
    }
    setProblem(null);
    if (minMinutes !== range.minMinutes || maxMinutes !== range.maxMinutes) {
      onSaveRange({ ...range, minMinutes, maxMinutes });
    }
  }

  // 目盛りは上限か見込みの大きいほうに 1 割足した長さにする。
  const scale = Math.max(
    60,
    (range.maxMinutes ?? 0) * 1.1,
    summary.forecastMinutes * 1.1,
    (range.minMinutes ?? 0) * 1.1,
  );
  const toMax = summary.toMaxMinutes;

  const hasRange = range.minMinutes !== null || range.maxMinutes !== null;

  return (
    <section className={root} aria-labelledby="work-report-summary">
      <h2 id="work-report-summary" className={heading}>
        {month}月の進み具合
      </h2>

      <div>
        <p className={label}>実働の合計</p>
        <p className={big}>
          {formatHours(summary.workedMinutes)}
          <span className={unit}>h</span>
        </p>
      </div>

      <p className={cx(status, STATUS_STYLE[summary.status])} role="status">
        {statusText(summary)}
      </p>

      <div className={meter}>
        <div className={track} aria-hidden="true">
          <div
            className={cx(bar, forecastBar)}
            style={{ width: percent(summary.forecastMinutes, scale) }}
          />
          <div
            className={cx(bar, workedBar)}
            style={{ width: percent(summary.workedMinutes, scale) }}
          />
          {hasRange ? (
            <div
              className={band}
              style={{
                left: percent(range.minMinutes ?? 0, scale),
                width: `calc(${percent(range.maxMinutes ?? scale, scale)} - ${percent(range.minMinutes ?? 0, scale)})`,
              }}
            />
          ) : null}
        </div>
        <ul className={legend}>
          <li>
            <span className={cx(chip, workedBar)} aria-hidden="true" />
            実働
          </li>
          <li>
            <span className={cx(chip, forecastBar)} aria-hidden="true" />
            月末の見込み
          </li>
          <li>
            <span className={bandChip} aria-hidden="true" />
            精算幅{hasRange ? `（${rangeText(range)}）` : ""}
          </li>
        </ul>
      </div>

      <dl className={stats}>
        <div className={stat}>
          <dt>下限まで</dt>
          <dd>{summary.toMinMinutes === null ? "—" : `あと ${hoursText(summary.toMinMinutes)}`}</dd>
        </div>
        <div className={stat}>
          <dt>上限まで</dt>
          <dd>
            {toMax === null
              ? "—"
              : toMax >= 0
                ? `あと ${hoursText(toMax)}`
                : `${hoursText(-toMax)} 超過`}
          </dd>
        </div>
        <div className={stat}>
          <dt>残りの稼働日</dt>
          <dd>{summary.remainingWorkdays} 日</dd>
        </div>
        <div className={stat}>
          <dt>必要なペース</dt>
          <dd>
            {summary.neededPerDayMinutes === null
              ? "—"
              : `${hoursText(summary.neededPerDayMinutes)} / 日`}
          </dd>
        </div>
        <div className={stat}>
          <dt>月末の見込み</dt>
          <dd>{hoursText(summary.forecastMinutes)}</dd>
        </div>
        <div className={stat}>
          <dt>{month}月の稼働日</dt>
          <dd>{summary.workdays} 日</dd>
        </div>
      </dl>

      <div className={rangeBox}>
        <p className={label}>
          精算幅
          <Tooltip label="精算幅の説明">
            契約で決めた、月の稼働時間の下限と上限です（例:
            140〜180h）。入力していない月は、直前に入力した月の値を引き継ぎます。
          </Tooltip>
        </p>
        <div className={rangeRow}>
          <input
            aria-label="精算幅の下限（時間）"
            inputMode="decimal"
            placeholder="140"
            className={cx(input({ size: "sm" }), rangeInput)}
            value={min}
            onChange={(event) => setMin(event.target.value)}
            onBlur={save}
          />
          <span>〜</span>
          <input
            aria-label="精算幅の上限（時間）"
            inputMode="decimal"
            placeholder="180"
            className={cx(input({ size: "sm" }), rangeInput)}
            value={max}
            onChange={(event) => setMax(event.target.value)}
            onBlur={save}
          />
          <span>h</span>
        </div>
        {problem ? (
          <p role="alert" className={error}>
            {problem}
          </p>
        ) : null}
      </div>
    </section>
  );
}
