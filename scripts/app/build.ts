// macOS 向けに よろずや.app を組み立てる。出力は dist/Yorozuya.app。
// YOROZUYA_TARGET（bun-darwin-arm64 / bun-darwin-x64）を渡すと、その CPU 向けのサーバを作る。
import { $ } from "bun";
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const app = join(root, "dist/Yorozuya.app");
const contents = join(app, "Contents");
const macos = join(contents, "MacOS");
const resources = join(contents, "Resources");
const work = join(root, "dist/app-build");
// macOS のアプリアイコンの原画。角丸の地まで描いた 1024px の正方形を使う（icon.png は Web 用の透過した紋）。
const icon = join(root, "src/assets/images/icon_apple.png");
const ICON_SIZE = 1024;
const { version } = (await Bun.file(join(root, "package.json")).json()) as { version: string };
const target = process.env.YOROZUYA_TARGET;

$.cwd(root);

await $`bun --bun vp build`;

await rm(app, { recursive: true, force: true });
await rm(work, { recursive: true, force: true });

// 常駐する AppleScript アプレットを土台にする。Dock の「終了」でサーバも止まる。
await $`osacompile -s -o ${app} scripts/app/launcher.applescript`;
await rm(join(resources, "Assets.car"), { force: true });
await rm(join(resources, "applet.icns"), { force: true });

const targetArgs = target ? [`--target=${target}`] : [];
await $`bun build --compile --minify ${targetArgs} scripts/app/server.ts --outfile ${join(macos, "yorozuya-server")}`;
await cp(join(root, "scripts/app/start.sh"), join(resources, "start.sh"));
await $`chmod +x ${join(resources, "start.sh")}`;

await cp(join(root, "dist/client"), join(resources, "client"), { recursive: true });
await cp(join(root, "src/db/migrations"), join(resources, "migrations"), { recursive: true });

// icon_apple.png（1024px）から .icns を作る。原画の大きさが違えば、粗いアイコンにならないよう止める。
const iconInfo = await $`sips -g pixelWidth -g pixelHeight ${icon}`.text();
const [width, height] = ["pixelWidth", "pixelHeight"].map((key) =>
  Number(new RegExp(`${key}: (\\d+)`).exec(iconInfo)?.[1]),
);
if (width !== ICON_SIZE || height !== ICON_SIZE) {
  console.error(
    `アプリアイコンの原画は ${ICON_SIZE}px の正方形にしてください: ${icon}（${width}×${height}）`,
  );
  process.exit(1);
}
const iconset = join(work, "AppIcon.iconset");
await mkdir(iconset, { recursive: true });
for (const size of [16, 32, 128, 256, 512]) {
  await $`sips -z ${size} ${size} ${icon} --out ${join(iconset, `icon_${size}x${size}.png`)}`.quiet();
  const double = size * 2;
  await $`sips -z ${double} ${double} ${icon} --out ${join(iconset, `icon_${size}x${size}@2x.png`)}`.quiet();
}
await $`iconutil -c icns ${iconset} -o ${join(resources, "AppIcon.icns")}`;

const plist = join(contents, "Info.plist");
const entries: [string, string][] = [
  ["CFBundleDevelopmentRegion", "ja"],
  ["CFBundleDisplayName", "よろずや"],
  ["CFBundleIconFile", "AppIcon"],
  ["CFBundleIdentifier", "com.github.tkc310.yorozuya"],
  ["CFBundleName", "よろずや"],
  ["CFBundleShortVersionString", version],
  ["CFBundleVersion", "1"],
  ["LSMinimumSystemVersion", "11.0"],
];
for (const [key, value] of entries) {
  await $`plutil -replace ${key} -string ${value} ${plist}`;
}
await $`plutil -remove CFBundleIconName ${plist}`.nothrow().quiet();

// 自分の Mac で開けるようにアドホック署名する。
await $`codesign --force --deep --sign - ${app}`;
await rm(work, { recursive: true, force: true });

console.log(`built ${app}`);
