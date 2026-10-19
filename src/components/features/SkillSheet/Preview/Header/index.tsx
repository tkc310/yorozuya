import { css, cx } from "styled-system/css";
import { formatSlashDate, type SheetView } from "@/shared/features/skill-sheet/sheet";
import { ACCENT, SUB, TEXT } from "../styles";

// ヘッダーは「誰か・どのレベルか」をまとめる。氏名・フリガナ・年齢・性別・肩書・経験年数。
// 更新日は書類の情報なので最上段の右端に小さく置く。

const root = css({
  borderBottom: "1.5pt solid #1f3a5f",
  mb: "4mm",
  pb: "2.5mm",
});

const top = css({
  alignItems: "baseline",
  color: SUB,
  display: "flex",
  fontSize: "8pt",
  justifyContent: "space-between",
  mb: "0.5mm",
});

const eyebrow = css({
  color: ACCENT,
  fontSize: "7.5pt",
  fontWeight: "bold",
  letterSpacing: "0.2em",
  margin: "0",
});

const nameRow = css({
  alignItems: "baseline",
  columnGap: "4mm",
  display: "flex",
  flexWrap: "wrap",
});

const name = css({
  fontSize: "20pt",
  fontWeight: "bold",
  letterSpacing: "0.04em",
  lineHeight: "1.2",
  margin: "0",
});

const kana = css({
  color: SUB,
  fontSize: "9pt",
  fontWeight: "normal",
  letterSpacing: "0.05em",
  ml: "1.5mm",
});

const attrs = css({
  color: TEXT,
  fontSize: "10pt",
  fontWeight: "bold",
  margin: "0",
});

// 項目の間の縦線。
const separated = css({
  "& > * + *": {
    borderLeft: "0.75pt solid #9fb3c8",
    ml: "2.5mm",
    pl: "2.5mm",
  },
});

const role = css({
  color: ACCENT,
  fontSize: "10.5pt",
  fontWeight: "bold",
  lineHeight: "1.4",
  margin: "0",
  mt: "0.5mm",
});

const experience = css({
  color: TEXT,
});

export function Header({ view }: { view: SheetView }) {
  const personal = [
    view.visibility.age && view.age !== null ? `${view.age}歳` : null,
    view.visibility.gender && view.gender ? view.gender : null,
  ].filter((item): item is string => item !== null);
  const title = view.texts.title.trim();
  const showExperience = view.visibility.experience && view.experience.trim().length > 0;
  return (
    <header className={root}>
      <div className={top}>
        <p className={eyebrow}>スキルシート</p>
        <span>更新日 {view.updatedOn ? formatSlashDate(view.updatedOn) : "未設定"}</span>
      </div>
      <div className={nameRow}>
        <h2 className={name}>
          {view.displayName}
          {view.nameKana ? <span className={kana}>（{view.nameKana}）</span> : null}
        </h2>
        {personal.length > 0 ? (
          <p className={cx(attrs, separated)}>
            {personal.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </p>
        ) : null}
      </div>
      {title || showExperience ? (
        <p className={cx(role, separated)}>
          {title ? <span>{title}</span> : null}
          {showExperience ? <span className={experience}>経験 {view.experience}</span> : null}
        </p>
      ) : null}
    </header>
  );
}
