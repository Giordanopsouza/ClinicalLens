import { test, expect } from "@playwright/test";

test("landing page loads and displays branding", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Clinical Lens/);
  await expect(page.getByText(/Next-Gen Clinical Decision Support/i)).toBeVisible();
});

test("navigation menu works on landing page", async ({ page }) => {
  await page.goto("/");
  const getStarted = page.getByRole("link", { name: /Dashboard/i }).first();
  await expect(getStarted).toBeVisible();
});
