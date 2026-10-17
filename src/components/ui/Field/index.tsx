import { Field as ArkField } from "@ark-ui/react/field";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

const root = css({
  display: "grid",
  gap: "1.5",
});

const label = css({
  fontSize: "sm",
  fontWeight: "semibold",
});

export function Field({ label: text, children }: { label: string; children: ReactNode }) {
  return (
    <ArkField.Root className={root}>
      <ArkField.Label className={label}>{text}</ArkField.Label>
      {children}
    </ArkField.Root>
  );
}
