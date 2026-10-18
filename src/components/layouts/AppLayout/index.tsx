import { Link, useMatches } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { css } from "styled-system/css";
import logo from "@/src/assets/images/logo.webp";
import { focusRing } from "@/src/styles/foundation";
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
} from "@/src/components/ui/Breadcrumb/index";

// md 以上では画面の高さに固定し、スクロールは main の中に任せる。
const page = css({
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  height: { md: "100dvh" },
  minHeight: "100dvh",
  _print: { display: "block", height: "auto", minHeight: "0" },
});

const top = css({
  _print: { display: "none" },
});

const header = css({
  alignItems: "center",
  background: "bg.canvas",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  px: { base: "4", md: "8" },
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

const crumbs = css({
  background: "bg.canvas",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  px: { base: "4", md: "8" },
  py: "2",
});

const content = css({
  minHeight: "0",
  overflowY: { md: "auto" },
  _print: { overflow: "visible" },
});

// ルートの staticData.crumb を上から順に並べる。トップだけのときは出さない。
function Crumbs() {
  const matches = useMatches({
    select: (all) =>
      all.flatMap((match) =>
        match.staticData.crumb ? [{ label: match.staticData.crumb, to: match.pathname }] : [],
      ),
  });
  if (matches.length < 2) {
    return null;
  }
  const current = matches[matches.length - 1];
  return (
    <div className={crumbs}>
      <Breadcrumb>
        {matches.slice(0, -1).map((crumb) => (
          <BreadcrumbItem key={crumb.to}>
            <Link to={crumb.to}>{crumb.label}</Link>
          </BreadcrumbItem>
        ))}
        <BreadcrumbCurrent>{current.label}</BreadcrumbCurrent>
      </Breadcrumb>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className={page}>
      <div className={top}>
        <header className={header}>
          <Link to="/" className={logoLink} aria-label="よろずや トップへ">
            <img src={logo} alt="よろずや" width={1137} height={256} className={logoImage} />
          </Link>
        </header>
        <Crumbs />
      </div>
      <main className={content}>{children}</main>
    </div>
  );
}
