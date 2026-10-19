## 開発者用のコマンド

- 開発サーバ起動: `pnpm dev`
- macOS アプリ作成: `pnpm build:app`
- Storybook 起動: `pnpm storybook`
- GitHub Pages のサイトを組み立てる: `pnpm site:build`（撮影を省くなら `--skip-capture`）
- 組み立てたサイトを確かめる: `pnpm site:preview`
- サイトを公開する: `pnpm site:publish`（手順は `.claude/skills/publish-site/SKILL.md`）
- スタイル生成: `pnpm prepare`
- テスト: `pnpm test`
- エンドツーエンドテスト: `pnpm test:e2e`
- 型検査: `pnpm typecheck`
- 静的検査: `pnpm lint`
- 境界検査: `pnpm lint:boundary`
- フォーマット: `pnpm fmt`

| 検査                                                                                               | 規則                                     |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ |
