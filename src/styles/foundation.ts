import { defineSemanticTokens, defineTextStyles, defineTokens } from "@pandacss/dev";

// デジタル庁デザインシステム（DADS）の foundation。
// 値は @digital-go-jp/design-tokens v2.0.1（MIT）に合わせる。

function scale(values: Record<string, string>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]));
}

function rem(px: number): string {
  return `${px / 16}rem`;
}

export const tokens = defineTokens({
  colors: {
    white: { value: "#ffffff" },
    black: { value: "#000000" },
    blue: scale({
      50: "#e8f1fe",
      100: "#d9e6ff",
      200: "#c5d7fb",
      300: "#9db7f9",
      400: "#7096f8",
      500: "#4979f5",
      600: "#3460fb",
      700: "#264af4",
      800: "#0031d8",
      900: "#0017c1",
      1000: "#00118f",
      1100: "#000071",
      1200: "#000060",
    }),
    green: scale({
      50: "#e6f5ec",
      100: "#c2e5d1",
      200: "#9bd4b5",
      300: "#71c598",
      400: "#51b883",
      500: "#2cac6e",
      600: "#259d63",
      700: "#1d8b56",
      800: "#197a4b",
      900: "#115a36",
      1000: "#0c472a",
      1100: "#08351f",
      1200: "#032213",
    }),
    yellow: scale({
      50: "#fbf5e0",
      100: "#fff0b3",
      200: "#ffe380",
      300: "#ffd43d",
      400: "#ffc700",
      500: "#ebb700",
      600: "#d2a400",
      700: "#b78f00",
      800: "#a58000",
      900: "#927200",
      1000: "#806300",
      1100: "#6e5600",
      1200: "#604b00",
    }),
    orange: scale({
      50: "#ffeee2",
      100: "#ffdfca",
      200: "#ffc199",
      300: "#ffa66d",
      400: "#ff8d44",
      500: "#ff7628",
      600: "#fb5b01",
      700: "#e25100",
      800: "#c74700",
      900: "#ac3e00",
      1000: "#8b3200",
      1100: "#6d2700",
      1200: "#541e00",
    }),
    red: scale({
      50: "#fdeeee",
      100: "#ffdada",
      200: "#ffbbbb",
      300: "#ff9696",
      400: "#ff7171",
      500: "#ff5454",
      600: "#fe3939",
      700: "#fa0000",
      800: "#ec0000",
      900: "#ce0000",
      1000: "#a90000",
      1100: "#850000",
      1200: "#620000",
    }),
    magenta: scale({
      50: "#f3e5f4",
      100: "#ffd0ff",
      200: "#ffaeff",
      300: "#ff8eff",
      400: "#f661f6",
      500: "#f137f1",
      600: "#db00db",
      700: "#c000c0",
      800: "#aa00aa",
      900: "#8b008b",
      1000: "#6c006c",
      1100: "#500050",
      1200: "#3b003b",
    }),
    solidGray: scale({
      50: "#f2f2f2",
      100: "#e6e6e6",
      200: "#cccccc",
      300: "#b3b3b3",
      400: "#999999",
      420: "#949494",
      500: "#7f7f7f",
      536: "#767676",
      600: "#666666",
      700: "#4d4d4d",
      800: "#333333",
      900: "#1a1a1a",
    }),
  },
  fonts: {
    sans: { value: "'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif" },
    mono: { value: "'Noto Sans Mono', monospace" },
  },
  // 14px 未満は使わない。
  fontSizes: scale({
    14: rem(14),
    16: rem(16),
    17: rem(17),
    18: rem(18),
    20: rem(20),
    24: rem(24),
    28: rem(28),
    32: rem(32),
    36: rem(36),
    45: rem(45),
  }),
  fontWeights: {
    normal: { value: "400" },
    bold: { value: "700" },
  },
  lineHeights: scale({
    100: "1",
    120: "1.2",
    130: "1.3",
    140: "1.4",
    150: "1.5",
    160: "1.6",
    170: "1.7",
    175: "1.75",
  }),
  // 字間は大きい文字ほど詰める。
  letterSpacings: {
    0: { value: "0" },
    1: { value: "0.01em" },
    2: { value: "0.02em" },
  },
  // 余白は 8px を基準にする。
  spacing: scale({
    0: "0",
    0.5: rem(2),
    1: rem(4),
    2: rem(8),
    3: rem(12),
    4: rem(16),
    6: rem(24),
    8: rem(32),
    16: rem(64),
  }),
  radii: {
    none: { value: "0" },
    4: { value: rem(4) },
    6: { value: rem(6) },
    8: { value: rem(8) },
    12: { value: rem(12) },
    16: { value: rem(16) },
    32: { value: rem(32) },
    full: { value: "9999px" },
  },
  shadows: scale({
    1: "0 2px 8px 1px rgba(0,0,0,0.1), 0 1px 5px 0 rgba(0,0,0,0.3)",
    2: "0 2px 12px 2px rgba(0,0,0,0.1), 0 1px 6px 0 rgba(0,0,0,0.3)",
    3: "0 4px 16px 3px rgba(0,0,0,0.1), 0 1px 6px 0 rgba(0,0,0,0.3)",
    4: "0 6px 20px 4px rgba(0,0,0,0.1), 0 2px 6px 0 rgba(0,0,0,0.3)",
    5: "0 8px 24px 5px rgba(0,0,0,0.1), 0 2px 10px 0 rgba(0,0,0,0.3)",
    6: "0 10px 30px 6px rgba(0,0,0,0.1), 0 3px 12px 0 rgba(0,0,0,0.3)",
    7: "0 12px 36px 7px rgba(0,0,0,0.1), 0 3px 14px 0 rgba(0,0,0,0.3)",
    8: "0 14px 40px 7px rgba(0,0,0,0.1), 0 3px 16px 0 rgba(0,0,0,0.3)",
  }),
});

export const semanticTokens = defineSemanticTokens({
  colors: {
    fg: {
      DEFAULT: { value: "{colors.solidGray.800}" },
      sub: { value: "{colors.solidGray.700}" },
      placeholder: { value: "{colors.solidGray.536}" },
      disabled: { value: "{colors.solidGray.420}" },
      inverse: { value: "{colors.white}" },
    },
    bg: {
      canvas: { value: "{colors.white}" },
      subtle: { value: "{colors.solidGray.50}" },
      selected: { value: "{colors.blue.100}" },
    },
    border: {
      DEFAULT: { value: "{colors.solidGray.420}" },
      field: { value: "{colors.solidGray.600}" },
      divider: { value: "{colors.solidGray.200}" },
    },
    key: {
      DEFAULT: { value: "{colors.blue.900}" },
      hover: { value: "{colors.blue.1000}" },
      active: { value: "{colors.blue.1200}" },
    },
    link: {
      DEFAULT: { value: "{colors.blue.1000}" },
      visited: { value: "{colors.magenta.900}" },
      active: { value: "{colors.orange.800}" },
    },
    focus: {
      ring: { value: "{colors.yellow.300}" },
      outline: { value: "{colors.black}" },
    },
    success: { value: "{colors.green.600}" },
    error: { value: "{colors.red.800}" },
    warning: { value: "{colors.yellow.900}" },
  },
});

// dads-u-{区分}-{大きさ}{太さ}-{行間} の命名に合わせる。
function textStyle(
  fontSize: string,
  fontWeight: string,
  lineHeight: string,
  letterSpacing: string,
) {
  return { value: { fontSize, fontWeight, lineHeight, letterSpacing } };
}

export const textStyles = defineTextStyles({
  "std-45B-140": textStyle("45", "bold", "140", "0"),
  "std-32B-150": textStyle("32", "bold", "150", "1"),
  "std-28B-150": textStyle("28", "bold", "150", "1"),
  "std-24B-150": textStyle("24", "bold", "150", "2"),
  "std-20B-150": textStyle("20", "bold", "150", "2"),
  "std-18B-160": textStyle("18", "bold", "160", "2"),
  "std-17N-170": textStyle("17", "normal", "170", "2"),
  "std-16N-170": textStyle("16", "normal", "170", "2"),
  "std-16B-170": textStyle("16", "bold", "170", "2"),
  "std-14N-170": textStyle("14", "normal", "170", "2"),
  "dns-16N-130": textStyle("16", "normal", "130", "0"),
  "oln-16N-100": textStyle("16", "normal", "100", "2"),
  "oln-16B-100": textStyle("16", "bold", "100", "2"),
  "oln-14N-100": textStyle("14", "normal", "100", "2"),
  "mono-16N-150": { value: { fontFamily: "mono", fontSize: "16", lineHeight: "150" } },
});

// ブレークポイントは 768px の 1 点だけ。
export const breakpoints = {
  md: "48rem",
};

// フォーカスはボタンと入力で共通。4px の黒枠と黄色のリング。
export const focusRing = {
  outlineColor: "focus.outline",
  outlineOffset: "2px",
  outlineStyle: "solid",
  outlineWidth: "4px",
  boxShadow: "0 0 0 2px token(colors.focus.ring)",
} as const;
