import { Button } from "@/src/components/ui/Button/index";
import { itemActions } from "../styles";

type ItemActionsProps = {
  // 読み上げで操作の対象を伝える名前。「〇〇を編集」のように使う。
  name: string;
  pending?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  // その場で編集している間は、編集・削除の代わりに取り消し・保存を出す。
  editing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
};

// リストの行の右に置く操作ボタン。
export function ItemActions({
  name,
  pending,
  onEdit,
  onRemove,
  editing,
  onSave,
  onCancel,
}: ItemActionsProps) {
  if (editing) {
    return (
      <span className={itemActions}>
        <Button type="button" variant="text" size="sm" onClick={onCancel}>
          取り消し
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          aria-label={`${name}を保存`}
          onClick={onSave}
        >
          保存
        </Button>
      </span>
    );
  }
  return (
    <span className={itemActions}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        aria-label={`${name}を編集`}
        onClick={onEdit}
      >
        編集
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        aria-label={`${name}を削除`}
        onClick={onRemove}
      >
        削除
      </Button>
    </span>
  );
}
