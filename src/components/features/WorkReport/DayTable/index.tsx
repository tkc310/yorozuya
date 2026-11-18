import { useState } from "react";
import { css, cx } from "styled-system/css";
import { button, input } from "styled-system/recipes";
import {
  WEEKDAY_LABELS,
  type DayEntry,
  type DayOverride,
  type WorkReportSettings,
} from "@/src/shared/features/work-report/report.schema";
import {
  emptyEntry,
  formatClock,
  formatHours,
  parseClock,
  workedMinutesOf,
  type DayRow,
} from "@/src/shared/features/work-report/report.service";
import { dayLabel } from "../report-sheet.service";

const wrap = css({
  overflowX: "auto",
});

const table = css({
  borderCollapse: "collapse",
  minWidth: "44rem",
  width: "100%",
  textStyle: "std-14N-170",
  "& th, & td": {
    borderBottomWidth: "1px",
    borderColor: "border.divider",
    px: "2",
    py: "1",
    textAlign: "left",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  "& th": {
    background: "bg.subtle",
    color: "fg.sub",
    fontWeight: "normal",
    position: "sticky",
    top: "0",
    zIndex: "1",
  },
});

const offRow = css({
  background: "bg.subtle",
  color: "fg.sub",
});

const holidayText = css({
  color: "red.800",
  fontWeight: "bold",
});

const dateText = css({
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
  minWidth: "5.5rem",
});

const kindText = css({
  textStyle: "std-14N-170",
});

const todayRow = css({
  boxShadow: "inset 4px 0 0 token(colors.key)",
});

const numeric = css({
  fontVariantNumeric: "tabular-nums",
  textAlign: "right!",
});

const clockInput = css({
  height: "32px!",
  px: "2!",
  textAlign: "right",
  width: "4.5rem",
});

const breakInput = css({
  height: "32px!",
  px: "2!",
  textAlign: "right",
  width: "4rem",
});

const noteInput = css({
  height: "32px!",
  minWidth: "10rem",
  px: "2!",
  width: "100%",
});

const overrideSelect = css({
  borderColor: "border.field",
  borderRadius: "8",
  borderWidth: "1px",
  height: "32px",
  px: "1",
  textStyle: "std-14N-170",
  background: "bg.canvas",
  color: "fg",
});

const error = css({
  color: "error",
  fontWeight: "bold",
  margin: "0",
  textStyle: "std-14N-170",
  whiteSpace: "normal",
});

const OVERRIDE_LABELS: Record<DayOverride, string> = {
  none: "通常",
  off: "休み",
  work: "稼働",
};

type Draft = { start: string; end: string; breakMinutes: string; note: string };

function draftOf(entry: DayEntry | null): Draft {
  return {
    start: formatClock(entry?.start ?? null),
    end: formatClock(entry?.end ?? null),
    breakMinutes: entry && entry.breakMinutes > 0 ? String(entry.breakMinutes) : "",
    note: entry?.note ?? "",
  };
}

function entryOf(
  date: string,
  draft: Draft,
  override: DayOverride,
): { entry: DayEntry; error: null } | { entry: null; error: string } {
  const start = parseClock(draft.start);
  const end = parseClock(draft.end);
  if (draft.start.trim() !== "" && start === null) {
    return { entry: null, error: "開始は 9:30 のように入力してください" };
  }
  if (draft.end.trim() !== "" && end === null) {
    return { entry: null, error: "終了は 18:00 のように入力してください（日をまたぐなら 25:00）" };
  }
  const breakText = draft.breakMinutes.trim();
  const breakMinutes = breakText === "" ? 0 : Number(breakText);
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    return { entry: null, error: "休憩は分の整数で入力してください" };
  }
  if (start !== null && end !== null && end < start) {
    return { entry: null, error: "終了は開始より後にしてください" };
  }
  if (start !== null && end !== null && breakMinutes > end - start) {
    return { entry: null, error: "休憩が作業時間より長くなっています" };
  }
  return {
    entry: { ...emptyEntry(date), start, end, breakMinutes, override, note: draft.note.trim() },
    error: null,
  };
}

function DayLine({
  row,
  month,
  today,
  settings,
  onSave,
}: {
  row: DayRow;
  month: number;
  today: string;
  settings: WorkReportSettings;
  onSave: (entry: DayEntry) => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(row.entry));
  const [override, setOverride] = useState<DayOverride>(row.entry?.override ?? "none");
  const [problem, setProblem] = useState<string | null>(null);
  const label = `${month}月${row.day}日`;

  function save(nextDraft: Draft, nextOverride: DayOverride) {
    const result = entryOf(row.date, nextDraft, nextOverride);
    if (result.error !== null) {
      setProblem(result.error);
      return;
    }
    setProblem(null);
    // 「1900」のような入力は「19:00」に整えて見せる。
    setDraft(draftOf(result.entry));
    const saved = draftOf(row.entry);
    const unchanged =
      nextOverride === (row.entry?.override ?? "none") &&
      (Object.keys(saved) as (keyof Draft)[]).every(
        (key) => saved[key].trim() === nextDraft[key].trim(),
      );
    if (!unchanged) {
      onSave(result.entry);
    }
  }

  function fillPlan() {
    const start = settings.defaultStart;
    const next: Draft = {
      start: formatClock(start),
      end: formatClock(start + row.plannedMinutes + settings.defaultBreak),
      breakMinutes: String(settings.defaultBreak),
      note: draft.note,
    };
    setDraft(next);
    save(next, override);
  }

  const parsed = entryOf(row.date, draft, override);
  const worked = parsed.entry ? workedMinutesOf(parsed.entry) : row.workedMinutes;
  const field = (key: keyof Draft) => ({
    value: draft[key],
    onChange: (event: { target: { value: string } }) =>
      setDraft((current) => ({ ...current, [key]: event.target.value })),
    onBlur: () => save(draft, override),
  });
  const kind = dayLabel(row);
  const canFill = row.workday && row.plannedMinutes > 0 && draft.start === "" && draft.end === "";

  return (
    <tr
      className={cx(!row.workday && offRow, row.date === today && todayRow)}
      aria-current={row.date === today ? "date" : undefined}
    >
      <td>
        <span className={cx(dateText, row.holiday && holidayText)}>
          {row.day}日（{WEEKDAY_LABELS[row.weekday]}）
        </span>
        {kind ? <span className={cx(kindText, row.holiday && holidayText)}>{kind}</span> : null}
      </td>
      <td>
        <select
          aria-label={`${label}の区分`}
          className={overrideSelect}
          value={override}
          onChange={(event) => {
            const next = event.target.value as DayOverride;
            setOverride(next);
            save(draft, next);
          }}
        >
          {(Object.keys(OVERRIDE_LABELS) as DayOverride[]).map((value) => (
            <option key={value} value={value}>
              {OVERRIDE_LABELS[value]}
            </option>
          ))}
        </select>
      </td>
      <td className={numeric}>{row.plannedMinutes > 0 ? formatHours(row.plannedMinutes) : "—"}</td>
      <td>
        <input
          aria-label={`${label}の開始`}
          inputMode="numeric"
          placeholder="--:--"
          className={cx(input({ size: "sm" }), clockInput)}
          {...field("start")}
        />
      </td>
      <td>
        <input
          aria-label={`${label}の終了`}
          inputMode="numeric"
          placeholder="--:--"
          className={cx(input({ size: "sm" }), clockInput)}
          {...field("end")}
        />
      </td>
      <td>
        <input
          aria-label={`${label}の休憩（分）`}
          inputMode="numeric"
          className={cx(input({ size: "sm" }), breakInput)}
          {...field("breakMinutes")}
        />
      </td>
      <td className={numeric}>{formatHours(worked)}</td>
      <td>
        <input
          aria-label={`${label}の作業内容`}
          className={cx(input({ size: "sm" }), noteInput)}
          {...field("note")}
        />
        {problem ? (
          <p role="alert" className={error}>
            {problem}
          </p>
        ) : null}
      </td>
      <td>
        {canFill ? (
          <button
            type="button"
            className={button({ variant: "text", size: "xs" })}
            aria-label={`${label}を予定どおりで埋める`}
            onClick={fillPlan}
          >
            予定で埋める
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export function DayTable({
  rows,
  month,
  today,
  settings,
  onSave,
}: {
  rows: DayRow[];
  month: number;
  today: string;
  settings: WorkReportSettings;
  onSave: (entry: DayEntry) => void;
}) {
  return (
    <div className={wrap}>
      <table className={table}>
        <caption className={css({ srOnly: true })}>{month}月の日ごとの稼働</caption>
        <thead>
          <tr>
            <th scope="col">日付</th>
            <th scope="col">区分</th>
            <th scope="col" className={numeric}>
              予定(h)
            </th>
            <th scope="col">開始</th>
            <th scope="col">終了</th>
            <th scope="col">休憩(分)</th>
            <th scope="col" className={numeric}>
              実働(h)
            </th>
            <th scope="col">作業内容</th>
            <th scope="col">
              <span className={css({ srOnly: true })}>操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <DayLine
              key={row.date}
              row={row}
              month={month}
              today={today}
              settings={settings}
              onSave={onSave}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
