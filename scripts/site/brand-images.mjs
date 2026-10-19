// ロゴ（src/assets/images/logo.svg）から、地の色と地紋を敷いたバナー類を作る。make brand-images で実行する。
//
//   docs/assets/banner.svg                    README の先頭（1280×400）
//   site/ogp.png                              LP の OGP 画像（1200×630。SNS は SVG を読めないので PNG にする）
//
// ロゴや色を変えたら、これを実行して作り直す。手で個別に直さない。
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

// LP（site/style.css）と同じ色。
const CANVAS = "#f6f5f1";
const ACCENT = "#1f3a5f";
const LOGO_VIEWBOX = { width: 1357.9, height: 320.9 };

const logo = await readFile(join(root, "src/assets/images/logo.svg"), "utf8");
const logoBody = logo
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  // 同じページに複数置いても衝突しないよう、切り抜きの id を変える。
  .replaceAll('id="c"', 'id="logo-clip"')
  .replaceAll("url(#c)", "url(#logo-clip)");

/**
 * @param {{ width: number; height: number; logoWidth: number; radius: number; band: number; tile: number; stroke: number }} size
 */
function banner({ width, height, logoWidth, radius, band, tile, stroke }) {
  const logoHeight = (logoWidth * LOGO_VIEWBOX.height) / LOGO_VIEWBOX.width;
  const x = ((width - logoWidth) / 2).toFixed(1);
  // 下の帯の分だけ、ロゴを少し上に置く。
  const y = ((height - band - logoHeight) / 2).toFixed(1);
  const r = tile / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="よろずや">
  <!-- scripts/site/brand-images.mjs で作る。手で直さない。 -->
  <defs>
    <!-- 七宝つなぎ。丸に萬の紋と同じ円の形を、地紋として薄く敷く。 -->
    <pattern id="shippo" width="${tile}" height="${tile}" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="${ACCENT}" stroke-width="${stroke}">
        <circle cx="0" cy="0" r="${r}"/>
        <circle cx="${tile}" cy="0" r="${r}"/>
        <circle cx="0" cy="${tile}" r="${r}"/>
        <circle cx="${tile}" cy="${tile}" r="${r}"/>
        <circle cx="${r}" cy="${r}" r="${r}"/>
      </g>
    </pattern>
    <!-- 中央（ロゴの周り）は地紋を消し、端に向かって濃くする。 -->
    <radialGradient id="fade" cx="50%" cy="50%" r="62%">
      <stop offset="0.38" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#fff" stop-opacity="1"/>
    </radialGradient>
    <mask id="edge">
      <rect width="${width}" height="${height}" fill="url(#fade)"/>
    </mask>
    <clipPath id="card">
      <rect width="${width}" height="${height}" rx="${radius}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${width}" height="${height}" fill="${CANVAS}"/>
    <rect width="${width}" height="${height}" fill="url(#shippo)" opacity="0.16" mask="url(#edge)"/>
    <rect y="${height - band}" width="${width}" height="${band}" fill="${ACCENT}"/>
  </g>
  <svg x="${x}" y="${y}" width="${logoWidth.toFixed(1)}" height="${logoHeight.toFixed(1)}" viewBox="0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}">${logoBody}</svg>
</svg>
`;
}

const outputs = {
  readme: {
    file: "docs/assets/banner.svg",
    svg: banner({
      width: 1280,
      height: 400,
      logoWidth: 760,
      radius: 28,
      band: 10,
      tile: 68,
      stroke: 1.4,
    }),
  },
  // OGP は SNS 側で角を丸めたり切り抜いたりするので、角丸にしない。
  ogp: {
    file: "site/ogp.png",
    svg: banner({
      width: 1200,
      height: 630,
      logoWidth: 880,
      radius: 0,
      band: 14,
      tile: 76,
      stroke: 1.6,
    }),
  },
};

for (const { file, svg } of [outputs.readme]) {
  await mkdir(dirname(join(root, file)), { recursive: true });
  await writeFile(join(root, file), svg);
  console.log(`作りました: ${file}`);
}

// OGP は Playwright のブラウザで SVG を描いて PNG にする。
const { chromium } = await import("@playwright/test");
const browser = await launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const work = join(tmpdir(), `yorozuya-ogp-${process.pid}.svg`);
  await writeFile(work, outputs.ogp.svg);
  await page.goto(`file://${work}`);
  await page.screenshot({
    path: join(root, outputs.ogp.file),
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await rm(work, { force: true });
  console.log(`作りました: ${outputs.ogp.file}`);
} finally {
  await browser.close();
}

// 撮影（capture.mjs）と同じく、Playwright の Chromium、無ければ手元の Chrome・Edge を使う。
async function launch() {
  const attempts = [{}, { channel: "chrome" }, { channel: "msedge" }];
  for (const options of attempts) {
    try {
      return await chromium.launch(options);
    } catch {
      // 次のブラウザを試す。
    }
  }
  console.error(
    "OGP 画像を描くブラウザがありません。make browsers を実行するか、Google Chrome を入れてください",
  );
  process.exit(1);
}
