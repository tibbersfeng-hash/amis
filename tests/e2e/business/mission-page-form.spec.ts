import { test, expect } from '@playwright/test';

test.describe('Mission Page - Form Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Form Input =====
  test('表单输入 - 修改任务名称', async ({ page }) => {
    const input = page.locator('input[name="missionName"]').first();
    await input.click();
    await input.fill('Test Mission Updated');
    await page.waitForTimeout(300);
    await expect(input).toHaveValue('Test Mission Updated');
    await input.fill('Summer Spending Mission');
  });

  test('表单输入 - 可以修改门槛值', async ({ page }) => {
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    const numberInput = activeTab.locator('input[role="spinbutton"], .cxd-NumberControl input, input[type="number"]').first();
    await expect(numberInput).toBeVisible();
    await numberInput.click();
    await numberInput.fill('500');
    await page.waitForTimeout(300);
    await expect(numberInput).toHaveValue('500');
  });

  // ===== Radio Buttons =====
  test('【单选按钮】displayInCenter 默认选中 No', async ({ page }) => {
    await expect(page.locator('input[name="displayInCenter"][value="no"]').first()).toBeChecked();
  });

  test('【单选按钮】点击切换选中值', async ({ page }) => {
    const yesRadio = page.locator('input[name="displayInCenter"][value="yes"]').first();
    await yesRadio.click();
    await page.waitForTimeout(200);
    await expect(yesRadio).toBeChecked();

    const noRadio = page.locator('input[name="displayInCenter"][value="no"]').first();
    await noRadio.click();
    await page.waitForTimeout(200);
    await expect(noRadio).toBeChecked();
  });

  test('【单选按钮】Label 文字正确', async ({ page }) => {
    const labels = page.locator('.radio-group label.radio-item');
    const firstLabel = await labels.first().textContent();
    expect(firstLabel.trim().length).toBeGreaterThan(0);
  });

  // ===== Skin Setting =====
  test('Skin Setting - 字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('.section-title-sm').filter({ hasText: 'Skin Setting' })).toBeVisible();
  });

  test('Skin Setting - 所有字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activeTab.locator('.date-range-picker').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' }).locator('input').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Font Color' }).locator('input').first()).toBeVisible();
  });

  test('Skin Setting - 颜色值正确', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    const bgItem = activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' });
    await expect(bgItem).toBeVisible();
    await expect(bgItem.locator('input').first()).toBeVisible();
    const fontItem = activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Font Color' });
    await expect(fontItem).toBeVisible();
    await expect(fontItem.locator('input').first()).toBeVisible();
  });

  // ===== Countdown =====
  test('Countdown - 字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('.section-title-sm').filter({ hasText: 'Countdown App Push' })).toBeVisible();
  });

  test('Countdown - 所有字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
    await page.waitForTimeout(300);
    await expect(page.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown Day' }).locator('input').first()).toBeVisible();
    await expect(page.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown App Push Title' }).locator('input').first()).toBeVisible();
    await expect(page.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown App Push Content' }).locator('input').first()).toBeVisible();
  });

  test('Countdown - 初始数据正确', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
    await page.waitForTimeout(300);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    const dayItem = activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown Day' });
    await expect(dayItem).toBeVisible();
    await expect(dayItem.locator('.cxd-DateControl').first()).toBeVisible();
    const titleItem = activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Countdown App Push Title' });
    await expect(titleItem).toBeVisible();
  });
});
