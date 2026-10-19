import { css } from "styled-system/css";
import type { SheetView } from "@/shared/features/skill-sheet/sheet";
import { SUB, part, sectionTitle } from "../styles";

// 基本情報は、契約できるかと経歴の前提を、担当者が確認する順に並べる。
// いつから → どれだけ → いくらで → どこで → どう契約するか → 経歴の前提。
// 塗りや縦線は使わず、項目の下の細い線と列の間の余白だけで区切る。

const grid = css({
  columnGap: "6mm",
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  margin: "0",
});

const cell = css({
  borderBottom: "0.5pt solid #e1e5ea",
  minWidth: "0",
  pb: "1.4mm",
  pt: "1.3mm",
});

const label = css({
  color: SUB,
  fontSize: "7pt",
  fontWeight: "bold",
});

const value = css({
  fontSize: "9pt",
  fontWeight: "bold",
  lineHeight: "1.35",
  margin: "0",
});

export type BasicItem = {
  label: string;
  value: string;
};

// 契約形態は希望雇用形態と所属をまとめる（例: 業務委託（フリーランス））。
function contractOf(view: SheetView): string {
  const employment = view.visibility.desiredEmployment ? view.texts.desiredEmployment.trim() : "";
  const affiliation = view.visibility.affiliation ? view.texts.affiliation.trim() : "";
  if (employment && affiliation) {
    return `${employment}（${affiliation}）`;
  }
  return employment || affiliation;
}

// 表示をオンにした、空でない項目を決まった順に並べる。
export function basicItems(view: SheetView): BasicItem[] {
  const items: [boolean, string, string][] = [
    [view.visibility.availableFrom, "稼働開始", view.texts.availableFrom],
    [view.visibility.desiredHours, "稼働量", view.texts.desiredHours],
    [view.visibility.desiredRate, "希望単価", view.texts.desiredRate],
    [view.visibility.workStyle, "勤務形態", view.texts.workStyle],
    [view.visibility.station, "最寄駅", view.station],
    [true, "契約形態", contractOf(view)],
    [view.visibility.education, "最終学歴", view.education],
  ];
  return items
    .filter(([visible, , text]) => visible && text.trim().length > 0)
    .map(([, itemLabel, text]) => ({ label: itemLabel, value: text.trim() }));
}

export function BasicInfo({ view }: { view: SheetView }) {
  const items = basicItems(view);
  if (items.length === 0) {
    return null;
  }
  return (
    <section className={part} aria-labelledby="basic-info-title">
      <h3 id="basic-info-title" className={sectionTitle}>
        基本情報
      </h3>
      <dl className={grid}>
        {items.map((item) => (
          <div key={item.label} className={cell}>
            <dt className={label}>{item.label}</dt>
            <dd className={value}>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
