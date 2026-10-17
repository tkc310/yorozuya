## 開発者用のコマンド

`package.json` の `scripts` だけです。

- `pnpm dev` は Bun で開発サーバを `127.0.0.1:43123` で起動します。
- `pnpm prepare` は Panda CSS の codegen を走らせます。
- `pnpm test` は Vitest を1回走らせます。
- `pnpm test:e2e` は Playwright を走らせます。
- `pnpm typecheck` は `tsc --noEmit` です。
- `pnpm lint` は Oxlint のあと `pnpm lint:boundary` を走らせます。
- `pnpm lint:boundary` は ESLint と `scripts/check-advanced-boundaries.mjs` を走らせます。

| 検査 | 規則 |
| --- | --- |
| `src/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ |
