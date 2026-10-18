import { css, cx } from "styled-system/css";

const root = css({
  alignItems: "center",
  color: "fg.sub",
  display: "inline-flex",
  gap: "2",
  textStyle: "std-14N-170",
});

// 待ち時間が短いときにちらつかないよう、少し遅れて出す。
const delayed = css({
  animation: "fadeIn 0.2s ease-out 0.3s both",
});

const ring = css({
  animation: "spin 0.8s linear infinite",
  borderColor: "currentColor",
  borderRadius: "full",
  borderRightColor: "transparent",
  borderStyle: "solid",
  borderWidth: "2px",
  display: "inline-block",
  flexShrink: "0",
  "@media (prefers-reduced-motion: reduce)": {
    animationDuration: "2.4s",
  },
});

const sizes = {
  sm: css({ height: "16px", width: "16px" }),
  md: css({ height: "24px", width: "24px" }),
} as const;

// 読み込みや保存の最中であることを、読み上げにも伝える。
// children を渡せば横に文言を出し、渡さなければ label を読み上げにだけ使う。
export function Spinner({
  label,
  children,
  size = "md",
  delay = false,
  className,
}: {
  label: string;
  children?: string;
  size?: keyof typeof sizes;
  delay?: boolean;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label={children ? undefined : label}
      className={cx(root, delay && delayed, className)}
    >
      <span aria-hidden="true" className={cx(ring, sizes[size])} />
      {children}
    </span>
  );
}
