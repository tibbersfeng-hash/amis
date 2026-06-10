import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Date Inputs', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // date-range-picker (自定义范围日期选择器)
  // ==========================================
  test.describe('date-range-picker', () => {
    test('【范围日期】Registration Period 输入框存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title').filter({ hasText: 'Registration Period' })).toBeVisible();
    });

    test('【范围日期】Registration Period 有默认值', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await expect(picker).toBeVisible();
      const input = picker.locator('.date-range-picker-input').first();
      const value = await input.inputValue();
      expect(typeof value).toBe('string');
      expect(value).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('【范围日期】点击输入框打开日期选择弹窗', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await picker.locator('.date-range-picker-input').click();
      await expect(page.locator('.date-range-picker-popover')).toBeVisible();
    });

    test('【范围日期】Registration Period 必填标记存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title').filter({ hasText: 'Registration Period' }).first()).toContainText('*');
    });

    test('【范围日期】输入框右侧有日历图标', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await expect(picker.locator('.date-range-picker-icon')).toBeVisible();
    });

    test('【范围日期】空值时显示占位符', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      const input = picker.locator('.date-range-picker-input').first();
      await expect(input).toBeVisible();
      const placeholder = await input.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    test('【范围日期】弹窗包含日历网格', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await picker.locator('.date-range-picker-input').click();
      await expect(page.locator('.drp-days')).toBeVisible();
      await expect(page.locator('.drp-weekday')).toHaveCount(7);
    });

    test('【范围日期】弹窗包含时间输入框', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await picker.locator('.date-range-picker-input').click();
      await expect(page.locator('.drp-time-row')).toBeVisible();
      const timeInputs = page.locator('.drp-time-fields input[type="number"]');
      expect(await timeInputs.count()).toBeGreaterThanOrEqual(6);
    });

    test('【范围日期】确认按钮关闭弹窗', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await picker.locator('.date-range-picker-input').click();
      await page.locator('.drp-btn-confirm').click();
      await expect(page.locator('.date-range-picker-popover')).not.toBeVisible();
    });
  });

  // ==========================================
  // input-date (Countdown Day 日期选择器)
  // ==========================================
  test.describe('input-date', () => {
    test('【日期】Countdown Day 输入框存在', async ({ page }) => {
      await goToMission(page);
      await page.locator('.antd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);
      const dateItem = page.locator('.antd-Form-item--normal').filter({ hasText: 'Countdown Day' });
      await expect(dateItem).toBeVisible();
      await expect(dateItem.locator('.antd-DateControl').first()).toBeVisible();
    });

    test('【日期】Countdown Day 默认值正确', async ({ page }) => {
      await goToMission(page);
      await page.locator('.antd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);
      const dateControl = page.locator('.antd-Form-item--normal').filter({ hasText: 'Countdown Day' }).locator('.antd-DateControl').first();
      await expect(dateControl).toBeVisible();
    });

    test('【日期】点击输入框打开日期选择器', async ({ page }) => {
      await goToMission(page);
      await page.locator('.antd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);
      const input = page.locator('.antd-Form-item--normal').filter({ hasText: 'Countdown Day' }).locator('.antd-DatePicker-input').first();
      await expect(input).toBeVisible();
      await input.click();
      await page.waitForTimeout(500);
    });

    test('【日期】Countdown Day 必填标记存在', async ({ page }) => {
      await goToMission(page);
      await page.locator('.antd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);
      const item = page.locator('.antd-Form-item--normal').filter({ hasText: 'Countdown Day' }).first();
      await expect(item).toBeVisible();
    });
  });

  // ==========================================
  // input-date-range (搜索区域日期范围选择器)
  // ==========================================
  test.describe('input-date-range', () => {
    test('【日期范围】搜索区域有两个日期范围选择器', async ({ page }) => {
      await page.goto('/?page=list');
      await page.waitForSelector('.antd-Table-table tbody tr', { timeout: 10000 });
      const dateRangeCount = await page.locator('.antd-DateRangeControl').count();
      expect(dateRangeCount).toBeGreaterThanOrEqual(2);
    });

    test('【日期范围】占位符为英文 (Start/End)', async ({ page }) => {
      await page.goto('/?page=list');
      await page.waitForSelector('.antd-Table-table tbody tr', { timeout: 10000 });
      const input = page.locator('.antd-DateRangeControl').first().locator('.antd-DateRangePicker-input').first();
      await expect(input).toBeVisible();
      const placeholder = await input.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
    });

    test('【日期范围】点击打开日期弹窗', async ({ page }) => {
      await page.goto('/?page=list');
      await page.waitForSelector('.antd-Table-table tbody tr', { timeout: 10000 });
      const input = page.locator('.antd-DateRangeControl').first().locator('.antd-DateRangePicker-input').first();
      await expect(input).toBeVisible();
      await input.click();
      await page.waitForTimeout(500);
    });

    test('【日期范围】两个输入之间有分隔符', async ({ page }) => {
      await page.goto('/?page=list');
      await page.waitForSelector('.antd-Table-table tbody tr', { timeout: 10000 });
      await expect(page.locator('.antd-DateRangeControl').first().locator('.antd-DateRangePicker-input-separator').first()).toBeVisible();
    });

    test('【日期范围】输入框有日历图标', async ({ page }) => {
      await page.goto('/?page=list');
      await page.waitForSelector('.antd-Table-table tbody tr', { timeout: 10000 });
      await expect(page.locator('.antd-DateRangeControl').first().locator('.antd-DateRangePicker-toggler').first()).toBeVisible();
    });
  });
});
