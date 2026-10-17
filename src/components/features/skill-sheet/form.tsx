import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import {
  PHASES,
  type Career,
  type Phase,
  type SheetInput,
  type YearMonth,
} from "../../../../shared/features/skill-sheet/sheet";
import { sheetQueryKey } from "../../../lib/query-keys";
import { request } from "../../../lib/request";
import { Button } from "../../ui/button";
import { Field } from "../../ui/field";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { SkillPreview } from "./preview";

function currentMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export const sheetColumns = css({
  display: "grid",
  gap: "6",
  gridTemplateColumns: { base: "1fr", lg: "minmax(0, 1fr) minmax(0, 1fr)" },
  p: "6",
});

const stack = css({
  display: "grid",
  gap: "4",
});

const row = css({
  display: "flex",
  gap: "2",
  alignItems: "end",
});

const checks = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "3",
});

type CareerDraft = {
  projectName: string;
  startYear: string;
  startMonth: string;
  endYear: string;
  endMonth: string;
  ongoing: boolean;
  summary: string;
  work: string;
  outcome: string;
  role: string;
  employment: string;
  environment: string;
  position: string;
  team: string;
  methodology: string;
  tools: string;
  phases: Phase[];
  parallel: boolean;
  hard: boolean;
};

const emptyCareer: CareerDraft = {
  projectName: "",
  startYear: "",
  startMonth: "",
  endYear: "",
  endMonth: "",
  ongoing: false,
  summary: "",
  work: "",
  outcome: "",
  role: "",
  employment: "",
  environment: "",
  position: "",
  team: "",
  methodology: "",
  tools: "",
  phases: [],
  parallel: false,
  hard: false,
};

function splitList(value: string): string[] {
  return value
    .split(/[、,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function monthNumber(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const month = Number(value);
  if (month < 1 || month > 12) {
    return null;
  }
  return month;
}

function yearNumber(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const year = Number(value);
  if (year < 1) {
    return null;
  }
  return year;
}

function toCareer(draft: CareerDraft): Omit<Career, "id"> | string {
  const startYear = yearNumber(draft.startYear);
  const startMonth = monthNumber(draft.startMonth);
  if (draft.projectName.trim().length === 0) {
    return "案件名を入れてください";
  }
  if (startYear === null || startMonth === null) {
    return "開始年月を入れてください";
  }
  const endYear = yearNumber(draft.endYear);
  const endMonth = monthNumber(draft.endMonth);
  const end = draft.ongoing
    ? null
    : endYear !== null && endMonth !== null
      ? { year: endYear, month: endMonth }
      : undefined;
  if (end === undefined) {
    return "終了年月を入れるか、進行中にしてください";
  }
  return {
    period: { start: { year: startYear, month: startMonth }, end },
    projectName: draft.projectName.trim(),
    summary: draft.summary,
    work: draft.work,
    outcome: draft.outcome,
    role: draft.role,
    employment: draft.employment,
    environment: splitList(draft.environment),
    position: draft.position,
    team: draft.team,
    methodology: draft.methodology,
    tools: splitList(draft.tools),
    phases: draft.phases,
    parallel: draft.parallel,
    hard: draft.hard,
  };
}

export type SkillSheetFormProps = {
  initial: SheetInput;
  onValues: (value: SheetInput) => void;
  onSaveProfile: (value: SheetInput) => void;
  onAddSkill: (groupName: string, skillName: string) => void;
  onRemoveSkill: (skillName: string) => void;
  onAddCareer: (career: Omit<Career, "id">) => void;
  onRemoveCareer: (careerId: string) => void;
  message?: string | null;
  pending?: boolean;
};

export function SkillSheetForm({
  initial,
  onValues,
  onSaveProfile,
  onAddSkill,
  onRemoveSkill,
  onAddCareer,
  onRemoveCareer,
  message,
  pending,
}: SkillSheetFormProps) {
  const form = useForm({
    defaultValues: initial,
  });
  const values = useStore(form.store, (state) => state.values);
  const [groupName, setGroupName] = useState("言語");
  const [skillName, setSkillName] = useState("");
  const [draft, setDraft] = useState<CareerDraft>(emptyCareer);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);

  useEffect(() => {
    onValues(values);
  }, [onValues, values]);

  return (
    <div className={stack}>
      <h2 className={css({ margin: "0" })}>入力</h2>
      {message ? <p role="alert">{message}</p> : null}
      <Field label="氏名">
        <form.Field name="name">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => {
                field.handleBlur();
                onSaveProfile(form.state.values);
              }}
            />
          )}
        </form.Field>
      </Field>
      <Field label="働き方">
        <form.Field name="workStyle">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => {
                field.handleBlur();
                onSaveProfile(form.state.values);
              }}
            />
          )}
        </form.Field>
      </Field>
      <Field label="最終学歴">
        <form.Field name="education">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => {
                field.handleBlur();
                onSaveProfile(form.state.values);
              }}
            />
          )}
        </form.Field>
      </Field>
      <Field label="最寄駅">
        <form.Field name="station">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => {
                field.handleBlur();
                onSaveProfile(form.state.values);
              }}
            />
          )}
        </form.Field>
      </Field>
      <Field label="自己PR">
        <form.Field name="selfPr">
          {(field) => (
            <Textarea
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
              onBlur={() => {
                field.handleBlur();
                onSaveProfile(form.state.values);
              }}
            />
          )}
        </form.Field>
      </Field>
      <div className={row}>
        <Field label="更新年">
          <form.Field name="updatedOn">
            {(field) => (
              <Input
                inputMode="numeric"
                value={field.state.value?.year ?? ""}
                onChange={(event) => {
                  const year = yearNumber(event.target.value);
                  const month = field.state.value?.month;
                  if (year === null || !month) {
                    field.handleChange(null);
                    return;
                  }
                  field.handleChange({ year, month });
                }}
                onBlur={() => onSaveProfile(form.state.values)}
              />
            )}
          </form.Field>
        </Field>
        <Field label="更新月">
          <form.Field name="updatedOn">
            {(field) => (
              <Input
                inputMode="numeric"
                value={field.state.value?.month ?? ""}
                onChange={(event) => {
                  const month = monthNumber(event.target.value);
                  const year = field.state.value?.year;
                  if (event.target.value === "") {
                    field.handleChange(null);
                    return;
                  }
                  if (month === null || !year) {
                    return;
                  }
                  field.handleChange({ year, month });
                }}
                onBlur={() => onSaveProfile(form.state.values)}
              />
            )}
          </form.Field>
        </Field>
      </div>
      <section className={stack}>
        <h3 className={css({ margin: "0" })}>保有技術</h3>
        <ul>
          {values.skillGroups.flatMap((group) =>
            group.skills.map((skill) => (
              <li key={`${group.name}-${skill.name}`}>
                {group.name} {skill.name}
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onRemoveSkill(skill.name)}
                >
                  削除
                </Button>
              </li>
            )),
          )}
        </ul>
        <div className={row}>
          <Field label="グループ">
            <Input value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </Field>
          <Field label="技術名">
            <Input value={skillName} onChange={(event) => setSkillName(event.target.value)} />
          </Field>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              onAddSkill(groupName, skillName);
              setSkillName("");
            }}
          >
            技術を追加
          </Button>
        </div>
      </section>
      <section className={stack}>
        <h3 className={css({ margin: "0" })}>職務経歴</h3>
        <ul>
          {values.careers.map((career) => (
            <li key={career.id}>
              {career.projectName}
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => onRemoveCareer(career.id)}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
        <div className={stack}>
          <h3 className={css({ margin: "0" })}>経歴を追加</h3>
          {draftMessage ? <p role="alert">{draftMessage}</p> : null}
          <Field label="案件名">
            <Input
              value={draft.projectName}
              onChange={(event) => setDraft({ ...draft, projectName: event.target.value })}
            />
          </Field>
          <div className={row}>
            <Field label="開始年">
              <Input
                inputMode="numeric"
                value={draft.startYear}
                onChange={(event) => setDraft({ ...draft, startYear: event.target.value })}
              />
            </Field>
            <Field label="開始月">
              <Input
                inputMode="numeric"
                value={draft.startMonth}
                onChange={(event) => setDraft({ ...draft, startMonth: event.target.value })}
              />
            </Field>
          </div>
          <label className={checks}>
            <input
              type="checkbox"
              checked={draft.ongoing}
              onChange={(event) => setDraft({ ...draft, ongoing: event.target.checked })}
            />
            進行中
          </label>
          {draft.ongoing ? null : (
            <div className={row}>
              <Field label="終了年">
                <Input
                  inputMode="numeric"
                  value={draft.endYear}
                  onChange={(event) => setDraft({ ...draft, endYear: event.target.value })}
                />
              </Field>
              <Field label="終了月">
                <Input
                  inputMode="numeric"
                  value={draft.endMonth}
                  onChange={(event) => setDraft({ ...draft, endMonth: event.target.value })}
                />
              </Field>
            </div>
          )}
          <Field label="概要">
            <Textarea
              value={draft.summary}
              onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
            />
          </Field>
          <Field label="やったこと">
            <Textarea
              value={draft.work}
              onChange={(event) => setDraft({ ...draft, work: event.target.value })}
            />
          </Field>
          <Field label="成果">
            <Textarea
              value={draft.outcome}
              onChange={(event) => setDraft({ ...draft, outcome: event.target.value })}
            />
          </Field>
          <Field label="役割">
            <Input
              value={draft.role}
              onChange={(event) => setDraft({ ...draft, role: event.target.value })}
            />
          </Field>
          <Field label="雇用形態">
            <Input
              value={draft.employment}
              onChange={(event) => setDraft({ ...draft, employment: event.target.value })}
            />
          </Field>
          <Field label="環境と言語">
            <Input
              value={draft.environment}
              onChange={(event) => setDraft({ ...draft, environment: event.target.value })}
            />
          </Field>
          <Field label="ポジション">
            <Input
              value={draft.position}
              onChange={(event) => setDraft({ ...draft, position: event.target.value })}
            />
          </Field>
          <Field label="チーム">
            <Input
              value={draft.team}
              onChange={(event) => setDraft({ ...draft, team: event.target.value })}
            />
          </Field>
          <Field label="開発手法">
            <Input
              value={draft.methodology}
              onChange={(event) => setDraft({ ...draft, methodology: event.target.value })}
            />
          </Field>
          <Field label="ツール">
            <Input
              value={draft.tools}
              onChange={(event) => setDraft({ ...draft, tools: event.target.value })}
            />
          </Field>
          <div className={checks}>
            {PHASES.map((phase) => (
              <label key={phase}>
                <input
                  type="checkbox"
                  checked={draft.phases.includes(phase)}
                  onChange={(event) => {
                    const phases = event.target.checked
                      ? [...draft.phases, phase]
                      : draft.phases.filter((item) => item !== phase);
                    setDraft({ ...draft, phases });
                  }}
                />
                {phase}
              </label>
            ))}
          </div>
          <label>
            <input
              type="checkbox"
              checked={draft.parallel}
              onChange={(event) => setDraft({ ...draft, parallel: event.target.checked })}
            />
            並行
          </label>
          <label>
            <input
              type="checkbox"
              checked={draft.hard}
              onChange={(event) => setDraft({ ...draft, hard: event.target.checked })}
            />
            難度の印
          </label>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              const career = toCareer(draft);
              if (typeof career === "string") {
                setDraftMessage(career);
                return;
              }
              setDraftMessage(null);
              setDraft(emptyCareer);
              onAddCareer(career);
            }}
          >
            経歴を追加
          </Button>
        </div>
      </section>
    </div>
  );
}

export function SkillSheet() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: sheetQueryKey,
    queryFn: async () => {
      const { getSheetFn } = await import("../../../server/features/skill-sheet/queries/get-sheet");
      return request(getSheetFn());
    },
    retry: false,
  });
  const [preview, setPreview] = useState<SheetInput | null>(null);
  const [generation, setGeneration] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [calculatedOn] = useState(currentMonth);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: sheetQueryKey });
    setPreview(null);
    setGeneration((current) => current + 1);
  };

  const saveProfile = useMutation({
    mutationFn: async (value: SheetInput) => {
      const { updateProfileFn } = await import("../../../server/features/skill-sheet/commands/update-profile");
      return request(
        updateProfileFn({
          data: {
            updatedOn: value.updatedOn,
            name: value.name,
            workStyle: value.workStyle,
            education: value.education,
            station: value.station,
            selfPr: value.selfPr,
          },
        }),
      );
    },
    onSuccess: async () => {
      setMessage(null);
      await queryClient.invalidateQueries({ queryKey: sheetQueryKey });
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const addSkillMutation = useMutation({
    mutationFn: async (input: { groupName: string; skillName: string }) => {
      const { addSkillFn } = await import("../../../server/features/skill-sheet/commands/add-skill");
      return request(addSkillFn({ data: input }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeSkillMutation = useMutation({
    mutationFn: async (skillName: string) => {
      const { removeSkillFn } = await import("../../../server/features/skill-sheet/commands/remove-skill");
      return request(removeSkillFn({ data: { skillName } }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const addCareerMutation = useMutation({
    mutationFn: async (career: Omit<Career, "id">) => {
      const { addCareerFn } = await import("../../../server/features/skill-sheet/commands/add-career");
      return request(addCareerFn({ data: career }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeCareerMutation = useMutation({
    mutationFn: async (careerId: string) => {
      const { removeCareerFn } = await import("../../../server/features/skill-sheet/commands/remove-career");
      return request(removeCareerFn({ data: { careerId } }));
    },
    onSuccess: async () => {
      setMessage(null);
      await refresh();
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const pending =
    saveProfile.isPending ||
    addSkillMutation.isPending ||
    removeSkillMutation.isPending ||
    addCareerMutation.isPending ||
    removeCareerMutation.isPending;

  if (query.isPending) {
    return <p>シートを読み込んでいます</p>;
  }
  if (query.isError) {
    return <p role="alert">{query.error.message}</p>;
  }

  const shown = preview ?? query.data;
  return (
    <div className={sheetColumns}>
      <div className="sheet-form">
        <SkillSheetForm
          key={generation}
          initial={query.data}
          onValues={setPreview}
          onSaveProfile={(value) => saveProfile.mutate(value)}
          onAddSkill={(groupName, skillName) => addSkillMutation.mutate({ groupName, skillName })}
          onRemoveSkill={(skillName) => removeSkillMutation.mutate(skillName)}
          onAddCareer={(career) => addCareerMutation.mutate(career)}
          onRemoveCareer={(careerId) => removeCareerMutation.mutate(careerId)}
          message={message}
          pending={pending}
        />
      </div>
      <SkillPreview sheet={shown} calculatedOn={calculatedOn} />
    </div>
  );
}
