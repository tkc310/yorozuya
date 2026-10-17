import { useId, useState } from "react";
import { css } from "styled-system/css";
import { Button } from "@/src/components/ui/Button/index";
import { Input } from "@/src/components/ui/Input/index";

const group = css({
  border: "none",
  display: "grid",
  gap: "2",
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
  color: "solidGray.600",
  fontWeight: "normal",
  ml: "2",
  textStyle: "std-14N-170",
});

const errorText = css({
  color: "error",
  fontWeight: "bold",
  textStyle: "std-14N-170",
});

const items = css({
  display: "grid",
  listStyle: "none",
  margin: "0",
  padding: "0",
});

const item = css({
  alignItems: "center",
  borderBottomWidth: "1px",
  borderColor: "border.divider",
  display: "flex",
  gap: "4",
  justifyContent: "space-between",
  py: "1",
});

const row = css({
  alignItems: "center",
  display: "flex",
  gap: "2",
});

// 1つずつ足して並べる入力。保有技術の一覧と同じ操作にする。
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
            <li key={name} className={item}>
              <span>{name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label={`${name}を削除`}
                onClick={() => onChange(values.filter((value) => value !== name))}
              >
                削除
              </Button>
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
