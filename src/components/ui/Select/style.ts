import { defineRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const select = defineRecipe({
  className: "select",
  base: {
    appearance: "none",
    background:
      "token(colors.bg.canvas) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' fill='none' stroke='%23333' stroke-width='2'/%3E%3C/svg%3E\") no-repeat right 12px center",
    borderColor: "border.field",
    borderRadius: "8",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "fg",
    cursor: "pointer",
    fontFamily: "sans",
    pl: "4",
    pr: "8",
    textStyle: "std-16N-170",
    width: "100%",
    "@media (hover: hover)": {
      "&:hover:not(:disabled)": {
        borderColor: "black",
      },
    },
    "&:focus-visible": focusRing,
    _disabled: {
      background: "bg.subtle",
      borderColor: "solidGray.300",
      color: "fg.disabled",
      cursor: "not-allowed",
    },
  },
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      sm: { height: "40px" },
      md: { height: "48px" },
      lg: { height: "56px" },
    },
  },
});
