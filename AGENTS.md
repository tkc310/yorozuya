## 開発者用のコマンド

- 開発サーバ起動: `pnpm dev`
- スタイル生成: `pnpm prepare`
- テスト: `pnpm test`
- エンドツーエンドテスト: `pnpm test:e2e`
- 型検査: `pnpm typecheck`
- 静的検査: `pnpm lint`
- 境界検査: `pnpm lint:boundary`

| 検査 | 規則 |
| --- | --- |
| `src/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ |
