// コミットメッセージが Conventional Commits の形かを判定する。bun に依存しないので Vitest（make test）で検査する。
// 規則は CONTRIBUTING.md の「コミットメッセージ」と .claude/skills/conventional-commits/SKILL.md に合わせる。

export const COMMIT_TYPES = [
  "feat",
  "fix",
  "perf",
  "refactor",
  "test",
  "docs",
  "build",
  "ci",
  "chore",
  "revert",
] as const;

const HEADER = new RegExp(`^(${COMMIT_TYPES.join("|")})(\\([a-z0-9][a-z0-9-]*\\))?!?: \\S`);
// Git や GitHub が作るメッセージは対象外にする。
const GENERATED = /^(Merge |Revert "|fixup! |squash! |amend! )/;

// 問題が無ければ null、あれば理由を返す。
export function checkCommitMessage(message: string): string | null {
  const header = message.split("\n").find((line) => line.trim() !== "" && !line.startsWith("#"));
  if (!header) {
    return "コミットメッセージが空です";
  }
  if (GENERATED.test(header)) {
    return null;
  }
  if (!HEADER.test(header)) {
    return `1 行目を「type(scope): 説明」の形にしてください（type は ${COMMIT_TYPES.join("・")}）: ${header}`;
  }
  if (header.endsWith(".") || header.endsWith("。")) {
    return `1 行目の終わりに句点を付けないでください: ${header}`;
  }
  return null;
}
