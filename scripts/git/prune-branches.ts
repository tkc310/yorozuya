// 用の済んだブランチを消す。既定では消す候補を出すだけで、--apply を付けると消す。
//
// 消すもの:
//   - リモート: Pull Request がマージ済みで、開いている Pull Request が無いブランチ。
//     Pull Request の無いブランチは、main に取り込み済みのときだけ消す。
//   - 手元: 上のリモートブランチを追っていたブランチと、追っていたリモートブランチが消えたブランチ。
// 消さないもの: main・gh-pages・今いるブランチ・未マージのブランチ。
//
// --apply のときは、マージ時にブランチを自動で消す設定（delete_branch_on_merge）も有効にする。
import { $ } from "bun";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const apply = process.argv.includes("--apply");
const protectedBranches = new Set(["main", "gh-pages"]);

$.cwd(root);

type Pull = {
  number: number;
  state: "open" | "closed";
  merged_at: string | null;
  head: { ref: string; repo: { full_name: string } | null };
};

const repo =
  (await $`gh repo view --json nameWithOwner -q .nameWithOwner`.nothrow().text()).trim() ||
  repoFromRemote();
const current = (await $`git branch --show-current`.text()).trim();

await $`git fetch -q --prune origin ${"+refs/heads/*:refs/remotes/origin/*"}`;

const pulls = JSON.parse(
  await $`gh api --paginate ${`repos/${repo}/pulls?state=all&per_page=100`} --slurp`.text(),
).flat() as Pull[];
const byBranch = new Map<string, Pull[]>();
for (const pull of pulls) {
  // フォークからの Pull Request は、このリポジトリのブランチではない。
  if (pull.head.repo?.full_name !== repo) {
    continue;
  }
  byBranch.set(pull.head.ref, [...(byBranch.get(pull.head.ref) ?? []), pull]);
}

const remoteBranches = lines(
  await $`git for-each-ref --format=${"%(refname:lstrip=3)"} refs/remotes/origin`.text(),
).filter((name) => name !== "HEAD");
const mergedIntoMain = new Set(
  lines(await $`git branch -r --merged origin/main --format=${"%(refname:lstrip=3)"}`.text()),
);

const removeRemote: string[] = [];
const keep: string[] = [];
for (const name of remoteBranches) {
  if (protectedBranches.has(name) || name === current) {
    continue;
  }
  const related = byBranch.get(name) ?? [];
  const open = related.some((pull) => pull.state === "open");
  const merged = related.some((pull) => pull.merged_at !== null);
  if (!open && (merged || (related.length === 0 && mergedIntoMain.has(name)))) {
    removeRemote.push(name);
  } else {
    keep.push(`${name}（${open ? "Pull Request が開いている" : "未マージ"}）`);
  }
}

// 手元のブランチ: 追っていたリモートブランチが消えた、または上で消すもの。
const removeLocal: string[] = [];
const local = lines(
  await $`git for-each-ref --format=${"%(refname:lstrip=2)\t%(upstream:lstrip=3)\t%(upstream:track)"} refs/heads`.text(),
);
for (const line of local) {
  const [name = "", upstream = "", track = ""] = line.split("\t");
  if (protectedBranches.has(name) || name === current) {
    continue;
  }
  if ((upstream && removeRemote.includes(upstream)) || track === "[gone]") {
    removeLocal.push(name);
  }
}

print("消すリモートブランチ", removeRemote);
print("消す手元のブランチ", removeLocal);
print("残すブランチ", keep);

if (!apply) {
  console.log("\n確認だけで終えます。消すなら make branch-prune ARGS=--apply を実行してください。");
  process.exit(0);
}

for (const name of removeRemote) {
  await $`git push -q origin --delete ${name}`;
}
for (const name of removeLocal) {
  await $`git branch -q -D ${name}`;
}
const enabled =
  await $`gh api -X PATCH ${`repos/${repo}`} -F delete_branch_on_merge=true --jq .delete_branch_on_merge`
    .nothrow()
    .text();
console.log(
  enabled.trim() === "true"
    ? "\n消しました。マージした Pull Request のブランチは、これからは GitHub が自動で消します。"
    : "\n消しました。マージ時の自動削除は設定できませんでした（Settings → General → Automatically delete head branches）。",
);

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function print(title: string, names: string[]) {
  console.log(`${title}（${names.length}）`);
  for (const name of names) {
    console.log(`  ${name}`);
  }
}

function repoFromRemote(): string {
  const url = Bun.spawnSync(["git", "remote", "get-url", "origin"]).stdout.toString().trim();
  const match = /github\.com[:/](.+?)(?:\.git)?$/.exec(url);
  if (!match?.[1]) {
    console.error(`origin から GitHub のリポジトリ名を読めませんでした: ${url}`);
    process.exit(1);
  }
  return match[1];
}
