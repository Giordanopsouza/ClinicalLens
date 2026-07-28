import { test, expect } from "@playwright/test";

test("dashboard is protected and redirects to sign-in", async ({ page }) => {
  await page.goto("/dashboard");
  // Clerk usually redirects to its own domain or a local sign-in path
  await page.waitForURL(/sign-in/);
  await expect(page).toHaveURL(/sign-in/);
});

test("records page is protected and redirects to sign-in", async ({ page }) => {
  await page.goto("/records");
  await page.waitForURL(/sign-in/);
  await expect(page).toHaveURL(/sign-in/);
});
