// .site を gh-pages ブランチに置いて GitHub Pages に公開する。CI では動かさない。
// gh-pages は .site の中身だけを持つブランチで、毎回 1 つのコミットに置き換える（履歴は残さない）。
import { $ } from "bun";
import { mkdtemp, rm, stat, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const site = join(root, ".site");
const branch = "gh-pages";
const dryRun = process.argv.includes("--dry-run");

$.cwd(root);

const built = await stat(join(site, "index.html"))
  .then(() => true)
  .catch(() => false);
if (!built) {
  console.error(".site がありません。先に pnpm site:build を実行してください");
  process.exit(1);
}

const remote = (await $`git remote get-url origin`.text()).trim();
const source = (await $`git rev-parse --short HEAD`.text()).trim();
const dirty = (await $`git status --porcelain`.text()).trim().length > 0;

// 作業中のリポジトリには触れず、空のリポジトリで 1 コミットだけ作って送る。
const work = await mkdtemp(join(tmpdir(), "yorozuya-pages-"));
try {
  await cp(site, work, { recursive: true });
  $.cwd(work);
  await $`git init -q -b ${branch}`;
  await $`git add -A`;
  const message = `サイトを更新する（${source}${dirty ? " と未コミットの変更" : ""}）`;
  await $`git -c user.name=${await gitConfig("user.name")} -c user.email=${await gitConfig("user.email")} commit -q -m ${message}`;
  if (dryRun) {
    console.log(`送らずに終えます（--dry-run）: ${work}`);
  } else {
    await $`git push -f ${remote} ${branch}:${branch}`;
    console.log(`${branch} に公開しました`);
  }
} finally {
  $.cwd(root);
  if (!dryRun) {
    await rm(work, { recursive: true, force: true });
  }
}

async function gitConfig(key: string): Promise<string> {
  const value = (await $`git -C ${root} config ${key}`.nothrow().text()).trim();
  return value || "yorozuya";
}
