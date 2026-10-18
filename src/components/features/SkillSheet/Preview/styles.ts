import { css } from "styled-system/css";

// プレビューの各部品で共通に使う見た目。

// 用紙は印刷物なので、画面の文字の大きさの規則（14px 以上）ではなく pt で組む。
// 罫線で囲む表組みは一覧だけにし、ほかは見出し・余白・細い線で区切って読みやすくする。
export const hairline = "0.5pt solid #b3b3b3";
export const rule = "0.75pt solid black";

// 大分類（基本情報・職務経歴の一覧・職務経歴の詳細）の見出し。左寄せで、左に縦線を付ける。
export const sectionTitle = css({
  borderLeft: "1.2mm solid black",
  fontSize: "11pt",
  fontWeight: "bold",
  lineHeight: "1.3",
  margin: "0",
  mb: "3mm",
  pl: "2mm",
});

// 小見出し（保有技術・自己紹介など）。
export const subTitle = css({
  borderBottom: hairline,
  color: "black",
  fontSize: "9pt",
  fontWeight: "bold",
  margin: "0",
  mb: "1.5mm",
  pb: "0.5mm",
});

export const part = css({
  mb: "6mm",
});

export const prose = css({
  margin: "0",
  whiteSpace: "pre-wrap",
});

export const itemLabel = css({
  color: "#4d4d4d",
  display: "block",
  fontSize: "7.5pt",
  fontWeight: "bold",
  mb: "0.5mm",
});

export const tags = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "1mm",
  listStyle: "none",
  margin: "0",
  p: "0",
});

export const tag = css({
  border: hairline,
  borderRadius: "1mm",
  fontSize: "7.5pt",
  lineHeight: "1.3",
  px: "1.2mm",
  py: "0.3mm",
});
