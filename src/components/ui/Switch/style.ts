import { defineSlotRecipe } from "@pandacss/dev";

// デジタル庁デザインシステムのオン／オフスイッチ（SwitchOnOff）に合わせる。
// 幅 56px・高さ 36px のトラックに 24px のつまみ。オンでは青にしてチェックを出す。
export const toggle = defineSlotRecipe({
  className: "toggle",
  slots: ["root", "control", "track", "thumb", "icon", "label"],
  base: {
    root: {
      alignItems: "center",
      color: "fg",
      cursor: "pointer",
      display: "inline-flex",
      gap: "8px",
      width: "fit-content",
      "&:has(:disabled)": { cursor: "not-allowed" },
    },
    control: {
      appearance: "none",
      background: "transparent",
      border: "none",
      cursor: "inherit",
      flexShrink: "0",
      padding: "0",
      position: "relative",
      userSelect: "none",
      WebkitTapHighlightColor: "transparent",
      // 押せる範囲を上下に 4px 広げ、44px を確保する。
      _before: {
        content: '""',
        inset: "-4px 0",
        position: "absolute",
      },
      "&:focus-visible": {
        borderRadius: "full",
        boxShadow: "0 0 0 2px token(colors.yellow.300)",
        outline: "4px solid black",
        outlineOffset: "2px",
      },
    },
    track: {
      background: "white",
      borderColor: "solidGray.600",
      borderRadius: "full",
      borderStyle: "solid",
      borderWidth: "2px",
      display: "block",
      padding: "4px",
      position: "relative",
      width: "56px",
      "[aria-checked=true] > &": {
        background: "blue.50",
        borderColor: "blue.900",
      },
      "@media (hover: hover)": {
        "[role=switch]:hover > &": {
          borderColor: "black",
          boxShadow: "0 0 0 4px token(colors.solidGray.420)",
        },
        "[role=switch][aria-checked=true]:hover > &": {
          borderColor: "blue.1100",
        },
      },
      "[role=switch]:active > &": {
        boxShadow: "0 0 0 6px token(colors.solidGray.600)",
      },
      "[role=switch]:disabled > &": {
        background: "solidGray.50",
        borderColor: "solidGray.300",
        boxShadow: "none",
      },
      "@media (forced-colors: active)": {
        borderColor: "ButtonText",
        "[aria-checked=true] > &": { borderColor: "Highlight" },
        "[role=switch]:disabled > &": { borderColor: "GrayText" },
      },
    },
    thumb: {
      background: "solidGray.800",
      borderRadius: "full",
      display: "block",
      height: "24px",
      width: "24px",
      "[aria-checked=true] > * > &": {
        background: "blue.900",
        marginLeft: "auto",
      },
      "@media (hover: hover)": {
        "[role=switch]:hover > * > &": { background: "black" },
        "[role=switch][aria-checked=true]:hover > * > &": { background: "blue.1100" },
      },
      "[role=switch]:disabled > * > &": { background: "solidGray.300" },
      "@media (forced-colors: active)": {
        background: "ButtonText",
        "[aria-checked=true] > * > &": { background: "Highlight" },
        "[role=switch]:disabled > * > &": { background: "GrayText" },
      },
    },
    icon: {
      color: "white",
      display: "none",
      flexShrink: "0",
      height: "24px",
      width: "24px",
      "[aria-checked=true] > * > * > &": { display: "block" },
      "@media (forced-colors: active)": { color: "Canvas" },
    },
    label: {
      textStyle: "std-16N-170",
      "[role=switch]:disabled + &": { color: "fg.disabled" },
    },
  },
});
