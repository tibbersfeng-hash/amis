import { test, expect } from '@playwright/test';

test.describe('FieldWithExcludeV2 Component — Operations & Data Assertions', () => {
  test('exclude checkbox: click toggles state, indicator appears', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Initial: Exclude indicator should NOT be visible (checkbox is false)
    await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();

    // Click Exclude checkbox
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // After click: indicator should be visible
    await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

    // Click again to uncheck
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // After uncheck: indicator should disappear
    await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-checkbox-toggle.png',
      fullPage: true,
    });
  });

  test('select: initial value matches test data', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find select inside field-with-exclude-v2 component
    const v2Select = page.locator('.field-with-exclude-v2 .cxd-Select').first();

    // Initial value should be "选项X, 选项Y" (from test data: ["x", "y"])
    await expect(v2Select).toContainText('选项X');
    await expect(v2Select).toContainText('选项Y');

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-initial-value.png',
      fullPage: true,
    });
  });

  test('exclude mode: checkbox state toggles correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Initial: checkbox should be unchecked
    const checkbox = page.locator('.field-with-exclude-v2 input[type="checkbox"]').first();
    const isChecked = await checkbox.evaluate((el) => el.checked);
    expect(isChecked).toBe(false);

    // Click checkbox to check it
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // After check: indicator should appear
    await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

    // Verify checkbox is now checked
    const isCheckedAfter = await checkbox.evaluate((el) => el.checked);
    expect(isCheckedAfter).toBe(true);

    // Uncheck again
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // Indicator should disappear
    await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();

    // Verify checkbox is unchecked
    const isCheckedFinal = await checkbox.evaluate((el) => el.checked);
    expect(isCheckedFinal).toBe(false);

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-exclude-mode.png',
      fullPage: true,
    });
  });

  test('exclude toggle does not affect selected values', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find select inside field-with-exclude-v2
    const v2Select = page.locator('.field-with-exclude-v2 .cxd-Select').first();
    const checkbox = page.locator('.field-with-exclude-v2 input[type="checkbox"]').first();

    // Initial: select shows "选项X, 选项Y", checkbox unchecked
    const initialValues = await v2Select.locator('.cxd-Select-value').allTextContents();
    expect(initialValues).toContain('选项X');
    expect(initialValues).toContain('选项Y');
    expect(await checkbox.evaluate((el) => el.checked)).toBe(false);

    // Step 1: Check exclude — values should NOT change
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // Verify indicator appears
    await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

    // Verify select values preserved after check
    const afterCheckValues = await v2Select.locator('.cxd-Select-value').allTextContents();
    expect(afterCheckValues).toContain('选项X');
    expect(afterCheckValues).toContain('选项Y');

    // Step 2: Uncheck exclude — values should still NOT change
    await page.evaluate(() => {
        const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
        if (!el) return;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
        if (key && typeof el[key]?.onClick === 'function') {
          el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
        }
      });
    await page.waitForTimeout(1000);

    // Verify indicator disappears
    await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();

    // Verify select values preserved after uncheck
    const finalValues = await v2Select.locator('.cxd-Select-value').allTextContents();
    expect(finalValues).toContain('选项X');
    expect(finalValues).toContain('选项Y');

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-exclude-preserve-values.png',
      fullPage: true,
    });
  });

  test('multiLang data: correct values loaded for zh and en', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find select inside field-with-exclude-v2
    const v2Select = page.locator('.field-with-exclude-v2 .cxd-Select').first();

    // Chinese: should show "选项X, 选项Y"
    await expect(v2Select).toContainText('选项X');
    await expect(v2Select).toContainText('选项Y');

    // Switch to English
    await page.locator('.language-select').first().selectOption('en');
    await page.waitForTimeout(2000);

    // English: should still show the same values
    await expect(v2Select).toContainText('选项X');
    await expect(v2Select).toContainText('选项Y');

    // Switch back to Chinese
    await page.locator('.language-select').first().selectOption('zh');
    await page.waitForTimeout(2000);

    // Should still show "选项X, 选项Y"
    await expect(v2Select).toContainText('选项X');
    await expect(v2Select).toContainText('选项Y');

    await page.screenshot({
      path: 'tests/e2e/screenshots/field-exclude-v2-multilang-values.png',
      fullPage: true,
    });
  });
});
