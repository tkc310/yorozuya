# 0011 祝日は内閣府の CSV をリポジトリに置き、GitHub Pages の JSON から取り込む

- 日付: 2026-11-18
- 状態: 採用

## 背景

作業報告書では、稼働日と残り稼働日数を数えるために祝日が要る。祝日の公表元は内閣府「国民の祝日について」の CSV（<https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv>、Shift_JIS、1955 年から翌年まで）で、デジタル庁が運営する e-Gov データポータルにも同じ URL で載っている。翌年分は毎年 2 月に掲載される。

よろずやは手元だけで動かす方針（ADR 0001）なので、利用者のデータを外に出さずに祝日を最新にしたい。

## 決定

- GitHub Actions（`.github/workflows/holidays.yml`）が毎年 3 月 1 日 9:00（JST）に CSV を取得し、`holidays/syukujitsu.csv`（UTF-8 に直した写し）と `holidays/holidays.json` を `main` にコミットし、JSON を `gh-pages` の `holidays.json` に載せる。手で動かすこともできる（workflow_dispatch）。手元では `make holidays-update`
- `make site-build` も `holidays/holidays.json` を `.site/holidays.json` に写す。`make site-publish` で `gh-pages` を置き換えても消えない
- アプリは `https://tkc310.github.io/yorozuya/holidays.json` を取得し、SQLite（`holidays`・`holiday_feeds`）に取り込む。取りに行くのは、取り込み済みのデータが開いた年を含まないときだけ（起動して最初に作業報告書を開いたとき、または範囲の外の年を開いたとき）。同じ起動の中では 1 つの年につき 1 回しか試さない
- まだ取り込めていない年（翌年分の公表前、オフラインで初めて開いたときなど）は、祝日法のルール（`holiday.service.ts`）から推定し、画面に「推定」と出す
- 外へ出る通信はこの GET だけにし、`src/server/lib/holiday-feed.ts` と `scripts/holidays/update.ts` の 2 か所でだけ `fetch` を許す（ESLint）。利用者のデータは送らない

## 理由

- 公表された CSV を正本にすると、法改正や特例にもデータの更新だけで追従できる
- 内閣府のサーバをアプリから直接叩かず、変換済みの JSON を GitHub Pages から配ると、文字コードの変換や形の検証をアプリに持たせずに済み、取得先も 1 か所に絞れる
- 翌年分が 2 月に掲載されるので、3 月 1 日に動かせば翌年の計画を立てる前に取り込める

## 影響・トレードオフ

- 公開リポジトリでは、60 日間コミットなどの動きがないと GitHub がスケジュール実行を止める。止まったら Actions の画面で有効にし直すか、手で動かす
- 年の途中で祝日が変わっても、取り込み済みの範囲の年は取り直さない。必要なら手で `make holidays-update` を動かして公開し、アプリの `data/yorozuya.db` の `holiday_feeds` を消すと取り直す
- 推定は 2000〜2099 年の範囲で、内閣府の公表値（2019・2020・2025〜2027 年）と突き合わせるテストを置いている
