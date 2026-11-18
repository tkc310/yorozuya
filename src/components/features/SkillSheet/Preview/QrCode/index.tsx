import { useMemo } from "react";
import { css } from "styled-system/css";
import { qrMatrixOf } from "./qr-code.service";

// 印刷・PDF でもリンクを開けるよう、URL の横に添える QR コード。
// スマートフォンで読める大きさとして 1 辺 16mm にする。

const svg = css({
  display: "block",
  flexShrink: "0",
  height: "16mm",
  width: "16mm",
});

export function QrCode({ url, label }: { url: string; label: string }) {
  const matrix = useMemo(() => qrMatrixOf(url), [url]);
  if (!matrix) {
    return null;
  }
  return (
    <svg
      className={svg}
      viewBox={`0 0 ${matrix.size} ${matrix.size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${label}の QR コード`}
    >
      <rect width={matrix.size} height={matrix.size} fill="#ffffff" />
      <path d={matrix.path} fill="#000000" />
    </svg>
  );
}
