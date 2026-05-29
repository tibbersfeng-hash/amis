import { test, expect } from '@playwright/test';

test.describe('Promotion CMS - Select, Switch & Number', () => {
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
    await page.waitForTimeout(300);
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

  test.describe('select', () => {
    test('【下拉选择】Promotion Type 存在', async ({ page }) => {
      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Type' });
      await expect(selectItem).toBeVisible();
    });

    test('【下拉选择】Promotion Type 有4个选项', async ({ page }) => {
      const selectWrap = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Type' }).locator('.cxd-Select-valueWrap').first();
      await selectWrap.click();
      await page.waitForTimeout(500);
      const optionCount = await page.locator('.cxd-Select-menu .cxd-Select-option').count();
      expect(optionCount).toBe(4);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    });

    test('【下拉选择】选择选项后值改变', async ({ page }) => {
      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Promotion Type' });
      await expect(selectItem).toContainText('Flash Sale');

      await changeSelectByLabel(page, 'Promotion Type', 'Bundle Deal');
      await expect(selectItem).toContainText('Bundle Deal');
    });

    test('【下拉选择】Target Audience 存在', async ({ page }) => {
      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Target Audience' });
      await expect(selectItem).toBeVisible();
    });

    test('【下拉选择】Currency 存在', async ({ page }) => {
      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Currency' });
      await expect(selectItem).toBeVisible();
    });

    test('【下拉选择】Discount Type 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Discount Type' });
      await expect(selectItem).toBeVisible();
    });

    test('【下拉选择】Display Position 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const selectItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Display Position' });
      await expect(selectItem).toBeVisible();
    });
  });

  test.describe('switch', () => {
    test('【开关】Stackable Switch 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Stackable' });
      await expect(switchItem).toBeVisible();
    });

    test('【开关】Enable Real-Time Tracking 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
      await page.waitForTimeout(300);

      const switchItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Real-Time Tracking' });
      await expect(switchItem).toBeVisible();
    });
  });

  test.describe('input-number', () => {
    test('【数字输入】Budget 输入框存在', async ({ page }) => {
      const numberItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Budget' });
      await expect(numberItem).toBeVisible();
    });

    test('【数字输入】Budget 输入数字', async ({ page }) => {
      const input = page.locator('.cxd-NumberControl input').first();
      await input.fill('99999');
      await expect(input).toHaveValue('99999');
    });

    test('【数字输入】Max Usage Per User 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
      await page.waitForTimeout(300);

      const numberItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Max Usage' });
      await expect(numberItem).toBeVisible();
    });

    test('【数字输入】Display Priority 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const numberItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Display Priority' });
      await expect(numberItem).toBeVisible();
    });
  });

  test.describe('input-image', () => {
    test('【图片上传】Banner Image 存在', async ({ page }) => {
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);

      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Banner Image' })).toBeVisible();
    });
  });
});
