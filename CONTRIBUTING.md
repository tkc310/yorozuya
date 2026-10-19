# コントリビュートガイド

よろずやへの関心をありがとうございます。このドキュメントでは、開発環境の用意から Pull Request、リリースまでの手順を説明します。

このリポジトリへの貢献は、[MIT ライセンス](./LICENSE)のもとで提供されたものとして扱います。

- [開発環境](#開発環境)
- [開発の流れ](#開発の流れ)
- [テスト](#テスト)
- [よくある作業](#よくある作業)
- [CI](#ci)
- [リリース](#リリース)

## 開発環境

### 必要なもの

[`.tool-versions`](./.tool-versions) のバージョンに合わせます。CI も同じファイルを読みます。

| ツール  | バージョン     |
| ------- | -------------- |
| Node.js | 24             |
| pnpm    | 10             |
| Bun     | 1.4            |
| make    | （macOS 標準） |

[mise](https://mise.jdx.dev/) か [asdf](https://asdf-vm.com/) を使うと、まとめて入ります。

```bash
mise install   # または asdf install
```

### セットアップ

```bash
git clone https://github.com/tkc310/yorozuya.git
cd yorozuya
make install   # prepare で Panda CSS のコード生成と Git フックの導入も走る
make dev       # http://127.0.0.1:46280
```

初回起動時に `data/yorozuya.db` が作られ、見本のデータが入ります。まっさらに戻したいときは、開発サーバを止めてこのファイルを消してください。

### コマンド

コマンドは [`Makefile`](./Makefile) にまとめてあり、`make` で一覧が出ます。中身は `package.json` のスクリプトや `pnpm exec` を呼ぶだけです。追加の引数は `ARGS` で渡します（例: `make test ARGS="src/components/features/SkillSheet"`）。コマンドを足すときは、`package.json` のスクリプトと `Makefile` の両方に足し、ドキュメントには `make` の形で書いてください。

## 開発の流れ

1. `main` から作業ブランチを切る（例: `feat/estimate`、`fix/preview-page-break`）
2. 変更し、テストやストーリーを足す
3. 検査を通す

   ```bash
   make check   # typecheck・lint・fmt・test をまとめて実行する
   ```

   `git push` の前に [lefthook](./lefthook.yml) が typecheck・lint・fmt を実行します。フォーマットの崩れは `make fmt-fix` で直せます。

4. Pull Request を作る。テンプレートのチェックリストを埋めてください
5. マージすると、GitHub が作業ブランチを自動で消します（Settings の「Automatically delete head branches」）。手元に残ったブランチや、設定前に残ったブランチは `make branch-prune` で一覧し、`make branch-prune ARGS=--apply` で消します。未マージのブランチと `main`・`gh-pages` は消しません

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/) で書きます。1 コミットには 1 つの関心事だけを入れます。

```
feat(skill-sheet): 職務経歴を並べ替えられるようにする
fix(app): パンくずリストのリンク先を直す
docs: リリース手順を書く
```

| type       | 使いどころ                     |
| ---------- | ------------------------------ |
| `feat`     | 機能の追加・変更               |
| `fix`      | 不具合の修正                   |
| `perf`     | 性能の改善                     |
| `refactor` | 振る舞いを変えない整理         |
| `test`     | テストだけの変更               |
| `docs`     | ドキュメントだけの変更         |
| `build`    | ビルドや依存、検査ツールの変更 |
| `ci`       | GitHub Actions の変更          |
| `chore`    | 上のどれにも当たらない雑務     |

scope には `skill-sheet` や `app` など、変更した領域を書きます。

### 守ってほしいこと

- 設計のルール（[`rules/security.md`](./rules/security.md)）に従う。主なものは `make lint-boundary` が検査します
- コンポーネントの置き方は [`src/components/COMPONENT_STRUCTURE.md`](./src/components/COMPONENT_STRUCTURE.md) に従う
- 見本 PDF の本文や、実在する個人の経歴をリポジトリに入れない
- `data/yorozuya.db` や秘密情報をコミットしない
- 直したことは [`docs/improvement/log.md`](./docs/improvement/log.md) に 1 行記録し、再発防止を足す。手順は [改善ループ](./docs/improvement-loop.md)、判断の記録は [`docs/decisions/`](./docs/decisions/README.md)

## テスト

| 種類           | 置き場所                       | 実行            |
| -------------- | ------------------------------ | --------------- |
| ユニットテスト | 対象の隣に `*.test.ts(x)`      | `make test`     |
| ストーリー     | 部品の隣に `index.stories.tsx` | `make test`     |
| e2e            | `tests/*.spec.ts`              | `make test-e2e` |

- ストーリーの `play` は [`src/components/stories.test.tsx`](./src/components/stories.test.tsx) から Vitest で実行されます。ストーリーを足したら、ここにも登録してください
- `Link` などルーターを使う部品のストーリーには、[`.storybook/withRouter.tsx`](./.storybook/withRouter.tsx) のデコレーターを付けます
- e2e は開発サーバを起動して実行します。初回は `make browsers` でブラウザを入れてください

## よくある作業

### 機能を足す

1. `src/components/features/<機能名>/` に画面を作る（ほかの機能は import しない）
2. `src/routes/<機能名>.tsx` にルートを作り、`staticData.crumb` にパンくずリストの名前を書く
3. トップページ（`src/components/features/Home/index.tsx`）の `tools` に 1 件足す
4. データベースが要るなら、`src/server/features/<機能名>/` に `queries` と `commands` のサーバ関数を作る

### データベースのスキーマを変える

1. `src/db/schema.ts` を変える
2. マイグレーションを生成する

   ```bash
   make db-generate
   ```

3. 生成された `src/db/migrations/` のファイルをコミットする

マイグレーションは開発サーバとアプリの起動時に自動で適用されます。表を作る SQL を手で書かないでください。

### 見た目を確かめる

```bash
make storybook   # http://127.0.0.1:6006
```

### ダミーデータで確かめる

[`fixtures/dummy-skill-sheet.json`](./fixtures/dummy-skill-sheet.json) は、架空の人物（経歴 10 年以上のデザインエンジニア）のスキルシートです。スキルシートの「JSONを読み込む」で読み込むと、職務経歴が 8 件ある、複数ページのプレビューを確かめられます。読み込むと今の内容は置き換わるので、必要なら先に「JSONを書き出す」で控えを取ってください。

このファイルはテストと、製品紹介（GitHub Pages）の撮影用デモでも使います。架空の人物だけを入れてください。

手元の見本 PDF や実在する人の経歴は `sample/` に置いてください。`sample/` は Git で無視され、追跡されません。

## CI

GitHub Actions で次のワークフローが動きます。

| ワークフロー                               | きっかけ                       | 内容                                                              |
| ------------------------------------------ | ------------------------------ | ----------------------------------------------------------------- |
| [CI](./.github/workflows/ci.yml)           | Pull Request、`main` への push | typecheck・lint・fmt・test、e2e、macOS アプリのビルド             |
| [Release](./.github/workflows/release.yml) | `v*.*.*` タグの push           | Apple Silicon / Intel 向けのアプリを作り、GitHub Release に載せる |
| [Dependabot](./.github/dependabot.yml)     | 毎週                           | 依存と GitHub Actions の更新 Pull Request                         |

ツールのバージョンは [`.github/actions/setup`](./.github/actions/setup/action.yml) が `.tool-versions` から入れます。

## リリース

バージョンは [Semantic Versioning](https://semver.org/lang/ja/) に従い、`package.json` の `version` だけで管理します。アプリの `Info.plist` もこの値を使います。

### 手順

1. `main` を最新にし、CI が通っていることを確かめる
2. `package.json` の `version` を上げ、コミットして `main` に入れる

   ```bash
   git switch -c release/v0.2.0
   # package.json の "version" を "0.2.0" にする
   git commit -am "chore(release): v0.2.0"
   # Pull Request を作ってマージする
   ```

3. マージしたコミットにタグを付けて push する

   ```bash
   git switch main && git pull
   git tag v0.2.0
   git push origin v0.2.0
   ```

4. [Release ワークフロー](./.github/workflows/release.yml) が次を行う
   - タグと `package.json` の `version` が一致するか確かめる（違えば失敗する）
   - `Yorozuya-v0.2.0-macos-arm64.zip` と `Yorozuya-v0.2.0-macos-x64.zip` を作る
   - GitHub Release を作り、zip を添付し、前回からの変更点を自動で書く
5. [Releases](https://github.com/tkc310/yorozuya/releases) で内容を確かめ、必要ならリリースノートを書き足す

`v0.2.0-beta.1` のように `-` を含むタグは、プレリリースとして公開されます。

### 失敗したとき

ワークフローが失敗したら、原因を直してからタグを付け直します。

```bash
git tag -d v0.2.0
git push origin :refs/tags/v0.2.0
# 直したコミットに付け直す
git tag v0.2.0 && git push origin v0.2.0
```

### 配布物について

アプリは Apple Developer ID で署名・公証していません（アドホック署名のみ）。ダウンロードしたアプリは Gatekeeper に止められるため、利用者には次のどちらかを案内してください。

- Finder でアプリを右クリックし「開く」を選ぶ
- ターミナルで隔離属性を外す

  ```bash
  xattr -dr com.apple.quarantine /Applications/Yorozuya.app
  ```
