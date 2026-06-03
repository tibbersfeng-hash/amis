import { test, expect } from '@playwright/test';

test.describe('Remote Page — API-driven schema rendering', () => {
  test('loads and renders page from dataType + dataId', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=remote&dataId=remote');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify the form is rendered
    const form = page.locator('.cxd-Form');
    await expect(form).toBeVisible();

    // Verify form fields are present with data values
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

  test('shows error when dataType schema file not found', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=nonexistent&dataId=remote');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show error message
    const overlay = page.locator('.loading-overlay');
    await expect(overlay).toBeVisible();
    await expect(page.getByText('⚠️')).toBeVisible();
  });

  test('loads schema with empty data when dataId file not found', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=remote&dataId=nonexistent');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Form should render but with empty fields
    const form = page.locator('.cxd-Form');
    await expect(form).toBeVisible();

    // Name field should be empty (no data file)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('');
  });

  test('missing params shows error', async ({ page }) => {
    await page.goto('http://localhost:5173/remote');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show error about missing params
    const overlay = page.locator('.loading-overlay');
    await expect(overlay).toBeVisible();
  });
});
