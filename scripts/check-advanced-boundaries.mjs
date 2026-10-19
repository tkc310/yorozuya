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

// タブのアイコンは、アプリ・LP・Storybook とも favicon.ico を使う。SVG の icon を並べるとブラウザが SVG を選び、
// 透過した黒い紋がダークモードのタブで見えなくなったため。
for (const [file, favicon] of [
  ["src/routes/__root.tsx", 'favicon.ico?url"'],
  ["site/index.html", 'rel="icon" href="images/favicon.ico"'],
  [".storybook/main.ts", 'rel="icon" href="./images/favicon.ico"'],
]) {
  const source = readFileSync(path.join(root, file), "utf8");
  if (!source.includes(favicon)) {
    failures.push(`${file}: タブのアイコンに favicon.ico を使う`);
  }
  if (
    /icon\.svg/.test(source) &&
    /rel[=:]\s*"icon"[^\n]*svg|svg[^\n]*rel[=:]\s*"icon"/.test(source)
  ) {
    failures.push(`${file}: タブのアイコンに SVG を並べない（favicon.ico が使われなくなる）`);
  }
}

// 改善ログは表 1 つ。複数の PR が同時に行を足すと、衝突の直し方しだいで表や行が重なるため。
{
  const log = readFileSync(path.join(root, "docs/improvement/log.md"), "utf8").split("\n");
  if (log.filter((line) => line.startsWith("| 日付")).length !== 1) {
    failures.push("docs/improvement/log.md: 表は 1 つにする（見出しの行が重なっている）");
  }
  const rows = log
    .filter((line) => /^\| \d{4}-\d{2}-\d{2} /.test(line))
    .map((line) => line.replace(/\s+/g, " "));
  const duplicated = rows.filter((row, index) => rows.indexOf(row) !== index);
  for (const row of duplicated) {
    failures.push(`docs/improvement/log.md: 同じ行が重なっている（${row.slice(0, 60)}…）`);
  }
}

// ロゴと、ロゴから作る画像（make brand-images）を、それぞれの場所で使っていること。
for (const [file, reference] of [
  ["README.md", 'src="docs/assets/banner.svg"'],
  [".storybook/manager.ts", 'brandImage: "./images/logo.svg"'],
  ["site/index.html", 'og:image" content="https://tkc310.github.io/yorozuya/ogp.png"'],
]) {
  if (!readFileSync(path.join(root, file), "utf8").includes(reference)) {
    failures.push(`${file}: make brand-images で作った画像を参照する（${reference}）`);
  }
}

// README の Agent Skills のバッジに書いたスキルの数は、.cursor/skills の数と同じにする。
{
  const skills = readdirSync(path.join(root, ".cursor/skills"), { withFileTypes: true }).filter(
    (entry) => entry.isDirectory(),
  ).length;
  const badge = /badge\/Agent_Skills-(\d+)-/.exec(
    readFileSync(path.join(root, "README.md"), "utf8"),
  );
  if (!badge || Number(badge[1]) !== skills) {
    failures.push(`README.md: Agent Skills のバッジの数を ${skills} にする（.cursor/skills の数）`);
  }
}

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
