## プロジェクト概要

ローカルで動く、フリーランス向けのユーティリティ。最初の機能は、印刷できるスキルシート。

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

## 環境構築

```bash
mise install
pnpm install
```

`pnpm install` は `prepare` を走らせる。Panda の codegen と `lefthook install`。

`pnpm dev` が起動時にマイグレーションを当て、`data/` を作る。

## 開発者用のコマンド

- 開発サーバ起動: `pnpm dev`
- スタイル生成: `pnpm prepare`
- テスト: `pnpm test`
- エンドツーエンドテスト: `pnpm test:e2e`
- 型検査: `pnpm typecheck`
- 静的検査: `pnpm lint`
- 境界検査: `pnpm lint:boundary`
- フォーマット: `pnpm fmt`
