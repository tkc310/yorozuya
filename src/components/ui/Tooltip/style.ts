import { defineSlotRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const tooltip = defineSlotRecipe({
  className: "tooltip",
  slots: ["trigger", "content"],
  base: {
    trigger: {
      alignItems: "center",
      background: "bg.canvas",
      borderColor: "fg.sub",
      borderRadius: "full",
      borderWidth: "1px",
      color: "fg.sub",
      cursor: "help",
      display: "inline-flex",
      flexShrink: "0",
      fontWeight: "bold",
      height: "18px",
      justifyContent: "center",
      lineHeight: "1",
      position: "relative",
      textStyle: "oln-14N-100",
      fontSize: "12px",
      verticalAlign: "middle",
      width: "18px",
      // 見た目は小さくても、押せる範囲は広く取る。
      _after: {
        content: '""',
        inset: "-8px",
        position: "absolute",
      },
      "@media (hover: hover)": {
        "&:hover": { borderColor: "key", color: "key" },
      },
      "&[data-state=open]": { background: "blue.50", borderColor: "key", color: "key" },
      "&:focus-visible": focusRing,
    },
    content: {
      background: "solidGray.800",
      borderRadius: "8",
      boxShadow: "2",
      color: "fg.inverse",
      fontWeight: "normal",
      maxWidth: "20rem",
      px: "3",
      py: "2",
      textAlign: "left",
      textStyle: "std-14N-170",
      whiteSpace: "normal",
      zIndex: "200",
      "@media (forced-colors: active)": {
        borderColor: "CanvasText",
        borderStyle: "solid",
        borderWidth: "1px",
      },
    },
  },
});
