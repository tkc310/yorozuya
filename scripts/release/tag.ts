// リリースの 2 段目。main の最新コミットに package.json の version のタグを付けて push する。
// タグの push で Release ワークフロー（.github/workflows/release.yml）がアプリを作り、GitHub Release を公開する。
//
//   make release-tag                  タグを付けて push する
//   make release-tag ARGS=--dry-run   確かめるだけ
//   make release-tag ARGS=--retag     ワークフローが失敗したあと、直したコミットにタグを付け直す
import { $ } from "bun";
import { join } from "node:path";
import { git, readVersion, repoName, requireCleanMain, stop } from "./lib";

const root = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const retag = args.includes("--retag");

$.cwd(root);

await requireCleanMain();

const version = await readVersion(root);
const tag = `v${version}`;
const head = await git`rev-parse HEAD`;
const repo = await repoName();

const localTag = (await git`tag -l ${tag}`) !== "";
const remoteTag = (await git`ls-remote --tags origin ${`refs/tags/${tag}`}`) !== "";
if ((localTag || remoteTag) && !retag) {
  stop(
    `タグ ${tag} はもうあります。先に make release-version で版を上げてください（付け直すなら ARGS=--retag）`,
  );
}
if (retag) {
  const released = await $`gh api ${`repos/${repo}/releases/tags/${tag}`}`.nothrow().quiet();
  if (released.exitCode === 0) {
    stop(`${tag} の GitHub Release はもう公開されています。付け直さず、版を上げてください`);
  }
}

// main の CI が通ったコミットにだけ付ける。
const runs = JSON.parse(
  await $`gh api ${`repos/${repo}/commits/${head}/check-runs?per_page=100`} --jq ${"[.check_runs[] | {name, status, conclusion}]"}`.text(),
) as { name: string; status: string; conclusion: string | null }[];
if (runs.length === 0) {
  stop(
    `main の最新コミット（${head.slice(0, 7)}）に CI の結果がありません。CI が始まるまで待ってください`,
  );
}
const pending = runs.filter((run) => run.status !== "completed");
const failed = runs.filter(
  (run) =>
    run.status === "completed" && !["success", "skipped", "neutral"].includes(run.conclusion ?? ""),
);
if (pending.length > 0) {
  stop(`CI が終わっていません: ${pending.map((run) => run.name).join("、")}`);
}
if (failed.length > 0) {
  stop(
    `CI が通っていません: ${failed.map((run) => `${run.name}（${run.conclusion}）`).join("、")}`,
  );
}

console.log(`${tag} を ${head.slice(0, 7)} に付けます（CI ${runs.length} 件が成功）`);
if (dryRun) {
  console.log("確かめるだけで終えます（--dry-run）");
  process.exit(0);
}

if (retag) {
  if (localTag) {
    await $`git tag -d ${tag}`.quiet();
  }
  if (remoteTag) {
    await $`git push -q origin ${`:refs/tags/${tag}`}`;
  }
}
await $`git tag -a ${tag} -m ${tag}`;
await $`git push -q origin ${tag}`;

console.log(`${tag} を push しました。`);
console.log(`ワークフロー: https://github.com/${repo}/actions/workflows/release.yml`);
console.log(`公開後のリリース: https://github.com/${repo}/releases/tag/${tag}`);
