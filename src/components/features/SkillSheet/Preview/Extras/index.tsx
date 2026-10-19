import { css, cx } from "styled-system/css";
import type { SheetView } from "@/shared/features/skill-sheet/sheet";
import { SUB, part, plainList, sectionTitle } from "../styles";

// 資格・語学とリンク。片方しか無ければ全幅にする。

const columns = css({
  columnGap: "6mm",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
});

const item = css({
  py: "0.3mm",
});

const linkLabel = css({
  color: SUB,
  mr: "3mm",
});

const link = css({
  color: "inherit",
  overflowWrap: "anywhere",
  textDecoration: "none",
});

export function Extras({ view }: { view: SheetView }) {
  const qualifications = view.qualifications;
  const links = view.links;
  if (qualifications.length === 0 && links.length === 0) {
    return null;
  }
  return (
    <div className={cx(part, qualifications.length > 0 && links.length > 0 ? columns : undefined)}>
      {qualifications.length > 0 ? (
        <section aria-labelledby="qualifications-title">
          <h3 id="qualifications-title" className={sectionTitle}>
            資格・語学
          </h3>
          <ul className={plainList}>
            {qualifications.map((name, index) => (
              <li key={`${index}-${name}`} className={item}>
                {name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {links.length > 0 ? (
        <section aria-labelledby="links-title">
          <h3 id="links-title" className={sectionTitle}>
            リンク
          </h3>
          <ul className={plainList}>
            {links.map((entry, index) => (
              <li key={`${index}-${entry.url}`} className={item}>
                {entry.label ? <span className={linkLabel}>{entry.label}</span> : null}
                <a className={link} href={entry.url} target="_blank" rel="noreferrer">
                  {entry.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
