import { expect, test } from "@playwright/test";

test("トップからスキルシートを開く", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "よろずや", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "スキルシートを開く" }).click();
  await expect(page).toHaveURL("/skill-sheet");
  await expect(page.getByRole("heading", { name: "スキルシート", level: 1 })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "氏名" })).toBeVisible();
});

test("パンくずリストとロゴからトップに戻る", async ({ page }) => {
  await page.goto("/skill-sheet");
  const crumbs = page.getByRole("navigation", { name: "パンくずリスト" });
  await crumbs.getByRole("link", { name: "トップ" }).click();
  await expect(page).toHaveURL("/");
  await page.goto("/skill-sheet");
  await page.getByRole("link", { name: "よろずや トップへ" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "よろずや", level: 1 })).toBeVisible();
});

test("トップから作業報告書を開き、入力が保存される", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "作業報告書を開く" }).click();
  await expect(page).toHaveURL("/work-report");
  await expect(page.getByRole("heading", { name: "作業報告書", level: 1 })).toBeVisible();
  await page.getByRole("tab", { name: "1月", exact: true }).click();
  const start = page.getByRole("textbox", { name: "1月5日の開始" });
  await start.fill("930");
  await page.getByRole("textbox", { name: "1月5日の終了" }).fill("18:30");
  await page.getByRole("textbox", { name: "1月5日の休憩（分）" }).fill("60");
  await page.getByRole("textbox", { name: "1月5日の作業内容" }).click();
  await expect(start).toHaveValue("9:30");
  await expect(page.getByText("今月の稼働日").locator("xpath=following-sibling::dd")).toHaveText(
    /日/,
  );
  await page.reload();
  await page.getByRole("tab", { name: "1月", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "1月5日の終了" })).toHaveValue("18:30");
});
