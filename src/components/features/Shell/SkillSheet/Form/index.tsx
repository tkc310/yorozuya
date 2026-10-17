import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import {
  GENDERS,
  isGender,
  type CalendarDate,
  type Career,
  type Duration,
  type ProfileItem,
  type SheetInput,
} from "@/shared/features/skill-sheet/sheet";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Select } from "@/src/components/ui/Select/index";
import { Switch } from "@/src/components/ui/Switch/index";
import { Textarea } from "@/src/components/ui/Textarea/index";
import { CareerSection } from "./CareerSection/index";
import { LinkList } from "./LinkList/index";
import { SheetActions } from "./SheetActions/index";
import { SkillSection } from "./SkillSection/index";
import { alert, hint, profileGrid, section, span, subheading } from "./styles";
import { ageError, fromDateValue, toAge, toDateValue } from "./values";

type CareerWrite = Omit<Career, "id">;

// 入力欄 1 つで保存できる文字列の項目。
type TextItem = "education" | "station" | "desiredHours" | "desiredEmployment" | "affiliation";
type LongTextItem = "strongSkills" | "strongWork" | "selfPr";

const stack = css({
  display: "grid",
  gap: "6",
});

const heading = css({
  margin: "0",
  textStyle: "std-28B-150",
});

const switches = css({
  columnGap: "4",
  display: "flex",
  flexWrap: "wrap",
  rowGap: "1",
});

const linkSection = css({
  display: "grid",
  gap: "3",
});

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
  onAddCareer: (career: CareerWrite) => void;
  onUpdateCareer: (careerId: string, career: CareerWrite) => void;
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
  const form = useForm({ defaultValues: initial });
  const values = useStore(form.store, (state) => state.values);
  const [ageText, setAgeText] = useState(initial.age === null ? "" : String(initial.age));
  // 必須欄のエラーは、フォーカスを外したときだけ出す。
  const [nameTouched, setNameTouched] = useState(false);
  // モーダルで入力中の経歴。保存前でもプレビューに映す。
  const [previewCareers, setPreviewCareers] = useState<Career[] | null>(null);

  useEffect(() => {
    onValues(previewCareers ? { ...values, careers: previewCareers } : values);
  }, [onValues, values, previewCareers]);

  // 入力を終えたら（フォーカスを外したら）保存する。
  const save = (patch: Partial<SheetInput> = {}) =>
    onSaveProfile({ ...form.state.values, ...patch });

  const visibilitySwitch = (item: ProfileItem, label: string) => (
    <form.Field name="visibility">
      {(field) => (
        <Switch
          label="表示"
          aria-label={`${label}をプレビューに表示`}
          checked={field.state.value[item]}
          onCheckedChange={(checked) => {
            const visibility = { ...field.state.value, [item]: checked };
            field.handleChange(visibility);
            save({ visibility });
          }}
        />
      )}
    </form.Field>
  );

  const textField = (
    name: TextItem,
    label: string,
    placeholder: string,
    size: Parameters<typeof span>[0],
    item?: ProfileItem,
  ) => (
    <Field
      label={label}
      className={span(size)}
      aside={item ? visibilitySwitch(item, label) : undefined}
    >
      <form.Field name={name}>
        {(field) => (
          <Input
            placeholder={placeholder}
            size="sm"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={() => {
              field.handleBlur();
              save();
            }}
          />
        )}
      </form.Field>
    </Field>
  );

  const longTextField = (
    name: LongTextItem,
    label: string,
    placeholder: string,
    item?: ProfileItem,
  ) => (
    <Field label={label} aside={item ? visibilitySwitch(item, label) : undefined}>
      <form.Field name={name}>
        {(field) => (
          <Textarea
            placeholder={placeholder}
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
            onBlur={() => {
              field.handleBlur();
              save();
            }}
          />
        )}
      </form.Field>
    </Field>
  );

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
                  onCheckedChange={(checked) => {
                    field.handleChange(checked);
                    save({ updatedAuto: checked });
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
                      save();
                    }}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>
        </Field>
      </div>
      <h3 className={subheading}>基本情報</h3>
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
                      save();
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
                  save();
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
                  const gender = isGender(event.target.value) ? event.target.value : null;
                  field.handleChange(gender);
                  save({ gender });
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
                    onCheckedChange={(checked) => {
                      field.handleChange(checked);
                      save({ experienceAuto: checked });
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
                      save();
                    }}
                  />
                )}
              </form.Field>
            )}
          </form.Subscribe>
        </Field>
        {textField("education", "最終学歴", "例: 〇〇大学", 7, "education")}
        {textField("station", "最寄駅", "例: 新宿駅", 6, "station")}
        {textField("desiredHours", "希望稼働時間", "例: 週4、月128時間", 8, "desiredHours")}
        {textField("desiredEmployment", "希望雇用形態", "例: 業務委託", 8, "desiredEmployment")}
        {textField("affiliation", "所属", "例: 個人事業主", 8, "affiliation")}
      </div>
      <p className={hint}>
        経験年数は「自動計算」をオンにすると職務経歴の期間から数え、オフにすると自由に入力できます。「表示」を切った項目はプレビューに出しません。
      </p>
      <section className={section}>
        <h3 className={subheading}>保有技術</h3>
        <SkillSection
          sheet={values}
          today={today}
          pending={pending}
          onAddSkill={onAddSkill}
          onUpdateSkillExperience={onUpdateSkillExperience}
          onRemoveSkill={onRemoveSkill}
        />
        {longTextField("strongSkills", "得意な技術", "例: TypeScript、React、Go")}
        {longTextField("strongWork", "得意な業務", "例: 要件整理、設計レビュー、性能改善")}
        {longTextField(
          "selfPr",
          "自己紹介",
          "例: Webアプリの設計から運用まで一貫して担当してきました。",
          "selfPr",
        )}
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
                  save({ links });
                }}
              />
            )}
          </form.Field>
        </section>
      </section>
      <section className={section}>
        <h3 className={subheading}>職務経歴</h3>
        <CareerSection
          sheet={values}
          today={today}
          pending={pending}
          onAddCareer={onAddCareer}
          onUpdateCareer={onUpdateCareer}
          onRemoveCareer={onRemoveCareer}
          onPreviewCareers={setPreviewCareers}
        />
      </section>
    </div>
  );
}
