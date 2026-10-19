// リリースの 1 段目。package.json の version を上げるブランチを作り、Pull Request を出す。
//
//   make release-version ARGS=patch        0.1.0 → 0.1.1
//   make release-version ARGS=minor        0.1.0 → 0.2.0
//   make release-version ARGS=major        0.1.0 → 1.0.0
//   make release-version ARGS=0.2.0-beta.1 版を直接指定する（- を含むとプレリリース）
//   ARGS に --dry-run を足すと、何もせずに次の版だけ出す。
//
// マージしたら make release-tag でタグを付ける（scripts/release/tag.ts）。
import { $ } from "bun";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { git, readVersion, requireCleanMain, stop } from "./lib";
import { nextVersion } from "./semver";

const root = join(import.meta.dir, "../..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const level = args.find((arg) => !arg.startsWith("--"));

$.cwd(root);

if (!level) {
  stop(
    "上げ方を指定してください（例: make release-version ARGS=minor）。patch・minor・major・版の直接指定が使えます",
  );
}

const current = await readVersion(root);
const next = nextVersion(current, level);
if (!next) {
  stop(
    `版を読めませんでした: ${level}（patch・minor・major か 1.2.3 / 1.2.3-beta.1 の形で指定してください）`,
  );
}
const tag = `v${next}`;
console.log(`${current} → ${next}`);

if (
  (await git`tag -l ${tag}`) !== "" ||
  (await git`ls-remote --tags origin ${`refs/tags/${tag}`}`) !== ""
) {
  stop(`タグ ${tag} はもうあります`);
}
if (dryRun) {
  console.log("確かめるだけで終えます（--dry-run）");
  process.exit(0);
}

await requireCleanMain();

const branch = `release/${tag}`;
await $`git switch -q -c ${branch}`;
const file = join(root, "package.json");
const text = await readFile(file, "utf8");
await writeFile(file, text.replace(/("version":\s*")[^"]+(")/, `$1${next}$2`));
if ((await readVersion(root)) !== next) {
  stop("package.json の version を書き換えられませんでした");
}
await $`git commit -q -am ${`chore(release): ${tag}`}`;
await $`git push -q -u origin ${branch}`;

const body = [
  `${tag} をリリースするために package.json の version を ${current} から ${next} に上げます。`,
  "",
  "マージしたら `make release-tag` でタグを付けてください。Release ワークフローがアプリを作り、GitHub Release を公開します。",
].join("\n");
const created =
  await $`gh pr create --base main --head ${branch} --title ${`chore(release): ${tag}`} --body ${body}`
    .nothrow()
    .quiet();
if (created.exitCode === 0) {
  console.log(`Pull Request を作りました: ${created.stdout.toString().trim()}`);
} else {
  console.log(
    `Pull Request を作れませんでした。ブラウザで作ってください: ${created.stderr.toString().trim()}`,
  );
}
console.log("CI が通ったらマージし、make release-tag を実行してください。");
