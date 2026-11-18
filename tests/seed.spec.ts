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
  // 画面が操作を受け付ける前に押すとタブが切り替わらないので、切り替わるまで押し直す。
  const january = page.getByRole("tab", { name: "1月", exact: true });
  await expect(async () => {
    await january.click();
    await expect(january).toHaveAttribute("aria-selected", "true", { timeout: 1000 });
  }).toPass();
  // 名前は完全一致で探す（部分一致だと「11月5日の開始」にも当たる）。
  const start = page.getByRole("textbox", { name: "1月5日の開始", exact: true });
  await start.fill("930");
  await page.getByRole("textbox", { name: "1月5日の終了", exact: true }).fill("18:30");
  await page.getByRole("textbox", { name: "1月5日の休憩（分）", exact: true }).fill("60");
  await page.getByRole("textbox", { name: "1月5日の作業内容", exact: true }).click();
  await expect(start).toHaveValue("9:30");
  await expect(
    page.getByText("1月の稼働日", { exact: true }).locator("xpath=following-sibling::dd"),
  ).toHaveText(/日/);
  await page.reload();
  await expect(async () => {
    await january.click();
    await expect(january).toHaveAttribute("aria-selected", "true", { timeout: 1000 });
  }).toPass();
  await expect(page.getByRole("textbox", { name: "1月5日の終了", exact: true })).toHaveValue(
    "18:30",
  );
});
