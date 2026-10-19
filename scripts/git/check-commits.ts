// コミットメッセージが Conventional Commits の形かを検査する。
//
//   make lint-commits                         origin/main から HEAD までのコミット
//   make lint-commits ARGS=origin/main..HEAD  範囲を指定する（CI の Pull Request で使う）
//   bun scripts/git/check-commits.ts --file .git/COMMIT_EDITMSG  1 件のメッセージ（commit-msg フックで使う）
import { $ } from "bun";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { checkCommitMessage } from "./commit-message";

const root = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
$.cwd(root);

const failures: string[] = [];
const fileIndex = args.indexOf("--file");
if (fileIndex >= 0) {
  const file = args[fileIndex + 1];
  if (!file) {
    console.error("--file にメッセージのファイルを指定してください");
    process.exit(1);
  }
  const problem = checkCommitMessage(await readFile(file, "utf8"));
  if (problem) {
    failures.push(problem);
  }
} else {
  const range = args.find((arg) => !arg.startsWith("--")) ?? "origin/main..HEAD";
  const log = await $`git log --format=${"%h%x00%B%x01"} ${range}`.text();
  for (const entry of log.split("\x01")) {
    const [hash = "", message = ""] = entry.trim().split("\x00");
    if (!hash) {
      continue;
    }
    const problem = checkCommitMessage(message);
    if (problem) {
      failures.push(`${hash}: ${problem}`);
    }
  }
}

if (failures.length > 0) {
  console.error(
    "Conventional Commits の形になっていません（CONTRIBUTING.md の「コミットメッセージ」）\n",
  );
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}
