## 開発者用のコマンド

コマンドは `make` で実行する（`Makefile`）。一覧は `make help`。追加の引数は `ARGS="..."` で渡す。コマンドを足すときは `package.json` のスクリプトと `Makefile` の両方に足し、ドキュメントには `make` の形で書く。

- 依存パッケージを入れる: `make install`
- 開発サーバ起動: `make dev`
- macOS アプリ作成: `make build-app`
- Storybook 起動: `make storybook`
- GitHub Pages のサイトを組み立てる: `make site-build`（撮影を省くなら `ARGS=--skip-capture`）
- 組み立てたサイトを確かめる: `make site-preview`
- サイトを公開する: `make site-publish`（手順は `.claude/skills/publish-site/SKILL.md`）
- スタイル生成: `make prepare`
- Playwright の Chromium を入れる: `make browsers`
- マイグレーション生成: `make db-generate`
- まとめて検査（型・静的・フォーマット・テスト）: `make check`
- テスト: `make test`
- エンドツーエンドテスト: `make test-e2e`
- 型検査: `make typecheck`
- 静的検査: `make lint`
- 境界検査: `make lint-boundary`
- フォーマット検査: `make fmt`（直すなら `make fmt-fix`）

| 検査                                                                                               | 規則                                     |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ |
