# 0001 データは手元の SQLite ファイルだけに置き、公開サーバと HTTP API は置かない

- 日付: 2026-10-19（それまでの方針を記録）
- 状態: 採用

## 背景

よろずやはフリーランス個人の書類（経歴・単価・連絡先など）を扱う。クラウドに置くと、アカウント管理・漏えい対策・運用費が必要になる。

## 決定

- データベースはローカルファイル `data/yorozuya.db` だけ。ホストされたデータベースは置かず、`TURSO_DATABASE_URL` は読まない
- `bun:sqlite` を import できるのは `src/server/lib/db.ts` だけ。`@libsql/client`・`drizzle-orm/libsql`・`better-sqlite3`・`node:sqlite` は使わない
- 公開サーバと HTTP の API は置かない。データベースが要る処理は TanStack Start のサーバ関数にし、画面はそれを直接 import する（`src/server/db` の import と `fetch` はしない）
- 書き込み（`insert`・`update`・`delete`）は `src/server/db/seed.ts` と 各 feature の `src/server/features/<feature>/repository.ts` だけ
- `data/yorozuya.db`、見本 PDF の本文、個人の経歴の本文、秘密情報はリポジトリに置かない

詳細な規則は [`rules/security.md`](../../rules/security.md)。

## 理由

- 個人のデータが手元から出ないので、利用者が安心して使える
- 書き込みの場所を絞ると、データを壊す変更をレビューで見つけやすい

## 影響・トレードオフ

- 端末をまたいだ同期はできない。必要なら JSON の書き出し・読み込みで移す
- 規則は `make lint-boundary`（ESLint と `scripts/check-advanced-boundaries.mjs`）で機械的に検査する
