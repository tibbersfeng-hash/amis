import { test, expect } from '@playwright/test';

test.describe('Mission Page - Layout & Structure', () => {
  const TAB_NAMES = ['Mission Setup', 'Sub-Mission Rules', 'Skin Setting', 'Countdown Push', 'Registration Rule'];

  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Tab Structure =====
  test('5个 tab 全部存在', async ({ page }) => {
    for (const tabName of TAB_NAMES) {
      await expect(page.getByText(tabName).first()).toBeVisible();
    }
  });

  test('默认激活 Mission Setup', async ({ page }) => {
    const firstTab = page.locator('.cxd-Tabs-link').filter({ hasText: 'Mission Setup' }).first();
    await expect(firstTab).toHaveClass(/is-active/);
  });

  test('切换 tab 后高亮正确', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
    await page.waitForTimeout(300);
    const skinTab = page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first();
    await expect(skinTab).toHaveClass(/is-active/);
  });

  // ===== Left-Right Split Layout (outside tabs) =====
  test('页面有左右分栏结构', async ({ page }) => {
    await expect(page.locator('.mission-body-split')).toBeVisible();
    await expect(page.locator('.mission-left')).toBeVisible();
    await expect(page.locator('.mission-right')).toBeVisible();
  });

  test('左侧 form-card 存在', async ({ page }) => {
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
  });

  test('右侧 preview-panel 在 tabs 外面固定可见', async ({ page }) => {
    // Preview is outside tabs, always visible
    const previewPanel = page.locator('.mission-right .preview-panel');
    await expect(previewPanel).toBeVisible();
  });

  test('不存在全局 floating preview-panel-fixed', async ({ page }) => {
    await expect(page.locator('.preview-panel-fixed')).not.toBeVisible();
  });

  test('切换 tab 后 preview 面板保持可见且不刷新', async ({ page }) => {
    const previewPanel = page.locator('.mission-right .preview-panel');

    // Get phone mockup text before tab switch
    const phoneBody = previewPanel.locator('.phone-body');
    const textBefore = await phoneBody.textContent();

    // Switch to Skin Setting tab
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
    await page.waitForTimeout(300);

    // Preview panel should still be visible
    await expect(previewPanel).toBeVisible();

    // Phone body should still show same content (not re-rendered)
    const textAfter = await phoneBody.textContent();
    expect(textAfter).toBe(textBefore);
  });

  // ===== Language Switcher (outside tabs) =====
  test('语言切换器在右侧始终可见', async ({ page }) => {
    const langSwitcher = page.locator('.mission-right .language-switcher');
    await expect(langSwitcher).toBeVisible();

    // Switch tabs - language switcher should still be visible
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
    await page.waitForTimeout(300);
    await expect(langSwitcher).toBeVisible();
  });

  test('语言切换器可操作', async ({ page }) => {
    const langSelect = page.locator('.mission-right .language-switcher select');
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption('en');
    await page.waitForTimeout(200);
    await expect(langSelect).toHaveValue('en');
  });

  // ===== Phone Mockup (outside tabs) =====
  test('右侧有手机框架', async ({ page }) => {
    const phoneFrame = page.locator('.mission-right .phone-frame');
    await expect(phoneFrame).toBeVisible();
  });

  // ===== Mission Setup Tab Fields =====
  test('Mission Setup: 基础字段存在', async ({ page }) => {
    await expect(page.locator('input[name="missionCode"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionName"]').first()).toBeVisible();
    await expect(page.locator('input[name="missionShortName"]').first()).toBeVisible();
  });

  test('Mission Setup: 注册周期和任务周期存在', async ({ page }) => {
    await expect(page.locator('.section-title').filter({ hasText: 'Registration Period' })).toBeVisible();
    await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Period' })).toBeVisible();
    await expect(page.locator('.date-range-picker').first()).toBeVisible();
  });

  test('Mission Setup: 配额字段存在', async ({ page }) => {
    await expect(page.locator('.cxd-NumberControl input, input[role="spinbutton"]').first()).toBeVisible();
  });

  test('Mission Setup: Display Config 缩略图上传存在', async ({ page }) => {
    await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Thumbnail' })).toBeVisible();
  });

  test('Mission Setup: 富文本编辑器存在', async ({ page }) => {
    await expect(page.locator('.section-title-sm').filter({ hasText: 'Mission Detail' })).toBeVisible();
  });

  // ===== Sub-Mission Rules Tab =====
  test('Sub-Mission Rules: 子任务表单存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(1).click({ force: true });
    await page.waitForTimeout(300);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
    await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Registration Award' })).toBeVisible();
  });

  // ===== Skin Setting Tab =====
  test('Skin Setting: 颜色字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(2).click({ force: true });
    await page.waitForTimeout(300);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
    await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Skin Setting' })).toBeVisible();
    await expect(activePane.locator('.cxd-Form-item--normal').filter({ hasText: 'Background Color' })).toBeVisible();
  });

  // ===== Countdown Push Tab =====
  test('Countdown Push: 倒计时字段存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').nth(3).click({ force: true });
    await page.waitForTimeout(300);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
    await expect(activePane.locator('.section-title-sm').filter({ hasText: 'Countdown App Push' })).toBeVisible();
    await expect(page.locator('input[name="countdownAppPushTitle"]').first()).toBeVisible();
    await expect(page.locator('input[name="countdownAppPushContent"]').first()).toBeVisible();
  });

  // ===== Registration Rule Tab =====
  test('Registration Rule: 注册奖励表单存在', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Registration Rule' }).first().click({ force: true });
    await page.waitForTimeout(300);
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    await expect(activePane.locator('.form-card')).toBeVisible();
    await expect(activePane.locator('.award-panel').first()).toBeVisible();
  });
});
