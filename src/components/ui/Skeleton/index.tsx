import type { CSSProperties } from "react";
import { css, cx } from "styled-system/css";

const block = css({
  animation: "shimmer 1.6s ease-in-out infinite",
  backgroundImage:
    "linear-gradient(90deg, token(colors.solidGray.100) 25%, token(colors.solidGray.50) 50%, token(colors.solidGray.100) 75%)",
  backgroundSize: "200% 100%",
  borderRadius: "4",
  display: "block",
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
});

// 中身の形だけを先に見せる灰色の箱。読み上げには出さないので、待っていることは呼び出し側で伝える。
export function Skeleton({
  width = "100%",
  height = "1em",
  radius,
  className,
}: {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  radius?: CSSProperties["borderRadius"];
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cx(block, className)}
      style={{ width, height, borderRadius: radius }}
    />
  );
}
