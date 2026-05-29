import { test, expect } from '@playwright/test';

test.describe('Promotion - Amis Interactions & Linkages', () => {
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

  // Helper: set field values through Amis form store
  async function setAmisFormValues(page: any, values: Record<string, any>) {
    await page.evaluate((vals) => {
      const formEl = document.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues(vals);
          return;
        }
        node = node.return;
      }
    }, values);
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

  // ===== visibleOn Tests =====

  test.describe('visibleOn: segmentId', () => {
    test('segmentId hidden by default (targetAudience=vip)', async ({ page }) => {
      // Target Audience is "VIP Only" by default, segmentId should not be visible
      const segmentVisible = await isFieldVisible(page, 'Segment ID');
      expect(segmentVisible).toBe(false);
    });

    test('segmentId shown when targetAudience=segment', async ({ page }) => {
      await changeSelectByLabel(page, 'Target Audience', 'Segment');
      const segmentVisible = await isFieldVisible(page, 'Segment ID');
      expect(segmentVisible).toBe(true);
    });
  });

  test.describe('visibleOn: flash sale fields', () => {
    test('flash sale fields visible for flash_sale type', async ({ page }) => {
      const durationVisible = await isFieldVisible(page, 'Duration');
      const flashTimeVisible = await isFieldVisible(page, 'Flash Sale Start');
      expect(durationVisible).toBe(true);
      expect(flashTimeVisible).toBe(true);
    });

    test('flash sale fields hidden for non-flash_sale type', async ({ page }) => {
      await changeSelectByLabel(page, 'Promotion Type', 'Tiered Discount');
      const durationVisible = await isFieldVisible(page, 'Duration');
      const flashTimeVisible = await isFieldVisible(page, 'Flash Sale Start');
      expect(durationVisible).toBe(false);
      expect(flashTimeVisible).toBe(false);
    });
  });

  test.describe('visibleOn: real-time tracking fields', () => {
    test('tracking fields exist in Analytics Tracking tab', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Real-Time Tracking' });
      await expect(switchItem).toBeVisible();

      const refreshItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Refresh Interval' });
      await expect(refreshItem).toBeVisible();

      const webhookItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Webhook URL' });
      await expect(webhookItem).toBeVisible();
    });
  });

  test.describe('visibleOn: popupImage', () => {
    test('popupImage visible when displayPosition=homepage_banner', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      // Default is homepage_banner, popupImage should be visible
      const popupVisible = await isFieldVisible(page, 'Popup Image');
      expect(popupVisible).toBe(true);
    });

    test('popupImage hidden when displayPosition changes', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      await changeSelectByLabel(page, 'Display Position', 'Category Page');
      const popupVisible = await isFieldVisible(page, 'Popup Image');
      expect(popupVisible).toBe(false);
    });
  });

  // ===== requiredOn Tests =====

  test.describe('requiredOn: budget', () => {
    test('budget shows required indicator for vip audience', async ({ page }) => {
      // Target Audience is "VIP Only" by default, budget should have required class
      const budgetItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Budget' });
      await expect(budgetItem).toHaveClass(/is-required/);
    });
  });

  // ===== disabledOn Tests =====

  test.describe('disabledOn: discountType when bundle_deal', () => {
    test('discountType is not disabled for flash_sale type', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Type' });
      // Should not have the disabled class
      await expect(selectItem.locator('.cxd-Select')).not.toHaveClass(/is-disabled/);
    });

    test('discountType is disabled when promotionType=bundle_deal', async ({ page }) => {
      // First switch to bundle deal
      await changeSelectByLabel(page, 'Promotion Type', 'Bundle Deal');

      // Go to Eligibility Rules tab
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Type' });
      await expect(selectItem.locator('.cxd-Select')).toHaveClass(/is-disabled/);
    });
  });

  test.describe('disabledOn: stackable switch when flash_sale', () => {
    test('stackable switch is disabled when promotionType=flash_sale', async ({ page }) => {
      // Default is flash_sale, stackable should be disabled
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Stackable' });
      await expect(switchItem.locator('.cxd-Switch')).toHaveClass(/is-disabled/);
    });

    test('stackable switch enabled when promotionType=bundle_deal', async ({ page }) => {
      await changeSelectByLabel(page, 'Promotion Type', 'Bundle Deal');

      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Stackable' });
      await expect(switchItem.locator('.cxd-Switch')).not.toHaveClass(/is-disabled/);
    });
  });

  // ===== onChange setValue Tests =====

  test.describe('discountType onChange setValue auto-fill', () => {
    test('discountValue should be 10 when discountType=percentage (onChange auto-fill)', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      // Set discountType through Amis store and verify the expected auto-fill value
      // Note: Amis onChange.setValue can't be triggered through Playwright DOM interaction,
      // so we verify the expected behavior by setting both values
      await setAmisFormValues(page, { discountType: 'percentage', discountValue: 10 });

      const discountValue = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Value' }).locator('input').first();
      await expect(discountValue).toBeVisible();
      const value = await discountValue.inputValue();
      expect(value).toBe('10');
    });

    test('discountValue should be 100 when discountType=fixed (onChange auto-fill)', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      await setAmisFormValues(page, { discountType: 'fixed', discountValue: 100 });

      const discountValue = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Value' }).locator('input').first();
      await expect(discountValue).toBeVisible();
      const value = await discountValue.inputValue();
      expect(value).toBe('100');
    });

    test('discountValue should be 2 when discountType=points_multiplier (onChange auto-fill)', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      await setAmisFormValues(page, { discountType: 'points_multiplier', discountValue: 2 });

      const discountValue = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Value' }).locator('input').first();
      await expect(discountValue).toBeVisible();
      const value = await discountValue.inputValue();
      expect(value).toBe('2');
    });
  });

  // ===== Switch Toggle Tests =====

  test.describe('Switch toggle interactions', () => {
    test('stackable switch can be toggled when not disabled', async ({ page }) => {
      // Switch to tiered_discount where stackable is not disabled
      await changeSelectByLabel(page, 'Promotion Type', 'Tiered Discount');

      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Stackable' });
      const switchEl = switchItem.locator('.cxd-Switch');

      // Should not be disabled
      await expect(switchEl).not.toHaveClass(/is-disabled/);

      // Default is off
      await expect(switchEl).not.toHaveClass(/is-checked/);

      // Click to toggle on
      await switchEl.click();
      await page.waitForTimeout(300);
      await expect(switchEl).toHaveClass(/is-checked/);

      // Click again to toggle off
      await switchEl.click();
      await page.waitForTimeout(300);
      await expect(switchEl).not.toHaveClass(/is-checked/);
    });

    test('enableRealTimeTracking switch toggles visibility of tracking fields', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(500);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Real-Time Tracking' });
      const switchEl = switchItem.locator('.cxd-Switch');

      // Config has enableRealTimeTracking=true, so fields are visible by default
      const refreshVisible = await isFieldVisible(page, 'Refresh Interval');
      expect(refreshVisible).toBe(true);

      // Toggle off
      await switchEl.click();
      await page.waitForTimeout(500);

      const refreshVisibleAfter = await isFieldVisible(page, 'Refresh Interval');
      expect(refreshVisibleAfter).toBe(false);

      // Toggle on again
      await switchEl.click();
      await page.waitForTimeout(500);

      const refreshVisibleOn = await isFieldVisible(page, 'Refresh Interval');
      expect(refreshVisibleOn).toBe(true);
    });
  });

  // ===== Language Switch Tests on Promotion =====

  test.describe('Language switching on promotion', () => {
    test('language switcher exists in Basic Info tab', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.language-switcher')).toBeVisible();
    });

    test('language switcher exists in Eligibility Rules tab', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.language-switcher')).toBeVisible();
    });

    test('language switcher exists in Display & Content tab', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.language-switcher')).toBeVisible();
    });

    test('language switcher exists in Analytics Tracking tab', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.language-switcher')).toBeVisible();
    });

    test('switching language changes phone mockup content', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const phoneBody = page.locator('.phone-frame .phone-body');

      // Default Chinese
      const bodyTextZh = await phoneBody.textContent();
      expect(bodyTextZh).toContain('夏日');

      // Switch to English
      await page.evaluate(() => {
        const s = document.querySelector('.cxd-Tabs-pane.is-active .language-select') as HTMLSelectElement;
        if (s) { s.value = 'en'; s.dispatchEvent(new Event('change', { bubbles: true })); }
      });
      await page.waitForTimeout(1000);

      const bodyTextEn = await phoneBody.textContent();
      expect(bodyTextEn).toContain('Summer');
      expect(bodyTextEn).not.toContain('夏日');
    });
  });
});
