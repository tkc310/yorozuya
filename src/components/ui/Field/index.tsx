import { Field as ArkField } from "@ark-ui/react/field";
import type { ReactNode } from "react";
import { css } from "styled-system/css";

const root = css({
  display: "grid",
  flex: "1",
  gap: "2",
  minWidth: "0",
});

// 補助の操作（スイッチなど）は見出しの下に並べ、欄の幅に関係なく形をそろえる。
const header = css({
  display: "grid",
  gap: "1",
  justifyItems: "start",
});

const label = css({
  color: "fg",
  textStyle: "std-16B-170",
});

const requiredMark = css({
  color: "solidGray.600",
  ml: "2",
  textStyle: "std-14N-170",
});

const helper = css({
  color: "fg.sub",
  textStyle: "std-14N-170",
});

const errorText = css({
  color: "error",
  textStyle: "std-14N-170",
  fontWeight: "bold",
});

export function Field({
  label: text,
  aside,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string;
  // ラベルの横に置く補助の操作。
  aside?: ReactNode;
  // 入力欄の下に出す注釈。
  hint?: ReactNode;
  // 入力欄の下に出すエラー。あれば入力欄もエラーの見た目にする。
  error?: string | null;
  // 真ならラベルの横に「(必須)」を出す。
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const labelNode = (
    <ArkField.Label className={label}>
      {text}
      {required ? (
        <span className={requiredMark} aria-hidden="true">
          (必須)
        </span>
      ) : null}
    </ArkField.Label>
  );
  return (
    <ArkField.Root
      className={className ? `${root} ${className}` : root}
      invalid={Boolean(error)}
      required={required}
    >
      {aside ? (
        <div className={header}>
          {labelNode}
          {aside}
        </div>
      ) : (
        labelNode
      )}
      {children}
      {hint ? <ArkField.HelperText className={helper}>{hint}</ArkField.HelperText> : null}
      <ArkField.ErrorText className={errorText}>{error}</ArkField.ErrorText>
    </ArkField.Root>
  );
}
