| 検査 | 規則 |
| --- | --- |
| `src/components/features/shell` 以外の feature が別の feature を import する | feature 同士は import しない |
| `src/components`、`src/routes`、`src/router.tsx` が `src/db` を import する | 画面は表を直接 import しない |
| 画面が `fetch` を呼ぶ | 取得はサーバ関数へ |
| `src/server` 以外が `src/server` を import する | サーバ関数の export を import できるのは画面と `src/lib` |
| `src/lib` が React を import する | `src/lib` に React コンポーネントは置かない |
| `src/components/ui` が `src/components/features`、`src/lib`、`src/server` を import する | `ui` は共通部品 |
| `shared/features` が React、Drizzle、`bun:sqlite`、`@libsql/client`、neverthrow、`@tanstack`、`src/server`、`src/lib` を import する | シートの計算は純粋 |
| `src/server/lib/db.ts` 以外が `bun:sqlite` または `drizzle-orm/bun-sqlite` を import する | 接続は `src/server/lib/db.ts` だけ |
| `@libsql/client`、`drizzle-orm/libsql`、`better-sqlite3` を import する | ホストされた DB も別の SQLite パッケージも使わない |
| `TURSO_DATABASE_URL` を読む | 接続先の環境変数は読まない |
| `src/server/lib/db.ts` 以外が `data/yorozu.db` を開く | ローカルファイルは `db.ts` だけ |
| `src/server/features` が Drizzle を import する | 読み書きは `src/server/lib/skill-sheet` |
| `queries` と `commands` が互いに import する | query と command は分ける |
| query が `insert`、`update`、`delete` を呼ぶ | query は書かない |
| `src/server/lib` 以外が `insert`、`update`、`delete` を呼ぶ | 書き込みはサーバの lib だけ |
