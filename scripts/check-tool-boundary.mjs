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

function resolveSpec(file, spec) {
  if (spec.startsWith("@/")) {
    return path.posix.normalize(`src/${spec.slice(2)}`);
  }
  if (spec.startsWith(".")) {
    const absolute = path.resolve(path.dirname(file), spec);
    return rel(absolute).replace(/\.(tsx|ts|jsx|js|mjs)$/, "");
  }
  return null;
}

function featureOf(filePath) {
  const match = filePath.match(/^src\/components\/features\/([^/]+)\//);
  return match ? match[1] : null;
}

function isScreen(filePath) {
  return (
    filePath.startsWith("src/components/") ||
    filePath.startsWith("src/routes/") ||
    filePath === "src/router.tsx"
  );
}

function fail(filePath, message) {
  failures.push(`${filePath}: ${message}`);
}

function scan(file) {
  const filePath = rel(file);
  if (filePath === "scripts/check-tool-boundary.mjs") {
    return;
  }
  const source = strip(readFileSync(file, "utf8"));
  const specs = imports(source);
  const resolved = specs
    .map((spec) => ({ spec, target: resolveSpec(file, spec) }))
    .filter((item) => item.spec);

  if (source.includes("TURSO_DATABASE_URL")) {
    fail(filePath, "TURSO_DATABASE_URL を読んでいます");
  }
  if (filePath !== "src/server/lib/db.ts" && source.includes("data/yorozu.db")) {
    fail(filePath, "data/yorozu.db を開いています");
  }
  const writes = /\.(insert|update|delete)\s*\(/.test(source);
  const usesDrizzle = specs.some((spec) => spec === "drizzle-orm" || spec.startsWith("drizzle-orm/"));
  if (writes && (filePath.includes("/queries/") || filePath.startsWith("src/server/features/") || (usesDrizzle && !filePath.startsWith("src/server/lib/")))) {
    fail(filePath, "insert、update、delete を呼んでいます");
  }

  for (const spec of specs) {
    if (spec === "bun:sqlite" || spec === "drizzle-orm/bun-sqlite") {
      if (filePath !== "src/server/lib/db.ts") {
        fail(filePath, `${spec} を import しています`);
      }
    }
    if (
      spec === "@libsql/client" ||
      spec.startsWith("@libsql/") ||
      spec === "drizzle-orm/libsql" ||
      spec.startsWith("drizzle-orm/libsql/") ||
      spec === "better-sqlite3"
    ) {
      fail(filePath, `${spec} を import しています`);
    }
    if (
      (spec === "react" || spec.startsWith("react/") || spec === "react-dom" || spec.startsWith("react-dom/")) &&
      filePath.startsWith("src/lib/")
    ) {
      fail(filePath, "React を import しています");
    }
    if (
      (spec === "drizzle-orm" || spec.startsWith("drizzle-orm/")) &&
      filePath.startsWith("src/server/features/")
    ) {
      fail(filePath, "Drizzle を import しています");
    }
  }

  const feature = featureOf(filePath);
  for (const item of resolved) {
    const target = item.target ?? "";
    if (feature && feature !== "shell" && target.startsWith("src/components/features/")) {
      const other = featureOf(`${target}/`);
      if (other && other !== feature) {
        fail(filePath, `${other} を import しています`);
      }
    }
    if (isScreen(filePath) && (target.startsWith("src/db") || target.startsWith("src/server"))) {
      fail(filePath, `${target} を import しています`);
    }
    if (
      !filePath.startsWith("src/server/") &&
      !filePath.startsWith("src/lib/") &&
      target.startsWith("src/server")
    ) {
      fail(filePath, "src/server を import しています");
    }
    if (filePath.startsWith("src/components/ui/") && (
      target.startsWith("src/components/features") ||
      target.startsWith("src/lib") ||
      target.startsWith("src/server")
    )) {
      fail(filePath, `${target} を import しています`);
    }
    if (filePath.startsWith("shared/features/") && (
      item.spec === "react" ||
      item.spec.startsWith("react/") ||
      item.spec === "drizzle-orm" ||
      item.spec.startsWith("drizzle-orm/") ||
      item.spec === "@libsql/client" ||
      item.spec.startsWith("@libsql/") ||
      item.spec === "bun:sqlite" ||
      item.spec === "neverthrow" ||
      item.spec.startsWith("@tanstack/") ||
      target.startsWith("src/server") ||
      target.startsWith("src/lib")
    )) {
      fail(filePath, `${item.spec} を import しています`);
    }
    if (filePath.includes("/queries/") && target.includes("/commands/")) {
      fail(filePath, "command を import しています");
    }
    if (filePath.includes("/commands/") && target.includes("/queries/")) {
      fail(filePath, "query を import しています");
    }
  }

  if (isScreen(filePath) && /\bfetch\s*\(/.test(source)) {
    fail(filePath, "fetch を呼んでいます");
  }

  if (filePath.startsWith("src/lib/skill-sheet/") && !specs.some((spec) => spec.includes("request"))) {
    fail(filePath, "request.ts を import していません");
  }

  const loadsData = /useQuery|useMutation|ensureQueryData|queryFn/.test(source);
  if (isScreen(filePath) && loadsData) {
    const throughLib = resolved.some(
      (item) =>
        (item.target ?? "").startsWith("src/lib/skill-sheet") ||
        (item.target ?? "").startsWith("src/lib/request"),
    );
    if (!throughLib) {
      fail(filePath, "request.ts を経由せずデータを取得しています");
    }
  }
}

walk(root);

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log("boundary ok");
