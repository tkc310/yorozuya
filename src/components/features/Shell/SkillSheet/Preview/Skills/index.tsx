import { css, cx } from "styled-system/css";
import {
  formatDuration,
  type SheetInput,
  type SheetView,
} from "@/shared/features/skill-sheet/sheet";
import { hairline, part, prose, tag, tags } from "../styles";

// 保有技術は全体を 1 枚のカードにする。見出しの帯の下で、グループごとに細い線で区切る。
const skillCard = css({
  border: hairline,
  borderRadius: "0.6mm",
  overflow: "hidden",
});

const skillHead = css({
  background: "#f2f2f2",
  borderBottom: hairline,
  fontSize: "9pt",
  fontWeight: "bold",
  margin: "0",
  px: "3mm",
  py: "1mm",
});

// グループ名は上下中央に置き、技術はタグで並べる。
const skillRow = css({
  alignItems: "center",
  display: "grid",
  gap: "3mm",
  gridTemplateColumns: "24mm minmax(0, 1fr)",
  px: "3mm",
  py: "2mm",
  "& + &": { borderTop: hairline },
});

const skillGroup = css({
  fontWeight: "bold",
});

// 保有技術。グループごとに技術を並べ、年数があれば | で添える。
export function Skills({ input, view }: { input: SheetInput; view: SheetView }) {
  const durations = new Map(view.skills.map((skill) => [skill.name, skill.duration]));
  const groups = input.skillGroups
    .map((group) => ({
      name: group.name,
      skills: group.skills
        .map((skill) => skill.name.trim())
        .filter((skillName) => durations.has(skillName)),
    }))
    .filter((group) => group.skills.length > 0);
  if (groups.length === 0) {
    return (
      <section className={cx(part, skillCard)} aria-label="保有技術">
        <h4 className={skillHead}>保有技術</h4>
        <p className={cx(prose, skillRow)}>保有技術はありません</p>
      </section>
    );
  }
  return (
    <section className={cx(part, skillCard)} aria-label="保有技術">
      <h4 className={skillHead}>保有技術</h4>
      {groups.map((group) => (
        <div key={group.name} className={skillRow}>
          <span className={skillGroup}>{group.name}</span>
          <ul className={tags}>
            {group.skills.map((skillName) => {
              const duration = durations.get(skillName);
              const years =
                duration && (duration.years > 0 || duration.months > 0)
                  ? formatDuration(duration)
                  : null;
              return (
                <li key={skillName} className={tag}>
                  {years ? `${skillName} | ${years}` : skillName}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
