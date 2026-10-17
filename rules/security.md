データベースはローカルファイル `data/yorozu.db` だけです。ホストされたデータベースは置きません。`TURSO_DATABASE_URL` は読みません。`@libsql/client` と `drizzle-orm/libsql` と `better-sqlite3` は使いません。`bun:sqlite` を import できるのは `src/server/lib/db.ts` だけです。

公開サーバと HTTP の API は置きません。データベースが要る処理は TanStack Start のサーバ関数です。画面は `src/db` と `src/server` を import せず、`fetch` を呼びません。

`data/yorozu.db` はコミットしません。見本 PDF の本文と、個人の経歴の本文はリポジトリに置きません。秘密情報はコードに書きません。

Valibot で弾いた入力は例外にしません。想定内の失敗は neverthrow の `Result` です。
