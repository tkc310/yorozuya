Valibot のスキーマ（型と検証ルールをまとめたもの）を置くファイルは `<名前>.schema.ts` と名付ける（例: `profile.schema.ts`、`import-json.schema.ts`）。テストは `<名前>.schema.test.ts` だ。`-schema.ts` や接尾辞の無い名前にはしない。

1 つのサーバ関数だけが使う小さなスキーマは、`commands/` や `queries/` のそのファイルの中に置いてよい。複数の場所で使うスキーマは `.schema.ts` に切り出す。
