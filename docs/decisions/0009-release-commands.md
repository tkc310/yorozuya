# 0009 リリースを 2 つのコマンド（版を上げる PR・タグ付け）で行う

- 日付: 2026-10-19
- 状態: 採用

## 背景

リリースは「`package.json` の `version` を上げる PR → マージ → タグを push」を手で行っていた。版の打ち間違い、タグと `version` のずれ、CI が通っていないコミットへのタグ付けが起こり得た。

## 決定

- `make release-version ARGS=<patch|minor|major|版>`: `main` から `release/v<版>` を作り、`version` を上げてコミットし、PR を出す
- `make release-tag`: 最新の `main` で、CI が通っていることを確かめてから `v<version>` の注釈付きタグを付けて push する。失敗時は `ARGS=--retag` で付け直す（GitHub Release が公開済みなら止める）
- アプリの作成と GitHub Release の公開は、これまでどおりタグの push で動く Release ワークフローが行う
- 版の計算は `scripts/release/semver.ts` に分け、Vitest で検査する

## 理由

- `main` を守ったまま（直接 push しない）、人が判断するのは PR のマージだけにできる
- タグは `version` から作るので、ワークフローの「タグと version の一致」の検査で落ちることがなくなる

## 影響・トレードオフ

- 手元に `gh`（GitHub CLI）とログインが要る
- PR を作れなかったときは、ブランチの push までで止まり、PR はブラウザで作る
