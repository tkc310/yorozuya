import { css } from "styled-system/css";
import { RUNNING_HEADER_HEIGHT_MM } from "../pagination";
import { SUB } from "../styles";

// 2 ページ目以降の上端。ページが分かれても誰のシートか分かるようにする。
const root = css({
  alignItems: "flex-end",
  borderBottom: "0.5pt solid #d0d7de",
  boxSizing: "border-box",
  color: SUB,
  display: "flex",
  flexShrink: "0",
  fontSize: "7.5pt",
  justifyContent: "space-between",
  pb: "1mm",
});

const spacer = css({
  flexShrink: "0",
});

export function RunningHeader({ name, updated }: { name: string; updated: string }) {
  return (
    <>
      <div className={root} aria-hidden="true" style={{ height: `${RUNNING_HEADER_HEIGHT_MM - 3}mm` }}>
        <span>スキルシート｜{name}</span>
        <span>更新日 {updated}</span>
      </div>
      <div className={spacer} style={{ height: "3mm" }} />
    </>
  );
}
