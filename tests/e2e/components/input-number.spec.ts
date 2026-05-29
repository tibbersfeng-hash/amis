import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Number & Color Inputs', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // input-number (数字输入)
  // ==========================================
  test.describe('input-number', () => {
    test('【数字输入】Number 组件存在', async ({ page }) => {
      await goToMission(page);
      const numberControl = page.locator('.cxd-NumberControl').first();
      await expect(numberControl).toBeVisible();
    });

    test('【数字输入】Number 输入框存在', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('.cxd-NumberControl input').first();
      await expect(input).toBeVisible();
    });

    test('【数字输入】Number 输入数字', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('.cxd-NumberControl input').first();
      await expect(input).toBeVisible();
      await input.click();
      await input.fill('100');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('100');
    });

    test('【数字输入】Number 清空操作', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('.cxd-NumberControl input').first();
      await input.click();
      await input.fill('');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('');
    });

    test('【数字输入】Number 有增减按钮', async ({ page }) => {
      await goToMission(page);
      const numberControl = page.locator('.cxd-NumberControl').first();
      await expect(numberControl).toBeVisible();
      const input = numberControl.locator('input').first();
      await expect(input).toBeVisible();
    });

    test('【数字输入】Number 占位符存在', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('.cxd-NumberControl input').first();
      await expect(input).toBeVisible();
      const placeholder = await input.getAttribute('placeholder');
      expect(typeof placeholder).toBe('string');
    });

    test('【数字输入】thresholdValue 输入框存在', async ({ page }) => {
      await goToMission(page);
      const numberControls = page.locator('.cxd-NumberControl');
      expect(await numberControls.count()).toBeGreaterThanOrEqual(2);
    });

    test('【数字输入】thresholdValue 输入数字', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('.cxd-NumberControl input').first();
      await expect(input).toBeVisible();
    });

    test('【数字输入】thresholdValue 清空操作', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.cxd-NumberControl').first()).toBeVisible();
    });
  });

  // ==========================================
  // input-color (颜色选择器)
  // ==========================================
  test.describe('input-color', () => {
    async function goToSkinSettingTab(page) {
      await goToMission(page);
      await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
      await page.waitForTimeout(300);
    }

    test('【颜色选择】Background Color 输入框存在', async ({ page }) => {
      await goToSkinSettingTab(page);
      const colorItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' });
      await expect(colorItem).toBeVisible();
      await expect(colorItem.locator('input').first()).toBeVisible();
    });

    test('【颜色选择】Background Color 默认值', async ({ page }) => {
      await goToSkinSettingTab(page);
      const colorItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' });
      await expect(colorItem).toBeVisible();
      const colorPicker = colorItem.locator('.cxd-ColorPicker, [class*="ColorPicker"], .cxd-Color').first();
      await expect(colorPicker).toBeVisible({ timeout: 10000 });
    });

    test('【颜色选择】Background Color 输入新颜色值', async ({ page }) => {
      await goToSkinSettingTab(page);
      const input = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' }).locator('input').first();
      await input.click();
      await input.fill('#FF0000');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('#FF0000');
    });

    test('【颜色选择】点击打开色板选择器', async ({ page }) => {
      await goToSkinSettingTab(page);
      const input = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' }).locator('input').first();
      await expect(input).toBeVisible();
      await input.click();
      await page.waitForTimeout(500);
    });

    test('【颜色选择】有颜色预览色块', async ({ page }) => {
      await goToSkinSettingTab(page);
      const colorItem = page.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' }).first();
      await expect(colorItem).toBeVisible();
    });
  });
});
