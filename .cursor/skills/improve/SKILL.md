---
name: improve
description: よろずや自体を改善するときに使う。「バックログから 1 件直して」「この指摘を直して再発しないようにして」と頼まれたとき、または会話で受けた指摘を直したあとに使う。1 件直し、再発防止を足し、改善ログに記録して PR にする。
---

# 改善を 1 件回す

[`docs/improvement-loop.md`](../../../docs/improvement-loop.md) の手順をエージェントが実行するためのスキル。

## 手順

1. **選ぶ**
   - 頼まれたものがあればそれ。無ければ `docs/improvement/backlog.md` と未解決の Issue（ラベル `improvement`）から選ぶ
   - 優先度: データを失う・壊す > 設計のルールの破れ > 提出物の品質 > 開発体験 > 見た目の好み
   - 1 PR 1 改善。大きいものは分割し、残りをバックログに戻す
2. **読む**
   - `rules/security.md`、関連する ADR（`docs/decisions/`）と指示書（`docs/specs/`）
   - `docs/improvement/log.md` で、同じ種類の改善が過去にないか確かめる（あれば仕組みが足りていない）
3. **直す**
   - 機能を足す・大きく変えるなら、先に `docs/specs/` に指示書を書いて確認を取る
   - 値や方針を変えるなら `docs/decisions/` に ADR を足し、README の表にも足す
   - スキーマを変えたら `make db-generate`
4. **再発を防ぐ（省略しない）**
   - 境界・データベースの扱い → `eslint.config.js` か `scripts/check-advanced-boundaries.mjs`
   - 書き方 → `vite.config.ts` の `lint` か `oxlint-plugins/`
   - 項目の足し忘れ → 対応表を `Record<型, …>` にする
   - 振る舞い → `*.test.ts(x)`、ストーリーの `play`（`src/components/stories.test.tsx` に登録）、`tests/*.spec.ts`
   - 判断基準 → `rules/security.md`・`AGENTS.md`・`COMPONENT_STRUCTURE.md` か ADR
   - 手順 → `Makefile` のコマンドか `.cursor/skills/` のスキル
5. **確かめる**
   - `make check` が通ること。画面を変えたら `make test-e2e` も
   - 画面や LP を変えたら、公開サイトの更新が要るかを判断し、要るなら `publish-site` スキルを案内する
6. **記録して出す**
   - `docs/improvement/log.md` の表の先頭に 1 行追記（日付・種別・内容・再発防止）。仕組みにできなければ再発防止は「—」とし、理由をバックログに残す
   - バックログの該当行を消す。途中で見つけた別の改善はバックログに足す
   - Conventional Commits でコミットし（`conventional-commits` スキル）、PR テンプレートのチェックリストを埋めて PR を作る

## やってはいけないこと

- 検査を通すために規則を緩める・外す。緩めるなら ADR に理由を書き、人の承認を得る
- `rules/security.md` に反する変更（ホストされたデータベース、公開 API、個人の経歴の本文のコミットなど）
- 複数の改善を 1 つの PR に混ぜる
- 古い ADR を消す（状態を「廃止（→ NNNN）」にして新しい ADR を足す）
