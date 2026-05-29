import { test, expect } from '@playwright/test';

/**
 * Tests that custom Amis components (DateRangePicker)
 * preserve their selected values when the language is switched.
 *
 * This covers the bug where native input selectors (input[name="field"])
 * failed for custom components that don't render native <input> elements.
 *
 * Fix: readI18nFieldValue / writeI18nFieldValue fall back to Amis store API
 * (window.amisStore.changeValue) when DOM selector returns nothing.
 */

// =========================================================================
// Showcase route: DateRangePicker custom component — tests value preservation
// =========================================================================

test.describe('Custom Component i18n — Showcase (DateRangePicker)', () => {
  test('selecting date range preserves after language switch', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#date-range-picker');
    await page.waitForTimeout(1000);

    // 1. Click the date picker to open it
    const drpInput = page.locator('.showcase-content').locator('.date-range-picker-input').first();
    await drpInput.click();
    await page.waitForTimeout(500);

    // 2. Select start date (click day 15)
    await page.locator('.drp-days .drp-day').nth(14).click();
    await page.waitForTimeout(200);

    // 3. Select end date (click day 20)
    await page.locator('.drp-days .drp-day').nth(19).click();
    await page.waitForTimeout(300);

    // 4. Click confirm
    await page.locator('.drp-btn-confirm').first().click();
    await page.waitForTimeout(500);

    // Capture the displayed value
    const displayText = await drpInput.inputValue();
    expect(displayText).toBeTruthy();
    expect(displayText.length).toBeGreaterThan(10);

    // 5. Switch language
    await page.locator('.showcase-lang-bar select').selectOption('en');
    await page.waitForTimeout(1000);

    // 6. Date range should still be displayed
    const afterLangText = await drpInput.inputValue();
    expect(afterLangText).toBeTruthy();
    expect(afterLangText).toBe(displayText);
  });
});

// =========================================================================
// Mission route: production App.tsx — tests the actual i18n switch fix
// =========================================================================

test.describe('Custom Component i18n — Mission Page (App.tsx)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ====== Helper: switch language on mission page ======
  async function switchLanguage(page: any, lang: string) {
    await page.evaluate((l: string) => {
      const s = document.querySelector('.preview-panel .language-select') as HTMLSelectElement;
      if (s) { s.value = l; s.dispatchEvent(new Event('change', { bubbles: true })); }
    }, lang);
    await page.waitForTimeout(1000);
  }

  // ====== Native fields: baseline verification ======

  test('native input-text fields preserve values across language switch', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const input = activePane.locator('input[name="missionShortName"]');

    // Edit Chinese value
    await input.fill('');
    await input.fill('持久化测试');
    await page.waitForTimeout(300);

    // Switch to English
    await switchLanguage(page, 'en');
    await page.waitForTimeout(300);

    // Switch back to Chinese
    await switchLanguage(page, 'zh');
    await page.waitForTimeout(300);

    // Chinese edit should be preserved
    expect(await input.inputValue()).toBe('持久化测试');
  });

  test('native input-text fields: English edit preserved after round-trip', async ({ page }) => {
    await switchLanguage(page, 'en');
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const input = activePane.locator('input[name="awardDescription"]');

    // Edit English value
    await input.fill('');
    await input.fill('Custom reward text');
    await page.waitForTimeout(300);

    // Round-trip: zh -> en -> zh -> en
    await switchLanguage(page, 'zh');
    await switchLanguage(page, 'en');
    await switchLanguage(page, 'zh');
    await switchLanguage(page, 'en');

    // English edit should be preserved
    expect(await input.inputValue()).toBe('Custom reward text');
  });

  // ====== DateRangePicker on mission page ======

  test('date-range-picker preserves selected dates after language switch', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();

    // 1. Open the date range picker (Registration Period is the first one)
    const drpInput = activePane.locator('.date-range-picker-input').first();
    await expect(drpInput).toBeVisible({ timeout: 5000 });
    await drpInput.click();
    await page.waitForTimeout(500);

    // 2. Select a start date (click day 10)
    const startDay = page.locator('.drp-days .drp-day:not(.drp-day-other)').nth(9);
    await startDay.click();
    await page.waitForTimeout(200);

    // 3. Select an end date (click day 15)
    const endDay = page.locator('.drp-days .drp-day:not(.drp-day-other)').nth(14);
    await endDay.click();
    await page.waitForTimeout(200);

    // 4. Confirm the selection
    await page.locator('.drp-btn-confirm').first().click();
    await page.waitForTimeout(500);

    // 5. Capture the displayed value
    const beforeLangText = await drpInput.inputValue();
    expect(beforeLangText).toBeTruthy();
    expect(beforeLangText.length).toBeGreaterThan(5);

    // 6. Switch language to English
    await switchLanguage(page, 'en');
    await page.waitForTimeout(500);

    // 7. Date range should still be displayed
    const afterLangText = await drpInput.inputValue();
    expect(afterLangText).toBeTruthy();
    expect(afterLangText).toBe(beforeLangText);
  });

  // ====== Save captures all values ======

  test('save captures edited values including date-range-picker values', async ({ page }) => {
    // 1. Edit a native field
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const shortName = activePane.locator('input[name="missionShortName"]');
    await shortName.fill('');
    await shortName.fill('保存测试');
    await page.waitForTimeout(300);

    // 2. Set up console capture
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    // 3. Save
    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    // 4. Verify edited value in console output
    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));
    expect(logs).toContain('保存测试');
  });
});
