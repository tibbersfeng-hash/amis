import { test, expect } from '@playwright/test';

test.describe('Mission - Form Save & Reconstruct', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  test('Save button outputs complete mission data', async ({ page }) => {
    // Set up console log capture
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    // Click Save
    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));

    // Verify key mission fields are present in the saved data
    expect(logs).toContain('missionCode');
    expect(logs).toContain('MISSION_20260430_001');
    expect(logs).toContain('missionName');
    expect(logs).toContain('Summer Spending Mission');
    expect(logs).toContain('regStartTime');
    expect(logs).toContain('2019-03-01');
    expect(logs).toContain('regEndTime');
    expect(logs).toContain('2019-03-03');
    expect(logs).toContain('missionStartTime');
    expect(logs).toContain('missionEndTime');
    expect(logs).toContain('missionThumbnail');
    expect(logs).toContain('missionDetail');
    expect(logs).toContain('subMissionType');
    expect(logs).toContain('ROOM_STAY_NIGHTS');
    expect(logs).toContain('subStayStart');
    expect(logs).toContain('subStayEnd');
  });

  test('Save includes i18n fields with language-specific values', async ({ page }) => {
    // Set up console log capture
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    // Click Save
    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));

    // Verify i18n fields are present (missionName, missionShortName, etc.)
    expect(logs).toContain('missionName');
    expect(logs).toContain('tcContent');
  });

  test('Form data persists after tab switching', async ({ page }) => {
    // Navigate to Sub-Mission Rules tab
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
    await page.waitForTimeout(300);

    // Verify datetime values are still present
    const datetimeInputs = page.locator('.date-range-picker-input');
    const count = await datetimeInputs.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Switch back to Mission Setup
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first().click({ force: true });
    await page.waitForTimeout(300);

    // Verify registration period values still exist
    const regInputs = page.locator('.date-range-picker-input');
    const regCount = await regInputs.count();
    expect(regCount).toBeGreaterThanOrEqual(2);

    const firstValue = await regInputs.first().inputValue();
    expect(firstValue).toBeTruthy();
  });
});
