import { useState } from "react";
import { css, cx } from "styled-system/css";
import { input } from "styled-system/recipes";
import type { MonthRange } from "@/src/shared/features/work-report/report.schema";
import {
  formatHours,
  parseHours,
  type MonthSummary,
} from "@/src/shared/features/work-report/report.service";

const root = css({
  display: "grid",
  gap: "5",
});

const heading = css({
  margin: "0",
  textStyle: "std-18B-160",
});

const big = css({
  fontVariantNumeric: "tabular-nums",
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
  margin: "0",
  textStyle: "std-14N-170",
});

const status = css({
  borderRadius: "8",
  borderWidth: "2px",
  margin: "0",
  px: "3",
  py: "2",
  textStyle: "std-14N-170",
  fontWeight: "bold",
});

const STATUS_STYLE: Record<MonthSummary["status"], string> = {
  unset: css({ borderColor: "border.divider", color: "fg.sub" }),
  below: css({ borderColor: "warning", color: "warning" }),
  within: css({ borderColor: "success", color: "success" }),
  over: css({ borderColor: "error", color: "error" }),
};

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
      return "精算幅を入れると、下限・上限までの残りが出ます";
    case "below":
      return `予定どおりでも見込み ${forecast} で、下限に届きません`;
    case "over":
      return `予定どおりだと見込み ${forecast} で、上限を超えます`;
    case "within":
      return `見込み ${forecast} で、精算幅に収まります`;
  }
}

function hoursText(minutes: number | null): string {
  return minutes === null ? "—" : `${formatHours(minutes)}h`;
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

  return (
    <section className={root} aria-labelledby="work-report-summary">
      <h2 id="work-report-summary" className={heading}>
        {month}月の進み具合
      </h2>

      <div className={rangeRow}>
        <span>精算幅</span>
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

      <div>
        <p className={legend}>実績</p>
        <p className={big}>
          {formatHours(summary.workedMinutes)}
          <span className={unit}>h</span>
        </p>
      </div>

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
          {range.minMinutes !== null || range.maxMinutes !== null ? (
            <div
              className={band}
              style={{
                left: percent(range.minMinutes ?? 0, scale),
                width: `calc(${percent(range.maxMinutes ?? scale, scale)} - ${percent(range.minMinutes ?? 0, scale)})`,
              }}
            />
          ) : null}
        </div>
        <p className={legend}>
          濃い色が実績、薄い色が予定どおりに働いたときの見込み、枠が精算幅です。
        </p>
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
          <dt>残り稼働日</dt>
          <dd>{summary.remainingWorkdays} 日</dd>
        </div>
        <div className={stat}>
          <dt>下限に必要</dt>
          <dd>
            {summary.neededPerDayMinutes === null
              ? "—"
              : `${hoursText(summary.neededPerDayMinutes)} / 日`}
          </dd>
        </div>
        <div className={stat}>
          <dt>見込み合計</dt>
          <dd>{hoursText(summary.forecastMinutes)}</dd>
        </div>
        <div className={stat}>
          <dt>今月の稼働日</dt>
          <dd>{summary.workdays} 日</dd>
        </div>
      </dl>

      <p className={cx(status, STATUS_STYLE[summary.status])} role="status">
        {statusText(summary)}
      </p>
    </section>
  );
}
