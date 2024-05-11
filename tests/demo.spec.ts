import { test, expect } from "@playwright/test"

test("demo test", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("link", { name: "Cookings" }).click()

  await page.waitForURL("/cookings")

  await page.getByRole("button", { name: "Edit" }).first().click()
  await page
    .locator('input[name="foods\\.0\\.usedIngredients\\.0\\.calories"]')
    .fill("30")
  await page.getByRole("button", { name: "Save" }).click()

  await page.goto("/cookings/5")

  await page.locator('[id="\\:R4mnkvffacq\\:-form-item"]').fill("15")
  await page.getByRole("button", { name: "Save" }).click()
  await page.getByRole("link", { name: "Cookings" }).click()

  await page.waitForURL("/cookings")

  await page.getByRole("button", { name: "Edit" }).first().click()

  await expect(page.locator('[id="\\:re\\:-form-item"]')).toHaveValue("15")
})
