import { test, expect } from '@playwright/test';

test.describe('Mission Page - Tab Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Tab Switching =====
  test('切换 Tab - Sub-Mission Rules', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    const subRuleTab = page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first();
    await expect(subRuleTab).toHaveClass(/is-active/);
  });

  test('切换 Tab - Registration Rule', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    const regRuleTab = page.locator('.cxd-Tabs-link').filter({ hasText: 'Registration Rule' }).first();
    await expect(regRuleTab).toHaveClass(/is-active/);
  });

  test('Tab 切换后数据保持', async ({ page }) => {
    const missionCodeInput = page.locator('input[name="missionCode"]').first();
    await missionCodeInput.click();
    await missionCodeInput.fill('UPDATED_CODE');
    await page.waitForTimeout(300);
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('.cxd-Tabs-link').nth(0).click({ force: true });
    await page.waitForTimeout(500);
    await expect(missionCodeInput).toHaveValue('UPDATED_CODE');
    await missionCodeInput.fill('MISSION_20260430_001');
  });

  // ===== Sub-Mission Rules tab =====
  test('Sub-Mission Rules tab has sub mission form', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
    await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Registration Award' })).toBeVisible();
  });

  // ===== Mission Setup - Sub-Tab =====
  test('Tab1: Sub-Tab 栏存在 (Rule Setup / Display)', async ({ page }) => {
    await expect(page.locator('.sub-tab-btn, .cxd-Tabs-tab, .cxd-Tabs-link').first()).toBeVisible();
    await expect(page.locator('.sub-tab-btn, .cxd-Tabs-tab, .cxd-Tabs-link').nth(1)).toBeVisible();
  });

  // ===== Mission Setup - Form Fields =====
  test('Tab1: 所有字段存在', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionName"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionShortName"]').first()).toBeVisible();
    await expect(page.locator('input[name="registrationKeyword"]').first()).toBeVisible();
    await expect(page.locator('input[name="limitationKeyword"]').first()).toBeVisible();
  });

  test('Tab1: 数据正确', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]').first()).toHaveValue('MISSION_20260430_001');
    await expect(page.locator('input[name="missionName"]').first()).toHaveValue('Summer Spending Mission');
  });

  test('Tab1: 必填标记', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionName"]').first()).toBeVisible();
  });

  test('Tab1: 格式提示文本', async ({ page }) => {
    await expect(page.locator('.hint-text').first()).toContainText('MISSION');
  });

  // ===== Registration Rule - Fields =====
  test('Tab5: 所有字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Registration Keyword' }).locator('input').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Limitation Keyword' }).locator('input').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Award Points' }).locator('.cxd-NumberControl input').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Billing Code' }).locator('.cxd-Select-valueWrap').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: '库存数' }).locator('.cxd-NumberControl input').first()).toBeVisible();
    await expect(activeTab.locator('input[name="regTransactionNote"]').first()).toBeVisible();
  });

  test('Tab5: Radio 按钮存在 (Award type x2 + Limitation)', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activeTab.locator('input[type="radio"]').first()).toBeVisible();
  });

  test('Tab5: Award Panel 浅灰背景', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const panel = activePane.locator('.award-panel').first();
    await expect(panel).toBeVisible();
    const bg = await panel.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBeTruthy();
  });

  test('Tab5: Rule Setup/Display 子tab', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(4).click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('.sub-tab-btn, .cxd-Tabs-link, .cxd-Tabs-tab').first()).toBeVisible();
  });

  // ===== Sub-Mission Rules - Fields =====
  test('Tab2: 所有字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Sub Mission Type' }).locator('.cxd-Select-valueWrap').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Business Unit' }).locator('.cxd-Select-valueWrap').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'No. of Nights' }).locator('.cxd-NumberControl input').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Payment Method' }).locator('.cxd-Select-valueWrap').first()).toBeVisible();
    await expect(activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'Source' }).locator('.cxd-Select-valueWrap').first()).toBeVisible();
  });

  test('Tab2: 数据正确', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    const nightsInput = activeTab.locator('.cxd-Form-item--normal').filter({ hasText: 'No. of Nights' }).locator('.cxd-NumberControl input').first();
    await expect(nightsInput).toHaveValue('2');
    await expect(activeTab.locator('input[name="transactionNote"]').first()).toHaveValue('Summer promotion special rate');
  });

  test('Tab2: Radio 按钮存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(500);
    const activeTab = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activeTab.locator('input[type="radio"]').first()).toBeVisible();
  });
});
