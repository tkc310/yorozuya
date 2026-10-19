# LP と Storybook の更新（GitHub Pages）

製品紹介ページ（LP）と Storybook は GitHub Pages で公開しています。

- LP: https://tkc310.github.io/yorozuya/
- Storybook: https://tkc310.github.io/yorozuya/storybook/

サイトは CI では更新しません。手元で組み立てて確かめ、`gh-pages` ブランチに置きます（[ADR-0005](./decisions/0005-site-on-pages-from-local.md)）。スクリーンショットと操作動画は Storybook のデモから撮ります（[ADR-0006](./decisions/0006-capture-from-storybook.md)）。

## よくある流れ

| やりたいこと               | すること                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| LP の文言・見た目を直す    | `site/index.html`・`site/style.css` を直して PR → マージ後に `make site-build ARGS=--skip-capture` → 確認 → `make site-publish` |
| 画面を変えたので撮り直す   | 画面の PR をマージ後に `make site-build` → 確認 → `make site-publish`                                                           |
| 新しい機能を LP で紹介する | `site/index.html` に節を足し、必要なら `scripts/site/capture.mjs` に撮影を足して PR → マージ後に公開                            |
| Storybook だけ最新にする   | `make site-build ARGS=--skip-capture` → 確認 → `make site-publish`                                                              |

LP の原稿（`site/`）や撮影の手順を変えたら、ふつうのコードと同じく PR でレビューしてから公開します。公開は PR とは別に、マージした `main` から行います。

## 構成

| 場所                                       | 中身                                                             |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `site/`                                    | LP の原稿（`index.html`・`style.css`）。文言はここを直す         |
| `src/components/features/SkillSheet/Demo/` | 撮影用のデモ。見本の JSON を読み、サーバもデータベースも使わない |
| `scripts/site/capture.mjs`                 | デモから撮る手順（スクリーンショット 5 枚と操作動画）            |
| `scripts/site/build.ts`                    | Storybook の組み立て → 撮影 → LP の写しを `.site/` に作る        |
| `scripts/site/publish.ts`                  | `.site/` を `gh-pages` に 1 コミットで強制プッシュする           |
| `.site/`                                   | 組み立てた結果。コミットしない（`.gitignore` 済み）              |

撮影はデモのストーリー（`スキルシート/デモ` の `見本`）から行う。アプリ本体（`make dev`）は使わないので、`data/yorozuya.db` の中身は変わらない。

## 手順

1. 準備を確かめる。
   - `make install` 済みであること。
   - 撮影するブラウザ: `make site-build` が撮影の前に Playwright の Chromium を入れる。Playwright が対応していない OS（macOS 13 など）では入れられないので、そのときは手元の Google Chrome（無ければ Microsoft Edge）で撮る。どちらも無ければ Google Chrome を入れておく。
   - 操作動画はブラウザの機能（画面の配信と MediaRecorder）で録るので、ffmpeg は要らない。
   - 動画を mp4 にもしたいときは、手元に `ffmpeg` があること（無ければ webm だけで公開する）。
   - `origin`（tkc310/yorozuya）にプッシュできること。
2. 公開したい内容のブランチ（ふつうは最新の `main`）にいることを確かめる。未コミットの変更があっても組み立てられるが、公開のコミットメッセージに「未コミットの変更」と残る。
3. 組み立てる: `make site-build`
   - 文言だけを直したときは `make site-build ARGS=--skip-capture` で撮影を省ける（前回の `.site/media` を使う）。
4. 確かめる: `make site-preview` を実行し、表示された URL を開く。
   - LP の画像 5 枚（home / editor / sheet-first / sheet-details / prompt）が出ている
   - 動画が再生でき、肩書・希望単価・主要スキルの変更がプレビューに映っている
   - 「Storybook を開く」から Storybook が開き、ストーリーが表示される
   - スマートフォンの幅でも横にはみ出さない
   - 画像や動画に、実在の人物や個人の経歴が写っていない（見本の「新究羅 理定」だけ）
5. 公開する: `make site-publish`
   - 先に送らずに確かめたいときは `make site-publish ARGS=--dry-run`
6. 公開先を開いて、4 と同じ点を確かめる。反映まで 1〜2 分かかることがある。

## 初回だけ

`gh-pages` を初めてプッシュしたあと、GitHub Pages の公開元を設定する。

```bash
gh api -X POST repos/tkc310/yorozuya/pages -f "source[branch]=gh-pages" -f "source[path]=/"
```

すでに設定済みなら 409 が返るので、そのままでよい。GitHub の Settings → Pages で「Deploy from a branch / gh-pages / (root)」になっていることでも確かめられる。

## 画面や機能を変えたとき

- 撮影の手順が画面の名前（ラベル・ボタン名）に頼っているので、名前を変えたら `scripts/site/capture.mjs` も直す。撮影が失敗したときは、まずここを疑う。
- 新しい機能を紹介するときは、`site/index.html` に節を足し、必要なら `capture.mjs` に撮影を足す。画像は `.site/media/` に出し、LP からは `media/〜` で参照する。
- デモのデータは `fixtures/dummy-skill-sheet.json`。架空の人物だけを使い、個人の経歴は入れない（`rules/security.md`）。

## うまくいかないとき

- Storybook の組み立てで `multiple entries detected` と出る: TanStack Start のプラグインが残っている。下の iframe.html の項目と同じく `.storybook/main.ts` を確かめる。
- 「撮影に使えるブラウザがありません」と出る: Playwright の Chromium も Google Chrome・Microsoft Edge も起動できなかった。Google Chrome を入れるか、対応している OS なら `make browsers` を実行してから組み立て直す。
- 撮影中に Chrome のウィンドウは開かない（画面に出さずに撮る）。撮影の様子を見たいときは `SITE_CAPTURE_HEADED=1 make site-build` で実行する。
- `Storybook の出力に iframe.html がありません` と出る: アプリの Vite 設定のプラグインが Storybook の静的ビルドの出力を変えている。`.storybook/main.ts` の `viteFinal` で、静的ビルドのときに外しているプラグイン（名前が `tanstack` で始まるもの）を確かめる。
- 撮影で要素が見つからない: 画面のラベルやボタン名が変わっている。`scripts/site/capture.mjs` を直す。

## してはいけないこと

- `.site/` やスクリーンショット・動画をリポジトリにコミットしない。
- CI（`.github/workflows`）にサイトの公開を足さない。
- `make dev` のアプリを操作して撮らない（手元のシートが書き換わる）。
