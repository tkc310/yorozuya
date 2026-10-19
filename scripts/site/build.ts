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

if (keepMedia) {
  await cp(kept, media, { recursive: true });
  await rm(kept, { recursive: true, force: true });
} else if (!skipCapture) {
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
await mkdir(join(out, "images"), { recursive: true });
for (const name of ["logo.svg", "icon.svg", "icon.png"]) {
  await cp(join(root, "src/assets/images", name), join(out, "images", name));
}
// GitHub Pages の Jekyll を通さない（_ で始まる Storybook のファイルを消されないように）。
await Bun.write(join(out, ".nojekyll"), "");

console.log(`できました: ${out}`);
console.log("確かめるには pnpm site:preview、公開するには pnpm site:publish");
