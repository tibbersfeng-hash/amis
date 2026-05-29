import { test, expect } from '@playwright/test';

test.describe('Promotion CMS - Text & URL Inputs', () => {
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

  test.describe('input-text', () => {
    test('【文本框】Promotion Code 输入框存在', async ({ page }) => {
      const input = page.locator('input[name="promotionCode"]').first();
      await expect(input).toBeVisible();
    });

    test('【文本框】Promotion Code 默认值正确', async ({ page }) => {
      const input = page.locator('input[name="promotionCode"]').first();
      const value = await input.inputValue();
      expect(value).toBe('PROMO_20260522_001');
    });

    test('【文本框】Promotion Code 输入新值', async ({ page }) => {
      const input = page.locator('input[name="promotionCode"]').first();
      await input.fill('PROMO_TEST_999');
      await expect(input).toHaveValue('PROMO_TEST_999');
    });

    test('【文本框】Promotion Code 必填标记存在', async ({ page }) => {
      const codeItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Code' });
      await expect(codeItem).toHaveClass(/is-required/);
    });

    test('【文本框】Promotion Name 输入新值', async ({ page }) => {
      const input = page.locator('input[name="promotionName"]').first();
      await input.fill('Test Promotion');
      await expect(input).toHaveValue('Test Promotion');
    });

    test('【文本框】Segment ID 初始不可见', async ({ page }) => {
      // Segment ID has visibleOn condition, should not be visible with default vip audience
      const segmentVisible = await isFieldVisible(page, 'Segment ID');
      expect(segmentVisible).toBe(false);
    });
  });

  test.describe('input-url', () => {
    test('【URL输入】CTA Link 输入框存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const ctaItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'CTA Link' });
      await expect(ctaItem).toBeVisible();
    });

    test('【URL输入】CTA Link 输入URL', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const input = activePane.locator('input[name="ctaLink"]').first();
      await input.fill('https://example.com/test');
      await expect(input).toHaveValue('https://example.com/test');
    });
  });

  test.describe('input-textarea', () => {
    test('【文本域】Description 输入框存在', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const textarea = activePane.locator('textarea[name="description"]').first();
      await expect(textarea).toBeVisible();
    });
  });

  test.describe('editor', () => {
    test('【富文本】Rich Content 编辑器存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Rich Content' })).toBeVisible();
    });

    test('【富文本】T&C Content 编辑器存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.section-title-sm').filter({ hasText: 'T&C Content' })).toBeVisible();
    });
  });
});
