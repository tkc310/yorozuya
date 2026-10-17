import { defineRecipe } from "@pandacss/dev";
import { focusRing } from "../../../styles/foundation";

export const button = defineRecipe({
  className: "button",
  base: {
    alignItems: "center",
    appearance: "none",
    borderStyle: "solid",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: "0",
    fontFamily: "sans",
    gap: "2",
    justifyContent: "center",
    position: "relative",
    textStyle: "oln-16B-100",
    textDecoration: "none",
    "&:focus-visible": focusRing,
    _disabled: {
      cursor: "not-allowed",
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
  variants: {
    variant: {
      solid: {
        background: "key",
        borderColor: "transparent",
        borderWidth: "4px",
        borderStyle: "double",
        color: "fg.inverse",
        "@media (hover: hover)": {
          "&:hover:not(:disabled)": {
            background: "key.hover",
            textDecoration: "underline",
          },
        },
        "&:active:not(:disabled)": {
          background: "key.active",
        },
        _disabled: {
          background: "solidGray.300",
          color: "solidGray.50",
        },
      },
      outline: {
        background: "bg.canvas",
        borderColor: "currentColor",
        borderWidth: "1px",
        color: "key",
        "@media (hover: hover)": {
          "&:hover:not(:disabled)": {
            background: "blue.200",
            color: "key.hover",
            textDecoration: "underline",
          },
        },
        "&:active:not(:disabled)": {
          background: "blue.300",
          color: "key.active",
        },
        _disabled: {
          background: "bg.canvas",
          color: "solidGray.300",
        },
      },
      text: {
        background: "transparent",
        borderColor: "transparent",
        borderWidth: "0",
        color: "key",
        textDecoration: "underline",
        "@media (hover: hover)": {
          "&:hover:not(:disabled)": {
            background: "blue.50",
            color: "key.hover",
            textDecorationThickness: "3px",
          },
        },
        "&:active:not(:disabled)": {
          background: "blue.100",
          color: "key.active",
        },
        "&:focus-visible": {
          background: "focus.ring",
        },
        _disabled: {
          color: "solidGray.300",
        },
      },
    },
    size: {
      lg: {
        borderRadius: "8",
        minHeight: "56px",
        minWidth: "136px",
        px: "4",
        py: "3",
      },
      md: {
        borderRadius: "8",
        minHeight: "48px",
        minWidth: "96px",
        px: "4",
        py: "2",
      },
      // 小さいボタンも 44px の押せる範囲を持たせる。
      sm: {
        borderRadius: "6",
        minHeight: "36px",
        minWidth: "80px",
        px: "3",
        py: "0.5",
        _after: {
          content: '""',
          height: "44px",
          left: "0",
          position: "absolute",
          right: "0",
          top: "50%",
          transform: "translateY(-50%)",
        },
      },
      xs: {
        borderRadius: "4",
        minHeight: "28px",
        minWidth: "72px",
        px: "2",
        py: "0.5",
        textStyle: "oln-14N-100",
        fontWeight: "bold",
        _after: {
          content: '""',
          height: "44px",
          left: "0",
          position: "absolute",
          right: "0",
          top: "50%",
          transform: "translateY(-50%)",
        },
      },
    },
  },
});
