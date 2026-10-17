import { defineConfig } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";
import pandaPreset from "@pandacss/preset-panda";
import { button } from "./src/theme/recipes/button";
import { input } from "./src/theme/recipes/input";
import { textarea } from "./src/theme/recipes/textarea";

export default defineConfig({
  presets: [basePreset, pandaPreset],
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
  theme: {
    extend: {
      recipes: {
        button,
        input,
        textarea,
      },
    },
  },
  globalCss: {
    "html, body": {
      background: "#f3efe6",
      color: "#1f1a17",
      fontFamily: "ui-sans-serif, 'Hiragino Sans', 'Noto Sans JP', sans-serif",
      margin: "0",
    },
  },
});
