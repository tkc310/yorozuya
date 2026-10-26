import { css } from "styled-system/css";
import { type SheetInput, type SheetView } from "@/src/shared/features/skill-sheet/sheet.schema";
import { byDuration, formatSkillYears } from "@/src/shared/features/skill-sheet/skill.service";
import { Badge, BadgeNote } from "../Badge/index";
import { ACCENT_SOFT, part, plainList, prose, sectionNote, sectionTitle } from "../styles";

// 保有技術。グループごとの縦リストを 3 段の段組みで上から詰める。
// グリッドにすると行ごとに一番高いグループへ揃い、短いグループの下が空くため段組みにする。

const columns = css({
  columnCount: "3",
  columnGap: "5mm",
});

const group = css({
  breakInside: "avoid",
  mb: "3mm",
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

const featured = css({
  fontWeight: "bold",
});

const years = css({
  fontVariantNumeric: "tabular-nums",
  whiteSpace: "nowrap",
});

export function Skills({ input, view }: { input: SheetInput; view: SheetView }) {
  const known = new Map(view.skills.map((skill) => [skill.name, skill]));
  const groups = input.skillGroups
    .map((item) => ({
      name: item.name,
      skills: byDuration(
        item.skills
          .map((skill) => known.get(skill.name.trim()))
          .filter((skill) => skill !== undefined),
      ),
    }))
    .filter((item) => item.skills.length > 0);
  const anyFeatured = view.skills.some((skill) => skill.featured);
  return (
    <section className={part} aria-labelledby="skills-title">
      <h3 id="skills-title" className={sectionTitle}>
        保有技術
        <span className={sectionNote}>経験年数は 0.5 年単位</span>
        {anyFeatured ? (
          <span className={sectionNote}>
            <BadgeNote kind="main" />
          </span>
        ) : null}
      </h3>
      {groups.length === 0 ? (
        <p className={prose}>保有技術はありません</p>
      ) : (
        <div className={columns}>
          {groups.map((item) => (
            <section key={item.name} className={group} aria-label={item.name}>
              <h4 className={groupName}>{item.name}</h4>
              <ul className={plainList}>
                {item.skills.map((skill) => (
                  <li key={skill.name} className={skillRow}>
                    <span className={skill.featured ? featured : undefined}>
                      {skill.name}
                      {skill.featured ? <Badge kind="main" /> : null}
                    </span>
                    <span className={years}>{formatSkillYears(skill.duration)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
