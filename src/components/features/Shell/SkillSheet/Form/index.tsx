import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { css } from "styled-system/css";
import {
  GENDERS,
  isGender,
  orderCareers,
  present,
  skillInCareers,
  type CalendarDate,
  type Career,
  type Duration,
  type ProfileItem,
  type SheetInput,
  type Skill,
} from "@/shared/features/skill-sheet/sheet";
import { Button } from "../../../../ui/Button/index";
import { Field } from "../../../../ui/Field/index";
import { Input } from "../../../../ui/Input/index";
import { Select } from "../../../../ui/Select/index";
import { Switch } from "../../../../ui/Switch/index";
import { Textarea } from "../../../../ui/Textarea/index";
import { CareerDialog } from "./CareerDialog/index";
import { LinkList } from "./LinkList/index";
import { SheetActions } from "./SheetActions/index";

const stack = css({
  display: "grid",
  gap: "6",
});

const section = css({
  borderTopWidth: "1px",
  borderColor: "border.divider",
  display: "grid",
  gap: "6",
  pt: "8",
});

const row = css({
  alignItems: "end",
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
});

const heading = css({
  margin: "0",
  textStyle: "std-28B-150",
});

const subheading = css({
  margin: "0",
  textStyle: "std-20B-150",
});

const linkSection = css({
  display: "grid",
  gap: "3",
});

const hint = css({
  color: "fg.sub",
  margin: "0",
  textStyle: "std-14N-170",
});

const alert = css({
  borderColor: "error",
  borderRadius: "12",
  borderWidth: "3px",
  color: "error",
  margin: "0",
  px: "4",
  py: "3",
  textStyle: "std-16B-170",
});

const items = css({
  display: "grid",
  listStyle: "none",
  margin: "0",
  padding: "0",
});

const listItem = css({
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  gap: "4",
  justifyContent: "space-between",
  py: "2",
});

// 氏名・年齢・性別で1行、経験年数・最終学歴・最寄駅で1行。
const switches = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1",
  justifyContent: "flex-end",
});

// 各欄は見出し・入力・注釈の 3 段を subgrid で共有する。見出しが折り返しても、
// 同じ行の見出しは上端、入力欄は同じ高さにそろう。
const profileGrid = css({
  columnGap: "3",
  display: "grid",
  gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
  rowGap: "4",
  "& > *": {
    alignContent: "start",
    gridRow: "span 3",
    gridTemplateRows: "subgrid",
    rowGap: "2",
  },
  "& > * > :first-child": {
    alignSelf: "start",
  },
});

// 24 列に細かく分け、見出しとスイッチが 1 行に収まる幅を割り当てる。
const spans = {
  6: css({ gridColumn: "span 6" }),
  7: css({ gridColumn: "span 7" }),
  8: css({ gridColumn: "span 8" }),
  11: css({ gridColumn: "span 11" }),
  12: css({ gridColumn: "span 12" }),
  24: css({ gridColumn: "span 24" }),
} as const;

function span(size: keyof typeof spans): string {
  return spans[size];
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

// input[type=date] の値（YYYY-MM-DD）と相互に変換する。
function toDateValue(value: CalendarDate | null): string {
  if (!value) {
    return "";
  }
  return `${String(value.year).padStart(4, "0")}-${pad(value.month)}-${pad(value.day)}`;
}

function fromDateValue(value: string): CalendarDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

// 入力中にすぐ出す年齢のエラー。
function ageError(value: string): string | null {
  const text = value.trim();
  if (text === "") {
    return null;
  }
  if (!/^\d+$/.test(text)) {
    return "数字で入力してください";
  }
  return Number(text) > 150 ? "150以下で入力してください" : null;
}

function requiredError(value: string): string | null {
  return value.trim().length === 0 ? "入力してください" : null;
}

function toAge(value: string): number | null {
  const text = value.trim();
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const age = Number(text);
  return age <= 150 ? age : null;
}

const experienceInput = css({
  px: "2",
  textAlign: "right",
  width: "3.5rem",
});

const careerNo = css({
  color: "fg.sub",
  display: "inline-block",
  fontVariantNumeric: "tabular-nums",
  mr: "2",
  minWidth: "1.75em",
  textAlign: "right",
});

const skillLabel = css({
  minWidth: "0",
  overflowWrap: "anywhere",
});

const experience = css({
  alignItems: "center",
  display: "flex",
  gap: "2",
  whiteSpace: "nowrap",
});

// 年と月が両方空なら未入力として扱う。
function toExperience(years: string, months: string): Duration | null | string {
  const yearsText = years.trim();
  const monthsText = months.trim();
  if (yearsText === "" && monthsText === "") {
    return null;
  }
  const yearsValue = yearsText === "" ? 0 : /^\d+$/.test(yearsText) ? Number(yearsText) : null;
  const monthsValue = monthsText === "" ? 0 : /^\d+$/.test(monthsText) ? Number(monthsText) : null;
  if (yearsValue === null || yearsValue > 99) {
    return "経験年数は0から99の数字で入力してください";
  }
  if (monthsValue === null || monthsValue > 11) {
    return "経験月数は0から11の数字で入力してください";
  }
  if (yearsValue === 0 && monthsValue === 0) {
    return null;
  }
  return { years: yearsValue, months: monthsValue };
}

function sameExperience(left: Duration | null, right: Duration | undefined): boolean {
  if (!left || !right) {
    return !left && !right;
  }
  return left.years === right.years && left.months === right.months;
}

function SkillRow({
  groupName,
  skill,
  available,
  computed,
  pending,
  onUpdateExperience,
  onRemove,
  onError,
}: {
  groupName: string;
  skill: Skill;
  // 経歴の環境にこの技術があるか。無ければ自動計算できない。
  available: boolean;
  computed: Duration | null;
  pending?: boolean;
  onUpdateExperience: (experience: Duration | null, auto: boolean) => void;
  onRemove: () => void;
  onError: (message: string | null) => void;
}) {
  const [years, setYears] = useState(skill.experience ? String(skill.experience.years) : "");
  const [months, setMonths] = useState(skill.experience ? String(skill.experience.months) : "");
  const auto = Boolean(skill.auto) && available;
  const save = (nextAuto: boolean) => {
    const parsed = toExperience(years, months);
    if (typeof parsed === "string") {
      onError(parsed);
      return;
    }
    onError(null);
    if (nextAuto !== Boolean(skill.auto) || !sameExperience(parsed, skill.experience)) {
      onUpdateExperience(parsed, nextAuto);
    }
  };
  return (
    <li className={listItem}>
      <span className={skillLabel}>
        {groupName} {skill.name}
      </span>
      <span className={experience}>
        <Input
          size="sm"
          inputMode="numeric"
          disabled={auto}
          aria-label={`${skill.name}の経験年数`}
          placeholder="3"
          className={experienceInput}
          value={auto ? String(computed?.years ?? 0) : years}
          onChange={(event) => setYears(event.target.value)}
          onBlur={() => save(Boolean(skill.auto))}
        />
        年
        <Input
          size="sm"
          inputMode="numeric"
          disabled={auto}
          aria-label={`${skill.name}の経験月数`}
          placeholder="6"
          className={experienceInput}
          value={auto ? String(computed?.months ?? 0) : months}
          onChange={(event) => setMonths(event.target.value)}
          onBlur={() => save(Boolean(skill.auto))}
        />
        ヶ月
        <Switch
          label="自動計算"
          aria-label={`${skill.name}の経験年数を職務経歴から自動計算`}
          title={available ? undefined : "職務経歴の環境にこの技術が無いため自動計算できません"}
          checked={auto}
          disabled={!available || pending}
          onChange={(event) => save(event.target.checked)}
        />
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onRemove}>
          削除
        </Button>
      </span>
    </li>
  );
}

export type FormProps = {
  initial: SheetInput;
  // 職務経歴から数えた経験年数。自動計算のときに入力欄へ出す。
  autoExperience: string;
  // 今日の日付。更新日が自動のときに入力欄へ出す。
  today: CalendarDate;
  onValues: (value: SheetInput) => void;
  onSaveProfile: (value: SheetInput) => void;
  onAddSkill: (groupName: string, skillName: string, experience: Duration | null) => void;
  onUpdateSkillExperience: (skillName: string, experience: Duration | null, auto: boolean) => void;
  onRemoveSkill: (skillName: string) => void;
  onAddCareer: (career: Omit<Career, "id">) => void;
  onUpdateCareer: (careerId: string, career: Omit<Career, "id">) => void;
  onRemoveCareer: (careerId: string) => void;
  onImport: (file: unknown) => void;
  message?: string | null;
  pending?: boolean;
};

export function Form({
  initial,
  autoExperience,
  today,
  onValues,
  onSaveProfile,
  onAddSkill,
  onUpdateSkillExperience,
  onRemoveSkill,
  onAddCareer,
  onUpdateCareer,
  onRemoveCareer,
  onImport,
  message,
  pending,
}: FormProps) {
  const form = useForm({
    defaultValues: initial,
  });
  const values = useStore(form.store, (state) => state.values);
  const [groupName, setGroupName] = useState("言語");
  const [skillName, setSkillName] = useState("");
  const [ageText, setAgeText] = useState(initial.age === null ? "" : String(initial.age));
  const visibilitySwitch = (item: ProfileItem, label: string) => (
    <form.Field name="visibility">
      {(field) => (
        <Switch
          label="表示"
          aria-label={`${label}をプレビューに表示`}
          checked={field.state.value[item]}
          onChange={(event) => {
            const visibility = { ...field.state.value, [item]: event.target.checked };
            field.handleChange(visibility);
            onSaveProfile({ ...form.state.values, visibility });
          }}
        />
      )}
    </form.Field>
  );
  const [skillYears, setSkillYears] = useState("");
  const [skillMonths, setSkillMonths] = useState("");
  const [skillMessage, setSkillMessage] = useState<string | null>(null);
  // 必須欄のエラーは、フォーカスを外したときと追加を押したときだけ出す。
  const [nameTouched, setNameTouched] = useState(false);
  const [skillErrors, setSkillErrors] = useState<{ group: string | null; name: string | null }>({
    group: null,
    name: null,
  });
  const groupInput = useRef<HTMLInputElement>(null);
  const skillNameInput = useRef<HTMLInputElement>(null);
  // 編集中の経歴の id。"new" なら追加、null なら閉じている。
  const [editing, setEditing] = useState<string | null>(null);
  const editingCareer =
    editing && editing !== "new"
      ? (values.careers.find((career) => career.id === editing) ?? null)
      : null;

  // モーダルで入力中の経歴。保存前でもプレビューに映す。
  const [draftCareer, setDraftCareer] = useState<Omit<Career, "id"> | null>(null);

  useEffect(() => {
    if (editing === null || !draftCareer) {
      onValues(values);
      return;
    }
    const careers =
      editing === "new"
        ? [...values.careers, { ...draftCareer, id: "draft" }]
        : values.careers.map((item) =>
            item.id === editing ? { ...draftCareer, id: editing } : item,
          );
    onValues({ ...values, careers });
  }, [onValues, values, editing, draftCareer]);

  // 自動計算したときの年数。入力欄に出す。
  const computedSkills = useMemo(() => {
    const result = present(
      {
        ...values,
        skillGroups: values.skillGroups.map((group) => ({
          ...group,
          skills: group.skills.map((skill) => ({ ...skill, auto: true })),
        })),
      },
      today,
    );
    return new Map(
      result.ok ? result.view.skills.map((skill) => [skill.name, skill.duration]) : [],
    );
  }, [values, today]);

  return (
    <div className={stack}>
      <h1 className={heading}>スキルシート</h1>
      <SheetActions sheet={values} pending={pending} onImport={onImport} />
      {message ? (
        <p role="alert" className={alert}>
          {message}
        </p>
      ) : null}
      <div className={profileGrid}>
        <Field
          label="更新日"
          className={span(12)}
          aside={
            <form.Field name="updatedAuto">
              {(field) => (
                <Switch
                  label="自動計算"
                  aria-label="更新日を今日にする"
                  checked={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.checked);
                    onSaveProfile({ ...form.state.values, updatedAuto: event.target.checked });
                  }}
                />
              )}
            </form.Field>
          }
        >
          <form.Subscribe selector={(state) => state.values.updatedAuto}>
            {(auto) => (
              <form.Field name="updatedOn">
                {(field) => (
                  <Input
                    size="sm"
                    type="date"
                    disabled={auto}
                    value={toDateValue(auto ? today : field.state.value)}
                    onChange={(event) => field.handleChange(fromDateValue(event.target.value))}
                    onBlur={() => {
                      field.handleBlur();
                      onSaveProfile(form.state.values);
                    }}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>
        </Field>
      </div>
      <div className={profileGrid}>
        <form.Subscribe selector={(state) => state.values.name}>
          {(name) => (
            <Field
              label="氏名"
              className={span(12)}
              required
              error={nameTouched && name.trim().length === 0 ? "入力してください" : null}
            >
              <form.Field name="name">
                {(field) => (
                  <Input
                    placeholder="例: 山田 太郎"
                    size="sm"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={() => {
                      field.handleBlur();
                      setNameTouched(true);
                      onSaveProfile(form.state.values);
                    }}
                  />
                )}
              </form.Field>
            </Field>
          )}
        </form.Subscribe>
        <Field
          label="年齢"
          className={span(6)}
          aside={visibilitySwitch("age", "年齢")}
          error={ageError(ageText)}
        >
          <form.Field name="age">
            {(field) => (
              <Input
                placeholder="例: 35"
                size="sm"
                inputMode="numeric"
                value={ageText}
                onChange={(event) => {
                  setAgeText(event.target.value);
                  field.handleChange(toAge(event.target.value));
                }}
                onBlur={() => {
                  field.handleBlur();
                  onSaveProfile(form.state.values);
                }}
              />
            )}
          </form.Field>
        </Field>
        <Field label="性別" className={span(6)} aside={visibilitySwitch("gender", "性別")}>
          <form.Field name="gender">
            {(field) => (
              <Select
                size="sm"
                value={field.state.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  const gender = isGender(value) ? value : null;
                  field.handleChange(gender);
                  onSaveProfile({ ...form.state.values, gender });
                }}
              >
                <option value="">未選択</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </Select>
            )}
          </form.Field>
        </Field>
        <Field
          label="経験年数"
          className={span(11)}
          aside={
            <span className={switches}>
              {visibilitySwitch("experience", "経験年数")}
              <form.Field name="experienceAuto">
                {(field) => (
                  <Switch
                    label="自動計算"
                    aria-label="経験年数を職務経歴から自動計算"
                    checked={field.state.value}
                    onChange={(event) => {
                      field.handleChange(event.target.checked);
                      onSaveProfile({ ...form.state.values, experienceAuto: event.target.checked });
                    }}
                  />
                )}
              </form.Field>
            </span>
          }
        >
          <form.Subscribe selector={(state) => state.values.experienceAuto}>
            {(auto) => (
              <form.Field name="experience">
                {(field) => (
                  <Input
                    size="sm"
                    disabled={auto}
                    placeholder="例: 10年以上"
                    value={auto ? autoExperience : field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={() => {
                      field.handleBlur();
                      onSaveProfile(form.state.values);
                    }}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>
        </Field>
        <Field
          label="最終学歴"
          className={span(7)}
          aside={visibilitySwitch("education", "最終学歴")}
        >
          <form.Field name="education">
            {(field) => (
              <Input
                placeholder="例: 〇〇大学"
                size="sm"
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
        <Field label="最寄駅" className={span(6)} aside={visibilitySwitch("station", "最寄駅")}>
          <form.Field name="station">
            {(field) => (
              <Input
                placeholder="例: 新宿駅"
                size="sm"
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
        <Field
          label="希望稼働時間"
          className={span(8)}
          aside={visibilitySwitch("desiredHours", "希望稼働時間")}
        >
          <form.Field name="desiredHours">
            {(field) => (
              <Input
                placeholder="例: 週4、月128時間"
                size="sm"
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
        <Field
          label="希望雇用形態"
          className={span(8)}
          aside={visibilitySwitch("desiredEmployment", "希望雇用形態")}
        >
          <form.Field name="desiredEmployment">
            {(field) => (
              <Input
                placeholder="例: 業務委託"
                size="sm"
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
        <Field label="所属" className={span(8)} aside={visibilitySwitch("affiliation", "所属")}>
          <form.Field name="affiliation">
            {(field) => (
              <Input
                placeholder="例: 個人事業主"
                size="sm"
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
      </div>
      <p className={hint}>
        経験年数は「自動計算」をオンにすると職務経歴の期間から数え、オフにすると自由に入力できます。「表示」を切った項目はプレビューに出しません。
      </p>
      <section className={section}>
        <h3 className={subheading}>保有技術</h3>
        <p className={hint}>
          経験年数は任意です。「自動計算」をオンにすると職務経歴の期間から数えます。職務経歴の環境に無い技術は自動計算できません。
        </p>
        {skillMessage ? (
          <p role="alert" className={alert}>
            {skillMessage}
          </p>
        ) : null}
        <ul className={items}>
          {values.skillGroups.flatMap((group) =>
            group.skills.map((skill) => (
              <SkillRow
                key={`${group.name}-${skill.name}`}
                groupName={group.name}
                skill={skill}
                pending={pending}
                available={skillInCareers(values.careers, skill.name)}
                computed={computedSkills.get(skill.name.trim()) ?? null}
                onUpdateExperience={(value, auto) =>
                  onUpdateSkillExperience(skill.name, value, auto)
                }
                onRemove={() => onRemoveSkill(skill.name)}
                onError={setSkillMessage}
              />
            )),
          )}
        </ul>
        <div className={row}>
          <Field label="グループ" required error={skillErrors.group}>
            <Input
              ref={groupInput}
              placeholder="例: 言語"
              size="sm"
              value={groupName}
              onChange={(event) => {
                setGroupName(event.target.value);
                if (event.target.value.trim()) {
                  setSkillErrors((current) => ({ ...current, group: null }));
                }
              }}
              onBlur={() =>
                setSkillErrors((current) => ({ ...current, group: requiredError(groupName) }))
              }
            />
          </Field>
          <Field label="技術名" required error={skillErrors.name}>
            <Input
              ref={skillNameInput}
              placeholder="例: TypeScript"
              size="sm"
              value={skillName}
              onChange={(event) => {
                setSkillName(event.target.value);
                if (event.target.value.trim()) {
                  setSkillErrors((current) => ({ ...current, name: null }));
                }
              }}
              onBlur={() =>
                setSkillErrors((current) => ({ ...current, name: requiredError(skillName) }))
              }
            />
          </Field>
        </div>
        <div className={row}>
          <Field label="経験年数（任意）">
            <Input
              placeholder="例: 3"
              size="sm"
              inputMode="numeric"
              value={skillYears}
              onChange={(event) => setSkillYears(event.target.value)}
            />
          </Field>
          <Field label="経験月数（任意）">
            <Input
              placeholder="例: 6"
              size="sm"
              inputMode="numeric"
              value={skillMonths}
              onChange={(event) => setSkillMonths(event.target.value)}
            />
          </Field>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              const errors = { group: requiredError(groupName), name: requiredError(skillName) };
              setSkillErrors(errors);
              if (errors.group || errors.name) {
                (errors.group ? groupInput : skillNameInput).current?.focus();
                return;
              }
              const parsed = toExperience(skillYears, skillMonths);
              if (typeof parsed === "string") {
                setSkillMessage(parsed);
                return;
              }
              setSkillMessage(null);
              onAddSkill(groupName, skillName, parsed);
              setSkillName("");
              setSkillErrors({ group: null, name: null });
              setSkillYears("");
              setSkillMonths("");
            }}
          >
            技術を追加
          </Button>
        </div>
        <div className={profileGrid}>
          <Field label="得意な技術" className={span(24)}>
            <form.Field name="strongSkills">
              {(field) => (
                <Textarea
                  placeholder="例: TypeScript、React、Go"
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
          <Field label="得意な業務" className={span(24)}>
            <form.Field name="strongWork">
              {(field) => (
                <Textarea
                  placeholder="例: 要件整理、設計レビュー、性能改善"
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
        </div>
        <Field label="自己紹介" aside={visibilitySwitch("selfPr", "自己紹介")}>
          <form.Field name="selfPr">
            {(field) => (
              <Textarea
                placeholder="例: Webアプリの設計から運用まで一貫して担当してきました。"
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
        <section className={linkSection} aria-labelledby="links-heading">
          <h3 id="links-heading" className={subheading}>
            ポートフォリオなどのリンク
          </h3>
          <form.Field name="links">
            {(field) => (
              <LinkList
                links={field.state.value}
                pending={pending}
                onChange={(links) => {
                  field.handleChange(links);
                  onSaveProfile({ ...form.state.values, links });
                }}
              />
            )}
          </form.Field>
        </section>
      </section>
      <section className={section}>
        <h3 className={subheading}>職務経歴</h3>
        <ul className={items}>
          {orderCareers(values, today).map((career, index) => (
            <li key={career.id} className={listItem}>
              <span className={skillLabel}>
                <span className={careerNo}>{index + 1}.</span>
                {career.projectName}
              </span>
              <span className={experience}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  aria-label={`${career.projectName}を編集`}
                  onClick={() => setEditing(career.id)}
                >
                  編集
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  aria-label={`${career.projectName}を削除`}
                  onClick={() => onRemoveCareer(career.id)}
                >
                  削除
                </Button>
              </span>
            </li>
          ))}
        </ul>
        <div>
          <Button type="button" disabled={pending} onClick={() => setEditing("new")}>
            経歴を追加
          </Button>
        </div>
        <CareerDialog
          open={editing !== null}
          career={editingCareer}
          onDraftChange={setDraftCareer}
          pending={pending}
          onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
            }
          }}
          onSubmit={(career) => {
            if (editingCareer) {
              onUpdateCareer(editingCareer.id, career);
            } else {
              onAddCareer(career);
            }
            setEditing(null);
          }}
        />
      </section>
    </div>
  );
}
