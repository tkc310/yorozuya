// 手元の Chrome で画面を開き、印刷用の CSS のまま PDF にする（docs/decisions/0011-server-pdf.md）。
// ブラウザの印刷ダイアログを通さないので、使っているブラウザや OS の印刷設定に左右されない。
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { err, ok, type Result } from "neverthrow";
import { ServerFunctionError } from "@/src/error";

// 読み込みから PDF にするまでの上限。超えたら諦めて、ブラウザの印刷を勧める。
const TIMEOUT_MS = 30_000;

// 画面の幅。プレビューは「幅に合わせる」で縮むが、割り付けは縮める前の高さで測るので結果は変わらない。
const VIEWPORT = { width: 1280, height: 1800 };

// 開いてよいのは手元のサーバだけ。
const LOOPBACK = new Set(["127.0.0.1", "localhost", "[::1]"]);

export function isLoopback(url: URL): boolean {
  return (url.protocol === "http:" || url.protocol === "https:") && LOOPBACK.has(url.hostname);
}

// 開いた画面が描き終わるのを待つ。フォントの読み込みと、プレビューの割り付け（測ってから並べ直す）が
// 落ち着くまで、用紙の枚数が数フレーム続けて変わらないことを確かめる。
const WAIT_FOR_PAPERS = `(async () => {
  while (document.documentElement.dataset.pdfReady !== "true") {
    if (document.documentElement.dataset.pdfReady === "error") {
      throw new Error("シートを読めませんでした");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await document.fonts.ready;
  let last = -1;
  let stable = 0;
  while (stable < 5) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    const count = document.querySelectorAll("[data-paper]").length;
    if (count > 0 && count === last) {
      stable += 1;
    } else {
      stable = 0;
      last = count;
    }
  }
  return last;
})()`;

// macOS で探すブラウザ。Chromium 系なら同じ印刷結果になる。上から順に使う。
const MAC_BROWSERS = [
  "Google Chrome.app/Contents/MacOS/Google Chrome",
  "Chromium.app/Contents/MacOS/Chromium",
  "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "Brave Browser.app/Contents/MacOS/Brave Browser",
];

// BUN_CHROME_PATH があればそれを、無ければ macOS のアプリケーションフォルダから探す。
// 見つからなければ Bun の自動検出（Linux の /usr/bin/google-chrome など）に任せる。
function browserPath(): string | undefined {
  if (process.env.BUN_CHROME_PATH || process.platform !== "darwin") {
    return undefined;
  }
  const folders = ["/Applications", join(homedir(), "Applications")];
  for (const app of MAC_BROWSERS) {
    for (const folder of folders) {
      const path = join(folder, app);
      if (existsSync(path)) {
        return path;
      }
    }
  }
  return undefined;
}

function chromeBackend(): Bun.WebView.Backend {
  const path = browserPath();
  return {
    type: "chrome",
    ...(path ? { path } : {}),
    // 動いている Chrome に繋がず、いつも別の Chrome を裏で立ち上げる（利用者のタブや設定に触れない）。
    url: false,
    // root で動かすとき（CI のコンテナなど）は、Chrome がサンドボックスを使えない。
    argv: process.getuid?.() === 0 ? ["--no-sandbox"] : [],
  };
}

function failure(cause: unknown): ServerFunctionError {
  const message = cause instanceof Error ? cause.message : String(cause);
  if (message === "timeout") {
    return new ServerFunctionError(
      "PDF の作成が時間内に終わりませんでした。「印刷 / PDF 保存」を使ってください",
    );
  }
  return new ServerFunctionError(
    "PDF を作れませんでした。Google Chrome（または Chromium・Microsoft Edge・Brave）が入っているか確かめるか、「印刷 / PDF 保存」を使ってください",
  );
}

// url の画面を A4 の PDF にし、Base64 で返す。用紙の大きさと余白は画面の @page に従う。
export async function renderPdf(url: URL): Promise<Result<string, ServerFunctionError>> {
  if (!isLoopback(url)) {
    return err(new ServerFunctionError("手元のサーバの画面だけを PDF にできます"));
  }
  let view: Bun.WebView | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS);
  });
  try {
    const work = (async () => {
      view = new Bun.WebView({ backend: chromeBackend(), ...VIEWPORT });
      await view.navigate(url.href);
      await view.evaluate(WAIT_FOR_PAPERS);
      const printed = await view.cdp<{ data: string }>("Page.printToPDF", {
        preferCSSPageSize: true,
        printBackground: true,
      });
      return printed.data;
    })();
    // 時間切れのあと view を閉じると、途中の処理が失敗する。その失敗は捨てる。
    void work.catch(() => undefined);
    return ok(await Promise.race([work, expired]));
  } catch (cause) {
    console.error("PDF の作成に失敗しました", cause);
    return err(failure(cause));
  } finally {
    clearTimeout(timer);
    view?.close();
  }
}
