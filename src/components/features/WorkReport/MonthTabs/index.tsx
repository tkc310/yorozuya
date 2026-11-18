import { Tabs } from "@ark-ui/react/tabs";
import type { ReactNode } from "react";
import { css } from "styled-system/css";
import { button } from "styled-system/recipes";
import { focusRing } from "@/src/styles/foundation";

const bar = css({
  alignItems: "end",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
});

const year = css({
  alignItems: "center",
  display: "flex",
  gap: "1",
  pb: "1",
});

const yearText = css({
  fontVariantNumeric: "tabular-nums",
  minWidth: "5rem",
  textAlign: "center",
  textStyle: "std-16B-170",
});

const list = css({
  display: "flex",
  gap: "1",
  overflowX: "auto",
});

const trigger = css({
  borderBottomWidth: "3px",
  borderColor: "transparent",
  color: "fg.sub",
  cursor: "pointer",
  px: "3",
  py: "2",
  textStyle: "std-16N-170",
  whiteSpace: "nowrap",
  "&[data-selected]": { borderColor: "key", color: "key", fontWeight: "bold" },
  "&:hover": { color: "fg" },
  "&:focus-visible": focusRing,
});

const current = css({
  textDecoration: "underline",
  textUnderlineOffset: "4px",
});

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

export function MonthTabs({
  year: shownYear,
  month,
  thisYear,
  thisMonth,
  onChange,
  children,
}: {
  year: number;
  month: number;
  thisYear: number;
  thisMonth: number;
  onChange: (year: number, month: number) => void;
  children: ReactNode;
}) {
  return (
    <Tabs.Root
      value={String(month)}
      onValueChange={(details) => onChange(shownYear, Number(details.value))}
      lazyMount
      unmountOnExit
    >
      <div className={bar}>
        <div className={year}>
          <button
            type="button"
            className={button({ variant: "text", size: "xs" })}
            aria-label="前の年"
            onClick={() => onChange(shownYear - 1, month)}
          >
            ◀
          </button>
          <span className={yearText} aria-live="polite">
            {shownYear}年
          </span>
          <button
            type="button"
            className={button({ variant: "text", size: "xs" })}
            aria-label="次の年"
            onClick={() => onChange(shownYear + 1, month)}
          >
            ▶
          </button>
        </div>
        <Tabs.List className={list} aria-label={`${shownYear}年の月`}>
          {MONTHS.map((value) => (
            <Tabs.Trigger key={value} value={String(value)} className={trigger}>
              <span className={shownYear === thisYear && value === thisMonth ? current : undefined}>
                {value}月
              </span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>
      <Tabs.Content value={String(month)}>{children}</Tabs.Content>
    </Tabs.Root>
  );
}
