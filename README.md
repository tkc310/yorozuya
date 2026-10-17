## プロジェクト概要

ローカルで動く、フリーランス向けのユーティリティです。最初の機能は、印刷できるスキルシートです。

## 技術スタック

パッケージ管理: pnpm
フレームワーク: TanStack Start / React
言語: TypeScript
スタイル: Panda CSS
UI: Park UI / Ark UI
フォーム: TanStack Form
データ取得: TanStack Query
UI 状態: Zustand
ビルド: Vite+ / Vite 8
データベース: bun:sqlite / Drizzle
エラー: neverthrow
サーバ関数: TanStack Start / createServerFn
バリデーション: Valibot
リンター: Oxlint / ESLint / 未使用の Result
フォーマッター: Oxfmt
カタログ: Storybook
ユニットテスト: Vitest
統合テスト: Vitest + React Testing Library + happy-dom + Storybook
VRT: Vitest browser mode / story
e2e: Playwright / Test Agents
配布: Bun シングルバイナリ
起動: `pnpm dev`

## 開発者用のコマンド

- `pnpm dev` は Bun で開発サーバを `127.0.0.1:43123` で起動します。
- `pnpm prepare` は Panda CSS の codegen を走らせます。
- `pnpm test` は Vitest を1回走らせます。
- `pnpm test:e2e` は Playwright を走らせます。
- `pnpm typecheck` は `bun check` です。
- `pnpm lint` は Oxlint のあと `pnpm lint:boundary` を走らせます。
- `pnpm lint:boundary` は ESLint と `scripts/check-advanced-boundaries.mjs` を走らせます。
