import { test, expect } from '@playwright/test';

test.describe('Promotion Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });
  });

  test('4 tabs exist', async ({ page }) => {
    const tabs = page.locator('.cxd-Tabs-link');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('Basic Info');
    await expect(tabs.nth(1)).toContainText('Eligibility Rules');
    await expect(tabs.nth(2)).toContainText('Display & Content');
    await expect(tabs.nth(3)).toContainText('Analytics Tracking');
  });

  test('default tab is Basic Info', async ({ page }) => {
    const activeTab = page.locator('.cxd-Tabs-link.is-active');
    await expect(activeTab).toContainText('Basic Info');
  });

  test('form fields populated from config', async ({ page }) => {
    const codeInput = page.locator('input[name="promotionCode"]').first();
    await expect(codeInput).toBeVisible();
    const codeValue = await codeInput.inputValue();
    expect(codeValue).toBe('PROMO_20260522_001');

    const nameInput = page.locator('input[name="promotionName"]').first();
    await expect(nameInput).toBeVisible();
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe('Summer Flash Sale 2026');
  });

  test('promotion type select has correct label', async ({ page }) => {
    const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Type' });
    await expect(selectItem).toBeVisible();
    await expect(selectItem).toContainText('Flash Sale');
  });

  test('date fields populated', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    // Date controls rendered as inputs within Amis datetime wrapper
    const dateInputs = activePane.locator('.cxd-DateControl input[type="text"], .cxd-DatetimeControl input[type="text"]');
    await expect(dateInputs.first()).toBeVisible();
  });

  test('flash sale fields visible for flash_sale type', async ({ page }) => {
    // Check via evaluate since visibleOn hides the element
    const durationVisible = await page.evaluate(() => {
      const items = document.querySelectorAll('.cxd-Form-item--normal');
      const item = Array.from(items).find(el => el.textContent?.includes('Duration'));
      return item ? item.offsetParent !== null : false;
    });
    expect(durationVisible).toBe(true);

    const flashTimeVisible = await page.evaluate(() => {
      const items = document.querySelectorAll('.cxd-Form-item--normal');
      const item = Array.from(items).find(el => el.textContent?.includes('Flash Sale Start'));
      return item ? item.offsetParent !== null : false;
    });
    expect(flashTimeVisible).toBe(true);
  });

  test('tab switching works', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(300);
    const activeTab = page.locator('.cxd-Tabs-link.is-active');
    await expect(activeTab).toContainText('Eligibility Rules');

    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('.cxd-Tabs-link.is-active')).toContainText('Display & Content');
  });

  test('data persists across tab switches', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const codeInput = activePane.locator('input[name="promotionCode"]').first();
    await codeInput.fill('TEST_CODE');
    await expect(codeInput).toHaveValue('TEST_CODE');

    // Switch to another tab
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(300);

    // Switch back
    await page.locator('.cxd-Tabs-link').nth(0).click({ force: true });
    await page.waitForTimeout(300);

    const codeInputAfter = page.locator('.cxd-Tabs-pane.is-active').first().locator('input[name="promotionCode"]').first();
    await expect(codeInputAfter).toHaveValue('TEST_CODE');
  });

  test('sticky footer visible', async ({ page }) => {
    await expect(page.locator('.sticky-footer')).toBeVisible();
    await expect(page.locator('.sticky-footer')).toContainText('Save');
    await expect(page.locator('.sticky-footer')).toContainText('Cancel');
  });

  test('i18n fields show single-language values', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);

    const bannerTitle = page.locator('input[name="bannerTitle"]').first();
    await expect(bannerTitle).toBeVisible();
    const value = await bannerTitle.inputValue();
    // i18n fields show single-language value (not JSON)
    expect(value).toBe('夏日闪购特惠');
    expect(value).not.toContain('"zh"');
    expect(value).not.toContain('"en"');
  });

  test('i18n fields update when language switches', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);

    const bannerTitle = page.locator('input[name="bannerTitle"]').first();
    await expect(bannerTitle).toHaveValue('夏日闪购特惠');

    // Switch to English
    await page.evaluate(() => {
      const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (s) { s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    await page.waitForTimeout(1000);

    // Value should now show English
    await expect(bannerTitle).toHaveValue('Summer Flash Sale');
  });

  test('language switcher in preview works', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.language-switcher')).toBeVisible();

    const select = activePane.locator('.language-select');
    await expect(select).toHaveValue('zh');

    await page.evaluate(() => {
      const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      if (s) { s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    await page.waitForTimeout(300);

    const val = await page.evaluate(() => {
      const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
      return s ? s.value : 'not-found';
    });
    expect(val).toBe('en');
  });

  test('phone mockup visible in Basic Info tab', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.phone-frame')).toBeVisible();
  });

  test('left-right split layout exists', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.tab-left')).toBeVisible();
    await expect(activePane.locator('.tab-right')).toBeVisible();
  });

  test('Save button outputs promotion data', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__testConsoleLogs = [];
      const origLog = console.log;
      console.log = (...args: unknown[]) => {
        (window as any).__testConsoleLogs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        origLog.apply(console, args);
      };
    });

    await page.locator('.footer-btn--save').click();
    await page.waitForTimeout(500);

    const logs = await page.evaluate(() => (window as any).__testConsoleLogs.join('\n'));
    expect(logs).toContain('promotionCode');
    expect(logs).toContain('PROMO_20260522_001');
    expect(logs).toContain('promotionName');
  });
});
