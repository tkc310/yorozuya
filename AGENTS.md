## アーキテクチャ境界

このプロジェクトの境界ルールは ESLint と追加チェックで自動検証されます。

### ESLint で検証されるルール

`eslint.config.js` で以下を検証：

- 画面（`src/components`, `src/routes`）は `src/db` を直接 import しない
- `src/components/ui` は `features`, `lib`, `server` を import しない
- `shared/features` は React、Drizzle、`bun:sqlite`、`neverthrow`、`@tanstack` を import しない
- `src/lib` は React を import しない
- `src/server/lib/db.ts` 以外は `bun:sqlite` を import しない
- ホストされた DB パッケージ（`@libsql/client` 等）は使用しない
- Feature 同士は import しない（`shell` は除く）
- Queries と commands は相互に import しない
- 画面は `fetch` を直接呼ばない
- `TURSO_DATABASE_URL` は使用しない

### 追加チェックで検証されるルール

`scripts/check-advanced-boundaries.mjs` で以下を検証：

- `data/yorozu.db` を開けるのは `src/server/lib/db.ts` だけ
- `CREATE TABLE` は書かない（マイグレーションを使用）
- `insert`, `update`, `delete` は `repository.ts` と `seed.ts` でのみ使用

### 実行方法

```bash
pnpm lint          # oxlint + ESLint + 追加チェック
pnpm lint:boundary # ESLint + 追加チェックのみ
```

| 検査 | 規則 | 検証方法 |
| --- | --- | --- |
| `src/components/features/shell` 以外の feature が別の feature を import する | feature 同士は import しない | ESLint |
| `src/components`、`src/routes` が `src/db` を import する | 画面は表を直接 import しない | ESLint |
| 画面が `fetch` を呼ぶ | 取得はサーバ関数へ | ESLint |
| `src/lib` が React を import する | `src/lib` に React コンポーネントは置かない | ESLint |
| `src/components/ui` が `src/components/features`、`src/lib`、`src/server` を import する | `ui` は共通部品 | ESLint |
| `shared/features` が React、Drizzle、`bun:sqlite`、`@libsql/client`、neverthrow、`@tanstack` を import する | シートの計算は純粋 | ESLint |
| `src/server/lib/db.ts` 以外が `bun:sqlite` または `drizzle-orm/bun-sqlite` を import する | 接続は `src/server/lib/db.ts` だけ | ESLint |
| `@libsql/client`、`drizzle-orm/libsql`、`better-sqlite3`、`node:sqlite` を import する | ホストされた DB も別の SQLite パッケージも使わない | ESLint |
| `TURSO_DATABASE_URL` を読む | 接続先の環境変数は読まない | ESLint |
| `src/server/lib/db.ts` 以外が `data/yorozu.db` を開く | ローカルファイルは `db.ts` だけ | 追加チェック |
| `src/server/features/repository.ts` 以外の `src/server/features` が Drizzle を import する | 読み書きは `SkillSheetRepository` だけ | ESLint |
| `queries` と `commands` が互いに import する | query と command は分ける | ESLint |
| query が `insert`、`update`、`delete` を呼ぶ | query は書かない | 追加チェック |
| `src/db/seed.ts` と `src/server/features/repository.ts` 以外が `insert`、`update`、`delete` を呼ぶ | 初期データは `seed.ts`、変更はリポジトリ | 追加チェック |
| `CREATE TABLE` を書く | マイグレーションを使用 | 追加チェック |
