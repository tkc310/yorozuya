import { css } from "styled-system/css";

// フォームの各部品で共通に使う見た目。

export const section = css({
  borderTopWidth: "1px",
  borderColor: "border.divider",
  display: "grid",
  gap: "6",
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
  listStyle: "none",
  margin: "0",
  padding: "0",
});

export const listItem = css({
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  flexWrap: "wrap",
  gap: "4",
  justifyContent: "space-between",
  py: "2",
});

export const itemLabel = css({
  minWidth: "0",
  overflowWrap: "anywhere",
});

export const itemActions = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
  whiteSpace: "nowrap",
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
