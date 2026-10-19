import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useId, useState, type ReactNode } from "react";
import { css } from "styled-system/css";
import {
  GENDERS,
  HIGHLIGHT_GUIDE_LENGTH,
  MAX_HIGHLIGHTS,
  SELF_PR_GUIDE_LENGTH,
  WORK_STYLES,
  cleanHighlights,
  isGender,
  sheetWarnings,
  type CalendarDate,
  type Career,
  type Duration,
  type ProfileItem,
  type SheetInput,
} from "@/shared/features/skill-sheet/sheet";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Select } from "@/src/components/ui/Select/index";
import { Spinner } from "@/src/components/ui/Spinner/index";
import { Switch } from "@/src/components/ui/Switch/index";
import { Textarea } from "@/src/components/ui/Textarea/index";
import { CareerSection } from "./CareerSection/index";
import { LinkList } from "./LinkList/index";
import { ListInput } from "./ListInput/index";
import { SheetActions } from "./SheetActions/index";
import { SkillSection } from "./SkillSection/index";
import { alert, hint, profileGrid, profileRows, section, span, subheading } from "./styles";
import { ageError, fromDateValue, lengthHint, toAge, toDateValue } from "./values";

type CareerWrite = Omit<Career, "id">;

// 入力欄 1 つで保存できる文字列の項目。
type TextItem =
  | "nameKana"
  | "nameInitials"
  | "title"
  | "education"
  | "station"
  | "availableFrom"
  | "desiredHours"
  | "desiredRate"
  | "workStyle"
  | "desiredEmployment"
  | "affiliation";

const stack = css({
  display: "grid",
  gap: "6",
  gridTemplateColumns: "minmax(0, 1fr)",
});

const header = css({
  alignItems: "center",
  columnGap: "4",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
});

const heading = css({
  margin: "0",
  textStyle: "std-28B-150",
});

const switches = css({
  columnGap: "3",
  display: "flex",
  flexWrap: "wrap",
  rowGap: "1",
});

const listSection = css({
  display: "grid",
  gap: "3",
  gridTemplateColumns: "minmax(0, 1fr)",
});

const warningBox = css({
  borderColor: "border.divider",
  borderRadius: "12",
  borderWidth: "1px",
  margin: "0",
  px: "4",
  py: "3",
});

const warningTitle = css({
  margin: "0",
  textStyle: "std-16B-170",
});

const warningList = css({
  color: "fg.sub",
  margin: "0",
  pl: "5",
  textStyle: "std-14N-170",
});

const overGuide = css({
  color: "error",
  fontWeight: "bold",
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
  onUpdateSkillFeatured: (skillName: string, featured: boolean) => void;
  onRemoveSkill: (skillName: string) => void;
  onAddCareer: (career: CareerWrite) => void;
  onUpdateCareer: (careerId: string, career: CareerWrite) => void;
  onRemoveCareer: (careerId: string) => void;
  onImport: (file: unknown) => void;
  message?: string | null;
  pending?: boolean;
};

// 文字数の目安を出す注釈。超えたら強調する。
function LengthHint({ text, guide }: { text: string; guide: number }) {
  const result = lengthHint(text, guide);
  return <span className={result.over ? overGuide : undefined}>{result.text}</span>;
}

export function Form({
  initial,
  autoExperience,
  today,
  onValues,
  onSaveProfile,
  onAddSkill,
  onUpdateSkillExperience,
  onUpdateSkillFeatured,
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
  const workStyleList = useId();
  const warnings = sheetWarnings(values);

  useEffect(() => {
    onValues(previewCareers ? { ...values, careers: previewCareers } : values);
  }, [onValues, values, previewCareers]);

  // 入力を終えたら（フォーカスを外したら）保存する。ハイライトは空の欄を除いて保存する。
  const save = (patch: Partial<SheetInput> = {}) => {
    const next = { ...form.state.values, ...patch };
    onSaveProfile({ ...next, highlights: cleanHighlights(next.highlights) });
  };

  const visibilitySwitch = (item: ProfileItem, label: string) => (
    <form.Field name="visibility">
      {(field) => (
        <Switch
          size="sm"
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
    options: { item?: ProfileItem; list?: string; aside?: ReactNode } = {},
  ) => (
    <Field
      label={label}
      className={span(size)}
      aside={options.aside ?? (options.item ? visibilitySwitch(options.item, label) : undefined)}
    >
      <form.Field name={name}>
        {(field) => (
          <Input
            placeholder={placeholder}
            size="sm"
            list={options.list}
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
      <div className={header}>
        <h1 className={heading}>スキルシート</h1>
        {pending ? (
          <Spinner label="保存しています" size="sm" delay>
            保存しています
          </Spinner>
        ) : null}
      </div>
      <SheetActions sheet={values} pending={pending} onImport={onImport} />
      {message ? (
        <p role="alert" className={alert}>
          {message}
        </p>
      ) : null}
      {warnings.length > 0 ? (
        <section className={warningBox} aria-labelledby="warnings-heading">
          <h2 id="warnings-heading" className={warningTitle}>
            書類選考で見られやすい項目の確認
          </h2>
          <ul className={warningList}>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className={profileGrid}>
        <Field
          label="更新日"
          className={span(12)}
          aside={
            <form.Field name="updatedAuto">
              {(field) => (
                <Switch
                  size="sm"
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
      <h3 className={subheading}>人物</h3>
      <div className={profileRows}>
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
          {textField("nameKana", "フリガナ", "例: ヤマダ タロウ", 12)}
        </div>
        <div className={profileGrid}>
          {textField("nameInitials", "イニシャル", "例: T.Y", 12, {
            aside: (
              <form.Field name="nameDisplay">
                {(field) => (
                  <Switch
                    size="sm"
                    label="イニシャルで出す"
                    aria-label="氏名をイニシャルで出す"
                    checked={field.state.value === "initials"}
                    onCheckedChange={(checked) => {
                      const nameDisplay = checked ? "initials" : "full";
                      field.handleChange(nameDisplay);
                      save({ nameDisplay });
                    }}
                  />
                )}
              </form.Field>
            ),
          })}
          {textField("title", "肩書", "例: バックエンドエンジニア / テックリード", 12)}
        </div>
        <div className={profileGrid}>
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
            className={span(12)}
            aside={
              <span className={switches}>
                {visibilitySwitch("experience", "経験年数")}
                <form.Field name="experienceAuto">
                  {(field) => (
                    <Switch
                      size="sm"
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
        </div>
      </div>
      <h3 className={subheading}>基本情報</h3>
      <div className={profileRows}>
        <div className={profileGrid}>
          {textField("availableFrom", "稼働開始", "例: 即日、2026年12月〜", 8, {
            item: "availableFrom",
          })}
          {textField("desiredHours", "稼働量", "例: 週4日（月130h程度）", 8, {
            item: "desiredHours",
          })}
          {textField("desiredRate", "希望単価", "例: 月80〜90万円（140〜180h）", 8, {
            item: "desiredRate",
          })}
        </div>
        <div className={profileGrid}>
          {textField("workStyle", "勤務形態", "例: フルリモート（月1回出社可）", 8, {
            item: "workStyle",
            list: workStyleList,
          })}
          {textField("station", "最寄駅", "例: 新宿駅", 8, { item: "station" })}
          {textField("education", "最終学歴", "例: 〇〇大学", 8, { item: "education" })}
        </div>
        <div className={profileGrid}>
          {textField("desiredEmployment", "希望雇用形態", "例: 業務委託", 12, {
            item: "desiredEmployment",
          })}
          {textField("affiliation", "所属", "例: フリーランス", 12, { item: "affiliation" })}
        </div>
      </div>
      <datalist id={workStyleList}>
        {WORK_STYLES.map((style) => (
          <option key={style} value={style} />
        ))}
      </datalist>
      <p className={hint}>
        希望雇用形態と所属は、プレビューでは「契約形態」にまとめて出します。経験年数は「自動計算」をオンにすると職務経歴の期間から数えます。「表示」を切った項目はプレビューに出しません。
      </p>
      <section className={section} aria-labelledby="highlights-heading">
        <div className={header}>
          <h3 id="highlights-heading" className={subheading}>
            ハイライト
          </h3>
          {visibilitySwitch("highlights", "ハイライト")}
        </div>
        <p className={hint}>
          書類選考で最初に読まれる強みを{MAX_HIGHLIGHTS}
          件まで入れます。直近の案件の実績も 1 件入れると伝わりやすくなります。
        </p>
        <form.Field name="highlights">
          {(field) =>
            Array.from({ length: MAX_HIGHLIGHTS }, (_, index) => {
              const text = field.state.value[index] ?? "";
              return (
                <Field
                  key={index}
                  label={`ハイライト ${index + 1}`}
                  hint={<LengthHint text={text} guide={HIGHLIGHT_GUIDE_LENGTH} />}
                >
                  <Input
                    size="sm"
                    placeholder={
                      index === 0
                        ? "例: 直近の案件で決済基盤の刷新をリードし、障害件数を半減"
                        : "例: 要件定義から運用まで一貫して担当"
                    }
                    value={text}
                    onChange={(event) => {
                      const next = Array.from(
                        { length: MAX_HIGHLIGHTS },
                        (_, at) => field.state.value[at] ?? "",
                      );
                      next[index] = event.target.value;
                      field.handleChange(next);
                    }}
                    onBlur={() => {
                      field.handleBlur();
                      save();
                    }}
                  />
                </Field>
              );
            })
          }
        </form.Field>
      </section>
      <section className={section}>
        <h3 className={subheading}>保有技術</h3>
        <SkillSection
          sheet={values}
          today={today}
          pending={pending}
          onAddSkill={onAddSkill}
          onUpdateSkillExperience={onUpdateSkillExperience}
          onUpdateSkillFeatured={onUpdateSkillFeatured}
          onRemoveSkill={onRemoveSkill}
        />
      </section>
      <section className={section}>
        <form.Field name="qualifications">
          {(field) => (
            <ListInput
              label="資格・語学"
              placeholder="例: 応用情報技術者試験"
              values={field.state.value}
              onChange={(qualifications) => {
                field.handleChange(qualifications);
                save({ qualifications });
              }}
            />
          )}
        </form.Field>
        <section className={listSection} aria-labelledby="links-heading">
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
        <form.Field name="selfPr">
          {(field) => (
            <Field
              label="自己PR"
              aside={visibilitySwitch("selfPr", "自己PR")}
              hint={<LengthHint text={field.state.value} guide={SELF_PR_GUIDE_LENGTH} />}
            >
              <Textarea
                placeholder="例: Webアプリの設計から運用まで一貫して担当してきました。"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                onBlur={() => {
                  field.handleBlur();
                  save();
                }}
              />
            </Field>
          )}
        </form.Field>
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
