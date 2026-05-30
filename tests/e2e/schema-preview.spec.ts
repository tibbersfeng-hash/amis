import { test, expect } from '@playwright/test';

/**
 * E2E tests for Schema Preview showcase page.
 * Tests: JSON editing, rendering, error handling, keyboard shortcut.
 */

test.describe('Schema Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForTimeout(500);
  });

  test('Schema Preview appears as first item in sidebar under "工具" category', async ({ page }) => {
    // "工具" should be the first category
    const firstCategory = page.locator('.showcase-nav-category').first();
    await expect(firstCategory).toContainText('工具');

    // Schema Preview should be the first nav item under "工具"
    const firstItem = page.locator('.showcase-nav-item').first();
    await expect(firstItem).toContainText('Schema Preview');
  });

  test('default schema renders in preview area', async ({ page }) => {
    // Preview container should have Amis form content
    const previewContainer = page.locator('.schema-preview-ami-container');
    await expect(previewContainer).toBeVisible();

    // Default form fields should be visible
    await expect(page.getByText('姓名').first()).toBeVisible();
    await expect(page.getByText('邮箱').first()).toBeVisible();
    await expect(page.getByText('备注').first()).toBeVisible();
  });

  test('JSON editor is editable and shows user input', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');
    await expect(textarea).toBeVisible();

    // Clear and input new schema
    await textarea.fill('');
    await textarea.fill(JSON.stringify({
      type: 'form',
      body: [{ type: 'input-text', name: 'test', label: '测试字段' }],
    }, null, 2));

    const value = await textarea.inputValue();
    expect(value).toContain('测试字段');
  });

  test('clicking 渲染 button updates preview with new schema', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');

    // Replace schema with a single text input
    await textarea.fill('');
    await textarea.fill(JSON.stringify({
      type: 'form',
      body: [{ type: 'input-text', name: 'custom', label: '自定义字段' }],
    }, null, 2));

    // Click render button
    await page.locator('.schema-preview-render-btn').click();
    await page.waitForTimeout(500);

    // New field should be visible in preview
    await expect(page.getByText('自定义字段').first()).toBeVisible();
  });

  test('Ctrl+Enter keyboard shortcut triggers render', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');

    // Replace schema
    await textarea.fill('');
    await textarea.fill(JSON.stringify({
      type: 'form',
      body: [{ type: 'input-text', name: 'shortcut', label: '快捷键字段' }],
    }, null, 2));

    // Press Ctrl+Enter
    await textarea.press('Control+Enter');
    await page.waitForTimeout(500);

    // New field should be visible
    await expect(page.getByText('快捷键字段').first()).toBeVisible();
  });

  test('invalid JSON shows error message', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');

    // Input invalid JSON
    await textarea.fill('');
    await textarea.fill('{ invalid json }');

    // Click render
    await page.locator('.schema-preview-render-btn').click();
    await page.waitForTimeout(300);

    // Error message should be visible
    const errorEl = page.locator('.schema-preview-error');
    await expect(errorEl).toBeVisible();
    const errorText = await errorEl.textContent();
    expect(errorText).toBeTruthy();
    expect(errorText!.length).toBeGreaterThan(0);
  });

  test('page title and description are correct', async ({ page }) => {
    await expect(page.locator('.showcase-page-title')).toHaveText('Schema Preview');
    await expect(page.locator('.showcase-page-desc')).toContainText('JSON Schema');
  });

  test('static JSON Configuration block is hidden for schema-preview', async ({ page }) => {
    // The showcase wrapper should NOT show static JSON/preview blocks for this page
    const sections = page.locator('.showcase-section');
    const count = await sections.count();
    // Only the schema-preview component's own sections should exist,
    // not the wrapper's static "JSON Configuration" and "Live Preview" blocks
    expect(count).toBeLessThanOrEqual(2);
  });

  test('renders complex schema with multiple field types', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');

    const complexSchema = JSON.stringify({
      type: 'form',
      title: '复杂表单',
      body: [
        { type: 'input-text', name: 'title', label: '标题', required: true },
        { type: 'input-number', name: 'price', label: '价格' },
        { type: 'textarea', name: 'desc', label: '描述' },
        {
          type: 'select',
          name: 'category',
          label: '分类',
          options: [
            { label: '选项A', value: 'a' },
            { label: '选项B', value: 'b' },
          ],
        },
        { type: 'switch', name: 'enabled', label: '启用' },
      ],
    }, null, 2);

    await textarea.fill('');
    await textarea.fill(complexSchema);

    await page.locator('.schema-preview-render-btn').click();
    await page.waitForTimeout(500);

    // Verify all fields rendered
    await expect(page.getByText('标题').first()).toBeVisible();
    await expect(page.getByText('价格').first()).toBeVisible();
    await expect(page.getByText('描述').first()).toBeVisible();
    await expect(page.getByText('分类').first()).toBeVisible();
    await expect(page.getByText('启用').first()).toBeVisible();
  });

  test('validates JSON on Ctrl+Enter with invalid input shows error', async ({ page }) => {
    const textarea = page.locator('.schema-preview-textarea');

    await textarea.fill('');
    await textarea.fill('not json at all');

    // Press Ctrl+Enter
    await textarea.press('Control+Enter');
    await page.waitForTimeout(300);

    await expect(page.locator('.schema-preview-error')).toBeVisible();
  });

  // === Data JSON Tab ===

  test('has two editor tabs: Schema and Data', async ({ page }) => {
    const schemaTab = page.locator('.schema-preview-tab', { hasText: 'Amis Schema JSON' });
    const dataTab = page.locator('.schema-preview-tab', { hasText: 'Data JSON' });
    await expect(schemaTab).toBeVisible();
    await expect(dataTab).toBeVisible();

    // Schema tab should be active by default
    await expect(schemaTab).toHaveClass(/is-active/);
    await expect(dataTab).not.toHaveClass(/is-active/);
  });

  test('clicking Data tab switches to data JSON editor', async ({ page }) => {
    const dataTab = page.locator('.schema-preview-tab', { hasText: 'Data JSON' });
    await dataTab.click();

    await expect(dataTab).toHaveClass(/is-active/);
    const schemaTab = page.locator('.schema-preview-tab', { hasText: 'Amis Schema JSON' });
    await expect(schemaTab).not.toHaveClass(/is-active/);

    // Toolbar title should update
    await expect(page.locator('.schema-preview-toolbar-title')).toHaveText('Data JSON');

    // Textarea should contain default data
    const textarea = page.locator('.schema-preview-textarea');
    const value = await textarea.inputValue();
    expect(value).toContain('张三');
  });

  test('data JSON edits are independent of schema JSON', async ({ page }) => {
    // Switch to Data tab
    await page.locator('.schema-preview-tab', { hasText: 'Data JSON' }).click();

    const textarea = page.locator('.schema-preview-textarea');
    await textarea.fill('');
    await textarea.fill(JSON.stringify({ name: '李四', email: 'lisi@test.com' }, null, 2));

    const value = await textarea.inputValue();
    expect(value).toContain('李四');

    // Switch back to Schema tab — should still have schema content
    await page.locator('.schema-preview-tab', { hasText: 'Amis Schema JSON' }).click();
    const schemaValue = await textarea.inputValue();
    expect(schemaValue).toContain('input-text');
  });

  // === Data Sync (form edits → Data JSON) ===

  test('form edits sync back to Data JSON textarea', async ({ page }) => {
    // Ensure schema tab is active and render the form
    const textarea = page.locator('.schema-preview-textarea');
    await page.locator('.schema-preview-tab', { hasText: 'Amis Schema JSON' }).click();

    // Set a simple form
    await textarea.fill('');
    await textarea.fill(JSON.stringify({
      type: 'form',
      body: [{ type: 'input-text', name: 'name', label: '姓名' }],
    }, null, 2));

    await page.locator('.schema-preview-render-btn').click();
    await page.waitForTimeout(500);

    // Type in the input — Amis wraps input in a container, find by input inside form
    const inputEl = page.locator('.schema-preview-ami-container input[type="text"]').first();
    await inputEl.click();
    await inputEl.fill('王五');
    await page.waitForTimeout(500);

    // Also try blur to trigger onChange
    await inputEl.press('Tab');
    await page.waitForTimeout(500);

    // Switch to Data tab
    await page.locator('.schema-preview-tab', { hasText: 'Data JSON' }).click();
    await page.waitForTimeout(300);

    const dataValue = await textarea.inputValue();
    expect(dataValue).toContain('王五');
  });

  test('clicking render with both schema and data uses data as initial values', async ({ page }) => {
    // Set data first
    await page.locator('.schema-preview-tab', { hasText: 'Data JSON' }).click();
    const dataTextarea = page.locator('.schema-preview-textarea');
    await dataTextarea.fill('');
    await dataTextarea.fill(JSON.stringify({ name: '预设姓名', email: 'preset@test.com' }, null, 2));

    // Set schema
    await page.locator('.schema-preview-tab', { hasText: 'Amis Schema JSON' }).click();
    const schemaTextarea = page.locator('.schema-preview-textarea');
    await schemaTextarea.fill('');
    await schemaTextarea.fill(JSON.stringify({
      type: 'form',
      body: [
        { type: 'input-text', name: 'name', label: '姓名' },
        { type: 'input-email', name: 'email', label: '邮箱' },
      ],
    }, null, 2));

    // Click render
    await page.locator('.schema-preview-render-btn').click();
    await page.waitForTimeout(500);

    // Verify data values rendered in form fields
    const nameVal = await page.locator('input[name="name"]').inputValue();
    expect(nameVal).toBe('预设姓名');

    const emailVal = await page.locator('input[name="email"]').inputValue();
    expect(emailVal).toBe('preset@test.com');
  });
});
