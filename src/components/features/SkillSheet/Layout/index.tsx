import type { ReactNode } from "react";
import { css } from "styled-system/css";

// md 以上ではフォームとプレビューを左右に並べ、それぞれを別々にスクロールする。
const columns = css({
  display: "grid",
  gridTemplateColumns: { base: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr)" },
  height: { md: "100%" },
  _print: { display: "block", height: "auto" },
});

const column = css({
  minHeight: "0",
  overflowY: { md: "auto" },
  p: { base: "4", md: "8" },
  _print: { overflow: "visible", p: "0" },
});

// 印刷ではプレビューだけを出す。
const formColumn = css({
  borderColor: "border.divider",
  borderRightWidth: { md: "1px" },
  _print: { display: "none" },
});

// パンくずリストはフォームと一緒にスクロールさせる。
const crumbs = css({
  mb: { base: "4", md: "6" },
});

const previewColumn = css({
  background: { md: "bg.subtle" },
  _print: { background: "transparent" },
});

// スキルシートの画面の枠。読み込み中のスケルトンも同じ枠を使い、表示が切り替わってもずれないようにする。
export function SheetLayout({
  breadcrumb,
  form,
  preview,
}: {
  breadcrumb?: ReactNode;
  form: ReactNode;
  preview: ReactNode;
}) {
  return (
    <div className={columns}>
      <div className={`${column} ${formColumn}`}>
        {breadcrumb ? <div className={crumbs}>{breadcrumb}</div> : null}
        {form}
      </div>
      <div className={`${column} ${previewColumn}`}>{preview}</div>
    </div>
  );
}
