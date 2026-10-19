import { css } from "styled-system/css";

// プレビューの各部品で共通に使う見た目。

// 用紙は印刷物なので、画面の文字の大きさの規則（14px 以上）ではなく pt で組む。
// 色はアクセントの濃紺 1 色とその淡色だけにし、白黒印刷でも濃淡で見分けられるようにする。
// 文字は 7pt より小さくしない。
// css() は静的に解析されるので、値は文字列の定数にして直接参照する。
export const ACCENT = "#1f3a5f";
export const ACCENT_SOFT = "#eef3f8";
export const ACCENT_MID = "#7b9cc0";
export const TEXT = "#1f2328";
export const SUB = "#57606a";
export const PANEL = "#fafbfc";
export const EMPHASIS = "#f3f7fb";

export const accentRule = "0.75pt solid #1f3a5f";

// 大見出し（基本情報・保有技術・職務経歴サマリーなど）。下にアクセント色の線を引く。
export const sectionTitle = css({
  alignItems: "baseline",
  borderBottom: accentRule,
  color: ACCENT,
  display: "flex",
  flexWrap: "wrap",
  fontSize: "10.5pt",
  fontWeight: "bold",
  gap: "0 2mm",
  lineHeight: "1.3",
  margin: "0",
  mb: "2mm",
  pb: "0.6mm",
});

// 見出しの横に添える注釈。
export const sectionNote = css({
  color: SUB,
  fontSize: "7pt",
  fontWeight: "normal",
});

// ブロックの下の余白。
export const part = css({
  mb: "5mm",
});

export const prose = css({
  margin: "0",
  whiteSpace: "pre-wrap",
});

// 本文の中の小見出し（担当業務・成果など）。
export const itemLabel = css({
  color: ACCENT,
  display: "block",
  fontSize: "7.2pt",
  fontWeight: "bold",
  mb: "0.3mm",
});

export const plainList = css({
  listStyle: "none",
  margin: "0",
  p: "0",
});
