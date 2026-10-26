import { useId, useMemo, useRef, useState } from "react";
import { css } from "styled-system/css";
import {
  MAX_FEATURED_SKILLS,
  type CalendarDate,
  type Duration,
  type SheetInput,
  type Skill,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import {
  featuredCount,
  formatDuration,
  present,
  skillInCareers,
} from "@/src/shared/features/skill-sheet/skill.service";
import { Button } from "@/src/components/ui/Button/index";
import { Checkbox } from "@/src/components/ui/Checkbox/index";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Switch } from "@/src/components/ui/Switch/index";
import { alert, hint, items, listItem, row } from "../styles";
import { requiredError, sameExperience, toExperience } from "../values";

// 2 桁が入る幅。
const experienceInput = css({
  px: "2",
  textAlign: "right",
  width: "2.75rem",
});

const groupList = css({
  display: "grid",
  gap: "4",
  gridTemplateColumns: "minmax(0, 1fr)",
  listStyle: "none",
  margin: "0",
  padding: "0",
});

const groupHeading = css({
  color: "fg.sub",
  margin: "0",
  mb: "1",
  textStyle: "std-14N-170",
  fontWeight: "bold",
});

// 行には技術名・年数・よく使う「主要」だけを置き、年数の編集と削除は「詳細」の中にしまう。
const skillLine = css({
  alignItems: "center",
  columnGap: "3",
  display: "flex",
  flexWrap: "wrap",
  rowGap: "1",
  width: "100%",
});

const skillName = css({
  flex: "1 1 10rem",
  fontWeight: "bold",
  minWidth: "0",
  overflowWrap: "anywhere",
});

const skillYears = css({
  color: "fg.sub",
  textStyle: "std-14N-170",
  whiteSpace: "nowrap",
});

const skillPanel = css({
  alignItems: "center",
  borderColor: "border.divider",
  borderTopWidth: "1px",
  columnGap: "3",
  display: "flex",
  flexWrap: "wrap",
  mt: "2",
  pt: "2",
  rowGap: "2",
  width: "100%",
});

const panelEnd = css({
  ml: "auto",
});

function yearsLabel(skill: Skill, auto: boolean, computed: Duration | null): string {
  const value = auto ? computed : (skill.experience ?? null);
  const text = value && (value.years > 0 || value.months > 0) ? formatDuration(value) : "年数なし";
  return auto ? `${text}（自動）` : text;
}

function SkillRow({
  skill,
  available,
  computed,
  pending,
  featuredFull,
  onUpdateExperience,
  onUpdateFeatured,
  onRemove,
  onError,
}: {
  skill: Skill;
  // 経歴の環境にこの技術があるか。無ければ自動計算できない。
  available: boolean;
  computed: Duration | null;
  pending?: boolean;
  // 主要スキルが上限まで選ばれているか。選ばれていない行は主要にできない。
  featuredFull: boolean;
  onUpdateExperience: (experience: Duration | null, auto: boolean) => void;
  onUpdateFeatured: (featured: boolean) => void;
  onRemove: () => void;
  onError: (message: string | null) => void;
}) {
  const [years, setYears] = useState(skill.experience ? String(skill.experience.years) : "");
  const [months, setMonths] = useState(skill.experience ? String(skill.experience.months) : "");
  const [open, setOpen] = useState(false);
  const panelId = useId();
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
      <div className={skillLine}>
        <span className={skillName}>{skill.name}</span>
        <span className={skillYears}>{yearsLabel(skill, auto, computed)}</span>
        <Checkbox
          aria-label={`${skill.name}を主要スキルにする`}
          title={
            featuredFull && !skill.featured
              ? `主要スキルは${MAX_FEATURED_SKILLS}件まで選べます`
              : undefined
          }
          checked={Boolean(skill.featured)}
          disabled={pending || (featuredFull && !skill.featured)}
          onChange={(event) => onUpdateFeatured(event.target.checked)}
        >
          主要
        </Checkbox>
        <Button
          type="button"
          variant="text"
          size="sm"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${skill.name}の詳細`}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "閉じる" : "詳細"}
        </Button>
      </div>
      {open ? (
        <div id={panelId} className={skillPanel}>
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
            size="sm"
            label="自動計算"
            aria-label={`${skill.name}の経験年数を職務経歴から自動計算`}
            title={available ? undefined : "職務経歴の環境にこの技術が無いため自動計算できません"}
            checked={auto}
            disabled={!available || pending}
            onCheckedChange={save}
          />
          <span className={panelEnd}>
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onRemove}>
              削除
            </Button>
          </span>
        </div>
      ) : null}
    </li>
  );
}

export type SkillSectionProps = {
  sheet: SheetInput;
  today: CalendarDate;
  pending?: boolean;
  onAddSkill: (groupName: string, skillName: string, experience: Duration | null) => void;
  onUpdateSkillExperience: (skillName: string, experience: Duration | null, auto: boolean) => void;
  onUpdateSkillFeatured: (skillName: string, featured: boolean) => void;
  onRemoveSkill: (skillName: string) => void;
};

// 保有技術の一覧と追加欄。必須欄はフォーカスを外したときと追加を押したときに検証する。
export function SkillSection({
  sheet,
  today,
  pending,
  onAddSkill,
  onUpdateSkillExperience,
  onUpdateSkillFeatured,
  onRemoveSkill,
}: SkillSectionProps) {
  const featuredFull = featuredCount(sheet) >= MAX_FEATURED_SKILLS;
  const [groupName, setGroupName] = useState("言語");
  const [skillName, setSkillName] = useState("");
  const [skillYears, setSkillYears] = useState("");
  const [skillMonths, setSkillMonths] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ group: string | null; name: string | null }>({
    group: null,
    name: null,
  });
  const groupInput = useRef<HTMLInputElement>(null);
  const skillNameInput = useRef<HTMLInputElement>(null);

  // 自動計算したときの年数。入力欄に出す。
  const computed = useMemo(() => {
    const result = present(
      {
        ...sheet,
        skillGroups: sheet.skillGroups.map((group) => ({
          ...group,
          skills: group.skills.map((skill) => ({ ...skill, auto: true })),
        })),
      },
      today,
    );
    return new Map(
      result.ok ? result.view.skills.map((skill) => [skill.name, skill.duration]) : [],
    );
  }, [sheet, today]);

  const add = () => {
    const next = { group: requiredError(groupName), name: requiredError(skillName) };
    setErrors(next);
    if (next.group || next.name) {
      (next.group ? groupInput : skillNameInput).current?.focus();
      return;
    }
    const parsed = toExperience(skillYears, skillMonths);
    if (typeof parsed === "string") {
      setMessage(parsed);
      return;
    }
    setMessage(null);
    onAddSkill(groupName, skillName, parsed);
    setSkillName("");
    setErrors({ group: null, name: null });
    setSkillYears("");
    setSkillMonths("");
  };

  return (
    <>
      <p className={hint}>
        経験年数の入力・自動計算・削除は各行の「詳細」から行います。経験年数は任意です。「自動計算」をオンにすると職務経歴の期間から数えます。職務経歴の環境に無い技術は自動計算できません。「主要」にした技術（
        {MAX_FEATURED_SKILLS}
        件まで）は 1 ページ目の主要スキルに出します。選ばなければ経験年数の長い順に出します。
      </p>
      {message ? (
        <p role="alert" className={alert}>
          {message}
        </p>
      ) : null}
      <ul className={groupList} aria-label="保有技術">
        {sheet.skillGroups.map((group) => (
          <li key={group.name}>
            <h4 className={groupHeading}>{group.name}</h4>
            <ul className={items} aria-label={group.name}>
              {group.skills.map((skill) => (
                <SkillRow
                  key={`${group.name}-${skill.name}`}
                  skill={skill}
                  pending={pending}
                  available={skillInCareers(sheet.careers, skill.name)}
                  computed={computed.get(skill.name.trim()) ?? null}
                  featuredFull={featuredFull}
                  onUpdateExperience={(value, auto) =>
                    onUpdateSkillExperience(skill.name, value, auto)
                  }
                  onUpdateFeatured={(featured) => onUpdateSkillFeatured(skill.name, featured)}
                  onRemove={() => onRemoveSkill(skill.name)}
                  onError={setMessage}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className={row}>
        <Field label="グループ" required error={errors.group}>
          <Input
            ref={groupInput}
            placeholder="例: 言語"
            size="sm"
            value={groupName}
            onChange={(event) => {
              setGroupName(event.target.value);
              if (event.target.value.trim()) {
                setErrors((current) => ({ ...current, group: null }));
              }
            }}
            onBlur={() => setErrors((current) => ({ ...current, group: requiredError(groupName) }))}
          />
        </Field>
        <Field label="技術名" required error={errors.name}>
          <Input
            ref={skillNameInput}
            placeholder="例: TypeScript"
            size="sm"
            value={skillName}
            onChange={(event) => {
              setSkillName(event.target.value);
              if (event.target.value.trim()) {
                setErrors((current) => ({ ...current, name: null }));
              }
            }}
            onBlur={() => setErrors((current) => ({ ...current, name: requiredError(skillName) }))}
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
        <Button type="button" disabled={pending} onClick={add}>
          技術を追加
        </Button>
      </div>
    </>
  );
}
