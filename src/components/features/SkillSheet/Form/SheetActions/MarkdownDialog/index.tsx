import { useState } from "react";
import { css } from "styled-system/css";
import { Button } from "@/src/components/ui/Button/index";
import { Dialog } from "@/src/components/ui/Dialog/index";
import { Field } from "@/src/components/ui/Field/index";
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

const output = css({
  fontFamily: "mono",
  minHeight: "20rem",
});

// AI スクリーニング向けの Markdown を見せ、コピーかファイルで渡せるようにする。
// markdown が null のときは作れない理由を error に入れる。
export function MarkdownDialog({
  open,
  markdown,
  error,
  onDownload,
  onOpenChange,
}: {
  open: boolean;
  markdown: string | null;
  error?: string;
  onDownload: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async () => {
    if (!markdown) {
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied("コピーしました");
    } catch {
      setCopied("コピーできませんでした。下の欄から選んでコピーしてください");
    }
  };

  return (
    <Dialog
      open={open}
      title="Markdownで書き出す"
      onOpenChange={(next) => {
        setCopied(null);
        onOpenChange(next);
      }}
      footer={
        <>
          <Button type="button" variant="outline" disabled={!markdown} onClick={onDownload}>
            .md をダウンロード
          </Button>
          <Button type="button" disabled={!markdown} onClick={() => void copy()}>
            Markdownをコピー
          </Button>
        </>
      }
    >
      <div className={body}>
        <p className={note}>
          AI による書類選考（スクリーニング）や、生成 AI
          への入力に使うテキスト版です。プレビューと同じ項目を、表示の設定どおりに書き出します。
        </p>
        <Field label="Markdown" hint={copied ?? error}>
          <Textarea className={output} readOnly value={markdown ?? ""} />
        </Field>
      </div>
    </Dialog>
  );
}
