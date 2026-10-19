---
name: conventional-commits
description: Write commit messages in Conventional Commits. Use whenever creating a commit in this repository, including commits made by the improve and publish-site skills.
---

# Conventional Commits

Every commit in this repository follows Conventional Commits. The `commit-msg` hook and CI (`make lint-commits`) reject other messages. The human-facing rules are in `CONTRIBUTING.md` (「コミットメッセージ」).

Use `type(scope): description`.

- The type is one of `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `build`, `ci`, `chore`, or `revert`.
- The scope is optional and names the area in lowercase letters, digits, and `-`, such as `skill-sheet`, `app`, `site`, or `release`.
- Add `!` after the type or scope for a breaking change, such as `feat(app)!: ...`.
- The description is imperative and has no trailing period (`.` or `。`). Japanese or English is fine.
- Keep one concern in each commit. Split unrelated changes into separate commits.
- Leave a blank line before the body. Put attribution trailers at the end of the body.

## Examples

```
feat(skill-sheet): 職務経歴を並べ替えられるようにする
fix(app): build the macOS icon from icon_apple.png at 1024px
docs: リリース手順を書く
chore(release): v0.2.0
```

Check commits before pushing with `make lint-commits` (defaults to `origin/main..HEAD`).
