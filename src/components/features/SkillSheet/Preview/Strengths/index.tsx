import { css, cx } from "styled-system/css";
import {
  durationMonths,
  formatSkillYears,
  type SheetView,
} from "@/shared/features/skill-sheet/sheet";
import { ACCENT, ACCENT_MID, part, plainList, sectionTitle } from "../styles";

// 強み。左にハイライト、右に主要スキル。どちらかしか無ければ全幅にする。

const columns = css({
  columnGap: "6mm",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
});

const single = css({
  display: "grid",
});

const highlight = css({
  mb: "1.2mm",
  pl: "4mm",
  position: "relative",
  _before: {
    background: ACCENT,
    borderRadius: "50%",
    content: '""',
    height: "1.6mm",
    left: "0",
    position: "absolute",
    top: "1.9mm",
    width: "1.6mm",
  },
});

const skillTable = css({
  borderCollapse: "collapse",
  width: "100%",
  "& th": {
    fontWeight: "bold",
    pr: "2mm",
    py: "0.5mm",
    textAlign: "left",
    whiteSpace: "nowrap",
    width: "1%",
  },
  "& td": { py: "0.5mm" },
});

const bar = css({
  background: ACCENT_MID,
  borderRadius: "0.6mm",
  display: "block",
  height: "2.4mm",
  printColorAdjust: "exact",
});

const years = css({
  fontVariantNumeric: "tabular-nums",
  fontWeight: "bold",
  textAlign: "right",
  whiteSpace: "nowrap",
  width: "13mm",
});

export function Strengths({ view }: { view: SheetView }) {
  const highlights = view.visibility.highlights ? view.highlights : [];
  const skills = view.featuredSkills;
  if (highlights.length === 0 && skills.length === 0) {
    return null;
  }
  const longest = Math.max(1, ...skills.map((skill) => durationMonths(skill.duration)));
  return (
    <div className={cx(part, highlights.length > 0 && skills.length > 0 ? columns : single)}>
      {highlights.length > 0 ? (
        <section aria-labelledby="highlights-title">
          <h3 id="highlights-title" className={sectionTitle}>
            ハイライト
          </h3>
          <ul className={plainList}>
            {highlights.map((text, index) => (
              <li key={`${index}-${text}`} className={highlight}>
                {text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {skills.length > 0 ? (
        <section aria-labelledby="featured-skills-title">
          <h3 id="featured-skills-title" className={sectionTitle}>
            主要スキル
          </h3>
          <table className={skillTable}>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.name}>
                  <th scope="row">{skill.name}</th>
                  <td>
                    <span
                      className={bar}
                      style={{ width: `${(durationMonths(skill.duration) / longest) * 100}%` }}
                    />
                  </td>
                  <td className={years}>{formatSkillYears(skill.duration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
