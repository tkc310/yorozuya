import { defineRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const input = defineRecipe({
  className: "input",
  base: {
    background: "bg.canvas",
    borderColor: "border.field",
    borderRadius: "8",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "fg",
    fontFamily: "sans",
    px: "4",
    textStyle: "std-16N-170",
    width: "100%",
    "@media (hover: hover)": {
      "&:hover:not(:disabled, :read-only)": {
        borderColor: "black",
      },
    },
    "&:focus-visible": focusRing,
    _placeholder: {
      color: "fg.placeholder",
    },
    _readOnly: {
      borderStyle: "dashed",
    },
    // ブラウザの :invalid（空の必須欄など）では赤くせず、検証したエラーだけを見せる。
    "&[aria-invalid=true]": {
      borderColor: "error",
    },
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
      // 狭い欄でも入力例が収まるよう、左右の余白を少し詰める。
      sm: { height: "40px", px: "3" },
      md: { height: "48px" },
      lg: { height: "56px" },
    },
  },
});
