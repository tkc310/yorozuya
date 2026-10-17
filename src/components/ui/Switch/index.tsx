import type { ComponentProps } from "react";
import { toggle } from "styled-system/recipes";

export type SwitchProps = Omit<
  ComponentProps<"button">,
  "type" | "role" | "children" | "onChange" | "aria-checked"
> & {
  // 画面に出すラベル。スイッチは必ずラベルと組にする。
  label: string;
  size?: "md" | "sm";
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// デジタル庁デザインシステムの SwitchOnOff。<button role="switch"> を aria-checked で切り替える。
export function Switch({
  label,
  size = "md",
  checked,
  onCheckedChange,
  onClick,
  ...props
}: SwitchProps) {
  const classes = toggle({ size });
  return (
    <label className={classes.root}>
      <button
        {...props}
        type="button"
        role="switch"
        aria-checked={checked}
        className={classes.control}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            onCheckedChange(!checked);
          }
        }}
      >
        <span className={classes.track} aria-hidden="true">
          <span className={classes.thumb}>
            <svg className={classes.icon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="m10.4 16.3-4.1-4.1 1.2-1.3 2.9 2.9 6-6.1 1.3 1.2z" fill="currentcolor" />
            </svg>
          </span>
        </span>
      </button>
      <span className={classes.label}>{label}</span>
    </label>
  );
}
