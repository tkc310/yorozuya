import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { css } from "styled-system/css";
import logo from "@/src/assets/images/logo.svg";
import { focusRing } from "@/src/styles/foundation";

// md 以上では画面の高さに固定し、スクロールは main の中に任せる。
const page = css({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  height: { md: "100dvh" },
  minHeight: "100dvh",
  _print: { display: "block", height: "auto", minHeight: "0" },
});

const header = css({
  alignItems: "center",
  background: "bg.canvas",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  px: { base: "4", md: "8" },
  _print: { display: "none" },
});

const logoLink = css({
  borderRadius: "4",
  display: "block",
  my: "2",
  "&:focus-visible": focusRing,
});

const logoImage = css({
  display: "block",
  height: { base: "32px", md: "40px" },
  width: "auto",
});

const content = css({
  minHeight: "0",
  overflowY: { md: "auto" },
  _print: { overflow: "visible" },
});

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={page}>
      <header className={header}>
        <Link to="/" className={logoLink} aria-label="よろずや トップへ">
          <img src={logo} alt="よろずや" width={1083} height={256} className={logoImage} />
        </Link>
      </header>
      <main className={content}>{children}</main>
    </div>
  );
}
