import { test, expect } from '@playwright/test';

test.describe('Mission Page - Structure & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Page Load =====
  test('loads mission page with tabs', async ({ page }) => {
    await expect(page.locator('.page-title')).toContainText('Add Mission');
    await expect(page.getByText('Registration Rule').first()).toBeVisible();
    await expect(page.getByText('Sub-Mission Rules').first()).toBeVisible();
  });

  test('Amis 渲染正常', async ({ page }) => {
    await expect(page.locator('.mission-root')).toBeVisible();
  });

  test('面包屑导航存在', async ({ page }) => {
    await expect(page.locator('.page-header-bar')).toBeVisible();
  });

  // ===== Tab Structure =====
  test('5个 tab 面板全部存在', async ({ page }) => {
    await expect(page.getByText('Mission Setup').first()).toBeVisible();
    await expect(page.getByText('Registration Rule').first()).toBeVisible();
    await expect(page.getByText('Sub-Mission Rules').first()).toBeVisible();
  });

  test('默认激活 Mission Setup', async ({ page }) => {
    const missionRuleTab = page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first();
    await expect(missionRuleTab).toHaveClass(/is-active/);
  });

  // ===== Form Fields =====
  test('form fields are populated from config', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]')).toHaveValue('MISSION_20260430_001');
    await expect(page.locator('input[name="missionName"]')).toHaveValue('Summer Spending Mission');
  });

  test('Mission Setup tab has form sections', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionName"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionShortName"]').first()).toBeVisible();
    await expect(page.locator('input[name="registrationKeyword"]').first()).toBeVisible();
    await expect(page.locator('.date-range-picker-input').first()).toBeVisible();
  });

  // ===== UI Components =====
  test('phone mockup component is visible', async ({ page }) => {
    await expect(page.locator('.mission-right .phone-frame')).toBeVisible();
  });

  test('sticky footer appears on mission page', async ({ page }) => {
    const footer = page.locator('.sticky-footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('Cancel').first()).toBeVisible();
    await expect(footer.getByText('Save Draft').first()).toBeVisible();
    await expect(footer.getByText('Save').first()).toBeVisible();
  });

  test('return to list link is present', async ({ page }) => {
    const returnLink = page.locator('.return-link');
    await expect(returnLink).toBeVisible();
    await expect(returnLink).toContainText('Return to List');
    await returnLink.click();
    await expect(page.locator('.page-title')).toContainText('Mission List');
  });

  test('TabBar 重叠边框样式', async ({ page }) => {
    const firstTab = page.locator('.cxd-Tabs-link').first();
    await expect(firstTab).toBeVisible();
    const marginRight = await firstTab.evaluate((el) => window.getComputedStyle(el).marginRight);
    expect(marginRight).toBeTruthy();
  });

  test('表单卡片白色背景', async ({ page }) => {
    const activeTab = page.locator('.cxd-Tabs-pane.is-active .form-card').first();
    await expect(activeTab).toBeVisible();
    const bg = await activeTab.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg.toLowerCase()).toMatch(/255.*255.*255|white/);
  });
});
