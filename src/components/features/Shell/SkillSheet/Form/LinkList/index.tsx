import { useRef, useState } from "react";
import { css } from "styled-system/css";
import type { ProfileLink } from "@/shared/features/skill-sheet/sheet";
import { Button } from "@/src/components/ui/Button/index";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Truncate } from "@/src/components/ui/Truncate/index";
import { itemActions, items, listItem } from "../styles";

const root = css({
  display: "grid",
  gap: "4",
  gridTemplateColumns: "minmax(0, 1fr)",
});

const text = css({
  display: "grid",
  flex: "1",
  minWidth: "0",
});

const url = css({
  color: "fg.sub",
  textStyle: "std-14N-170",
});

// 2 つの欄は見出し・入力・エラーの 3 段を subgrid で共有し、追加ボタンを入力欄の段の中央にそろえる。
const row = css({
  columnGap: "3",
  display: "grid",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr) auto",
  gridTemplateRows: "auto auto auto",
  "& > [data-part=root]": {
    alignContent: "start",
    gridRow: "1 / span 3",
    gridTemplateRows: "subgrid",
    rowGap: "2",
  },
});

// 編集中の行。名前と URL の入力欄を横に並べる。
const editRow = css({
  alignItems: "start",
  display: "grid",
  flex: "1",
  gap: "2",
  gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
  minWidth: "0",
});

const addButton = css({
  alignSelf: "center",
  gridColumn: "3",
  gridRow: "2",
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

type Draft = {
  index: number;
  label: string;
  url: string;
  error: string | null;
};

// 自己紹介の下に並べるリンク。追加・編集・削除したらすぐ保存する。
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
  // 編集ボタンを押した行だけ入力欄に変える。
  const [draft, setDraft] = useState<Draft | null>(null);

  const saveDraft = () => {
    if (!draft) {
      return;
    }
    const message = urlError(draft.url);
    if (message) {
      setDraft({ ...draft, error: message });
      return;
    }
    onChange(
      links.map((link, index) =>
        index === draft.index ? { label: draft.label.trim(), url: draft.url.trim() } : link,
      ),
    );
    setDraft(null);
  };

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
            <li key={`${index}-${link.url}`} className={listItem}>
              {draft?.index === index ? (
                <>
                  <div className={editRow}>
                    <Field label="リンク名">
                      <Input
                        size="sm"
                        value={draft.label}
                        onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                      />
                    </Field>
                    <Field label="URL" required error={draft.error}>
                      <Input
                        size="sm"
                        inputMode="url"
                        value={draft.url}
                        onChange={(event) =>
                          setDraft({ ...draft, url: event.target.value, error: null })
                        }
                      />
                    </Field>
                  </div>
                  <span className={itemActions}>
                    <Button type="button" variant="text" size="sm" onClick={() => setDraft(null)}>
                      取り消し
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      aria-label={`${link.label || link.url}を保存`}
                      onClick={saveDraft}
                    >
                      保存
                    </Button>
                  </span>
                </>
              ) : (
                <>
                  <span className={text}>
                    <Truncate>{link.label || link.url}</Truncate>
                    {link.label ? <Truncate className={url}>{link.url}</Truncate> : null}
                  </span>
                  <span className={itemActions}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      aria-label={`${link.label || link.url}を編集`}
                      onClick={() =>
                        setDraft({ index, label: link.label, url: link.url, error: null })
                      }
                    >
                      編集
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      aria-label={`${link.label || link.url}を削除`}
                      onClick={() => {
                        setDraft(null);
                        onChange(links.filter((_, current) => current !== index));
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
