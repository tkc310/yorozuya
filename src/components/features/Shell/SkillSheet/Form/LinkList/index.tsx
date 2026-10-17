import { useRef, useState } from "react";
import { css } from "styled-system/css";
import type { ProfileLink } from "@/shared/features/skill-sheet/sheet";
import { Button } from "@/src/components/ui/Button/index";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";

const root = css({
  display: "grid",
  gap: "3",
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

const text = css({
  display: "grid",
  minWidth: "0",
  overflowWrap: "anywhere",
});

const url = css({
  color: "fg.sub",
  textStyle: "std-14N-170",
});

const row = css({
  alignItems: "start",
  display: "grid",
  gap: "3",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr) auto",
});

const addButton = css({
  mt: "8",
});

function urlError(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "入力してください";
  }
  if (!/^https?:\/\//.test(trimmed) || !URL.canParse(trimmed)) {
    return "http:// か https:// で始まる URL を入力してください";
  }
  return null;
}

// 自己紹介の下に並べるリンク。追加・削除したらすぐ保存する。
export function LinkList({
  links,
  pending,
  onChange,
}: {
  links: ProfileLink[];
  pending?: boolean;
  onChange: (links: ProfileLink[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const urlInput = useRef<HTMLInputElement>(null);

  const add = () => {
    const message = urlError(address);
    setError(message);
    if (message) {
      urlInput.current?.focus();
      return;
    }
    onChange([...links, { label: label.trim(), url: address.trim() }]);
    setLabel("");
    setAddress("");
  };

  return (
    <div className={root}>
      {links.length > 0 ? (
        <ul className={items} aria-label="リンク">
          {links.map((link, index) => (
            <li key={`${index}-${link.url}`} className={item}>
              <span className={text}>
                <span>{link.label || link.url}</span>
                {link.label ? <span className={url}>{link.url}</span> : null}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                aria-label={`${link.label || link.url}を削除`}
                onClick={() => onChange(links.filter((_, current) => current !== index))}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className={row}>
        <Field label="リンク名">
          <Input
            size="sm"
            placeholder="例: GitHub"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </Field>
        <Field label="URL" required error={error}>
          <Input
            ref={urlInput}
            size="sm"
            inputMode="url"
            placeholder="例: https://github.com/..."
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              if (error && !urlError(event.target.value)) {
                setError(null);
              }
            }}
            onBlur={() => setError(address.trim() ? urlError(address) : null)}
          />
        </Field>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={addButton}
          disabled={pending}
          onClick={add}
        >
          リンクを追加
        </Button>
      </div>
    </div>
  );
}
