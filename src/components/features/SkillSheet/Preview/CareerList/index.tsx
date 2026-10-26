import { css, cx } from "styled-system/css";
import {
  type Career,
  type SheetView,
  type YearMonth,
} from "@/src/shared/features/skill-sheet/sheet.schema";
import { formatDuration } from "@/src/shared/features/skill-sheet/skill.service";
import { Badge, BadgeNote } from "../Badge/index";
import { endLabel, periodDuration, startLabel } from "../format";
import { ACCENT, SUB, sectionNote, sectionTitle } from "../styles";

// 職務経歴サマリー。ページをまたげるよう、見出しと各行を別のブロックにする。
// 行は 1 行ずつの表にし、列の幅は colgroup で全行そろえる。
// ページの先頭に来た行の上には、見出し行（CareerTableHead）を繰り返す。

// 「主な技術」に出す技術・環境の数。
export const CAREER_TECH_COUNT = 4;

const table = css({
  borderCollapse: "collapse",
  tableLayout: "fixed",
  width: "100%",
});

const head = css({
  "& th": {
    background: ACCENT,
    color: "white",
    fontSize: "7.5pt",
    fontWeight: "bold",
    printColorAdjust: "exact",
    px: "1.5mm",
    py: "1mm",
    textAlign: "left",
  },
});

const row = css({
  "& td": {
    borderBottom: "0.5pt solid #d0d7de",
    fontSize: "8.3pt",
    lineHeight: "1.45",
    px: "1.5mm",
    py: "1.4mm",
    verticalAlign: "top",
  },
});

const noCell = css({
  color: ACCENT,
  fontWeight: "bold",
  textAlign: "center",
});

const muted = css({
  color: SUB,
});

const summary = css({
  color: "#3d4650",
  whiteSpace: "pre-wrap",
});

const tech = css({
  color: "#3d4650",
  fontSize: "7.6pt",
});

const projectName = css({
  fontWeight: "bold",
});

function Columns() {
  return (
    <colgroup>
      <col style={{ width: "6mm" }} />
      <col style={{ width: "19mm" }} />
      <col />
      <col style={{ width: "36mm" }} />
      <col style={{ width: "40mm" }} />
    </colgroup>
  );
}

// 表の見出し行。見出しのブロックと、ページの先頭で繰り返すときに使う。
export function CareerTableHead() {
  return (
    <table className={cx(table, head)} aria-hidden="true">
      <Columns />
      <thead>
        <tr>
          <th scope="col">No</th>
          <th scope="col">期間</th>
          <th scope="col">案件 / 業務概要</th>
          <th scope="col">役割</th>
          <th scope="col">主な技術</th>
        </tr>
      </thead>
    </table>
  );
}

export function CareerListHead({ view }: { view: SheetView }) {
  return (
    <>
      <h3 id="career-list-title" className={sectionTitle}>
        職務経歴サマリー
        <span className={sectionNote}>新しい順</span>
        {view.parallelCount > 0 ? (
          <span className={sectionNote}>期間の重なりは並行案件</span>
        ) : null}
        {view.hardCount > 0 ? (
          <span className={sectionNote}>
            <BadgeNote kind="excerpt" />
          </span>
        ) : null}
      </h3>
      <div data-repeat-head="">
        <CareerTableHead />
      </div>
    </>
  );
}

export function CareerRow({ no, item, until }: { no: number; item: Career; until: YearMonth }) {
  return (
    <table className={cx(table, row)} aria-label={`職務経歴 ${no}`}>
      <Columns />
      <tbody>
        <tr>
          <td className={noCell}>{no}</td>
          <td>
            {startLabel(item.period)} –
            <br />
            {endLabel(item.period)}
            <br />
            <span className={muted}>{formatDuration(periodDuration(item.period, until))}</span>
          </td>
          <td>
            <span className={projectName}>{item.projectName}</span>
            {item.hard ? <Badge kind="excerpt" /> : null}
            {item.summary.trim() ? (
              <>
                <br />
                <span className={summary}>{item.summary}</span>
              </>
            ) : null}
          </td>
          <td>
            {item.role}
            {item.employment.trim() ? (
              <>
                <br />
                <span className={muted}>{item.employment}</span>
              </>
            ) : null}
          </td>
          <td className={tech}>{item.environment.slice(0, CAREER_TECH_COUNT).join(" / ")}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmptyCareerRow() {
  return (
    <table className={cx(table, row)}>
      <tbody>
        <tr>
          <td>職務経歴はありません</td>
        </tr>
      </tbody>
    </table>
  );
}
