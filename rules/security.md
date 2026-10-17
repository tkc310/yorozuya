データベースはローカルファイル `data/yorozuya.db` だけだ。ホストされたデータベースは置かない。`TURSO_DATABASE_URL` は読まない。`@libsql/client` と `drizzle-orm/libsql` と `better-sqlite3` と `node:sqlite` は使わない。`bun:sqlite` を import できるのは `src/server/lib/db.ts` だけだ。

公開サーバと HTTP の API は置かない。データベースが要る処理は TanStack Start のサーバ関数だ。画面は `src/server/features` のサーバ関数を直接 import し、`src/db` は import せず、`fetch` を呼ばない。

`data/yorozuya.db` はコミットしない。見本 PDF の本文と、個人の経歴の本文はリポジトリに置かない。秘密情報はコードに書かない。

Valibot で弾いた入力は例外にしない。想定内の失敗は neverthrow の `Result` だ。
