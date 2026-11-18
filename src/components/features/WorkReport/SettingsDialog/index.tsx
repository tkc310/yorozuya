import { useState } from "react";
import { css, cx } from "styled-system/css";
import { input } from "styled-system/recipes";
import {
  WEEKDAY_LABELS,
  type WorkReportSettings,
} from "@/src/shared/features/work-report/report.schema";
import {
  formatClock,
  formatHours,
  parseClock,
  parseHours,
} from "@/src/shared/features/work-report/report.service";
import { Button } from "@/src/components/ui/Button/index";
import { Dialog } from "@/src/components/ui/Dialog/index";
import { Switch } from "@/src/components/ui/Switch/index";

const stack = css({
  display: "grid",
  gap: "6",
});

const group = css({
  border: "none",
  display: "grid",
  gap: "3",
  margin: "0",
  p: "0",
});

const legend = css({
  p: "0",
  textStyle: "std-16B-170",
});

const hint = css({
  color: "fg.sub",
  margin: "0",
  textStyle: "std-14N-170",
});

const week = css({
  display: "grid",
  gap: "2",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
});

const day = css({
  display: "grid",
  gap: "1",
  justifyItems: "center",
  textStyle: "std-14N-170",
});

const small = css({
  px: "1!",
  textAlign: "center",
  width: "100%",
});

const row = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
});

const labeled = css({
  display: "grid",
  flex: "1",
  gap: "1",
  minWidth: "10rem",
  textStyle: "std-14N-170",
});

const error = css({
  color: "error",
  fontWeight: "bold",
  margin: "0",
  textStyle: "std-14N-170",
});

const footer = css({
  display: "flex",
  gap: "2",
  justifyContent: "flex-end",
});

// 日曜始まりの並びを、画面では月曜始まりで見せる。
const ORDER = [1, 2, 3, 4, 5, 6, 0];

type Draft = {
  weekday: string[];
  holidaysOff: boolean;
  defaultStart: string;
  defaultBreak: string;
  name: string;
  client: string;
  project: string;
};

function draftOf(settings: WorkReportSettings): Draft {
  return {
    weekday: settings.weekdayMinutes.map((minutes) => formatHours(minutes)),
    holidaysOff: settings.holidaysOff,
    defaultStart: formatClock(settings.defaultStart),
    defaultBreak: String(settings.defaultBreak),
    name: settings.name,
    client: settings.client,
    project: settings.project,
  };
}

function settingsOf(draft: Draft): WorkReportSettings | string {
  const weekday = draft.weekday.map((value) => (value.trim() === "" ? 0 : parseHours(value)));
  if (weekday.some((value) => value === null || value > 24 * 60)) {
    return "曜日ごとの予定は 0〜24 の時間で入力してください";
  }
  const defaultStart = parseClock(draft.defaultStart);
  if (defaultStart === null || defaultStart >= 24 * 60) {
    return "始業時刻は 10:00 のように入力してください";
  }
  const defaultBreak = Number(draft.defaultBreak.trim() === "" ? "0" : draft.defaultBreak);
  if (!Number.isInteger(defaultBreak) || defaultBreak < 0 || defaultBreak > 24 * 60) {
    return "休憩は分の整数で入力してください";
  }
  const [sun, mon, tue, wed, thu, fri, sat] = weekday as number[];
  return {
    weekdayMinutes: [sun ?? 0, mon ?? 0, tue ?? 0, wed ?? 0, thu ?? 0, fri ?? 0, sat ?? 0],
    holidaysOff: draft.holidaysOff,
    defaultStart,
    defaultBreak,
    name: draft.name.trim(),
    client: draft.client.trim(),
    project: draft.project.trim(),
  };
}

// 入力中の値で「定時を入力」がどう入るかの例。読めない値があれば出さない。
function fillExample(draft: Draft): string | null {
  const next = settingsOf(draft);
  if (typeof next === "string") {
    return null;
  }
  const planned = ORDER.map((index) => next.weekdayMinutes[index] ?? 0).find(
    (minutes) => minutes > 0,
  );
  if (planned === undefined) {
    return null;
  }
  const end = formatClock(next.defaultStart + planned + next.defaultBreak);
  return `予定 ${formatHours(planned)}h の日は ${formatClock(next.defaultStart)}〜${end}`;
}

export function SettingsDialog({
  open,
  settings,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  settings: WorkReportSettings;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: WorkReportSettings) => Promise<unknown>;
}) {
  return (
    <Dialog open={open} title="作業報告書の設定" onOpenChange={onOpenChange}>
      {/* 開くたびに保存済みの値から作り直す。 */}
      <SettingsForm settings={settings} onCancel={() => onOpenChange(false)} onSave={onSave} />
    </Dialog>
  );
}

function SettingsForm({
  settings,
  onCancel,
  onSave,
}: {
  settings: WorkReportSettings;
  onCancel: () => void;
  onSave: (settings: WorkReportSettings) => Promise<unknown>;
}) {
  const [draft, setDraft] = useState(() => draftOf(settings));
  const [problem, setProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const text = (key: "defaultStart" | "defaultBreak" | "name" | "client" | "project") => ({
    value: draft[key],
    onChange: (event: { target: { value: string } }) =>
      setDraft((current) => ({ ...current, [key]: event.target.value })),
  });

  const example = fillExample(draft);

  return (
    <form
      className={stack}
      onSubmit={(event) => {
        event.preventDefault();
        const next = settingsOf(draft);
        if (typeof next === "string") {
          setProblem(next);
          return;
        }
        setProblem(null);
        setSaving(true);
        onSave(next)
          .then(onCancel)
          .catch((reason: unknown) =>
            setProblem(reason instanceof Error ? reason.message : "保存できませんでした"),
          )
          .finally(() => setSaving(false));
      }}
    >
      <fieldset className={group}>
        <legend className={legend}>稼働日と予定時間</legend>
        <p className={hint}>
          曜日ごとに 1 日の予定時間（h）を入力します。0 か空にした曜日は休みになります。
        </p>
        <div className={week}>
          {ORDER.map((index) => (
            <label key={index} className={day}>
              {WEEKDAY_LABELS[index]}
              <input
                inputMode="decimal"
                aria-label={`${WEEKDAY_LABELS[index]}曜日の予定時間`}
                className={cx(input({ size: "sm" }), small)}
                value={draft.weekday[index] ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    weekday: current.weekday.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  }))
                }
              />
            </label>
          ))}
        </div>
        <Switch
          label="祝日は休みにする"
          checked={draft.holidaysOff}
          onCheckedChange={(holidaysOff) => setDraft((current) => ({ ...current, holidaysOff }))}
        />
      </fieldset>

      <fieldset className={group}>
        <legend className={legend}>定時</legend>
        <p className={hint}>
          表の「定時を入力」ボタンで入る時刻です。終業時刻は、始業時刻にその日の予定時間と休憩を足して決まります
          {example ? `（例: ${example}）` : ""}。
        </p>
        <div className={row}>
          <label className={labeled}>
            始業時刻
            <input
              inputMode="numeric"
              placeholder="10:00"
              className={input({ size: "sm" })}
              {...text("defaultStart")}
            />
          </label>
          <label className={labeled}>
            休憩（分）
            <input
              inputMode="numeric"
              placeholder="60"
              className={input({ size: "sm" })}
              {...text("defaultBreak")}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className={group}>
        <legend className={legend}>書き出すファイルに載せる項目</legend>
        <div className={row}>
          <label className={labeled}>
            氏名
            <input className={input({ size: "sm" })} {...text("name")} />
          </label>
          <label className={labeled}>
            提出先
            <input className={input({ size: "sm" })} {...text("client")} />
          </label>
          <label className={labeled}>
            案件名
            <input className={input({ size: "sm" })} {...text("project")} />
          </label>
        </div>
      </fieldset>

      {problem ? (
        <p role="alert" className={error}>
          {problem}
        </p>
      ) : null}
      <div className={footer}>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          保存する
        </Button>
      </div>
    </form>
  );
}
