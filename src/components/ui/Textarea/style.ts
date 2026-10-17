import { defineRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const textarea = defineRecipe({
  className: "textarea",
  base: {
    background: "bg.canvas",
    borderColor: "border.field",
    borderRadius: "8",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "fg",
    fontFamily: "sans",
    height: "4.5rem",
    minHeight: "4.5rem",
    px: "4",
    py: "3",
    resize: "vertical",
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
});
