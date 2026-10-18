import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { focusRing } from "@/src/styles/foundation";

const list = css({
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  listStyle: "none",
  margin: "0",
  p: "0",
  textStyle: "std-14N-170",
});

const item = css({
  alignItems: "center",
  display: "flex",
  "&:not(:last-child)::after": {
    color: "fg.sub",
    content: '"/"',
    mx: "2",
  },
  "& a": {
    color: "link",
    textDecoration: "underline",
    "@media (hover: hover)": {
      "&:hover": { textDecorationThickness: "3px" },
    },
    "&:active": { color: "link.active" },
    "&:focus-visible": { ...focusRing, background: "focus.ring" },
  },
  "& [aria-current='page']": {
    color: "fg",
  },
});

// 中身のリンクは呼び出し側が渡す。ルーターに依存しないため、ここではリンクを作らない。
export function Breadcrumb({ children }: { children: ReactNode }) {
  return (
    <nav aria-label="パンくずリスト">
      <ol className={list}>{children}</ol>
    </nav>
  );
}

export function BreadcrumbItem({ children }: { children: ReactNode }) {
  return <li className={item}>{children}</li>;
}

export function BreadcrumbCurrent({ children }: { children: ReactNode }) {
  return (
    <li className={item}>
      <span aria-current="page">{children}</span>
    </li>
  );
}
