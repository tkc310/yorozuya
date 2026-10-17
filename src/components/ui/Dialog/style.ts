import { defineSlotRecipe } from "@pandacss/dev";

export const dialog = defineSlotRecipe({
  className: "dialog",
  slots: ["backdrop", "positioner", "content", "header", "title", "body", "footer"],
  base: {
    backdrop: {
      background: "rgba(0, 0, 0, 0.5)",
      inset: "0",
      position: "fixed",
      zIndex: "100",
    },
    positioner: {
      alignItems: "center",
      display: "flex",
      inset: "0",
      justifyContent: "center",
      p: "4",
      position: "fixed",
      zIndex: "101",
    },
    content: {
      background: "bg.canvas",
      borderRadius: "16",
      boxShadow: "8",
      color: "fg",
      display: "grid",
      gridTemplateRows: "auto minmax(0, 1fr) auto",
      maxHeight: "calc(100vh - 2rem)",
      maxWidth: "44rem",
      width: "100%",
      "@media (forced-colors: active)": {
        borderColor: "CanvasText",
        borderStyle: "solid",
        borderWidth: "1px",
      },
    },
    header: {
      alignItems: "center",
      borderBottomWidth: "1px",
      borderColor: "border.divider",
      display: "flex",
      gap: "4",
      justifyContent: "space-between",
      px: "6",
      py: "4",
    },
    title: {
      margin: "0",
      textStyle: "std-20B-150",
    },
    body: {
      display: "grid",
      gap: "6",
      overflowY: "auto",
      px: "6",
      py: "6",
    },
    footer: {
      borderColor: "border.divider",
      borderTopWidth: "1px",
      display: "flex",
      gap: "4",
      justifyContent: "flex-end",
      px: "6",
      py: "4",
    },
  },
  defaultVariants: {
    placement: "center",
  },
  variants: {
    placement: {
      center: {},
      // 左側（フォームの列）にせり出す。右のプレビューは隠さない。
      side: {
        backdrop: {
          display: "none",
        },
        positioner: {
          alignItems: "stretch",
          inset: "0 auto 0 0",
          justifyContent: "flex-start",
          p: "0",
          width: { base: "100vw", md: "50vw" },
        },
        content: {
          animation: "slideInLeft 0.2s ease-out",
          borderRadius: "0",
          borderRightColor: "border",
          borderRightStyle: "solid",
          borderRightWidth: "1px",
          height: "100%",
          maxHeight: "none",
          maxWidth: "none",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
      },
    },
  },
});
