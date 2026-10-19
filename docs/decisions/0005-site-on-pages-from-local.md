# 0005 LP と Storybook は手元で組み立てて gh-pages に置く（CI では更新しない）

- 日付: 2026-10-19
- 状態: 採用

## 背景

製品紹介ページ（LP）と Storybook を GitHub Pages で公開したい。スクリーンショットと操作動画は実際の画面から撮るので、ブラウザと時間が要る。

## 決定

- `make site-build` で Storybook の組み立て → 撮影 → LP の写しを `.site/` に作り、`make site-preview` で確かめ、`make site-publish` で `gh-pages` ブランチに 1 コミットで強制プッシュする
- CI では動かさない。手順は `.claude/skills/publish-site/SKILL.md`
- `.site/` と撮った画像・動画はコミットしない

## 理由

公開の時期を人が決められる。CI に撮影用のブラウザや権限を持たせずに済む。

## 影響・トレードオフ

- 画面を変えても、公開サイトは自動では追従しない。画面を変えた PR ではサイトの更新が要るかを判断する
- `gh-pages` の履歴は残らない（毎回 1 コミット）
