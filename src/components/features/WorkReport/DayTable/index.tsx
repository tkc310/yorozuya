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
import { Tooltip } from "@/src/components/ui/Tooltip/index";

const wrap = css({
  overflowX: "auto",
});

const table = css({
  borderCollapse: "collapse",
  minWidth: "46rem",
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
  "& thead th": {
    borderBottomWidth: "2px",
    borderColor: "border",
    color: "fg.sub",
    fontWeight: "bold",
    py: "2",
    textStyle: "std-14N-170",
  },
  "& tfoot th, & tfoot td": {
    borderBottomWidth: "0",
    borderTopWidth: "2px",
    borderColor: "border",
    fontWeight: "bold",
    py: "3",
  },
});

const headLabel = css({
  alignItems: "center",
  display: "inline-flex",
  gap: "1",
});

const unit = css({
  color: "fg.sub",
  fontWeight: "normal",
  ml: "0.5",
});

// 休みの日は入力欄を薄くして、稼働日を目で追いやすくする。
const offRow = css({
  background: "bg.subtle",
  color: "fg.sub",
  "& input": {
    borderColor: "border",
  },
  "& input::placeholder": { color: "transparent" },
  "& input:hover, & input:focus": {
    borderColor: "border.field",
  },
});

const todayRow = css({
  background: "blue.50",
  boxShadow: "inset 4px 0 0 token(colors.key)",
});

const dateCell = css({
  alignItems: "center",
  display: "flex",
  gap: "2",
});

const dateText = css({
  color: "fg",
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
  minWidth: "4.75rem",
});

const saturdayText = css({ color: "blue.900" });

const sundayText = css({ color: "red.800" });

const holidayText = css({ color: "red.800", fontWeight: "bold" });

const tag = css({
  borderRadius: "4",
  borderWidth: "1px",
  lineHeight: "1.4",
  px: "1",
  textStyle: "oln-14N-100",
  fontSize: "12px",
});

const holidayTag = css({ borderColor: "red.800", color: "red.800" });

const todayTag = css({
  background: "key",
  borderColor: "key",
  color: "fg.inverse",
  fontWeight: "bold",
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
  minWidth: "8rem",
  px: "2!",
  width: "100%",
});

const stateSelect = css({
  borderColor: "border.field",
  borderRadius: "8",
  borderWidth: "1px",
  height: "32px",
  px: "1",
  textStyle: "std-14N-170",
  background: "bg.canvas",
  color: "fg",
});

// 設定（曜日・祝日）と違う扱いにした日は、切り替えたことが分かるようにする。
const stateChanged = css({
  borderColor: "key",
  borderWidth: "2px",
  color: "key",
  fontWeight: "bold",
});

const error = css({
  color: "error",
  fontWeight: "bold",
  margin: "0",
  textStyle: "std-14N-170",
  whiteSpace: "normal",
});

// 画面では「稼働日か休みか」だけを選ばせる。設定どおりなら none、違えば off / work として保存する。
type DayState = "work" | "off";

const STATE_LABELS: Record<DayState, string> = {
  work: "稼働日",
  off: "休み",
};

function stateOf(row: DayRow, override: DayOverride): DayState {
  if (override === "none") {
    return row.kind === "workday" ? "work" : "off";
  }
  return override;
}

function overrideOf(row: DayRow, state: DayState): DayOverride {
  return stateOf(row, "none") === state ? "none" : state;
}

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
  const state = stateOf(row, override);
  const isToday = row.date === today;
  const canFill = row.workday && row.plannedMinutes > 0 && draft.start === "" && draft.end === "";
  const fillStart = formatClock(settings.defaultStart);
  const fillEnd = formatClock(settings.defaultStart + row.plannedMinutes + settings.defaultBreak);

  return (
    <tr
      className={cx(state === "off" && offRow, isToday && todayRow)}
      aria-current={isToday ? "date" : undefined}
    >
      <td>
        <span className={dateCell}>
          <span
            className={cx(
              dateText,
              row.weekday === 6 && saturdayText,
              row.weekday === 0 && sundayText,
              row.holiday && holidayText,
            )}
          >
            {row.day}日（{WEEKDAY_LABELS[row.weekday]}）
          </span>
          {isToday ? <span className={cx(tag, todayTag)}>今日</span> : null}
          {row.holiday ? <span className={cx(tag, holidayTag)}>{row.holiday}</span> : null}
        </span>
      </td>
      <td>
        <select
          aria-label={`${label}の稼働／休み`}
          title={override === "none" ? undefined : "設定（曜日・祝日）から切り替えています"}
          className={cx(stateSelect, override !== "none" && stateChanged)}
          value={state}
          onChange={(event) => {
            const next = overrideOf(row, event.target.value as DayState);
            setOverride(next);
            save(draft, next);
          }}
        >
          {(Object.keys(STATE_LABELS) as DayState[]).map((value) => (
            <option key={value} value={value}>
              {STATE_LABELS[value]}
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
            className={button({ variant: "outline", size: "xs" })}
            aria-label={`${label}に定時を入力`}
            title={`${fillStart}〜${fillEnd}（休憩 ${settings.defaultBreak} 分）を入力します`}
            onClick={fillPlan}
          >
            定時を入力
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
  const plannedTotal = rows.reduce((sum, row) => sum + row.plannedMinutes, 0);
  const workedTotal = rows.reduce((sum, row) => sum + (row.workedMinutes ?? 0), 0);
  return (
    <div className={wrap}>
      <table className={table}>
        <caption className={css({ srOnly: true })}>{month}月の日ごとの稼働</caption>
        <thead>
          <tr>
            <th scope="col">日付</th>
            <th scope="col">
              <span className={headLabel}>
                稼働／休み
                <Tooltip label="稼働／休みの説明">
                  設定の曜日ごとの予定時間と祝日から自動で決まります。有給や休日出勤など、その日だけ変えたいときに切り替えます。
                </Tooltip>
              </span>
            </th>
            <th scope="col" className={numeric}>
              予定<span className={unit}>(h)</span>
            </th>
            <th scope="col">開始</th>
            <th scope="col">終了</th>
            <th scope="col">
              休憩<span className={unit}>(分)</span>
            </th>
            <th scope="col" className={numeric}>
              実働<span className={unit}>(h)</span>
            </th>
            <th scope="col">作業内容</th>
            <th scope="col">
              <span className={headLabel}>
                定時入力
                <Tooltip label="定時入力の説明">
                  定時どおりに働いた日は、ボタン 1
                  つで開始・終了・休憩を入力できます。入る時刻は、設定の始業時刻と休憩、その日の予定時間から決まります。
                </Tooltip>
              </span>
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
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              合計
            </th>
            <td className={numeric}>{formatHours(plannedTotal)}</td>
            <td colSpan={3} />
            <td className={numeric}>{formatHours(workedTotal)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
