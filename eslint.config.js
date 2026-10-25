import { readdirSync } from "node:fs";
import importPlugin from "eslint-plugin-import-x";
import tsParser from "@typescript-eslint/parser";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

// 画面の機能。機能ごとに、ほかの機能を import できない区域を作る。
const features = readdirSync("./src/components/features", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

export default [
  // ignores だけの設定は全体に効く。生成物やビルド成果物（.app の中身を含む）は検査しない。
  {
    ignores: [
      "src/routeTree.gen.ts",
      "styled-system/**",
      "dist/**",
      ".output/**",
      ".tanstack/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "storybook-static/**",
      ".site/**",
      ".site-media-keep/**",
      "sample/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
    ignores: ["scripts/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "import-x": importPlugin,
    },
    // 解決できない import は境界を検査できないため、tsconfig の paths と拡張子で解決する。
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
    },
    rules: {
      // 画面は src/server/db を直接 import しない
      "import-x/no-restricted-paths": [
        "error",
        {
          basePath: ".",
          zones: [
            // 画面から src/server/db への import を禁止
            {
              target: "./src/components",
              from: "./src/server/db",
              message: "画面は表を直接 import できません",
            },
            {
              target: "./src/routes",
              from: "./src/server/db",
              message: "画面は表を直接 import できません",
            },
            // src/components/ui から features, lib, server への import を禁止
            {
              target: "./src/components/ui",
              from: "./src/components/features",
              message: "ui は共通部品のため features を import できません",
            },
            {
              target: "./src/components/ui",
              from: "./src/lib",
              message: "ui は共通部品のため lib を import できません",
            },
            {
              target: "./src/components/ui",
              from: "./src/server",
              message: "ui は共通部品のため server を import できません",
            },
            // shared/features から src への import を禁止
            {
              target: "./shared/features",
              from: "./src/server",
              message: "シートの計算は純粋である必要があります",
            },
            {
              target: "./shared/features",
              from: "./src/lib",
              message: "シートの計算は純粋である必要があります",
            },
            // feature 同士の import を禁止
            ...features.map((feature) => ({
              target: `./src/components/features/${feature}`,
              from: "./src/components/features",
              except: [`./${feature}`],
              message: "feature 同士は import しません",
            })),
            // queries と commands の相互 import を禁止
            {
              target: "./**/queries",
              from: "./**/commands",
              message: "query と command は分ける必要があります",
            },
            {
              target: "./**/commands",
              from: "./**/queries",
              message: "query と command は分ける必要があります",
            },
          ],
        },
      ],

      // 特定パッケージの import 制限
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@libsql/client",
              message: "ホストされた DB は使用できません。bun:sqlite を使用してください",
            },
            {
              name: "drizzle-orm/libsql",
              message:
                "ホストされた DB は使用できません。drizzle-orm/bun-sqlite を使用してください",
            },
            {
              name: "better-sqlite3",
              message: "別の SQLite パッケージは使用できません。bun:sqlite を使用してください",
            },
            {
              name: "node:sqlite",
              message: "node:sqlite は使用できません。bun:sqlite を使用してください",
            },
          ],
          patterns: [
            {
              group: ["@libsql/*"],
              message: "ホストされた DB は使用できません",
            },
            {
              group: ["drizzle-orm/libsql/*"],
              message: "ホストされた DB は使用できません",
            },
          ],
        },
      ],

      // 特定構文の使用制限
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='fetch']",
          message: "画面で fetch を直接呼ばず、サーバ関数を使用してください",
        },
        {
          selector: "MemberExpression[property.name='TURSO_DATABASE_URL']",
          message: "TURSO_DATABASE_URL は使用できません。ローカルファイルを使用してください",
        },
      ],
    },
  },

  // src/lib では React を import できない
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "src/lib に React コンポーネントは置けません" },
            { name: "react-dom", message: "src/lib に React コンポーネントは置けません" },
          ],
          patterns: [
            { group: ["react/*"], message: "src/lib に React コンポーネントは置けません" },
            { group: ["react-dom/*"], message: "src/lib に React コンポーネントは置けません" },
          ],
        },
      ],
    },
  },

  // src/server/lib/db.ts 以外で bun:sqlite を import できない
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/server/lib/db.ts"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "bun:sqlite",
              message: "bun:sqlite を import できるのは src/server/lib/db.ts だけです",
            },
            {
              name: "drizzle-orm/bun-sqlite",
              message: "drizzle-orm/bun-sqlite を import できるのは src/server/lib/db.ts だけです",
            },
          ],
          patterns: [
            {
              group: ["drizzle-orm/bun-sqlite/*"],
              message: "drizzle-orm/bun-sqlite を import できるのは src/server/lib/db.ts だけです",
            },
          ],
        },
      ],
    },
  },

  // shared/features で特定パッケージを import できない
  {
    files: ["shared/features/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "react", message: "シートの計算は純粋である必要があります" },
            { name: "react-dom", message: "シートの計算は純粋である必要があります" },
            { name: "drizzle-orm", message: "シートの計算は純粋である必要があります" },
            { name: "bun:sqlite", message: "シートの計算は純粋である必要があります" },
            { name: "neverthrow", message: "シートの計算は純粋である必要があります" },
          ],
          patterns: [
            { group: ["react/*"], message: "シートの計算は純粋である必要があります" },
            { group: ["react-dom/*"], message: "シートの計算は純粋である必要があります" },
            { group: ["drizzle-orm/*"], message: "シートの計算は純粋である必要があります" },
            { group: ["@libsql/*"], message: "シートの計算は純粋である必要があります" },
            { group: ["@tanstack/*"], message: "シートの計算は純粋である必要があります" },
          ],
        },
      ],
    },
  },

  // src/server/features で Drizzle を import できない（repository.ts は除く）
  {
    files: ["src/server/features/**/*.{ts,tsx}"],
    ignores: ["src/server/features/repository.ts"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "drizzle-orm", message: "読み書きは SkillSheetRepository だけで行います" },
          ],
          patterns: [
            { group: ["drizzle-orm/*"], message: "読み書きは SkillSheetRepository だけで行います" },
          ],
        },
      ],
    },
  },
];
