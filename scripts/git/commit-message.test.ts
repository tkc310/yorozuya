import { describe, expect, it } from "vitest";
import { checkCommitMessage } from "./commit-message";

describe("コミットメッセージ", () => {
  it("Conventional Commits の形なら通す", () => {
    expect(checkCommitMessage("feat(skill-sheet): 職務経歴を並べ替えられるようにする")).toBeNull();
    expect(checkCommitMessage("docs: リリース手順を書く\n\n本文")).toBeNull();
    expect(checkCommitMessage("fix(app)!: change the data directory")).toBeNull();
    expect(checkCommitMessage("chore(release): v0.2.0")).toBeNull();
  });

  it("Git や GitHub が作るメッセージは通す", () => {
    expect(checkCommitMessage("Merge pull request #25 from tkc310/ci/branch-cleanup")).toBeNull();
    expect(checkCommitMessage("Merge branch 'main' into ci/branch-cleanup")).toBeNull();
    expect(checkCommitMessage('Revert "feat: add x"')).toBeNull();
    expect(checkCommitMessage("fixup! feat: add x")).toBeNull();
  });

  it("コメント行は読み飛ばす", () => {
    expect(checkCommitMessage("# コメント\nfeat: add x")).toBeNull();
  });

  it("形が違えば理由を返す", () => {
    expect(checkCommitMessage("職務経歴を並べ替える")).toMatch(/type\(scope\)/);
    expect(checkCommitMessage("feature: add x")).toMatch(/type\(scope\)/);
    expect(checkCommitMessage("feat(Skill Sheet): add x")).toMatch(/type\(scope\)/);
    expect(checkCommitMessage("feat:add x")).toMatch(/type\(scope\)/);
    expect(checkCommitMessage("feat: add x.")).toMatch(/句点/);
    expect(checkCommitMessage("")).toMatch(/空/);
  });
});
