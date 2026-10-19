# コンポーネント構造規則

## 概要

React コンポーネントのファイル名とディレクトリ構造。コンポーネントの作成時はこの規則に従う。

## ファイル名規則

### パスカルケース（PascalCase）

フレームワーク上で意味を持つ場合（例: ファイルベースルーティング）を除き、コンポーネントのディレクトリ名は **先頭大文字のパスカルケース**。

#### ✅ 正しい例

- `src/components/features/SkillSheet/`
- `src/components/layouts/AppLayout/`
- `src/components/ui/Button/`

#### ❌ 避けるべき例

- `src/components/features/skill-sheet/`（ケバブケース）
- `src/components/layouts/app-layout/`（ケバブケース）
- `src/components/ui/button/`（小文字）

### 例外: ルーティング

TanStack Router のファイルベースルーティングでは、ルート定義ファイルは小文字・ケバブケース。

#### 例外ケース

- `src/routes/index.tsx` - トップページ
- `src/routes/skill-sheet.tsx` - スキルシートページ

## 置き場所

| ディレクトリ | 置くもの                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `ui/`        | どの画面でも使う共通部品。`features`、`lib`、`server` を import しない                           |
| `layouts/`   | 全画面に共通する枠（ヘッダー、パンくずリスト）。ルーターに依存してよい                           |
| `features/`  | 1 ページ分の機能。ルートファイルから直接描く。ほかの機能を import しない（`make lint-boundary`） |

機能を足すときは、`features/` に機能のディレクトリを作り、`src/routes/` にルートファイルを作る。ルートの `staticData.crumb` に書いた名前が `layouts/PageBreadcrumb` に出る。パンくずリストの置き場所はページごとに決め、ルートファイルから機能に渡す（機能はルーターに依存させない）。トップページ（`features/Home`）の機能一覧にも 1 件足す。

## ディレクトリ構造（コロケーション）

関連するファイルは同じディレクトリに置く。**ディレクトリ階層からコンポーネントスコープが判断できる** ようにする。

### 基本構成

```
ComponentName/
├── index.tsx           # コンポーネント本体
├── index.test.tsx      # ユニットテスト
├── index.stories.tsx   # Storybook
└── useHookName.ts      # カスタムフック（必要に応じて）
```

### 実例: SkillSheet コンポーネント（親子関係の例）

```
src/components/features/SkillSheet/
├── index.tsx           # SkillSheet ページ（クエリとミューテーションを持つ）
├── index.stories.tsx
├── useSheetCommands.ts # 変更系のサーバ関数をまとめたフック
├── Form/               # SkillSheet の子コンポーネント
│   ├── index.tsx
│   ├── index.stories.tsx
│   └── CareerDialog/   # Form の子コンポーネント
│       └── index.tsx
└── Preview/            # SkillSheet の子コンポーネント
    ├── index.tsx
    └── index.stories.tsx
```

この構造での関係:

- **SkillSheet** は `/skill-sheet` のルートが描くページ
- **Form** と **Preview** は **SkillSheet** 専用の子コンポーネント
- **CareerDialog** は **Form** 専用の子コンポーネント

### 親子関係の表現

コンポーネント間の親子関係は、ディレクトリの入れ子。

```
ParentComponent/
├── index.tsx           # 親コンポーネント
├── index.stories.tsx
└── ChildComponent/     # 子コンポーネント
    ├── index.tsx
    └── index.stories.tsx
```

子が親以外からも使われるようになったら、共通の祖先まで引き上げる。どの機能からも使うなら `ui/` に移す。

## Import 規則

### コロケーションされたコンポーネント

同じディレクトリまたはその配下にあるファイルは、相対パスで import する。

```typescript
// SkillSheet/index.tsx から同じディレクトリのファイルを import
import { Form } from "./Form/index";
import { useSheetCommands } from "./useSheetCommands";
```

### 3階層以上離れたファイル

3階層以上離れたファイルは、パスエイリアス（`@/*`）の絶対パスで import する。

```typescript
// SkillSheet/Form/index.tsx から深い階層のファイルを import
import { Button } from "@/src/components/ui/Button/index";
import { getSheetFn } from "@/src/server/features/skill-sheet/queries/get-sheet";
```

## 再エクスポート

`index.tsx` からコンポーネントを再エクスポートし、外部からの import を単純にする。

```typescript
// SkillSheet/index.tsx
export function SkillSheet() {
  // ...
}

// 別のファイルから
import { SkillSheet } from "../components/features/SkillSheet/index";
```

## チェックリスト

コンポーネントの作成・変更時に確認する。

- [ ] ディレクトリ名はパスカルケースになっているか
- [ ] コンポーネント本体は `index.tsx` になっているか
- [ ] テストファイルは `index.test.tsx` になっているか
- [ ] Storybook ファイルは `index.stories.tsx` になっているか
- [ ] カスタムフックは `useXxx.ts` という名前になっているか
- [ ] 関連ファイルが同じディレクトリに配置されているか
- [ ] 機能が別の機能を import していないか
- [ ] 深い相対パスではなく、パスエイリアスを使用しているか

## 参考

- TanStack Router: https://tanstack.com/router/latest
- Storybook: https://storybook.js.org/
- TypeScript Path Mapping: https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
