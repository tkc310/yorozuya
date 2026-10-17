import { useId, useState } from "react";
import { css } from "styled-system/css";
import { Button } from "@/src/components/ui/Button/index";
import { Input } from "@/src/components/ui/Input/index";
import { Truncate } from "@/src/components/ui/Truncate/index";
import { itemActions, itemLabel, items, listItem } from "../../styles";

const group = css({
  border: "none",
  display: "grid",
  gap: "4",
  gridTemplateColumns: "minmax(0, 1fr)",
  margin: "0",
  minWidth: "0",
  padding: "0",
});

const legend = css({
  color: "fg",
  padding: "0",
  textStyle: "std-16B-170",
});

const requiredMark = css({
  color: "fg",
  fontWeight: "normal",
  ml: "2",
  textStyle: "std-14N-170",
});

const errorText = css({
  color: "error",
  fontWeight: "bold",
  textStyle: "std-14N-170",
});

const row = css({
  alignItems: "center",
  display: "flex",
  gap: "2",
});

const editInput = css({
  flex: "1 1 8rem",
  minWidth: "8rem",
});

type Draft = {
  name: string;
  text: string;
  error: string | null;
};

// 1つずつ足して並べる入力。保有技術の一覧と同じ操作にする。各項目は編集ボタンでその場で直せる。
export function ListInput({
  label,
  required,
  error,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [text, setText] = useState("");
  const errorId = useId();
  // 編集ボタンを押した項目だけ入力欄に変える。
  const [draft, setDraft] = useState<Draft | null>(null);
  const saveDraft = () => {
    if (!draft) {
      return;
    }
    const name = draft.text.trim();
    if (name.length === 0) {
      setDraft({ ...draft, error: "入力してください" });
      return;
    }
    if (name !== draft.name && values.includes(name)) {
      setDraft({ ...draft, error: "すでにあります" });
      return;
    }
    onChange(values.map((value) => (value === draft.name ? name : value)));
    setDraft(null);
  };
  const add = () => {
    const name = text.trim();
    if (name.length === 0) {
      return;
    }
    if (!values.includes(name)) {
      onChange([...values, name]);
    }
    setText("");
  };
  return (
    <fieldset className={group}>
      <legend className={legend}>
        {label}
        {required ? (
          <span className={requiredMark} aria-hidden="true">
            (必須)
          </span>
        ) : null}
      </legend>
      {values.length > 0 ? (
        <ul className={items} aria-label={label}>
          {values.map((name) => (
            <li key={name} className={listItem}>
              {draft?.name === name ? (
                <>
                  <span className={editInput}>
                    <Input
                      size="sm"
                      aria-label={`${name}の新しい名前`}
                      aria-invalid={draft.error ? true : undefined}
                      value={draft.text}
                      onChange={(event) =>
                        setDraft({ ...draft, text: event.target.value, error: null })
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          saveDraft();
                        }
                      }}
                    />
                    {draft.error ? <span className={errorText}>{draft.error}</span> : null}
                  </span>
                  <span className={itemActions}>
                    <Button type="button" variant="text" size="sm" onClick={() => setDraft(null)}>
                      取り消し
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      aria-label={`${name}を保存`}
                      onClick={saveDraft}
                    >
                      保存
                    </Button>
                  </span>
                </>
              ) : (
                <>
                  <span className={itemLabel}>
                    <Truncate>{name}</Truncate>
                  </span>
                  <span className={itemActions}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`${name}を編集`}
                      onClick={() => setDraft({ name, text: name, error: null })}
                    >
                      編集
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`${name}を削除`}
                      onClick={() => {
                        setDraft(null);
                        onChange(values.filter((value) => value !== name));
                      }}
                    >
                      削除
                    </Button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      <div className={row}>
        <Input
          size="sm"
          aria-label={`追加する${label}`}
          aria-required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`${label}に追加`}
          onClick={add}
        >
          追加
        </Button>
      </div>
      {error ? (
        <span id={errorId} className={errorText}>
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}
