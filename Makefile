# よく使うコマンドの入口。中身は package.json のスクリプトや pnpm exec を呼ぶだけ。
# 一覧は `make`（または `make help`）で出る。
#
# 追加の引数は ARGS で渡す。
#   make site-build ARGS=--skip-capture
#   make site-publish ARGS=--dry-run
#   make test ARGS="src/components/features/SkillSheet"

PNPM ?= pnpm
ARGS ?=

.DEFAULT_GOAL := help

.PHONY: help
help: ## コマンドの一覧を出す
	@awk 'BEGIN { FS = ":.*## " } /^[a-zA-Z0-9_-]+:.*## / { printf "  make %-16s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

## 準備

.PHONY: install
install: ## 依存パッケージを入れる（Panda CSS の生成と Git フックの導入も走る）
	$(PNPM) install $(ARGS)

.PHONY: prepare
prepare: ## Panda CSS のスタイルを生成し、Git フックを入れる
	$(PNPM) prepare $(ARGS)

.PHONY: browsers
browsers: ## e2e と撮影に使う Playwright の Chromium を入れる
	$(PNPM) exec playwright install chromium $(ARGS)

## 開発

.PHONY: dev
dev: ## 開発サーバを起動する（http://127.0.0.1:46280）
	$(PNPM) dev $(ARGS)

.PHONY: storybook
storybook: ## Storybook を起動する（http://127.0.0.1:6006）
	$(PNPM) storybook $(ARGS)

.PHONY: build-app
build-app: ## macOS アプリを作る（dist/Yorozuya.app）
	$(PNPM) build:app $(ARGS)

.PHONY: db-generate
db-generate: ## スキーマの変更からマイグレーションを生成する
	$(PNPM) exec drizzle-kit generate $(ARGS)

## 検査

.PHONY: check
check: typecheck lint fmt test ## 型検査・静的検査・フォーマット検査・テストをまとめて実行する

.PHONY: typecheck
typecheck: ## 型を検査する
	$(PNPM) typecheck $(ARGS)

.PHONY: lint
lint: ## 静的検査と境界検査を実行する
	$(PNPM) lint $(ARGS)

.PHONY: lint-boundary
lint-boundary: ## import の境界とデータベース操作の場所を検査する
	$(PNPM) lint:boundary $(ARGS)

.PHONY: fmt
fmt: ## フォーマットを検査する
	$(PNPM) fmt $(ARGS)

.PHONY: fmt-fix
fmt-fix: ## フォーマットを直す
	$(PNPM) exec vp fmt $(ARGS)

.PHONY: test
test: ## ユニットテストと Storybook の play を実行する
	$(PNPM) test $(ARGS)

.PHONY: test-e2e
test-e2e: ## Playwright で e2e テストを実行する
	$(PNPM) test:e2e $(ARGS)

## GitHub Pages（CI では動かさず、手元で実行する）

.PHONY: site-build
site-build: ## LP と Storybook を .site/ に組み立てる（撮影を省くなら ARGS=--skip-capture）
	$(PNPM) site:build $(ARGS)

.PHONY: site-preview
site-preview: ## 組み立てた .site/ を手元で確かめる
	$(PNPM) site:preview $(ARGS)

.PHONY: site-publish
site-publish: ## .site/ を gh-pages に公開する（送らずに確かめるなら ARGS=--dry-run）
	$(PNPM) site:publish $(ARGS)
