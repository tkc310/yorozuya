<p align="center">
  <img src="src/assets/images/logo.svg" alt="よろずや" width="360">
</p>

<p align="center">
  フリーランスとして働く人のための、手元で動く小さな道具箱。
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black">
  <img alt="TanStack Start" src="https://img.shields.io/badge/TanStack_Start-FF4154">
  <img alt="Bun" src="https://img.shields.io/badge/Bun-1.4-000000?logo=bun&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-local-003B57?logo=sqlite&logoColor=white">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</p>

---

## よろずやとは

よろずやは、フリーランスの仕事のまわりにある細かな作業を片づけるためのアプリです。いくつかの機能をひとつのアプリにまとめていて、機能はこれから順に増やしていきます。

- **手元だけで動く** — データはパソコンの中の SQLite ファイルに保存されます。クラウドやアカウントは要りません。
- **印刷できる** — 画面で見たままの A4 レイアウトで、印刷や PDF 保存ができます。
- **macOS アプリにできる** — ビルドすると `.app` になり、Dock から起動できます。

## 機能

| 機能         | できること                                                                                                                                                                                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| スキルシート | プロフィール・保有技術・職務経歴を入力し、書類選考で読みやすい A4 レイアウトでプレビューします。1 ページ目に人物・基本情報・強み（ハイライトと主要スキル）をまとめ、経験年数の自動計算、項目ごとの表示切り替え、印刷・PDF 保存、JSON の書き出し・読み込みに対応しています。手元のスキルシートから読み込み用の JSON を生成 AI に作ってもらうプロンプトも作れます。 |

起動するとトップページ（`/`）が開き、そこから各機能に移動できます。

## ダウンロード

[Releases](https://github.com/tkc310/yorozuya/releases) から、お使いの Mac に合う zip をダウンロードします。

| Mac                       | ファイル                          |
| ------------------------- | --------------------------------- |
| Apple シリコン（M1 以降） | `Yorozuya-vX.Y.Z-macos-arm64.zip` |
| Intel                     | `Yorozuya-vX.Y.Z-macos-x64.zip`   |

展開した `Yorozuya.app` をアプリケーションフォルダに移して起動します。アプリは公証していないため、初回は Finder で右クリックして「開く」を選んでください。

## はじめかた

### 必要なもの

[`.tool-versions`](./.tool-versions) に書かれたバージョンを使います。

- Node.js 24
- pnpm 10
- Bun 1.4

[mise](https://mise.jdx.dev/) か [asdf](https://asdf-vm.com/) を使っているなら、次のコマンドでまとめて入ります。

```bash
mise install   # または asdf install
```

### ソースから動かす

```bash
git clone https://github.com/tkc310/yorozuya.git
cd yorozuya
pnpm install
pnpm dev
```

<http://127.0.0.1:46280> を開きます。初回起動時に `data/yorozuya.db` が作られ、見本のデータが入ります。

### macOS アプリを自分で作る

```bash
pnpm build:app
```

`dist/Yorozuya.app` ができます。起動するとサーバが裏で立ち上がり、ブラウザで <http://127.0.0.1:4628> が開きます。Dock から終了するとサーバも止まります。

## データの保存場所

| 起動方法     | 保存先                                                    |
| ------------ | --------------------------------------------------------- |
| `pnpm dev`   | `data/yorozuya.db`                                        |
| macOS アプリ | `~/Library/Application Support/Yorozuya/data/yorozuya.db` |

データは外部に送られません。バックアップを取るには、このファイルを複製するか、スキルシートの「JSONを書き出す」を使ってください。`data/yorozuya.db` はコミットしないでください。

## 開発

### コマンド

| コマンド             | 内容                                             |
| -------------------- | ------------------------------------------------ |
| `pnpm dev`           | 開発サーバを起動する                             |
| `pnpm build:app`     | macOS アプリを作る                               |
| `pnpm storybook`     | Storybook を起動する（<http://127.0.0.1:6006>）  |
| `pnpm prepare`       | Panda CSS のスタイルを生成し、Git フックを入れる |
| `pnpm test`          | ユニットテストと Storybook の play を実行する    |
| `pnpm test:e2e`      | Playwright で e2e テストを実行する               |
| `pnpm typecheck`     | 型を検査する                                     |
| `pnpm lint`          | 静的検査と境界検査を実行する                     |
| `pnpm lint:boundary` | import の境界とデータベース操作の場所を検査する  |
| `pnpm fmt`           | フォーマットを検査する                           |

`git push` の前に、[lefthook](https://github.com/evilmartians/lefthook) が typecheck・lint・fmt を実行します。

### ディレクトリ構成

```
.
├── shared/features/      # 画面とサーバで共有する純粋な計算（React や DB に依存しない）
├── src/
│   ├── routes/           # TanStack Router のファイルベースルーティング
│   ├── components/
│   │   ├── ui/           # どの画面でも使う共通部品
│   │   ├── layouts/      # 全画面に共通する枠（ヘッダー、パンくずリスト）
│   │   └── features/     # 1 ページ分の機能（Home、SkillSheet）
│   ├── server/
│   │   ├── features/     # サーバ関数（queries と commands）とリポジトリ
│   │   └── lib/db.ts     # データベースを開く唯一の場所
│   ├── db/               # スキーマ、マイグレーション、見本データ
│   └── styles/           # デザイントークン
├── tests/                # e2e テスト
└── scripts/app/          # macOS アプリのビルドと起動
```

コンポーネントの置き方は [`src/components/COMPONENT_STRUCTURE.md`](./src/components/COMPONENT_STRUCTURE.md) にまとめています。

### 設計のルール

次のルールは `pnpm lint:boundary` で機械的に検査します。詳しくは [`rules/security.md`](./rules/security.md) を参照してください。

- データベースはローカルファイルだけです。ホストされたデータベースや公開 HTTP API は置きません。
- 画面はサーバ関数を直接 import します。`src/db` の import と `fetch` の呼び出しはしません。
- 書き込み（`insert` / `update` / `delete`）は、リポジトリと見本データの投入にしか書けません。
- 機能（`src/components/features/*`）同士は import しません。
- 想定内の失敗は例外にせず、neverthrow の `Result` で返します。

### 技術スタック

| 分類           | 使っているもの                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フレームワーク | [TanStack Start](https://tanstack.com/start) / React 19                                                                                                    |
| 言語           | TypeScript                                                                                                                                                 |
| スタイル / UI  | [Panda CSS](https://panda-css.com/) / [Ark UI](https://ark-ui.com/)。トークンは[デジタル庁デザインシステム](https://design.digital.go.jp/)に合わせています |
| フォーム       | TanStack Form                                                                                                                                              |
| データ取得     | TanStack Query / サーバ関数（`createServerFn`）                                                                                                            |
| バリデーション | Valibot                                                                                                                                                    |
| エラー         | neverthrow                                                                                                                                                 |
| データベース   | `bun:sqlite` / Drizzle ORM                                                                                                                                 |
| ビルド         | Vite+                                                                                                                                                      |
| 検査           | Oxlint / ESLint / Oxfmt                                                                                                                                    |
| テスト         | Vitest / React Testing Library / Storybook / Playwright                                                                                                    |
| 配布           | Bun のシングルバイナリと AppleScript による macOS アプリ                                                                                                   |

## コントリビュート

Issue や Pull Request を歓迎します。開発の流れ、テスト、リリースの手順は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## ライセンス

[MIT](./LICENSE) © tkc310

デザイントークンの値は [@digital-go-jp/design-tokens](https://github.com/digital-go-jp/design-tokens)（MIT License, Copyright (c) 2023 デジタル庁）に合わせています。
