import { defineSlotRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

// 小さなオンオフ切り替え。項目名の横に置く。
export const toggle = defineSlotRecipe({
  className: "toggle",
  slots: ["root", "control", "label"],
  base: {
    root: {
      alignItems: "center",
      cursor: "pointer",
      display: "inline-flex",
      gap: "1",
      minHeight: "24px",
      position: "relative",
      "&:has(input:disabled)": {
        cursor: "not-allowed",
      },
    },
    control: {
      appearance: "none",
      background: "solidGray.420",
      borderRadius: "full",
      cursor: "pointer",
      flexShrink: "0",
      height: "20px",
      margin: "0",
      position: "relative",
      transition: "background 0.15s",
      width: "36px",
      _before: {
        background: "white",
        borderRadius: "full",
        content: '""',
        height: "16px",
        left: "2px",
        position: "absolute",
        top: "2px",
        transition: "transform 0.15s",
        width: "16px",
      },
      _checked: {
        background: "key",
        _before: {
          transform: "translateX(16px)",
        },
      },
      "&:focus-visible": focusRing,
      _disabled: {
        background: "solidGray.200",
        cursor: "not-allowed",
      },
      "@media (prefers-reduced-motion: reduce)": {
        transition: "none",
        _before: { transition: "none" },
      },
      "@media (forced-colors: active)": {
        borderColor: "CanvasText",
        borderStyle: "solid",
        borderWidth: "1px",
      },
    },
    label: {
      color: "fg.sub",
      textStyle: "oln-14N-100",
      "input:disabled + &": {
        color: "fg.disabled",
      },
    },
  },
});
