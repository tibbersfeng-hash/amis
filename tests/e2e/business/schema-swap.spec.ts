import { test, expect } from '@playwright/test';

test.describe('Schema Swap - Linkage Persistence', () => {
  // Helper: change an Amis select by its label text
  async function changeSelectByLabel(page: any, labelText: string, optionText: string) {
    const selectWrap = page.locator('.cxd-Form-item--normal').filter({ hasText: labelText }).locator('.cxd-Select-valueWrap').first();
    await selectWrap.click();
    await page.waitForTimeout(500);

    const options = page.locator('.cxd-Select-menu .cxd-Select-option');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const txt = await options.nth(i).textContent();
      if (txt?.trim() === optionText) {
        await options.nth(i).click();
        break;
      }
    }
    await page.waitForTimeout(500);
  }

  // Helper: check if a form field is visible by its label text
  async function isFieldVisible(page: any, labelText: string): Promise<boolean> {
    return page.evaluate((label) => {
      const items = document.querySelectorAll('.cxd-Form-item--normal');
      const item = Array.from(items).find(el => el.textContent?.includes(label));
      return item ? item.offsetParent !== null : false;
    }, labelText);
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=promotion');
    await expect(page.getByText('Add Promotion').first()).toBeVisible({ timeout: 10000 });
  });

  test.describe('visibleOn linkages with swapped data', () => {
    test('visibleOn: segmentId appears after swapping to segment audience', async ({ page }) => {
      // Verify segmentId is hidden initially (vip audience)
      const segmentVisibleBefore = await isFieldVisible(page, 'Segment ID');
      expect(segmentVisibleBefore).toBe(false);

      // Simulate config swap by changing the targetAudience value
      await changeSelectByLabel(page, 'Target Audience', 'Segment');

      // Linkage should still work: segmentId becomes visible
      const segmentVisibleAfter = await isFieldVisible(page, 'Segment ID');
      expect(segmentVisibleAfter).toBe(true);
    });

    test('visibleOn: flash sale fields appear after swapping to flash_sale type', async ({ page }) => {
      // Swap to tiered_discount first
      await changeSelectByLabel(page, 'Promotion Type', 'Tiered Discount');

      // Flash sale fields should be hidden
      const durationVisible = await isFieldVisible(page, 'Duration');
      expect(durationVisible).toBe(false);

      // Swap back to flash_sale
      await changeSelectByLabel(page, 'Promotion Type', 'Flash Sale');

      // Flash sale fields should reappear (linkage still works)
      const durationVisibleAfter = await isFieldVisible(page, 'Duration');
      expect(durationVisibleAfter).toBe(true);
    });

    test('visibleOn: popupImage disappears after changing display position', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      // Default is homepage_banner, popupImage should be visible
      const popupVisibleBefore = await isFieldVisible(page, 'Popup Image');
      expect(popupVisibleBefore).toBe(true);

      // Swap display position
      await changeSelectByLabel(page, 'Display Position', 'Cart Page');
      await page.waitForTimeout(500);

      const popupVisibleAfter = await isFieldVisible(page, 'Popup Image');
      expect(popupVisibleAfter).toBe(false);
    });
  });

  test.describe('Cross-tab linkage persistence', () => {
    test('promotionType change on Basic Info tab persists after tab switch', async ({ page }) => {
      // Change promotionType on Basic Info tab
      await changeSelectByLabel(page, 'Promotion Type', 'Bundle Deal');

      // Switch to another tab and back
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);
      await page.locator('.cxd-Tabs-link').nth(0).click({ force: true });
      await page.waitForTimeout(300);

      // Promotion Type should still show Bundle Deal
      const typeItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Type' });
      await expect(typeItem).toContainText('Bundle Deal');
    });

    test('requiredOn budget indicator persists after audience change', async ({ page }) => {
      // Budget should be required for VIP audience (default)
      const budgetItemBefore = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Budget' });
      await expect(budgetItemBefore).toHaveClass(/is-required/);

      // Change to "All Members" audience
      await changeSelectByLabel(page, 'Target Audience', 'All Members');

      // Budget should no longer be required
      const budgetItemAfter = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Budget' });
      await expect(budgetItemAfter).not.toHaveClass(/is-required/);
    });
  });

  test.describe('Form submission', () => {
    test('Save button outputs complete promotion data', async ({ page }) => {
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
      // Verify key fields are present in the saved data
      expect(logs).toContain('promotionCode');
      expect(logs).toContain('PROMO_20260522_001');
      expect(logs).toContain('promotionName');
      expect(logs).toContain('promotionType');
      expect(logs).toContain('flash_sale');
      expect(logs).toContain('targetAudience');
      expect(logs).toContain('budget');
    });
  });

  test.describe('i18n linkage after swap', () => {
    test('language switch still works after data changes', async ({ page }) => {
      // Switch language
      await page.evaluate(() => {
        const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
        if (s) { s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); }
      });
      await page.waitForTimeout(1000);

      const phoneBody = page.locator('.phone-frame .phone-body');
      const bodyText = await phoneBody.textContent();
      expect(bodyText).toContain('Summer');
    });
  });
});
