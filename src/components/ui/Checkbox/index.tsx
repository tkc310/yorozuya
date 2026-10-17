import type { ComponentProps, ReactNode } from "react";
import { checkbox } from "styled-system/recipes";

export function Checkbox({
  children,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { children: ReactNode }) {
  const classes = checkbox();
  return (
    <label className={classes.root}>
      <input type="checkbox" className={classes.control} {...props} />
      {children}
    </label>
  );
}
