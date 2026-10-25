## 開発者用のコマンド

コマンドは `make` で実行する（`Makefile`）。一覧は `make help`。追加の引数は `ARGS="..."` で渡す。コマンドを足すときは `package.json` のスクリプトと `Makefile` の両方に足し、ドキュメントには `make` の形で書く。

- 依存パッケージを入れる: `make install`
- 開発サーバ起動: `make dev`
- macOS アプリ作成: `make build-app`
- Storybook 起動: `make storybook`
- GitHub Pages のサイトを組み立てる: `make site-build`（撮影を省くなら `ARGS=--skip-capture`）
- 組み立てたサイトを確かめる: `make site-preview`
- ロゴからREADME のバナーと OGP 画像を作り直す: `make brand-images`
- サイトを公開する: `make site-publish`（手順は `docs/site.md`）
- スタイル生成: `make prepare`
- Playwright の Chromium を入れる: `make browsers`
- マイグレーション生成: `make db-generate`
- リリース: `make release-version ARGS=minor` → マージ → `make release-tag`（手順は `CONTRIBUTING.md` の「リリース」）
- マージ済みのブランチを消す: `make branch-prune`（一覧だけ。消すなら `ARGS=--apply`）
- まとめて検査（型・静的・フォーマット・テスト）: `make check`
- テスト: `make test`
- エンドツーエンドテスト: `make test-e2e`
- 型検査: `make typecheck`
- 静的検査: `make lint`
- 境界検査: `make lint-boundary`
- コミットメッセージの検査: `make lint-commits`
- フォーマット検査: `make fmt`（直すなら `make fmt-fix`）

| 検査                                                                                                      | 規則                                     |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/server/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ |

## まず読むもの

| やりたいこと                           | 読むもの                                                       |
| -------------------------------------- | -------------------------------------------------------------- |
| よろずや自体を直す・改善する           | `docs/improvement-loop.md` → `.claude/skills/improve/SKILL.md` |
| 判断の理由を知る                       | `docs/decisions/`（ADR）                                       |
| 機能を足す・大きく変える               | `docs/specs/`（先に指示書を書く）                              |
| 過去に直したこと・残っている改善を知る | `docs/improvement/log.md`・`docs/improvement/backlog.md`       |
| LP と Storybook を更新・公開する       | `docs/site.md` → `.claude/skills/publish-site/SKILL.md`        |
| エージェントとの進め方を知る           | `docs/ai-agents.md`                                            |
| 開発の手順を知る                       | `CONTRIBUTING.md`                                              |

## 守ること

- `rules/security.md` に従う。検査を通すために規則を緩めない（緩めるなら ADR に理由を書き、人の承認を得る）
- コミットメッセージは Conventional Commits（`type(scope): 説明`）で書く。type と書き方は `CONTRIBUTING.md` の「コミットメッセージ」と `.claude/skills/conventional-commits/SKILL.md`。`commit-msg` フックと CI（`make lint-commits`）が検査する
- 1 PR 1 改善。直したら再発防止（検査・テスト・ルール・スキル）を足す
- 変更したら `make check` を通し、`docs/improvement/log.md` の表の先頭に 1 行記録する
- 値や方針を変えたら `docs/decisions/` に ADR を足す。古い ADR は消さず「廃止（→ NNNN）」にする
- 会話で受けた指摘も `log.md` に残し、同じ種類の指摘が続いたらルール文書か検査に格上げする
