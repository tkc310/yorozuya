// GitHub Pages に置くサイトを .site/ に組み立てる。CI では動かさず、手元で必要なときに実行する。
//
//   .site/index.html … 製品紹介（site/ をそのまま写す）
//   .site/images/    … ロゴとアイコン（src/assets/images から写す）
//   .site/media/     … スクリーンショットと操作動画（Storybook のデモから撮る）
//   .site/storybook/ … Storybook
//
// --skip-capture を付けると撮影を省き、前回の .site/media を使う（文言だけ直すとき）。
import { $ } from "bun";
import { cp, mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { serveStatic } from "./serve";

const root = join(import.meta.dir, "../..");
const out = join(root, ".site");
const storybook = join(out, "storybook");
const media = join(out, "media");
const skipCapture = process.argv.includes("--skip-capture");

$.cwd(root);

async function exists(path: string): Promise<boolean> {
  return stat(path)
    .then(() => true)
    .catch(() => false);
}

// 撮影を省くときは、前回の media を残す。
const keepMedia = skipCapture && (await exists(media));
const kept = join(root, ".site-media-keep");
if (keepMedia) {
  await rm(kept, { recursive: true, force: true });
  await cp(media, kept, { recursive: true });
}

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

console.log("Storybook を組み立てます");
await $`pnpm exec storybook build --quiet --output-dir ${storybook}`;
// 撮影は Storybook の iframe.html を開く。無ければ中身を出して止める（原因を追うため）。
if (!(await exists(join(storybook, "iframe.html")))) {
  const { readdir } = await import("node:fs/promises");
  console.error(`Storybook の出力に iframe.html がありません: ${storybook}`);
  console.error((await readdir(storybook)).sort().join("\n"));
  process.exit(1);
}

if (keepMedia) {
  await cp(kept, media, { recursive: true });
  await rm(kept, { recursive: true, force: true });
} else if (!skipCapture) {
  // 撮影に使う Chromium を入れる。入っていれば何もしない。
  // Playwright が対応していない OS（古い macOS など）では入れられないので、
  // そのときは手元の Google Chrome（または Microsoft Edge）で撮る（capture.mjs が選ぶ）。
  console.log("撮影に使う Chromium を確かめます");
  const installed = await $`pnpm exec playwright install chromium`.nothrow();
  if (installed.exitCode !== 0) {
    console.warn("Playwright の Chromium を入れられないため、手元の Google Chrome で撮ります");
  }
  console.log("スクリーンショットと操作動画を撮ります");
  const server = serveStatic(storybook);
  try {
    await $`node scripts/site/capture.mjs ${server.url} ${media}`;
  } finally {
    server.stop();
  }
} else {
  console.warn("前回の .site/media が無いため、画像と動画の無いサイトになります");
}

console.log("製品紹介のページを写します");
await cp(join(root, "site"), out, { recursive: true });
// 動画を撮れなかったときは、LP から動画のボタンとモーダルを外す（<!-- video:start --> から <!-- video:end --> までをすべて）。
if (!(await exists(join(media, "demo.webm")))) {
  const page = join(out, "index.html");
  const html = await Bun.file(page).text();
  await Bun.write(page, html.replace(/<!-- video:start -->[\s\S]*?<!-- video:end -->/g, ""));
  console.warn("操作動画が無いため、LP から動画の欄を外しました");
}
await mkdir(join(out, "images"), { recursive: true });
for (const name of ["logo.svg", "icon.svg", "icon.png"]) {
  await cp(join(root, "src/assets/images", name), join(out, "images", name));
}
// GitHub Pages の Jekyll を通さない（_ で始まる Storybook のファイルを消されないように）。
await Bun.write(join(out, ".nojekyll"), "");

console.log(`できました: ${out}`);
console.log("確かめるには make site-preview、公開するには make site-publish");
