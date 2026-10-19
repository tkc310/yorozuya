import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skipped = new Set([
  "node_modules",
  "styled-system",
  "dist",
  ".git",
  ".output",
  ".tanstack",
  "coverage",
  "playwright-report",
  "test-results",
  "storybook-static",
  ".site",
  ".site-media-keep",
  "agent-tools",
]);
const extensions = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".mts"]);
const failures = [];

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (skipped.has(entry)) {
      continue;
    }
    const full = path.join(directory, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      walk(full);
      continue;
    }
    if (extensions.has(path.extname(entry))) {
      scan(full);
    }
  }
}

function strip(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/.*$/gm, "$1");
}

function imports(source) {
  const found = [];
  const pattern =
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of source.matchAll(pattern)) {
    found.push(match[1] ?? match[2] ?? match[3]);
  }
  return found;
}

function fail(filePath, message) {
  failures.push(`${filePath}: ${message}`);
}

function scan(file) {
  const filePath = rel(file);
  if (filePath.startsWith("scripts/")) {
    return;
  }
  const source = strip(readFileSync(file, "utf8"));
  const specs = imports(source);

  // data/yorozuya.db を開けるのは src/server/lib/db.ts だけ
  if (filePath !== "src/server/lib/db.ts" && source.includes("data/yorozuya.db")) {
    fail(filePath, "data/yorozuya.db を開けるのは src/server/lib/db.ts だけです");
  }

  // CREATE TABLE を書かない
  if (/\bCREATE\s+TABLE\b/i.test(source)) {
    fail(filePath, "表を作る SQL は書けません。マイグレーションを使用してください");
  }

  // insert, update, delete の呼び出しチェック
  const writes = /\.(insert|update|delete)\s*\(/.test(source);
  const usesDrizzle = specs.some(
    (spec) => spec === "drizzle-orm" || spec.startsWith("drizzle-orm/"),
  );
  const writesInPlace =
    filePath === "src/server/features/repository.ts" || filePath === "src/db/seed.ts";

  if (
    writes &&
    !writesInPlace &&
    (filePath.includes("/queries/") ||
      filePath.startsWith("src/server/features/") ||
      (usesDrizzle && !filePath.startsWith("src/server/lib/")))
  ) {
    fail(filePath, "insert、update、delete は repository.ts と seed.ts でのみ使用できます");
  }
}

walk(root);

// Git フックから呼ぶ make は ARGS= で空にする。make のコマンド行の ARGS が MAKEFLAGS を通して
// フックにまで引き継がれ、`make release-version ARGS=minor` の push で typecheck に minor が渡ったため。
for (const line of readFileSync(path.join(root, "lefthook.yml"), "utf8").split("\n")) {
  const command = /^\s*run:\s*(make\s.*)$/.exec(line)?.[1];
  if (command && !/(^|\s)ARGS=(\s|$)/.test(command)) {
    failures.push(`lefthook.yml: フックの make には ARGS= を付ける（${command.trim()}）`);
  }
}

if (failures.length > 0) {
  console.error("Advanced boundary checks failed:\n");
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}

console.log("Advanced boundary checks passed");
