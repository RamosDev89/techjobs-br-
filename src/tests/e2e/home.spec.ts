import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("TechJobs BR")).toBeVisible();
    await expect(page.getByRole("link", { name: /buscar vagas/i })).toBeVisible();
  });

  test("navigates to vagas page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /buscar vagas/i }).first().click();
    await expect(page).toHaveURL("/vagas");
  });
});

test.describe("Vagas page", () => {
  test("renders filter sidebar", async ({ page }) => {
    await page.goto("/vagas");
    await expect(page.getByText(/filtros/i)).toBeVisible();
  });

  test("search updates URL param", async ({ page }) => {
    await page.goto("/vagas");
    await page.fill('[name="q"]', "React");
    await page.click('[type="submit"]');
    await expect(page).toHaveURL(/\?.*q=React/);
  });
});
