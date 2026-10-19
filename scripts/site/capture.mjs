// Storybook のデモ（スキルシート/デモ）から、製品紹介に載せるスクリーンショットと操作動画を撮る。
// サーバもデータベースも使わないので、手元のシートは変わらない。
//
//   node scripts/site/capture.mjs <Storybook の URL> <出力先>
//
// 出力: editor.png / sheet-first.png / sheet-details.png / prompt.png / demo-poster.png / demo.webm
//       （ffmpeg があれば demo.mp4 も作る）
import { spawnSync } from "node:child_process";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const [base, out] = process.argv.slice(2);
if (!base || !out) {
  console.error("使い方: node scripts/site/capture.mjs <Storybook の URL> <出力先>");
  process.exit(1);
}

const DEMO_TITLE = "スキルシート/デモ";
const DEMO_NAME = "見本";

async function demoUrl() {
  const response = await fetch(new URL("index.json", base));
  const index = await response.json();
  const entry = Object.values(index.entries).find(
    (item) => item.type === "story" && item.title === DEMO_TITLE && item.name === DEMO_NAME,
  );
  if (!entry) {
    throw new Error(`Storybook に「${DEMO_TITLE} / ${DEMO_NAME}」がありません`);
  }
  return new URL(`iframe.html?id=${entry.id}&viewMode=story`, base).toString();
}

// ページのエラーを集め、撮れなかったときに原因を出す。
function watch(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 400) {
      errors.push(`${response.status()}: ${response.url()}`);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

// プレビューの割り付けとフォントの読み込みを待つ。表示されなければ画面とエラーを残して止める。
async function ready(page) {
  const errors = page.errors ?? [];
  try {
    await page.getByRole("heading", { name: /^新究羅 理定/, level: 2 }).waitFor({ timeout: 30000 });
  } catch (error) {
    await page.screenshot({ path: join(out, "failure.png"), fullPage: true }).catch(() => {});
    console.error(`デモが表示されませんでした: ${page.url()}`);
    console.error(`画面: ${join(out, "failure.png")}`);
    console.error(errors.length > 0 ? errors.join("\n") : "ページのエラーはありません");
    const text = await page
      .evaluate(() => document.body.innerText.slice(0, 800))
      .catch(() => "（読めませんでした）");
    console.error(`画面の文字:\n${text || "（空）"}`);
    throw error;
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

async function stills(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.errors = watch(page);
  await page.goto(url);
  await ready(page);
  await page.screenshot({ path: join(out, "editor.png") });

  // 用紙は 100% で撮る。プレビューの列が A4（約 794px）より狭いと用紙が列の端で切れるので、
  // 列が A4 より広く、用紙 1 枚の高さ（約 1123px）が収まる大きな画面で撮り直す。
  const wide = await browser.newContext({
    viewport: { width: 2000, height: 1500 },
    deviceScaleFactor: 2,
  });
  const sheet = await wide.newPage();
  sheet.errors = watch(sheet);
  await sheet.goto(url);
  await ready(sheet);
  await sheet.getByRole("button", { name: "100%" }).click();
  await sheet.waitForTimeout(500);
  const pages = sheet.locator('[aria-label$="ページ目"]');
  await pages.first().screenshot({ path: join(out, "sheet-first.png") });
  const details = pages.filter({ has: sheet.getByRole("heading", { name: "職務経歴詳細" }) });
  await ((await details.count()) > 0 ? details.first() : pages.last()).screenshot({
    path: join(out, "sheet-details.png"),
  });
  await wide.close();

  await page.getByRole("button", { name: "インポート用のプロンプトを作る" }).click();
  await page
    .getByRole("textbox", { name: "参照情報" })
    .fill("氏名: 山田 太郎\n職種: バックエンドエンジニア\n経歴: 2019年4月〜 決済サービスの開発 …");
  await page.waitForTimeout(300);
  await page.getByRole("dialog").screenshot({ path: join(out, "prompt.png") });
  await context.close();
}

async function video(browser, url) {
  const raw = join(out, "video-raw");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: raw, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();
  page.errors = watch(page);
  await page.goto(url);
  await ready(page);
  await page.screenshot({ path: join(out, "demo-poster.png") });
  await page.waitForTimeout(1200);

  // 肩書を書き換えると、プレビューのヘッダーがすぐ変わる。
  const title = page.getByRole("textbox", { name: "肩書" });
  await title.click();
  await title.press("ControlOrMeta+a");
  await title.pressSequentially("フルスタックエンジニア / テックリード", { delay: 70 });
  await title.blur();
  await page.waitForTimeout(1200);

  // 希望単価を入れて、用紙に出す。
  const rate = page.getByRole("textbox", { name: "希望単価" });
  await rate.scrollIntoViewIfNeeded();
  await rate.click();
  await rate.pressSequentially("月 90 万円〜（140〜180h）", { delay: 70 });
  await rate.blur();
  await page.getByRole("switch", { name: "希望単価をプレビューに表示" }).click();
  await page.waitForTimeout(1500);

  // 主要スキルを足すと、1 ページ目の主要スキルに並ぶ。
  const featured = page.getByRole("checkbox", { name: "Vue.jsを主要スキルにする" });
  await featured.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await featured.check();
  await page.waitForTimeout(1500);

  // プレビューを等倍にして、職務経歴までスクロールする。
  await page.getByRole("button", { name: "100%" }).click();
  await page.waitForTimeout(800);
  const preview = page.getByRole("region", { name: "プレビュー" });
  const box = await preview.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, Math.min(box.y + 400, 700));
    for (let step = 0; step < 24; step += 1) {
      await page.mouse.wheel(0, 180);
      await page.waitForTimeout(120);
    }
  }
  await page.waitForTimeout(1500);

  const recorded = page.video();
  await context.close();
  if (recorded) {
    await rename(await recorded.path(), join(out, "demo.webm"));
  }
  await rm(raw, { recursive: true, force: true });
}

function toMp4() {
  const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (probe.status !== 0) {
    console.warn("ffmpeg が無いため demo.mp4 は作りません（webm だけで公開します）");
    return;
  }
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      join(out, "demo.webm"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      join(out, "demo.mp4"),
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    console.warn("demo.mp4 を作れませんでした（webm だけで公開します）");
  }
}

// Playwright の Chromium を使う。入っていない（対応していない OS など）ときは、
// 手元の Google Chrome、Microsoft Edge の順に試す。
async function launch() {
  const errors = [];
  for (const channel of [undefined, "chrome", "msedge"]) {
    try {
      const browser = await chromium.launch({
        ...(channel ? { channel } : {}),
        // 撮影はふつう画面に出さずに行う。様子を見たいときは SITE_CAPTURE_HEADED=1 を付ける。
        headless: process.env.SITE_CAPTURE_HEADED !== "1",
      });
      console.log(`撮影に使うブラウザ: ${channel ?? "Playwright の Chromium"}`);
      return browser;
    } catch (error) {
      errors.push(`${channel ?? "chromium"}: ${error.message.split("\n")[0]}`);
    }
  }
  throw new Error(
    `撮影に使えるブラウザがありません。Google Chrome を入れるか、pnpm exec playwright install chromium を実行してください。\n${errors.join("\n")}`,
  );
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
const url = await demoUrl();
const browser = await launch();
try {
  await stills(browser, url);
  // 動画は ffmpeg が無い環境では撮れない。そのときはスクリーンショットだけで続ける。
  await video(browser, url).catch((error) => {
    console.warn(`操作動画を撮れませんでした: ${error.message.split("\n")[0]}`);
  });
} finally {
  await browser.close();
}
if ((await readdir(out)).includes("demo.webm")) {
  toMp4();
}
console.log(`撮りました: ${(await readdir(out)).sort().join(", ")}`);
