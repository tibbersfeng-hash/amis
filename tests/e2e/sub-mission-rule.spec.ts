import { test, expect } from '@playwright/test';

test.describe('Sub Mission Rule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Sub Mission Rule tab renders combo with values', async ({ page }) => {
    // Click Sub Mission Rule tab
    const subMissionTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').filter({ hasText: 'Sub Mission Rule' });
    await subMissionTab.click();
    await page.waitForTimeout(500);

    // Both combo items should be visible
    const comboItems = page.locator('.cxd-Combo-item');
    await expect(comboItems).toHaveCount(2);

    // Check first combo item form values
    const firstItem = comboItems.first();
    expect(await firstItem.locator('input[name="subMissionName"]').inputValue()).toBe('连续签到7天');
    expect(await firstItem.locator('input[name="currency"]').inputValue()).toBe('积分');
    expect(await firstItem.locator('input[name="awardName"]').inputValue()).toBe('宝箱钥匙');
    expect(await firstItem.locator('input[name="ctaText"]').inputValue()).toBe('立即签到');
    expect(await firstItem.locator('input[name="ctaLink"]').inputValue()).toBe('/mission/daily-checkin');

    // Check second combo item form values
    const secondItem = comboItems.last();
    expect(await secondItem.locator('input[name="subMissionName"]').inputValue()).toBe('连续签到30天');
    expect(await secondItem.locator('input[name="currency"]').inputValue()).toBe('钻石');
    expect(await secondItem.locator('input[name="awardName"]').inputValue()).toBe('限定头像框');
    expect(await secondItem.locator('input[name="ctaText"]').inputValue()).toBe('查看详情');
    expect(await secondItem.locator('input[name="ctaLink"]').inputValue()).toBe('/mission/monthly-checkin');
  });
});
