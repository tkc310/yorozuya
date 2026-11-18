import { Result } from "neverthrow";
import { useRef, useState } from "react";
import { css } from "styled-system/css";
import { type CalendarDate, type SheetInput } from "@/src/shared/features/skill-sheet/sheet.schema";
import {
  displayNameOf,
  present,
  toSheetFile,
} from "@/src/shared/features/skill-sheet/skill.service";
import { Button } from "@/src/components/ui/Button/index";
import { Dialog } from "@/src/components/ui/Dialog/index";
import { printTitle } from "../values";
import { ImportPromptDialog } from "./ImportPromptDialog/index";
import { MarkdownDialog } from "./MarkdownDialog/index";
import { sheetMarkdown } from "./sheet-markdown.service";

const actions = css({
  display: "flex",
  flexWrap: "wrap",
  gap: "2",
});

const hidden = css({
  display: "none",
});

const alert = css({
  color: "error",
  margin: "0",
  textStyle: "std-14N-170",
  fontWeight: "bold",
});

const parseJson = Result.fromThrowable(
  (text: string): unknown => JSON.parse(text),
  () => "JSON として読めませんでした",
);

function fileName(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `skill-sheet-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

function saveFile(content: string, type: string, name: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function download(sheet: SheetInput) {
  const now = new Date();
  saveFile(JSON.stringify(toSheetFile(sheet, now), null, 2), "application/json", fileName(now));
}

// プレビューと同じ基準日で Markdown にする。氏名が無いなどで作れなければ理由を返す。
function markdownOf(sheet: SheetInput, today: CalendarDate) {
  const presented = present(sheet, today);
  return presented.ok
    ? { markdown: sheetMarkdown(sheet, presented.view, today), error: undefined }
    : { markdown: null, error: `Markdownを作れません: ${presented.error}` };
}

// 印刷する。PDF に保存するときの既定のファイル名は document.title なので、
// 印刷の間だけ氏名と日付の入った名前に変え、終わったら戻す。
function printSheet(sheet: SheetInput) {
  const now = new Date();
  const previous = document.title;
  document.title = printTitle(displayNameOf(sheet), {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

// 印刷と、Markdown の書き出し、JSON の読み込み・書き出し。読み込みは確認してから今の内容を置き換える。
export function SheetActions({
  sheet,
  today,
  pending,
  onImport,
}: {
  sheet: SheetInput;
  today: CalendarDate;
  pending?: boolean;
  onImport: (file: unknown) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<{ name: string; file: unknown } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [markdownOpen, setMarkdownOpen] = useState(false);
  const markdown = markdownOpen ? markdownOf(sheet, today) : null;

  return (
    <div>
      <div className={actions}>
        <Button type="button" variant="outline" size="sm" onClick={() => printSheet(sheet)}>
          印刷 / PDF 保存
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setMarkdownOpen(true)}>
          Markdownで書き出す
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => input.current?.click()}
        >
          JSONを読み込む
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => download(sheet)}>
          JSONを書き出す
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setPromptOpen(true)}>
          インポート用のプロンプトを作る
        </Button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          aria-label="読み込む JSON ファイル"
          className={hidden}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) {
              return;
            }
            const parsed = parseJson(await file.text());
            if (parsed.isErr()) {
              setMessage(parsed.error);
              return;
            }
            setMessage(null);
            setLoaded({ name: file.name, file: parsed.value });
          }}
        />
      </div>
      {message ? (
        <p role="alert" className={alert}>
          {message}
        </p>
      ) : null}
      <ImportPromptDialog open={promptOpen} onOpenChange={setPromptOpen} />
      <MarkdownDialog
        open={markdownOpen}
        markdown={markdown?.markdown ?? null}
        error={markdown?.error}
        onOpenChange={setMarkdownOpen}
        onDownload={() => {
          if (markdown?.markdown) {
            saveFile(
              markdown.markdown,
              "text/markdown",
              `${printTitle(displayNameOf(sheet), today)}.md`,
            );
          }
        }}
      />
      <Dialog
        open={loaded !== null}
        title="JSONを読み込む"
        onOpenChange={(open) => {
          if (!open) {
            setLoaded(null);
          }
        }}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setLoaded(null)}>
              取り消し
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                if (loaded) {
                  onImport(loaded.file);
                }
                setLoaded(null);
              }}
            >
              置き換える
            </Button>
          </>
        }
      >
        <p>
          「{loaded?.name}
          」の内容で、いまのプロフィール・保有技術・職務経歴をすべて置き換えます。元に戻せないため、必要なら先に
          JSON を書き出してください。
        </p>
      </Dialog>
    </div>
  );
}
