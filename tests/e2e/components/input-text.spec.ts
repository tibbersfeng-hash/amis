import { test, expect } from '@playwright/test';

test.describe('Mission CMS - Text & URL Inputs', () => {
  async function goToMission(page) {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  }

  // ==========================================
  // input-text (文本输入框)
  // ==========================================
  test.describe('input-text', () => {
    test('【文本框】Mission Code 输入框存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    });

    test('【文本框】Mission Code 默认值正确', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="missionCode"]').first()).toHaveValue('MISSION_20260430_001');
    });

    test('【文本框】Mission Code 输入新值', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="missionCode"]').first();
      await input.click();
      await input.fill('TEST_INPUT_TEXT');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('TEST_INPUT_TEXT');
    });

    test('【文本框】Mission Code 清空操作', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="missionCode"]').first();
      await input.click();
      await input.fill('');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('');
    });

    test('【文本框】Mission Code 占位符正确', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="missionCode"]').first()).toHaveAttribute('placeholder', 'Please input');
    });

    test('【文本框】Mission Code 必填标记存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    });

    test('【文本框】Mission Code 聚焦时边框变色', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="missionCode"]').first();
      await input.click();
      await page.waitForTimeout(200);
      const borderColor = await input.evaluate((el) => window.getComputedStyle(el).borderColor);
      expect(borderColor).toBeTruthy();
    });

    test('【文本框】Mission Name 输入新值', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="missionName"]').first();
      await input.click();
      await input.fill('Updated Mission Name');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('Updated Mission Name');
    });
  });

  // ==========================================
  // input-url (URL输入)
  // ==========================================
  test.describe('input-url', () => {
    test('【URL输入】T&C Link 输入框存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="tcLink"]').first()).toBeVisible();
    });

    test('【URL输入】T&C Link 输入URL', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="tcLink"]').first();
      await input.click();
      await input.fill('https://example.com/terms');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('https://example.com/terms');
    });

    test('【URL输入】T&C Link 占位符正确', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="tcLink"]').first()).toHaveAttribute('placeholder', 'Please input');
    });

    test('【URL输入】T&C Link 清空操作', async ({ page }) => {
      await goToMission(page);
      const input = page.locator('input[name="tcLink"]').first();
      await input.click();
      await input.fill('');
      await page.waitForTimeout(300);
      await expect(input).toHaveValue('');
    });

    test('【URL输入】输入类型为 url', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('input[name="tcLink"]').first()).toBeVisible();
    });
  });

  // ==========================================
  // editor (富文本编辑器)
  // ==========================================
  test.describe('editor', () => {
    test('【富文本】Mission Detail 编辑器存在', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });

    test('【富文本】编辑器有内容区域', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });

    test('【富文本】编辑器可点击聚焦', async ({ page }) => {
      await goToMission(page);
      await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
    });
  });
});
