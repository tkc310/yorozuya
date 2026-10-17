import { expect, test } from "@playwright/test";

test("スキルシートを開く", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "スキルシート" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "氏名" })).toBeVisible();
});
