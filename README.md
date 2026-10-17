## プロジェクト概要

ローカルで動く、フリーランス向けのユーティリティです。最初の機能は、印刷できるスキルシートです。

## 技術スタック

- パッケージ管理は pnpm です。
- フレームワークは TanStack Start と React です。
- 言語は TypeScript です。
- スタイルは Panda CSS です。
- UI は Park UI と Ark UI です。
- フォームは TanStack Form です。
- データ取得は TanStack Query です。
- UI 状態は Zustand です。
- ビルドは Vite+ です。
- データベースは bun:sqlite と Drizzle です。
- エラーは neverthrow です。
- サーバ関数は TanStack Start の createServerFn です。
- バリデーションは Valibot です。
- リンターは Oxlint と ESLint です。
- フォーマッターは Oxfmt です。
- カタログは Storybook です。
- ユニットテストと統合テストは Vitest、React Testing Library、happy-dom です。
- e2e は Playwright です。
- 開発サーバは Bun で起動します。

## 開発者用のコマンド

- `pnpm dev` は Bun で開発サーバを `127.0.0.1:43123` で起動します。
- `pnpm prepare` は Panda CSS の codegen を走らせます。
- `pnpm test` は Vitest を1回走らせます。
- `pnpm test:e2e` は Playwright を走らせます。
- `pnpm typecheck` は `tsc --noEmit` です。
- `pnpm lint` は Oxlint のあと `pnpm lint:boundary` を走らせます。
- `pnpm lint:boundary` は ESLint と `scripts/check-advanced-boundaries.mjs` を走らせます。
