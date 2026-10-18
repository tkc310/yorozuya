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
