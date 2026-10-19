import { useState } from "react";
import { css } from "styled-system/css";
import {
  REFERENCE_KINDS,
  REFERENCE_KIND_LABELS,
  REFERENCE_PLACEHOLDERS,
  buildImportPrompt,
  type ReferenceKind,
} from "@/shared/features/skill-sheet/import-prompt";
import { Button } from "@/src/components/ui/Button/index";
import { Dialog } from "@/src/components/ui/Dialog/index";
import { Field } from "@/src/components/ui/Field/index";
import { Input } from "@/src/components/ui/Input/index";
import { Select } from "@/src/components/ui/Select/index";
import { Textarea } from "@/src/components/ui/Textarea/index";

const body = css({
  display: "grid",
  gap: "4",
  gridTemplateColumns: "minmax(0, 1fr)",
});

const note = css({
  color: "fg.sub",
  margin: "0",
  textStyle: "std-14N-170",
});

const prompt = css({
  fontFamily: "mono",
  minHeight: "16rem",
});

function isReferenceKind(value: string): value is ReferenceKind {
  return (REFERENCE_KINDS as readonly string[]).includes(value);
}

// 元のスキルシートを生成 AI に渡して、読み込める JSON を作ってもらうためのプロンプトを作る。
export function ImportPromptDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [kind, setKind] = useState<ReferenceKind>("text");
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const result = buildImportPrompt(kind, reference);

  const copy = async () => {
    if (!result) {
      return;
    }
    try {
      await navigator.clipboard.writeText(result);
      setCopied("コピーしました");
    } catch {
      setCopied("コピーできませんでした。下の欄から選んでコピーしてください");
    }
  };

  return (
    <Dialog
      open={open}
      title="インポート用のプロンプトを作る"
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
          <Button type="button" disabled={!result} onClick={() => void copy()}>
            プロンプトをコピー
          </Button>
        </>
      }
    >
      <div className={body}>
        <p className={note}>
          手元のスキルシートを生成 AI に渡し、このアプリに読み込める JSON
          を作ってもらうためのプロンプトです。できた JSON は「JSONを読み込む」から読み込めます。
        </p>
        <Field label="元のスキルシートの渡し方">
          <Select
            size="sm"
            value={kind}
            onChange={(event) => {
              if (isReferenceKind(event.target.value)) {
                setKind(event.target.value);
                setCopied(null);
              }
            }}
          >
            {REFERENCE_KINDS.map((value) => (
              <option key={value} value={value}>
                {REFERENCE_KIND_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="参照情報" required>
          {kind === "text" ? (
            <Textarea
              placeholder={REFERENCE_PLACEHOLDERS.text}
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
                setCopied(null);
              }}
            />
          ) : (
            <Input
              size="sm"
              inputMode={kind === "url" ? "url" : undefined}
              placeholder={REFERENCE_PLACEHOLDERS[kind]}
              value={reference}
              onChange={(event) => {
                setReference(event.target.value);
                setCopied(null);
              }}
            />
          )}
        </Field>
        <Field
          label="プロンプト"
          hint={copied ?? (result ? undefined : "参照情報を入れるとプロンプトができます")}
        >
          <Textarea className={prompt} readOnly value={result ?? ""} />
        </Field>
      </div>
    </Dialog>
  );
}
