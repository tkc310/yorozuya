import { css } from "styled-system/css";
import {
  PHASES,
  detailSummaryOf,
  formatDuration,
  type Career,
  type YearMonth,
} from "@/shared/features/skill-sheet/sheet";
import { careerName, endLabel, formatMonth, periodDuration } from "../format";
import { hairline, itemLabel, prose, tag, tags } from "../styles";

// 詳細は 1 案件を 1 枚のカードにする。左に本文、右に技術や体制をまとめる。
const card = css({
  border: hairline,
  borderRadius: "0.6mm",
  breakInside: "avoid",
  mb: "4mm",
  overflow: "hidden",
});

const cardHead = css({
  alignItems: "baseline",
  background: "#f2f2f2",
  borderBottom: hairline,
  display: "flex",
  gap: "3mm",
  px: "3mm",
  py: "1.8mm",
});

const cardNo = css({
  color: "#4d4d4d",
  flexShrink: "0",
  fontSize: "9.5pt",
  fontWeight: "bold",
});

const cardTitle = css({
  flex: "1",
  fontSize: "10.5pt",
  fontWeight: "bold",
  lineHeight: "1.35",
  margin: "0",
});

const cardPeriod = css({
  color: "#333333",
  flexShrink: "0",
  fontSize: "8.5pt",
  fontWeight: "bold",
  whiteSpace: "nowrap",
});

// 担当職種などは項目名と値を横に並べる。1 行目に担当職種・雇用形態・チーム構成、2 行目に開発手法を置く。
const cardMeta = css({
  borderBottom: hairline,
  display: "grid",
  gap: "1mm 6mm",
  // 担当職種と雇用形態は短いので中身の幅にし、残りをチーム構成に回す。
  gridTemplateColumns: "auto auto minmax(0, 1fr)",
  m: "0",
  px: "3mm",
  py: "1.5mm",
});

const metaItem = css({
  alignItems: "baseline",
  display: "flex",
  gap: "1.5mm",
  minWidth: "0",
  "&[data-wide]": { gridColumn: "1 / -1" },
});

const metaLabel = css({
  color: "#666666",
  flexShrink: "0",
  fontSize: "7.5pt",
  whiteSpace: "nowrap",
});

const metaValue = css({
  fontSize: "8.5pt",
  m: "0",
});

const cardBody = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 56mm",
});

// 本文は右の列より短くても間隔を広げず、上から一定の間隔で詰める。
const cardMain = css({
  alignContent: "start",
  display: "grid",
  gap: "2.5mm",
  px: "3mm",
  py: "2.5mm",
});

const cardSide = css({
  borderLeft: hairline,
  display: "grid",
  gap: "2.5mm",
  alignContent: "start",
  px: "3mm",
  py: "2.5mm",
});

// 担当工程は 4 列 2 行。工程名と ● を線で区切る。工程名はすべて同じ文字の形にし、担当は ● で示す。
const phaseGrid = css({
  border: hairline,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
});

// 工程名の段と ● の段は高さを固定し、● の有無で表が崩れないようにする。
const phaseCell = css({
  display: "grid",
  gridTemplateRows: "7mm 5mm",
  textAlign: "center",
  "&:not(:nth-child(4n + 1))": { borderLeft: hairline },
  "&:nth-child(n + 5)": { borderTop: hairline },
});

const phaseLabel = css({
  alignItems: "center",
  color: "black",
  display: "flex",
  fontSize: "6.5pt",
  fontWeight: "bold",
  justifyContent: "center",
  lineHeight: "1.2",
  px: "0.5mm",
});

const phaseMark = css({
  alignItems: "center",
  borderTop: hairline,
  display: "flex",
  fontSize: "8pt",
  justifyContent: "center",
  lineHeight: "1",
});

// 工程名は単語で 2 行に分ける（要件/定義、ユニット/テスト）。2 文字のものは 1 行のまま。
function phaseLines(phase: string) {
  const split = phase.endsWith("テスト") ? phase.length - 3 : phase.length === 4 ? 2 : 0;
  if (split === 0) {
    return phase;
  }
  return (
    <>
      {phase.slice(0, split)}
      <br />
      {phase.slice(split)}
    </>
  );
}

function tagList(values: string[]) {
  return (
    <ul className={tags}>
      {values.map((name) => (
        <li key={name} className={tag}>
          {name}
        </li>
      ))}
    </ul>
  );
}

// 職務経歴の詳細。1 案件を 1 枚のカードにする。
export function DetailCareer({ no, item, until }: { no: number; item: Career; until: YearMonth }) {
  const texts = [
    { label: "概要", text: detailSummaryOf(item) },
    { label: "担当業務", text: item.work },
    { label: "注力した課題・成果", text: item.outcome },
  ].filter((entry) => entry.text.trim().length > 0);
  const meta = [
    { label: "担当職種", value: item.role },
    { label: "雇用形態", value: item.employment },
    { label: "チーム構成", value: item.team },
    { label: "開発手法", value: item.methodology },
  ].filter((entry) => entry.value.trim().length > 0);
  return (
    <article className={card} aria-label={item.projectName}>
      <div className={cardHead}>
        <span className={cardNo}>No.{no}</span>
        <h4 className={cardTitle}>{careerName(item)}</h4>
        <span className={cardPeriod}>
          {formatMonth(item.period.start)} 〜 {endLabel(item.period)}（
          {formatDuration(periodDuration(item.period, until))}）
        </span>
      </div>
      {meta.length > 0 ? (
        <dl className={cardMeta}>
          {meta.map((entry) => (
            <div
              key={entry.label}
              className={metaItem}
              data-wide={entry.label === "開発手法" ? "" : undefined}
            >
              <dt className={metaLabel}>{entry.label}</dt>
              <dd className={metaValue}>{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <div className={cardBody}>
        <div className={cardMain}>
          {texts.map((entry) => (
            <div key={entry.label}>
              <span className={itemLabel}>{entry.label}</span>
              <p className={prose}>{entry.text}</p>
            </div>
          ))}
        </div>
        <div className={cardSide}>
          {item.environment.length > 0 ? (
            <div>
              <span className={itemLabel}>技術・環境</span>
              {tagList(item.environment)}
            </div>
          ) : null}
          {item.tools.length > 0 ? (
            <div>
              <span className={itemLabel}>ツール</span>
              {tagList(item.tools)}
            </div>
          ) : null}
          <div>
            <span className={itemLabel}>担当工程</span>
            <div className={phaseGrid}>
              {PHASES.map((phase) => {
                const active = item.phases.includes(phase);
                return (
                  <div key={phase} className={phaseCell}>
                    <span className={phaseLabel}>{phaseLines(phase)}</span>
                    <span className={phaseMark} aria-label={phase}>
                      {active ? "●" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
