import { defineSlotRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const checkbox = defineSlotRecipe({
  className: "checkbox",
  slots: ["root", "control"],
  base: {
    root: {
      alignItems: "center",
      cursor: "pointer",
      display: "inline-flex",
      gap: "2",
      minHeight: "44px",
      textStyle: "std-16B-170",
    },
    control: {
      accentColor: "token(colors.key)",
      cursor: "pointer",
      flexShrink: "0",
      height: "24px",
      margin: "0",
      width: "24px",
      "&:focus-visible": focusRing,
      _disabled: {
        cursor: "not-allowed",
      },
    },
  },
});
