# 0013 祝日データの取得と配信は tkc310/jp-holidays に分ける

- 日付: 2026-11-18
- 状態: 採用（0012 を置き換える）

## 背景

0012 では、内閣府の祝日 CSV を取得する GitHub Actions と変換した JSON をこのリポジトリに置き、よろずやの GitHub Pages（`gh-pages`）で配っていた。祝日データはよろずや以外からも使えるほうが便利で、サイトの公開（`make site-publish` が `gh-pages` を置き換える）とも絡まないほうが扱いやすい。

## 決定

- 祝日 CSV の取得・変換・配信は [tkc310/jp-holidays](https://github.com/tkc310/jp-holidays) が受け持つ。毎年 3 月 1 日に内閣府の CSV（<https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv>）を取得し、`https://tkc310.github.io/jp-holidays/holidays.json` で配る
- よろずやはその JSON を取得して SQLite に取り込むだけにする。取得の条件（取り込み済みの範囲が開いた年を含まないときだけ、同じ起動の中で同じ年は 1 回）と、取り込めていない年を祝日法のルールで推定する点は 0012 のまま
- このリポジトリから祝日の Actions・取得スクリプト・`make holidays-update`・サイトへの写しを外す。外へ出る `fetch` は `src/server/lib/holiday-feed.ts` だけに許す

## 理由

- 祝日データを独立した配信元にすると、ほかの道具からも同じ URL で使える
- よろずやのサイト公開の手順が祝日データに気を配らずに済む

## 影響・トレードオフ

- 配信の形（`kind: "jp-holidays"`、`version: 1`）を変えるときは、jp-holidays と `holiday.schema.ts` を合わせて直す
- jp-holidays の GitHub Pages が止まると、取り込み済みの範囲の外の年は推定のままになる
