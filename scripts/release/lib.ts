// リリースのスクリプト（version.ts・tag.ts）で共有する処理。
import { $ } from "bun";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export function stop(message: string): never {
  console.error(message);
  process.exit(1);
}

// git を実行し、標準出力を前後の空白を除いて返す。
export async function git(strings: TemplateStringsArray, ...values: string[]): Promise<string> {
  const command = strings.reduce((all, part, index) => all + part + (values[index] ?? ""), "");
  const result = await $`git ${{ raw: command }}`.quiet();
  return result.stdout.toString().trim();
}

export async function readVersion(root: string): Promise<string> {
  const manifest = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as {
    version?: string;
  };
  return manifest.version ?? stop("package.json に version がありません");
}

// main にいて、手元に変更が無く、origin/main と同じであることを確かめる。
export async function requireCleanMain(): Promise<void> {
  if ((await git`branch --show-current`) !== "main") {
    stop("main で実行してください（git switch main）");
  }
  if ((await git`status --porcelain`) !== "") {
    stop("コミットしていない変更があります");
  }
  await $`git fetch -q origin main`;
  if ((await git`rev-parse HEAD`) !== (await git`rev-parse origin/main`)) {
    stop("main が origin/main と違います。git pull してください");
  }
}

export async function repoName(): Promise<string> {
  const url = await git`remote get-url origin`;
  const match = /github\.com[:/](.+?)(?:\.git)?$/.exec(url);
  return match?.[1] ?? stop(`origin から GitHub のリポジトリ名を読めませんでした: ${url}`);
}
