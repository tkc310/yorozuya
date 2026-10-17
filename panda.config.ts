import { defineConfig } from "@pandacss/dev";
import basePreset from "@pandacss/preset-base";
import { button } from "./src/components/ui/Button/style";
import { checkbox } from "./src/components/ui/Checkbox/style";
import { dialog } from "./src/components/ui/Dialog/style";
import { input } from "./src/components/ui/Input/style";
import { select } from "./src/components/ui/Select/style";
import { toggle } from "./src/components/ui/Switch/style";
import { textarea } from "./src/components/ui/Textarea/style";
import { breakpoints, semanticTokens, textStyles, tokens } from "./src/styles/foundation";

export default defineConfig({
  presets: [basePreset],
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",
  theme: {
    extend: {
      breakpoints,
      tokens,
      semanticTokens,
      textStyles,
      recipes: {
        button,
        input,
        select,
        textarea,
      },
      slotRecipes: {
        checkbox,
        dialog,
        toggle,
      },
    },
  },
  globalCss: {
    "html, body": {
      background: "bg.canvas",
      color: "fg",
      fontFamily: "sans",
      margin: "0",
      textStyle: "std-17N-170",
    },
  },
});
