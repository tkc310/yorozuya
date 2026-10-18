import { css } from "styled-system/css";

// フォームの各部品で共通に使う見た目。

// グリッドの子は既定で中身より細くならないので、列を minmax(0, 1fr) にして省略表示を効かせる。
export const section = css({
  borderTopWidth: "1px",
  borderColor: "border.divider",
  display: "grid",
  gap: "6",
  gridTemplateColumns: "minmax(0, 1fr)",
  pt: "8",
});

export const row = css({
  alignItems: "end",
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
});

export const subheading = css({
  margin: "0",
  textStyle: "std-20B-150",
});

export const hint = css({
  color: "fg.sub",
  margin: "0",
  textStyle: "std-14N-170",
});

export const alert = css({
  borderColor: "error",
  borderRadius: "12",
  borderWidth: "3px",
  color: "error",
  margin: "0",
  px: "4",
  py: "3",
  textStyle: "std-16B-170",
});

export const items = css({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  listStyle: "none",
  margin: "0",
  padding: "0",
});

// リストの行。線で区切らず、1 行おきに背景を変えて見分ける。
// 名前は折り返さず省略し（Truncate）、操作は右に寄せる。幅が足りないときは操作を次の行へ送る。
export const listItem = css({
  alignItems: "center",
  columnGap: "4",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  px: "3",
  py: "2",
  rowGap: "2",
  "&:nth-child(odd)": { background: "bg.subtle" },
});

export const itemLabel = css({
  alignItems: "center",
  display: "flex",
  flex: "1 1 8rem",
  minWidth: "8rem",
});

export const itemActions = css({
  alignItems: "center",
  display: "flex",
  flexShrink: "0",
  gap: "2",
  ml: "auto",
  whiteSpace: "nowrap",
});

// 基本情報のように行を細い線で区切る。行ごとに profileGrid を入れる。
export const profileRows = css({
  display: "grid",
  gap: "4",
  gridTemplateColumns: "minmax(0, 1fr)",
  "& > * + *": { borderColor: "border.divider", borderTopWidth: "1px", pt: "4" },
});

// 各欄は見出し・入力・注釈の 3 段を subgrid で共有する。見出しが折り返しても、
// 同じ行の見出しは上端、入力欄は同じ高さにそろう。
export const profileGrid = css({
  columnGap: "3",
  display: "grid",
  gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
  rowGap: "4",
  "& > *": {
    alignContent: "start",
    gridRow: "span 3",
    gridTemplateRows: "subgrid",
    rowGap: "2",
  },
  "& > * > :first-child": {
    alignSelf: "start",
  },
});

// 24 列に細かく分け、欄ごとに幅を割り当てる。
const spans = {
  6: css({ gridColumn: "span 6" }),
  7: css({ gridColumn: "span 7" }),
  8: css({ gridColumn: "span 8" }),
  11: css({ gridColumn: "span 11" }),
  12: css({ gridColumn: "span 12" }),
  24: css({ gridColumn: "span 24" }),
} as const;

export function span(size: keyof typeof spans): string {
  return spans[size];
}
