# コンポーネント構造規則

## 概要

React コンポーネントのファイル名とディレクトリ構造に関するコーディングルールです。コンポーネントを作成する際は、このルールに従ってください。

## ファイル名規則

### パスカルケース（PascalCase）

フレームワーク上で意味を持つ場合（例: ファイルベースルーティング）を除き、コンポーネントのディレクトリ名は **先頭大文字のパスカルケース** にします。

#### ✅ 正しい例

- `src/components/features/Shell/`
- `src/components/features/SkillSheet/`
- `src/components/ui/Button/`

#### ❌ 避けるべき例

- `src/components/features/shell/`（小文字）
- `src/components/features/skill-sheet/`（ケバブケース）
- `src/components/ui/button/`（小文字）

### 例外: ルーティング

TanStack Router のファイルベースルーティングでは、ルート定義ファイルは小文字・ケバブケースを使用します。

#### 例外ケース

- `src/routes/index.tsx` - ルートファイル
- `src/routes/skill-sheet.tsx` - 動的ルート（フレームワークの要求）

## ディレクトリ構造（コロケーション）

関連するファイルは同じディレクトリに配置し、**ディレクトリ階層からコンポーネントスコープが判断できる** ようにします。

### 基本構成

```
ComponentName/
├── index.tsx           # コンポーネント本体
├── index.test.tsx      # ユニットテスト
├── index.stories.tsx   # Storybook
└── useHookName.ts      # カスタムフック（必要に応じて）
```

### 実例: Shell コンポーネント

```
src/components/features/Shell/
├── index.tsx           # Shell コンポーネント本体
├── index.test.tsx      # Shell のテスト
├── index.stories.tsx   # Shell の Storybook
├── useToolSelection.ts # ツール選択用カスタムフック
└── registry.ts         # ツール登録の設定
```

### 実例: SkillSheet コンポーネント（複数のサブコンポーネント）

```
src/components/features/SkillSheet/
├── Form/
│   ├── index.tsx
│   └── index.stories.tsx
└── Preview/
    ├── index.tsx
    └── index.stories.tsx
```

### 親子関係の表現

コンポーネント間の親子関係は、ディレクトリの入れ子で表現します。

```
ParentComponent/
├── index.tsx           # 親コンポーネント
├── index.stories.tsx
└── ChildComponent/     # 子コンポーネント
    ├── index.tsx
    └── index.stories.tsx
```

**例**: Shell コンポーネントが ToolBar という子コンポーネントを持つ場合

```
src/components/features/Shell/
├── index.tsx
├── index.test.tsx
├── index.stories.tsx
├── useToolSelection.ts
├── registry.ts
└── ToolBar/            # Shell の子コンポーネント
    ├── index.tsx
    └── index.test.tsx
```

この構造により、`ToolBar` が `Shell` に属する専用のコンポーネントであることが明確になります。

## Import 規則

### コロケーションされたコンポーネント

同じディレクトリまたはその配下にあるファイルは、相対パスで import します。

```typescript
// Shell/index.tsx から同じディレクトリのファイルを import
import { useToolSelection } from "./useToolSelection";
import { registry } from "./registry";
```

### 3階層以上離れたファイル

3階層以上離れたファイルは、パスエイリアス（`@/*`）を使った絶対パスで import します。

```typescript
// Shell/index.tsx から深い階層のファイルを import
import { Button } from "@/src/components/ui/Button/index";
import { getSheetFn } from "@/src/server/features/skill-sheet/queries/get-sheet";
```

## 再エクスポート

`index.tsx` からコンポーネントを再エクスポートすることで、外部からのimportがシンプルになります。

```typescript
// Shell/index.tsx
export function Shell({ tools }: ShellProps) {
  // ...
}

// 別のファイルから
import { Shell } from "../Shell/index";
```

## チェックリスト

コンポーネントを作成・変更する際は、以下を確認してください：

- [ ] ディレクトリ名はパスカルケースになっているか
- [ ] コンポーネント本体は `index.tsx` になっているか
- [ ] テストファイルは `index.test.tsx` になっているか
- [ ] Storybook ファイルは `index.stories.tsx` になっているか
- [ ] カスタムフックは `useXxx.ts` という名前になっているか
- [ ] 関連ファイルが同じディレクトリに配置されているか
- [ ] 深い相対パスではなく、パスエイリアスを使用しているか

## 参考

- TanStack Router: https://tanstack.com/router/latest
- Storybook: https://storybook.js.org/
- TypeScript Path Mapping: https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
