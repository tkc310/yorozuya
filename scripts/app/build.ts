// macOS 向けに よろずや.app を組み立てる。出力は dist/Yorozuya.app。
import { $ } from "bun";
import { cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const app = join(root, "dist/Yorozuya.app");
const contents = join(app, "Contents");
const macos = join(contents, "MacOS");
const resources = join(contents, "Resources");
const work = join(root, "dist/app-build");
const icon = join(root, "src/assets/images/icon.png");

$.cwd(root);

await $`bun --bun vp build`;

await rm(app, { recursive: true, force: true });
await rm(work, { recursive: true, force: true });

// 常駐する AppleScript アプレットを土台にする。Dock の「終了」でサーバも止まる。
await $`osacompile -s -o ${app} scripts/app/launcher.applescript`;
await rm(join(resources, "Assets.car"), { force: true });
await rm(join(resources, "applet.icns"), { force: true });

await $`bun build --compile --minify scripts/app/server.ts --outfile ${join(macos, "yorozuya-server")}`;
await cp(join(root, "scripts/app/start.sh"), join(resources, "start.sh"));
await $`chmod +x ${join(resources, "start.sh")}`;

await cp(join(root, "dist/client"), join(resources, "client"), { recursive: true });
await cp(join(root, "src/db/migrations"), join(resources, "migrations"), { recursive: true });

// icon.png（512px）から .icns を作る。
const iconset = join(work, "AppIcon.iconset");
await mkdir(iconset, { recursive: true });
for (const size of [16, 32, 128, 256, 512]) {
  await $`sips -z ${size} ${size} ${icon} --out ${join(iconset, `icon_${size}x${size}.png`)}`.quiet();
  if (size < 512) {
    const double = size * 2;
    await $`sips -z ${double} ${double} ${icon} --out ${join(iconset, `icon_${size}x${size}@2x.png`)}`.quiet();
  }
}
await $`iconutil -c icns ${iconset} -o ${join(resources, "AppIcon.icns")}`;

const plist = join(contents, "Info.plist");
const entries: [string, string][] = [
  ["CFBundleDevelopmentRegion", "ja"],
  ["CFBundleDisplayName", "よろずや"],
  ["CFBundleIconFile", "AppIcon"],
  ["CFBundleIdentifier", "com.github.tkc310.yorozuya"],
  ["CFBundleName", "よろずや"],
  ["CFBundleShortVersionString", "0.1.0"],
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
