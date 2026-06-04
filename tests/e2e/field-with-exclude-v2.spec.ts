import { test, expect } from '@playwright/test';

test.describe('FieldWithExcludeV2 Component', () => {
  test('showcase: renders with Amis native styling', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude-v2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Component wrapper visible
    await expect(page.locator('.field-with-exclude-v2').first()).toBeVisible();

    // Label row with label + checkbox
    await expect(page.locator('.field-with-exclude-v2-label-row').first()).toBeVisible();
    await expect(page.getByText('Market Code').first()).toBeVisible();
    await expect(page.getByText('Exclude').first()).toBeVisible();

    // Amis native select
    await expect(page.locator('.cxd-Select').first()).toBeVisible();

    // Both field-with-exclude-v2 components visible (Market Code + Rate Code)
    await expect(page.locator('.field-with-exclude-v2')).toHaveCount(2);

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-showcase.png',
      fullPage: true,
    });
  });

  test('remote: renders from multiLang schema with correct data', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Component visible
    await expect(page.locator('.field-with-exclude-v2').first()).toBeVisible();

    // Label visible
    await expect(page.getByText('排除选择').first()).toBeVisible();

    // Exclude checkbox visible
    await expect(page.getByText('Exclude').first()).toBeVisible();

    // Amis native select visible
    await expect(page.locator('.cxd-Select').first()).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-remote-zh.png',
      fullPage: true,
    });
  });

  test('multiLang: language switch preserves selection', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Get initial select display
    const selectValue = page.locator('.cxd-Select-value').first();
    const initialText = await selectValue.textContent();
    console.log('Initial select value (zh):', initialText);

    // Switch to English
    await page.locator('.language-select').first().selectOption('en');
    await page.waitForTimeout(2000);

    // Check select display after language switch
    const afterText = await selectValue.textContent();
    console.log('Select value after switch (en):', afterText);

    // Switch back to Chinese
    await page.locator('.language-select').first().selectOption('zh');
    await page.waitForTimeout(2000);

    // Check select display after switching back
    const backText = await selectValue.textContent();
    console.log('Select value after switch back (zh):', backText);

    // Value should be preserved (initial === back)
    expect(backText).toBe(initialText);

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-multilang.png',
      fullPage: true,
    });
  });
});
