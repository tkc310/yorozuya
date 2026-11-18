import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

// サーバの Chrome で作った PDF が、プレビューと同じ枚数の A4 になること。
test("スキルシートをサーバで PDF にしてダウンロードする", async ({ page }) => {
  await page.goto("/skill-sheet");
  await page.waitForLoadState("networkidle");
  const papers = await page.locator("[data-paper]").count();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "PDF をダウンロード" }).click(),
  ]);
  const path = await download.path();
  const pdf = await readFile(path, "latin1");

  expect(pdf.startsWith("%PDF-")).toBe(true);
  expect(pdf.match(/\/Type\s*\/Page\b/g)?.length).toBe(papers);
  // A4（595 × 842 pt）
  expect(pdf).toMatch(/\/MediaBox\s*\[\s*0 0 59[45]\.\d+ 84[12]\.\d+\s*\]/);
});
