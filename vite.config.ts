import panda from "@pandacss/dev/postcss";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const testing = process.env.VITEST === "true";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4628,
  },
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    postcss: {
      plugins: [panda()],
    },
  },
  plugins: testing ? [react()] : [tanstackStart(), react()],
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    semi: true,
    singleQuote: false,
  },
  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
    plugins: ["typescript", "react", "oxc"],
    jsPlugins: ["./oxlint-plugins/must-use-result.js", "./oxlint-plugins/no-create-table.js"],
    rules: {
      "must-use-result/must-use-result": "error",
      "no-create-table/no-create-table": "error",
      "typescript/no-floating-promises": "error",
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "model",
          environment: "node",
          include: ["shared/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "screen",
          environment: "happy-dom",
          include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
          server: {
            deps: {
              external: ["bun:sqlite"],
            },
          },
        },
      },
    ],
  },
});
