import { test, expect } from '@playwright/test';

test.describe('Sub Mission Rule', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('Sub Mission Rule tab renders forms with values', async ({ page }) => {
    // Click Sub Mission Rule tab
    const subMissionTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').filter({ hasText: 'Sub Mission Rule' });
    await subMissionTab.click();
    await page.waitForTimeout(500);

    // Both sub tabs should be visible
    await expect(page.getByText('Sub Mission 1').first()).toBeVisible();
    await expect(page.getByText('Sub Mission 2').first()).toBeVisible();

    // Check Sub Mission 1 form values (all fields in one form)
    const subMissionName = await page.locator('.schema-preview-ami-container input[name="subMissionName"]').inputValue();
    expect(subMissionName).toBe('连续签到7天');

    const currency = await page.locator('.schema-preview-ami-container input[name="currency"]').inputValue();
    expect(currency).toBe('积分');

    const awardName = await page.locator('.schema-preview-ami-container input[name="awardName"]').inputValue();
    expect(awardName).toBe('宝箱钥匙');

    const ctaText = await page.locator('.schema-preview-ami-container input[name="ctaText"]').inputValue();
    expect(ctaText).toBe('立即签到');

    const ctaLink = await page.locator('.schema-preview-ami-container input[name="ctaLink"]').inputValue();
    expect(ctaLink).toBe('/mission/daily-checkin');
  });
});
