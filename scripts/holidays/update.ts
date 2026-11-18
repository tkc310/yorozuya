// 内閣府の祝日 CSV を取得し、holidays/syukujitsu.csv（UTF-8 に直した写し）と
// holidays/holidays.json（アプリが GitHub Pages から読む形）を作り直す。
// GitHub Actions（.github/workflows/holidays.yml）が年に 1 回動かす。手元では make holidays-update。
//
//   --from <ファイル>  ネットワークを使わず、手元の CSV（Shift_JIS か UTF-8）から作る
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { HOLIDAY_CSV_URL } from "../../src/shared/features/work-report/holiday.schema";
import { parseHolidayCsv } from "../../src/shared/features/work-report/holiday-csv.service";

const root = join(import.meta.dir, "../..");
const out = join(root, "holidays");
const fromIndex = process.argv.indexOf("--from");
const from = fromIndex >= 0 ? process.argv[fromIndex + 1] : undefined;

// 内閣府の CSV は Shift_JIS。UTF-8 として読めればそのまま使う。
function decode(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return utf8.includes("�") ? new TextDecoder("shift_jis").decode(bytes) : utf8;
}

async function download(): Promise<Uint8Array> {
  const response = await fetch(HOLIDAY_CSV_URL, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`祝日 CSV を取得できませんでした（${response.status}）: ${HOLIDAY_CSV_URL}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

const bytes = from ? new Uint8Array(await readFile(from)) : await download();
const text = decode(bytes);
const parsed = parseHolidayCsv(text);
if (!parsed.ok) {
  console.error(parsed.error);
  process.exit(1);
}
const { feed } = parsed;
const thisYear = new Date().getFullYear();
const count = Object.keys(feed.holidays).length;
// 取得に失敗して空や途中までのデータで置き換えないよう、量と範囲を確かめる。
if (count < 500 || feed.maxYear < thisYear) {
  console.error(
    `祝日が少なすぎるか、今年（${thisYear}）を含みません: ${count} 件、${feed.minYear}〜${feed.maxYear} 年`,
  );
  process.exit(1);
}

await mkdir(out, { recursive: true });
const csv = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").trimEnd() + "\n";
await writeFile(join(out, "syukujitsu.csv"), csv);
await writeFile(join(out, "holidays.json"), JSON.stringify(feed, null, 2) + "\n");
console.log(`祝日を ${count} 件書き出しました（${feed.minYear}〜${feed.maxYear} 年）`);
