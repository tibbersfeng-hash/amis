import { test, expect } from '@playwright/test';

test.describe('Promotion CMS - Date Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });
  });

  test.describe('input-datetime', () => {
    test('【日期时间】Active Period 输入框存在', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.cxd-DateControl, .cxd-DatetimeControl').first()).toBeVisible();
    });

    test('【日期时间】Active Period 有默认值', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const dateInputs = activePane.locator('.cxd-DateControl input[type="text"], .cxd-DatetimeControl input[type="text"]');
      const firstValue = await dateInputs.first().inputValue();
      expect(firstValue.length).toBeGreaterThan(0);
    });

    test('【日期时间】必填标记存在', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.section-title-sm .asterisk')).toBeVisible();
    });
  });

  test.describe('flash sale datetime', () => {
    test('【日期时间】Flash Sale Start Time 存在', async ({ page }) => {
      // Check via evaluate since visibleOn controls visibility
      const flashTimeVisible = await page.evaluate(() => {
        const items = document.querySelectorAll('.cxd-Form-item--normal');
        const item = Array.from(items).find(el => el.textContent?.includes('Flash Sale Start'));
        return item ? item.offsetParent !== null : false;
      });
      expect(flashTimeVisible).toBe(true);
    });

    test('【日期时间】Flash Sale Duration 存在', async ({ page }) => {
      const durationVisible = await page.evaluate(() => {
        const items = document.querySelectorAll('.cxd-Form-item--normal');
        const item = Array.from(items).find(el => el.textContent?.includes('Duration'));
        return item ? item.offsetParent !== null : false;
      });
      expect(durationVisible).toBe(true);
    });
  });
});
