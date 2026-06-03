import { test, expect } from '@playwright/test';

test.describe('Remote Page — API-driven schema rendering', () => {
  test('loads and renders page from remote schema + data API', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?schema=remote-schema.json&data=remote-data.json');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify the form is rendered — check for Amis form structure
    const form = page.locator('.cxd-Form');
    await expect(form).toBeVisible();

    // Verify form fields are present
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('张三');

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveValue('zhangsan@example.com');

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/remote-page-basic.png',
      fullPage: true,
    });
  });

  test('shows error when schema API fails', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?schema=nonexistent.json&data=remote-data.json');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show error message (Loading component uses .loading-overlay with error text)
    const overlay = page.locator('.loading-overlay');
    await expect(overlay).toBeVisible();

    // Check for error indicator (⚠️ emoji)
    await expect(page.getByText('⚠️')).toBeVisible();
  });
});
