import { css, cx } from "styled-system/css";
import {
  PHASES,
  PHASE_SHORT,
  detailSummaryOf,
  formatDuration,
  type Career,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";
import { Badge } from "../Badge/index";
import { endLabel, periodDuration, startLabel } from "../format";
import { ACCENT, ACCENT_SOFT, EMPHASIS, PANEL, SUB, itemLabel, prose } from "../styles";

// 職務経歴詳細。1 案件を 1 枚のカードにする。左に本文、右に技術や担当工程をまとめる。

const card = css({
  border: "0.5pt solid #c9d1d9",
  borderRadius: "1mm",
  breakInside: "avoid",
  mb: "3.5mm",
  overflow: "hidden",
});

const cardHead = css({
  alignItems: "center",
  background: ACCENT_SOFT,
  display: "flex",
  gap: "2.5mm",
  printColorAdjust: "exact",
  px: "3mm",
  py: "1.6mm",
});

const cardNo = css({
  alignItems: "center",
  background: ACCENT,
  borderRadius: "50%",
  color: "white",
  display: "flex",
  flexShrink: "0",
  fontSize: "8pt",
  fontWeight: "bold",
  height: "5.5mm",
  justifyContent: "center",
  printColorAdjust: "exact",
  width: "5.5mm",
});

const cardTitle = css({
  flex: "1",
  fontSize: "10pt",
  fontWeight: "bold",
  lineHeight: "1.35",
  margin: "0",
});

const cardPeriod = css({
  flexShrink: "0",
  fontSize: "8.2pt",
  whiteSpace: "nowrap",
});

const cardDuration = css({
  color: ACCENT,
  fontWeight: "bold",
  ml: "1.5mm",
});

// 役割・契約・体制・手法を 1 行に並べる。長ければ折り返す。
const cardMeta = css({
  borderBottom: "0.5pt solid #e1e5ea",
  fontSize: "7.9pt",
  margin: "0",
  px: "3mm",
  py: "1.1mm",
  "& > span + span::before": { color: SUB, content: '"｜"', mx: "1.5mm" },
});

const metaLabel = css({
  color: SUB,
  mr: "1mm",
});

const cardBody = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 50mm",
});

const cardMain = css({
  alignContent: "start",
  display: "grid",
  gap: "1.2mm",
  px: "3mm",
  py: "2mm",
});

const lead = css({
  fontWeight: "bold",
  margin: "0",
  whiteSpace: "pre-wrap",
});

// 成果は選考側が最も見たい数値実績なので、背景と左の線で目立たせる。
const outcome = css({
  background: EMPHASIS,
  borderLeft: "1mm solid #1f3a5f",
  printColorAdjust: "exact",
  px: "2mm",
  py: "0.8mm",
});

const cardSide = css({
  alignContent: "start",
  background: PANEL,
  borderLeft: "0.5pt solid #e1e5ea",
  display: "grid",
  gap: "1.2mm",
  printColorAdjust: "exact",
  px: "3mm",
  py: "2mm",
});

const techList = css({
  fontSize: "7.9pt",
  lineHeight: "1.45",
  margin: "0",
});

// 担当工程は 4 列 2 段のチップ。担当した工程は塗り、していない工程は枠だけにする。
const phaseGrid = css({
  display: "grid",
  gap: "0.8mm",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  listStyle: "none",
  margin: "0",
  p: "0",
});

const phase = css({
  border: "0.5pt solid #d0d7de",
  borderRadius: "0.6mm",
  color: "#a0a8b0",
  fontSize: "7pt",
  printColorAdjust: "exact",
  py: "0.2mm",
  textAlign: "center",
  "&[data-active]": {
    background: ACCENT,
    borderColor: ACCENT,
    color: "white",
    fontWeight: "bold",
  },
});

export function DetailCareer({ no, item, until }: { no: number; item: Career; until: YearMonth }) {
  const meta = [
    { label: "役割", value: item.role },
    { label: "契約", value: item.employment },
    { label: "体制", value: item.team },
    { label: "手法", value: item.methodology },
  ].filter((entry) => entry.value.trim().length > 0);
  const summary = detailSummaryOf(item).trim();
  return (
    <article className={card} aria-label={item.projectName}>
      <div className={cardHead}>
        <span className={cardNo}>{no}</span>
        <h4 className={cardTitle}>
          {item.projectName}
          {item.hard ? <Badge kind="excerpt" /> : null}
        </h4>
        <span className={cardPeriod}>
          {startLabel(item.period)} – {endLabel(item.period)}
          <span className={cardDuration}>{formatDuration(periodDuration(item.period, until))}</span>
        </span>
      </div>
      {meta.length > 0 ? (
        <p className={cardMeta}>
          {meta.map((entry) => (
            <span key={entry.label}>
              <span className={metaLabel}>{entry.label}</span>
              {entry.value}
            </span>
          ))}
        </p>
      ) : null}
      <div className={cardBody}>
        <div className={cardMain}>
          {summary ? <p className={lead}>{summary}</p> : null}
          {item.work.trim() ? (
            <div>
              <span className={itemLabel}>担当業務</span>
              <p className={prose}>{item.work}</p>
            </div>
          ) : null}
          {item.outcome.trim() ? (
            <div>
              <span className={itemLabel}>成果</span>
              <p className={cx(prose, outcome)}>{item.outcome}</p>
            </div>
          ) : null}
        </div>
        <div className={cardSide}>
          {item.environment.length > 0 ? (
            <div>
              <span className={itemLabel}>技術・環境</span>
              <p className={techList}>{item.environment.join(" / ")}</p>
            </div>
          ) : null}
          {item.tools.length > 0 ? (
            <div>
              <span className={itemLabel}>ツール</span>
              <p className={techList}>{item.tools.join(" / ")}</p>
            </div>
          ) : null}
          <div>
            <span className={itemLabel}>担当工程</span>
            <ul className={phaseGrid}>
              {PHASES.map((name) => {
                const active = item.phases.includes(name);
                return (
                  <li
                    key={name}
                    className={phase}
                    data-active={active ? "" : undefined}
                    aria-label={`${name}${active ? "（担当）" : ""}`}
                  >
                    {PHASE_SHORT[name]}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </article>
  );
}
