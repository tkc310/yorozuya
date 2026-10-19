# 0006 LP の画像と動画は Storybook のデモから撮り、動画は ffmpeg を使わない

- 日付: 2026-10-19
- 状態: 採用

## 背景

撮影のたびに開発サーバとデータベースを用意すると、手元の個人データが写り込むおそれがある。また macOS 13 では Playwright の ffmpeg が使えず、動画を撮れなかった。

## 決定

- 撮影は静的ビルドした Storybook のストーリー（`トップ/画面`、`スキルシート/デモ`）から行う。デモは見本の JSON（`fixtures/dummy-skill-sheet.json`）を読み、サーバもデータベースも使わない
- 本番ビルドの Storybook では TanStack Start のプラグインを外す
- 動画は Chrome DevTools Protocol の screencast で得たフレームを、ブラウザの MediaRecorder で WebM にする。ブラウザは Playwright の Chromium、無ければ手元の Chrome・Edge を使う
- 動画を撮れなければ、動画の箇所（`<!-- video:start -->`〜`<!-- video:end -->`）を外して公開する

## 理由

撮影に個人データが混ざらず、どの環境でも同じ見本で撮れる。追加の道具を入れずに動画を作れる。

## 影響・トレードオフ

- デモはサーバ関数を使わないので、保存などサーバを通る操作は撮れない
- フレームの間隔は画面の変化に依存するので、動画の滑らかさは環境で変わる
