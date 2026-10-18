import { css } from "styled-system/css";
import type { Career, SheetView } from "@/shared/features/skill-sheet/sheet";
import { careerName, endLabel, formatMonth } from "../format";
import { prose, rule, sectionTitle } from "../styles";

const note = css({
  color: "#4d4d4d",
  fontSize: "7.5pt",
  margin: "0",
  mb: "1mm",
});

// 一覧だけは比べやすいよう表にする。縦線や行の線は使わず、1 行おきに背景を変える。
const listTable = css({
  borderCollapse: "collapse",
  mt: "1.5mm",
  tableLayout: "fixed",
  width: "100%",
  "& th": {
    borderBottom: rule,
    borderTop: rule,
    fontSize: "8pt",
    fontWeight: "bold",
    px: "1.2mm",
    py: "1mm",
    textAlign: "left",
  },
  "& td": {
    px: "1.2mm",
    py: "1.5mm",
    verticalAlign: "middle",
  },
  "& tbody tr:nth-child(even)": { background: "#f2f2f2" },
  "& tbody tr:last-child td": { borderBottom: rule },
  "& th:first-child, & td:first-child": { textAlign: "center" },
  "& tbody tr": { breakInside: "avoid" },
});

const projectCell = css({
  fontWeight: "bold",
});

// 職務経歴の一覧。案件を 1 行ずつ表に並べる。
export function CareerList({ view, careers }: { view: SheetView; careers: Career[] }) {
  return (
    <section aria-labelledby="career-list-title">
      <h3 id="career-list-title" className={sectionTitle}>
        職務経歴の一覧
      </h3>
      {/* 期間の重なりがあるときだけ並行の注記を、高難易度の経歴があるときだけ ※ の注記を出す。 */}
      {view.parallelCount > 0 ? (
        <p className={note}>期間が重複しているものについては並行していた案件になります。</p>
      ) : null}
      {view.hardCount > 0 ? (
        <p className={note}>
          特に難易度が高くスキルアップできた経歴には 企業・案件名の末尾に (※) と記載しています。
        </p>
      ) : null}
      <table className={listTable}>
        <colgroup>
          <col style={{ width: "8mm" }} />
          {/* 期間は「2023年12月 -」が 1 行に収まる幅にして、2 行で収める。 */}
          <col style={{ width: "24mm" }} />
          <col style={{ width: "38mm" }} />
          <col />
          <col style={{ width: "22mm" }} />
          {/* 雇用形態は「個人事業主」が 1 行に収まる幅にする。 */}
          <col style={{ width: "21mm" }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">No.</th>
            <th scope="col">期間</th>
            <th scope="col">企業・案件名</th>
            <th scope="col">業務の概要</th>
            <th scope="col">担当職種</th>
            <th scope="col">雇用形態</th>
          </tr>
        </thead>
        <tbody>
          {careers.length === 0 ? (
            <tr>
              <td colSpan={6}>職務経歴はありません</td>
            </tr>
          ) : null}
          {careers.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>
                {formatMonth(item.period.start)} -
                <br />
                {endLabel(item.period)}
              </td>
              <td className={projectCell}>{careerName(item)}</td>
              <td className={prose}>{item.summary}</td>
              <td>{item.role}</td>
              <td>{item.employment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
