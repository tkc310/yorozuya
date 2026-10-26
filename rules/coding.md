ファイル名の接尾辞で役割を示す。

| 接尾辞        | 置くもの                                                                                               | 例                                     |
| ------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `.schema.ts`  | データの形を決めるもの。Valibot のスキーマ（型と検証ルール）、型、定数、生成 AI に渡すプロンプトの定義 | `profile.schema.ts`、`sheet.schema.ts` |
| `.service.ts` | 形を受け取って計算する純粋関数                                                                         | `skill.service.ts`                     |
| `.test.ts`    | 対象と同じ名前のテスト                                                                                 | `import-json.schema.test.ts`           |

`-schema.ts` や、接尾辞の無い名前（`sheet.ts`）にはしない。`src/shared/features` の `.schema.ts` には関数を置かず、関数は `.service.ts` に置く。

1 つのサーバ関数だけが使う小さなスキーマは、`commands/` や `queries/` のそのファイルの中に置いてよい。複数の場所で使うスキーマは `.schema.ts` に切り出す。

画面とサーバの両方で使うものだけを `src/shared/features/<feature>/` に置く。片方だけで使うものは、使う側のそばに置く（例: 画面だけで使うインポート用プロンプトは `ImportPromptDialog/import-prompt.schema.ts`）。
