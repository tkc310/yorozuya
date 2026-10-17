import type { ComponentProps } from "react";
import { toggle } from "styled-system/recipes";

export function Switch({
  label,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string }) {
  const classes = toggle();
  return (
    <label className={classes.root}>
      <input type="checkbox" role="switch" className={classes.control} {...props} />
      <span className={classes.label}>{label}</span>
    </label>
  );
}
