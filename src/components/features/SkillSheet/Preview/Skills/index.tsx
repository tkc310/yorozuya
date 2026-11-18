import { css, cx } from "styled-system/css";
import { type SheetInput, type SheetView } from "@/src/shared/features/skill-sheet/sheet.schema";
import { byDuration, formatSkillYears } from "@/src/shared/features/skill-sheet/skill.service";
import { Badge, BadgeNote } from "../Badge/index";
import { ACCENT_SOFT, SUB, part, prose, sectionNote, sectionTitle } from "../styles";

// 保有技術。グループ名と技術の 1 行ずつを項目にし、3 段の段組みへ上から詰める。
// どの項目をどの段に置くかは改ページ（pagination.ts）が高さを測って決める。
// グループの途中でも段とページを分け、段の先頭ではグループ名を「続き」として繰り返す。

export const SKILL_COLUMN_COUNT = 3;

const columns = css({
  alignItems: "start",
  columnGap: "5mm",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
});

// 高さを余白ごと測れるよう、余白を内側に閉じ込める。
const itemBox = css({
  display: "flow-root",
});

// グループの最後の行の下をあけ、次のグループと離す。
const groupEnd = css({
  pb: "3mm",
});

const groupName = css({
  background: ACCENT_SOFT,
  fontSize: "8.5pt",
  fontWeight: "bold",
  margin: "0",
  mb: "1mm",
  printColorAdjust: "exact",
  px: "1.5mm",
  py: "0.6mm",
});

const skillRow = css({
  alignItems: "baseline",
  borderBottom: "0.5pt dotted #c4ccd4",
  display: "flex",
  fontSize: "8.2pt",
  gap: "2mm",
  justifyContent: "space-between",
  px: "1.5mm",
  py: "0.35mm",
});

const continuedNote = css({
  color: SUB,
  fontWeight: "normal",
});

const featured = css({
  fontWeight: "bold",
});

const years = css({
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

type SkillRow = SheetView["skills"][number];

export type SkillItem =
  | { kind: "group"; key: string; name: string }
  | { kind: "skill"; key: string; group: string; skill: SkillRow; last: boolean };

// 段組みに並べる順の項目。グループ名のあとにそのグループの技術を経験の長い順に続ける。
export function skillItems(input: SheetInput, view: SheetView): SkillItem[] {
  const known = new Map(view.skills.map((skill) => [skill.name, skill]));
  return input.skillGroups.flatMap((item, groupIndex) => {
    const skills = byDuration(
      item.skills
        .map((skill) => known.get(skill.name.trim()))
        .filter((skill) => skill !== undefined),
    );
    if (skills.length === 0) {
      return [];
    }
    return [
      { kind: "group" as const, key: `group-${groupIndex}`, name: item.name },
      ...skills.map((skill, index) => ({
        kind: "skill" as const,
        key: `skill-${groupIndex}-${index}`,
        group: item.name,
        skill,
        last: index === skills.length - 1,
      })),
    ];
  });
}

// 測る前の仮の並び。項目の数で段を割る。
function evenColumns(items: SkillItem[]): string[][] {
  const size = Math.ceil(items.length / SKILL_COLUMN_COUNT);
  return Array.from({ length: SKILL_COLUMN_COUNT }, (_, index) =>
    items.slice(index * size, (index + 1) * size).map((item) => item.key),
  );
}

function GroupName({ name, continued }: { name: string; continued?: boolean }) {
  return (
    <h4 className={groupName}>
      {name}
      {continued ? <span className={continuedNote}>（続き）</span> : null}
    </h4>
  );
}

function SkillColumn({ items }: { items: SkillItem[] }) {
  const first = items[0];
  return (
    <div>
      {/* 段の先頭がグループの途中なら、グループ名を繰り返す。 */}
      {first?.kind === "skill" ? <GroupName name={first.group} continued /> : null}
      {items.map((item) =>
        item.kind === "group" ? (
          <div key={item.key} className={itemBox} data-flow-item={item.key}>
            <GroupName name={item.name} />
          </div>
        ) : (
          <div
            key={item.key}
            className={cx(itemBox, item.last ? groupEnd : undefined)}
            data-flow-item={item.key}
          >
            <div className={skillRow}>
              <span className={item.skill.featured ? featured : undefined}>
                {item.skill.name}
                {item.skill.featured ? <Badge kind="main" /> : null}
              </span>
              <span className={years}>{formatSkillYears(item.skill.duration)}</span>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

// placed はこのページに置く項目のキーを段ごとに並べたもの。continued は前のページからの続きのとき。
export function Skills({
  input,
  view,
  placed,
  continued = false,
}: {
  input: SheetInput;
  view: SheetView;
  placed?: string[][];
  continued?: boolean;
}) {
  const items = skillItems(input, view);
  const byKey = new Map(items.map((item) => [item.key, item]));
  const anyFeatured = view.skills.some((skill) => skill.featured);
  const titleId = continued ? undefined : "skills-title";
  return (
    <section
      className={part}
      aria-labelledby={titleId}
      aria-label={continued ? "保有技術（続き）" : undefined}
    >
      <h3 id={titleId} className={sectionTitle}>
        保有技術
        {continued ? (
          <span className={sectionNote}>（続き）</span>
        ) : (
          <>
            <span className={sectionNote}>経験年数は 0.5 年単位</span>
            {anyFeatured ? (
              <span className={sectionNote}>
                <BadgeNote kind="main" />
              </span>
            ) : null}
          </>
        )}
      </h3>
      {items.length === 0 ? (
        <p className={prose}>保有技術はありません</p>
      ) : (
        <div className={columns} data-flow-body>
          {(placed ?? evenColumns(items)).map((keys, index) => (
            <SkillColumn
              key={index}
              items={keys.map((key) => byKey.get(key)).filter((item) => item !== undefined)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
