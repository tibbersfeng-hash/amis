import { test, expect } from '@playwright/test';

test.describe('Drawer Showcase', () => {
  test('Drawer page loads and shows form', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Drawer' }).first()).toBeVisible();
    await expect(content.locator('.showcase-page-desc').first()).toBeVisible();
  });

  test('Drawer renders with input-group trigger buttons', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');

    // Custom component uses .drawer-showcase class
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    // Title and description
    await expect(drawerShowcase.locator('.drawer-showcase-title')).toBeVisible();

    // Two fields with labels
    await expect(drawerShowcase.locator('text=选中人员').first()).toBeVisible();
    await expect(drawerShowcase.locator('text=选中角色').first()).toBeVisible();

    // Each field has a "选择" button
    const selectBtns = drawerShowcase.locator('.drawer-showcase-btn-primary');
    await expect(selectBtns).toHaveCount(2);

    // Default values
    const inputs = drawerShowcase.locator('.drawer-showcase-input');
    await expect(inputs.nth(0)).toHaveValue('张三');
    await expect(inputs.nth(1)).toHaveValue('管理员');
  });

  test('Drawer open, select person, confirm — updates input field', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    const inputs = drawerShowcase.locator('.drawer-showcase-input');
    await expect(inputs.nth(0)).toHaveValue('张三');

    // Click first "选择" button (人员)
    const selectBtns = drawerShowcase.locator('.drawer-showcase-btn-primary');
    await selectBtns.nth(0).click();

    // Drawer opens
    const panel = page.locator('.drawer-showcase-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('text=选择人员').first()).toBeVisible();

    // Select 李四
    await panel.locator('.drawer-showcase-radio', { hasText: '李四' }).click();

    // Click confirm
    await panel.locator('.drawer-showcase-actions .drawer-showcase-btn-primary', { hasText: '确认' }).click();

    // Drawer closes, value updated
    await expect(panel).toBeHidden();
    await expect(inputs.nth(0)).toHaveValue('李四');
  });

  test('Drawer open, select role, confirm — updates input field', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    const inputs = drawerShowcase.locator('.drawer-showcase-input');
    await expect(inputs.nth(1)).toHaveValue('管理员');

    // Click second "选择" button (角色)
    const selectBtns = drawerShowcase.locator('.drawer-showcase-btn-primary');
    await selectBtns.nth(1).click();

    // Drawer opens
    const panel = page.locator('.drawer-showcase-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('text=选择角色').first()).toBeVisible();

    // Select 编辑
    await panel.locator('.drawer-showcase-radio', { hasText: '编辑' }).click();

    // Click confirm
    await panel.locator('.drawer-showcase-actions .drawer-showcase-btn-primary', { hasText: '确认' }).click();

    // Value updated
    await expect(inputs.nth(1)).toHaveValue('编辑');
  });

  test('Drawer cancel — does not update input field', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    const inputs = drawerShowcase.locator('.drawer-showcase-input');
    await expect(inputs.nth(0)).toHaveValue('张三');

    // Open drawer
    const selectBtns = drawerShowcase.locator('.drawer-showcase-btn-primary');
    await selectBtns.nth(0).click();

    const panel = page.locator('.drawer-showcase-panel');
    await expect(panel).toBeVisible();

    // Select different value but cancel
    await panel.locator('.drawer-showcase-radio', { hasText: '王五' }).click();
    await panel.locator('.drawer-showcase-actions button', { hasText: '取消' }).click();

    // Value should NOT change
    await expect(inputs.nth(0)).toHaveValue('张三');
  });

  test('Drawer shows JSON schema documentation', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    // JSON schema section
    await expect(drawerShowcase.locator('.drawer-showcase-schema')).toBeVisible();
    const schemaText = await drawerShowcase.locator('.drawer-showcase-schema pre').textContent();
    expect(schemaText).toContain('actionType');
    expect(schemaText).toContain('drawer');
    expect(schemaText).toContain('setValue');
  });

  test('Drawer shows current values display', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    // Result section shows current values
    const result = drawerShowcase.locator('.drawer-showcase-result');
    await expect(result).toBeVisible();
    const resultText = await result.locator('pre').textContent();
    expect(resultText).toContain('张三');
    expect(resultText).toContain('管理员');
  });

  test('Drawer select both values and verify result', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();

    // Select person
    const selectBtns = drawerShowcase.locator('.drawer-showcase-btn-primary');
    await selectBtns.nth(0).click();
    const panel = page.locator('.drawer-showcase-panel');
    await panel.locator('.drawer-showcase-radio', { hasText: '赵六' }).click();
    await panel.locator('.drawer-showcase-actions .drawer-showcase-btn-primary', { hasText: '确认' }).click();

    // Select role
    await selectBtns.nth(1).click();
    await panel.locator('.drawer-showcase-radio', { hasText: '访客' }).click();
    await panel.locator('.drawer-showcase-actions .drawer-showcase-btn-primary', { hasText: '确认' }).click();

    // Verify both updated in result
    const result = drawerShowcase.locator('.drawer-showcase-result pre');
    const resultText = await result.textContent();
    expect(resultText).toContain('赵六');
    expect(resultText).toContain('访客');
  });
});
