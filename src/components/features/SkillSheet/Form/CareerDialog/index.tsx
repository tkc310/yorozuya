import { useEffect, useRef, useState } from "react";
import { css } from "styled-system/css";
import {
  CAREER_SUMMARY_GUIDE_LENGTH,
  PHASES,
  type Career,
  type Phase,
} from "@/shared/features/skill-sheet/sheet";
import { Button } from "@/src/components/ui/Button/index";
import { Checkbox } from "@/src/components/ui/Checkbox/index";
import { Dialog } from "@/src/components/ui/Dialog/index";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Textarea } from "@/src/components/ui/Textarea/index";
import { ListInput } from "../ListInput/index";
import { lengthHint } from "../values";

const form = css({
  display: "grid",
  gap: "6",
  gridTemplateColumns: "minmax(0, 1fr)",
});

// 開始年月、進行中、終了年月をそれぞれ1行にする。年と月は横に並べ、左に寄せる。
const period = css({
  alignItems: "start",
  display: "grid",
  gap: "4",
  gridTemplateColumns: "auto auto",
  justifyContent: "start",
});

// 西暦 4 桁と月 2 桁が入る幅（入力例も収まる幅）。
const yearInput = css({ width: "6.5rem" });
const monthInput = css({ width: "5rem" });

const row = css({
  alignItems: "end",
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
  justifyContent: "flex-end",
});

const checks = css({
  display: "flex",
  flexWrap: "wrap",
  columnGap: "6",
});

const group = css({
  border: "none",
  display: "grid",
  gap: "1",
  margin: "0",
  minWidth: "0",
  padding: "0",
});

const groupLabel = css({
  color: "fg",
  padding: "0",
  textStyle: "std-16B-170",
});

const summary = css({
  borderColor: "error",
  borderRadius: "12",
  borderWidth: "3px",
  color: "error",
  display: "grid",
  gap: "1",
  margin: "0",
  px: "4",
  py: "3",
  textStyle: "std-16B-170",
});

const summaryList = css({
  margin: "0",
  pl: "6",
  textStyle: "std-14N-170",
});

export type CareerDraft = {
  projectName: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  ongoing: boolean;
  summary: string;
  detailSummary: string;
  work: string;
  outcome: string;
  role: string;
  employment: string;
  environment: string[];
  team: string;
  methodology: string;
  tools: string[];
  phases: Phase[];
  hard: boolean;
};

export const emptyCareer: CareerDraft = {
  projectName: "",
  startYear: "",
  startMonth: "",
  endYear: "",
  endMonth: "",
  ongoing: false,
  summary: "",
  detailSummary: "",
  work: "",
  outcome: "",
  role: "",
  employment: "",
  environment: [],
  team: "",
  methodology: "",
  tools: [],
  phases: [],
  hard: false,
};

// 検証する欄。並び順はフォーカスする順。
const CHECKED_FIELDS = [
  "projectName",
  "startYear",
  "startMonth",
  "endYear",
  "endMonth",
  "role",
  "environment",
  "team",
  "methodology",
  "tools",
] as const;

type CheckedField = (typeof CHECKED_FIELDS)[number];

// 欄の下には短く出し、上のまとめで詳しく伝える。
const REQUIRED = "入力してください";

const REQUIRED_DETAIL: Record<CheckedField, string> = {
  projectName: "入力してください",
  startYear: "入力してください",
  startMonth: "入力してください",
  endYear: "入力するか、進行中を選択してください",
  endMonth: "入力するか、進行中を選択してください",
  role: "入力してください",
  environment: "1つ以上追加してください",
  team: "入力してください",
  methodology: "入力してください",
  tools: "1つ以上追加してください",
};

const FIELD_LABELS: Record<CheckedField, string> = {
  projectName: "企業・案件名",
  startYear: "開始年",
  startMonth: "開始月",
  endYear: "終了年",
  endMonth: "終了月",
  role: "担当職種",
  environment: "技術・環境",
  team: "チーム構成",
  methodology: "開発手法",
  tools: "ツール",
};

export type CareerErrors = Partial<Record<CheckedField, string>>;

// 入力中にすぐ出すエラー。数字以外や範囲外を知らせる。
export function typingError(field: "year" | "month", value: string): string | null {
  const text = value.trim();
  if (text === "") {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    return "数字で入力してください";
  }
  const number = Number(text);
  if (field === "month" && (number < 1 || number > 12)) {
    return "1から12で入力してください";
  }
  if (field === "year" && number < 1) {
    return "1以上で入力してください";
  }
  return null;
}

function numberOf(field: "year" | "month", value: string): number | null {
  if (value.trim() === "" || typingError(field, value)) {
    return null;
  }
  return Number(value.trim());
}

export function validateCareer(draft: CareerDraft): CareerErrors {
  const errors: CareerErrors = {};
  if (draft.projectName.trim().length === 0) {
    errors.projectName = REQUIRED;
  }
  if (numberOf("year", draft.startYear) === null) {
    errors.startYear = typingError("year", draft.startYear) ?? REQUIRED;
  }
  if (numberOf("month", draft.startMonth) === null) {
    errors.startMonth = typingError("month", draft.startMonth) ?? REQUIRED;
  }
  if (!draft.ongoing) {
    if (numberOf("year", draft.endYear) === null) {
      errors.endYear = typingError("year", draft.endYear) ?? REQUIRED;
    }
    if (numberOf("month", draft.endMonth) === null) {
      errors.endMonth = typingError("month", draft.endMonth) ?? REQUIRED;
    }
  }
  for (const field of ["role", "team", "methodology"] as const) {
    if (draft[field].trim().length === 0) {
      errors[field] = REQUIRED;
    }
  }
  for (const field of ["environment", "tools"] as const) {
    if (draft[field].length === 0) {
      errors[field] = "1つ以上追加してください";
    }
  }
  return errors;
}

export function toCareer(draft: CareerDraft): Omit<Career, "id"> | CareerErrors {
  const errors = validateCareer(draft);
  const startYear = numberOf("year", draft.startYear);
  const startMonth = numberOf("month", draft.startMonth);
  const endYear = numberOf("year", draft.endYear);
  const endMonth = numberOf("month", draft.endMonth);
  if (Object.keys(errors).length > 0 || startYear === null || startMonth === null) {
    return errors;
  }
  const end =
    draft.ongoing || endYear === null || endMonth === null
      ? null
      : { year: endYear, month: endMonth };
  return {
    period: { start: { year: startYear, month: startMonth }, end },
    projectName: draft.projectName.trim(),
    summary: draft.summary,
    detailSummary: draft.detailSummary,
    work: draft.work,
    outcome: draft.outcome,
    role: draft.role,
    employment: draft.employment,
    environment: draft.environment,
    team: draft.team,
    methodology: draft.methodology,
    tools: draft.tools,
    phases: draft.phases,
    hard: draft.hard,
  };
}

// 登録済みの経歴を入力欄の値に戻す。
export function toDraft(career: Career): CareerDraft {
  return {
    projectName: career.projectName,
    startYear: String(career.period.start.year),
    startMonth: String(career.period.start.month),
    endYear: career.period.end ? String(career.period.end.year) : "",
    endMonth: career.period.end ? String(career.period.end.month) : "",
    ongoing: career.period.end === null,
    summary: career.summary,
    detailSummary: career.detailSummary,
    work: career.work,
    outcome: career.outcome,
    role: career.role,
    employment: career.employment,
    environment: career.environment,
    team: career.team,
    methodology: career.methodology,
    tools: career.tools,
    phases: career.phases,
    hard: career.hard,
  };
}

export type CareerDialogProps = {
  open: boolean;
  // 編集する経歴。無ければ追加。
  career: Career | null;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (career: Omit<Career, "id">) => void;
  // 入力中の内容。プレビューにすぐ映すために渡す。揃っていなければ null。
  onDraftChange?: (career: Omit<Career, "id"> | null) => void;
};

export function CareerDialog({
  open,
  career,
  pending,
  onOpenChange,
  onSubmit,
  onDraftChange,
}: CareerDialogProps) {
  return (
    <Dialog
      open={open}
      placement="side"
      title={career ? "経歴を編集" : "経歴を追加"}
      onOpenChange={onOpenChange}
    >
      {open ? (
        <CareerForm
          key={career?.id ?? "new"}
          career={career}
          pending={pending}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          onDraftChange={onDraftChange}
        />
      ) : null}
    </Dialog>
  );
}

const overGuide = css({
  color: "error",
  fontWeight: "bold",
});

// 一覧用の概要は、一覧で 2 行に収まる文字数を目安にする。
function SummaryLength({ text }: { text: string }) {
  const result = lengthHint(text, CAREER_SUMMARY_GUIDE_LENGTH);
  return <span className={result.over ? overGuide : undefined}>{result.text}</span>;
}

function CareerForm({
  career,
  pending,
  onCancel,
  onSubmit,
  onDraftChange,
}: {
  career: Career | null;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (career: Omit<Career, "id">) => void;
  onDraftChange?: (career: Omit<Career, "id"> | null) => void;
}) {
  const [draft, setDraft] = useState<CareerDraft>(career ? toDraft(career) : emptyCareer);
  // 追加・保存を押したときのエラー。直した欄から消す。
  const [errors, setErrors] = useState<CareerErrors>({});
  const [attempt, setAttempt] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onDraftChange) {
      return;
    }
    const next = toCareer(draft);
    onDraftChange("period" in next ? next : null);
  }, [draft, onDraftChange]);

  useEffect(() => () => onDraftChange?.(null), [onDraftChange]);

  // 押したあと、最初のエラーの欄にフォーカスする。
  useEffect(() => {
    if (attempt === 0) {
      return;
    }
    const first = root.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    first?.focus();
  }, [attempt]);

  const update = (patch: Partial<CareerDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    const touched = Object.keys(patch) as (keyof CareerDraft)[];
    setErrors((current) => {
      const next = { ...current };
      for (const key of touched) {
        delete next[key as CheckedField];
      }
      if (patch.ongoing) {
        delete next.endYear;
        delete next.endMonth;
      }
      return next;
    });
  };

  // フォーカスを外したら、その欄だけ検証する。
  const touch = (field: CheckedField) => {
    const message = validateCareer(draft)[field];
    setErrors((current) => {
      const next = { ...current };
      if (message) {
        next[field] = message;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const errorOf = (field: CheckedField, kind?: "year" | "month") =>
    (kind ? typingError(kind, draft[field] as string) : null) ?? errors[field] ?? null;

  const messages = CHECKED_FIELDS.flatMap((field) => {
    const message = errors[field];
    if (!message) {
      return [];
    }
    const detail = message === REQUIRED ? REQUIRED_DETAIL[field] : message;
    return [`${FIELD_LABELS[field]}：${detail}`];
  });

  return (
    <div ref={root} className={form}>
      {messages.length > 0 ? (
        <div role="alert" className={summary}>
          入力内容を確認してください
          <ul className={summaryList}>
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <Field label="企業・案件名" required error={errorOf("projectName")}>
        <Input
          placeholder="例: 株式会社〇〇 会員管理システム刷新"
          size="sm"
          value={draft.projectName}
          onChange={(event) => update({ projectName: event.target.value })}
          onBlur={() => touch("projectName")}
        />
      </Field>
      <div className={period}>
        <Field label="開始年" required error={errorOf("startYear", "year")}>
          <Input
            placeholder="例: 2024"
            size="sm"
            inputMode="numeric"
            value={draft.startYear}
            className={yearInput}
            onChange={(event) => update({ startYear: event.target.value })}
            onBlur={() => touch("startYear")}
          />
        </Field>
        <Field label="開始月" required error={errorOf("startMonth", "month")}>
          <Input
            placeholder="例: 4"
            size="sm"
            inputMode="numeric"
            value={draft.startMonth}
            className={monthInput}
            onChange={(event) => update({ startMonth: event.target.value })}
            onBlur={() => touch("startMonth")}
          />
        </Field>
      </div>
      <Checkbox
        checked={draft.ongoing}
        onChange={(event) => update({ ongoing: event.target.checked })}
      >
        進行中
      </Checkbox>
      <div className={period}>
        <Field
          label="終了年"
          required={!draft.ongoing}
          error={draft.ongoing ? null : errorOf("endYear", "year")}
        >
          <Input
            placeholder="例: 2025"
            size="sm"
            inputMode="numeric"
            disabled={draft.ongoing}
            value={draft.ongoing ? "" : draft.endYear}
            className={yearInput}
            onChange={(event) => update({ endYear: event.target.value })}
            onBlur={() => touch("endYear")}
          />
        </Field>
        <Field
          label="終了月"
          required={!draft.ongoing}
          error={draft.ongoing ? null : errorOf("endMonth", "month")}
        >
          <Input
            placeholder="例: 3"
            size="sm"
            inputMode="numeric"
            disabled={draft.ongoing}
            value={draft.ongoing ? "" : draft.endMonth}
            className={monthInput}
            onChange={(event) => update({ endMonth: event.target.value })}
            onBlur={() => touch("endMonth")}
          />
        </Field>
      </div>
      <Field label="職務経歴の一覧用の概要" hint={<SummaryLength text={draft.summary} />}>
        <Textarea
          placeholder="例: 会員管理システムのクラウド移行"
          value={draft.summary}
          onChange={(event) => update({ summary: event.target.value })}
        />
      </Field>
      <Field
        label="職務経歴の詳細用の概要"
        hint="入力しない場合は、職務経歴の一覧用の概要を詳細にも使います。"
      >
        <Textarea
          placeholder="例: オンプレミスの会員管理システムをクラウドへ移行し、運用を自動化した。"
          value={draft.detailSummary}
          onChange={(event) => update({ detailSummary: event.target.value })}
        />
      </Field>
      <Field label="担当業務">
        <Textarea
          placeholder="例: 画面設計、API実装、結合テスト"
          value={draft.work}
          onChange={(event) => update({ work: event.target.value })}
        />
      </Field>
      <Field label="成果" hint="数値で示せる実績があると、書類選考で伝わりやすくなります。">
        <Textarea
          placeholder="例: 手作業の転記を自動化し、月20時間の作業を削減した。"
          value={draft.outcome}
          onChange={(event) => update({ outcome: event.target.value })}
        />
      </Field>
      <Field label="担当職種" required error={errorOf("role")}>
        <Input
          placeholder="例: バックエンドエンジニア"
          size="sm"
          value={draft.role}
          onChange={(event) => update({ role: event.target.value })}
          onBlur={() => touch("role")}
        />
      </Field>
      <Field label="雇用形態">
        <Input
          placeholder="例: 業務委託"
          size="sm"
          value={draft.employment}
          onChange={(event) => update({ employment: event.target.value })}
        />
      </Field>
      <ListInput
        label="技術・環境"
        required
        error={errorOf("environment")}
        placeholder="例: TypeScript"
        values={draft.environment}
        onChange={(environment) => update({ environment })}
      />
      <Field label="チーム構成" required error={errorOf("team")}>
        <Input
          placeholder="例: 5名（PM 1名、エンジニア 4名）"
          size="sm"
          value={draft.team}
          onChange={(event) => update({ team: event.target.value })}
          onBlur={() => touch("team")}
        />
      </Field>
      <Field label="開発手法" required error={errorOf("methodology")}>
        <Input
          placeholder="例: スクラム"
          size="sm"
          value={draft.methodology}
          onChange={(event) => update({ methodology: event.target.value })}
          onBlur={() => touch("methodology")}
        />
      </Field>
      <ListInput
        label="ツール"
        required
        error={errorOf("tools")}
        placeholder="例: GitHub"
        values={draft.tools}
        onChange={(tools) => update({ tools })}
      />
      <fieldset className={group}>
        <legend className={groupLabel}>担当工程</legend>
        <div className={checks}>
          {PHASES.map((phase) => (
            <Checkbox
              key={phase}
              checked={draft.phases.includes(phase)}
              onChange={(event) => {
                const phases = event.target.checked
                  ? [...draft.phases, phase]
                  : draft.phases.filter((item) => item !== phase);
                update({ phases });
              }}
            >
              {phase}
            </Checkbox>
          ))}
        </div>
      </fieldset>
      <fieldset className={group}>
        <legend className={groupLabel}>その他</legend>
        <div className={checks}>
          <Checkbox
            checked={draft.hard}
            onChange={(event) => update({ hard: event.target.checked })}
          >
            高難易度な案件やスキルアップできた案件（抜粋 タグを付ける）
          </Checkbox>
        </div>
      </fieldset>
      <div className={row}>
        <Button type="button" variant="outline" onClick={onCancel}>
          取り消し
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            const next = toCareer(draft);
            if (!("period" in next)) {
              setErrors(next);
              setAttempt((current) => current + 1);
              return;
            }
            setErrors({});
            onSubmit(next);
          }}
        >
          {career ? "保存" : "追加"}
        </Button>
      </div>
    </div>
  );
}
