import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Date Range Picker Layout', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // Date Range Picker Components - display and layout
  // ==========================================
  test.describe('Date Range Picker Display', () => {
    test('【范围日期】Registration Period 有范围选择器', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      await expect(picker).toBeVisible();
      const input = picker.locator('.date-range-picker-input');
      await expect(input).toBeVisible();
    });

    test('【范围日期】Registration Period 显示默认范围值', async ({ page }) => {
      await goToMission(page);
      const picker = page.locator('.date-range-picker').first();
      const input = picker.locator('.date-range-picker-input');
      const value = await input.inputValue();
      expect(value).toMatch(/2019-03-01/);
      expect(value).toMatch(/2019-03-03/);
    });

    test('【范围日期】Mission Period 有范围选择器', async ({ page }) => {
      await goToMission(page);
      const pickers = page.locator('.date-range-picker');
      expect(await pickers.count()).toBeGreaterThanOrEqual(2);
      const missionPicker = pickers.nth(1);
      await expect(missionPicker).toBeVisible();
    });

    test('【范围日期】Mission Period 显示默认范围值', async ({ page }) => {
      await goToMission(page);
      const pickers = page.locator('.date-range-picker');
      const missionPicker = pickers.nth(1);
      const input = missionPicker.locator('.date-range-picker-input');
      const value = await input.inputValue();
      expect(value).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('【范围日期】所有范围选择器高度一致', async ({ page }) => {
      await goToMission(page);
      const inputs = page.locator('.date-range-picker-input-wrap');
      const firstH = await inputs.first().boundingBox().then(b => b.height);
      const secondH = await inputs.nth(1).boundingBox().then(b => b.height);
      expect(Math.abs(firstH - secondH)).toBeLessThanOrEqual(2);
    });
  });

  // ==========================================
  // Date Range Picker on Other Tabs
  // ==========================================
  test.describe('Date Range Picker - Other Tabs', () => {
    test('【范围日期】Skin Setting tab 有范围选择器', async ({ page }) => {
      await goToMission(page);
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
      await page.waitForTimeout(500);
      const picker = page.locator('.date-range-picker');
      expect(await picker.count()).toBeGreaterThanOrEqual(1);
    });

    test('【范围日期】Skin Setting 范围选择器显示默认值', async ({ page }) => {
      await goToMission(page);
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
      await page.waitForTimeout(500);
      const picker = page.locator('.date-range-picker').first();
      const input = picker.locator('.date-range-picker-input');
      const value = await input.inputValue();
      expect(value).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    test('【范围日期】Sub-Mission Rules tab 有范围选择器', async ({ page }) => {
      await goToMission(page);
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
      await page.waitForTimeout(500);
      const picker = page.locator('.date-range-picker');
      expect(await picker.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // Background Color / Font Color still side by side
  // ==========================================
  test.describe('Color Controls Layout', () => {
    test('【颜色控件】Background Color / Font Color 在一行', async ({ page }) => {
      await goToMission(page);
      const tabs = page.locator('.cxd-Tabs-link');
      await tabs.nth(2).click({ force: true });
      await page.waitForTimeout(500);
      const bgColorItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' });
      const fontColorItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Font Color' });
      await expect(bgColorItem).toBeVisible();
      await expect(fontColorItem).toBeVisible();
      const box1 = await bgColorItem.boundingBox();
      const box2 = await fontColorItem.boundingBox();
      expect(box1).not.toBeNull();
      expect(box2).not.toBeNull();
      const yDiff = Math.abs(box1!.y - box2!.y);
      expect(yDiff).toBeLessThan(20);
    });
  });

  // ==========================================
  // Single date control - Countdown Day
  // ==========================================
  test.describe('Single Date - Countdown Day Layout', () => {
    test('【单日】Countdown Day 不在 group 中（独立一行）', async ({ page }) => {
      await goToMission(page);
      const tabs = page.locator('.cxd-Tabs-link');
      const tabCount = await tabs.count();
      if (tabCount > 3) {
        await tabs.nth(3).click({ force: true });
        await page.waitForTimeout(300);
      }
      const countdownItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown Day' });
      await expect(countdownItem).toBeVisible();
      const dateControl = countdownItem.locator('.cxd-DateControl');
      await expect(dateControl.first()).toBeVisible();
      const datetimeControls = countdownItem.locator('.cxd-DateControl.is-datetime');
      const count = await datetimeControls.count();
      expect(count).toBe(0);
    });
  });
});
