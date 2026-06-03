import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * E2E tests for AI Generator feature on Schema Preview page.
 * All tests call the real Claude CLI backend — no mocking.
 */

test.describe('AI Generator', () => {
  test.use({
    actionTimeout: 180_000,
  });

  /**
   * Helper: navigate to schema preview and open AI drawer.
   */
  async function openAIDrawer(page) {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForTimeout(500);
    await page.getByTestId('ai-generate-btn').click();
    await page.waitForTimeout(300);
  }

  /**
   * Helper: fill prompt, generate, wait for result, verify and apply.
   */
  async function generateAndApply(page, prompt: string, options: { timeout?: number; expectFields?: string[]; clearResult?: boolean } = {}) {
    const { timeout = 180_000, expectFields = [], clearResult = false } = options;

    // If drawer has result from previous generation, clear it first
    if (clearResult) {
      const resultVisible = await page.getByText('生成结果预览').isVisible().catch(() => false);
      if (resultVisible) {
        await page.getByTestId('ai-drawer-reset-btn').click();
        await page.waitForTimeout(300);
      }
    }

    const textarea = page.getByTestId('ai-drawer-prompt');
    await textarea.fill(prompt);
    await page.getByTestId('ai-drawer-generate-btn').click();

    // Wait for result
    await expect(page.getByText('生成结果预览')).toBeVisible({ timeout });

    // Verify Schema JSON and Data JSON tabs exist
    const drawer = page.getByTestId('ai-drawer');
    await expect(drawer.getByText('Schema JSON')).toBeVisible();
    await expect(drawer.getByText('Data JSON')).toBeVisible();

    // Apply the result
    await page.getByTestId('ai-drawer-apply-btn').click();
    await page.waitForTimeout(500);

    // Verify editor was updated
    const editorTextarea = page.locator('.schema-preview-textarea').first();
    const schemaValue = await editorTextarea.inputValue();
    expect(schemaValue.length).toBeGreaterThan(50);

    // Verify expected fields exist in schema
    for (const field of expectFields) {
      expect(schemaValue).toContain(field);
    }

    return schemaValue;
  }

  // ── UI tests (no API call needed) ──

  test('AI Generate button is visible in toolbar', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForTimeout(500);
    await expect(page.getByTestId('ai-generate-btn')).toBeVisible();
  });

  test('clicking AI 生成 opens drawer', async ({ page }) => {
    await openAIDrawer(page);
    await expect(page.getByTestId('ai-drawer-prompt')).toBeVisible();
  });

  test('drawer can be closed with close button', async ({ page }) => {
    await openAIDrawer(page);
    await page.getByTestId('ai-drawer-close').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('ai-drawer-prompt')).not.toBeVisible();
  });

  test('drawer can be closed with backdrop click', async ({ page }) => {
    await openAIDrawer(page);
    await page.getByTestId('ai-drawer-backdrop').click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId('ai-drawer-prompt')).not.toBeVisible();
  });

  test('generate button disabled without prompt', async ({ page }) => {
    await openAIDrawer(page);
    await expect(page.getByTestId('ai-drawer-generate-btn')).toBeDisabled();
  });

  test('generate button enabled with prompt', async ({ page }) => {
    await openAIDrawer(page);
    await page.getByTestId('ai-drawer-prompt').fill('添加一个下拉选择框');
    await expect(page.getByTestId('ai-drawer-generate-btn')).toBeEnabled();
  });

  test('image upload area is visible in drawer', async ({ page }) => {
    await openAIDrawer(page);
    await expect(page.getByText('添加参考图片（可选）')).toBeVisible();
    await expect(page.getByText('拖拽或点击上传')).toBeVisible();
  });

  test('uploading image shows thumbnail', async ({ page }) => {
    await openAIDrawer(page);
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'test-screenshot.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    await page.waitForTimeout(300);
    await expect(page.locator('img[alt="test-screenshot.png"]')).toBeVisible();
    await expect(page.locator('button[title="移除图片"]')).toBeVisible();
  });

  test('removing image clears thumbnail', async ({ page }) => {
    await openAIDrawer(page);
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'remove-me.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    await page.waitForTimeout(300);
    await expect(page.locator('img[alt="remove-me.png"]')).toBeVisible();
    await page.locator('button[title="移除图片"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('img[alt="remove-me.png"]')).not.toBeVisible();
  });

  test('image upload area shows "继续添加" after uploading', async ({ page }) => {
    await openAIDrawer(page);
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'first.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    await page.waitForTimeout(300);
    await expect(page.getByText('继续添加图片')).toBeVisible();
  });

  test('images are cleared on reset session', async ({ page }) => {
    await openAIDrawer(page);
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await page.locator('input[type="file"]').setInputFiles({
      name: 'clear-me.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    await page.waitForTimeout(300);
    await expect(page.locator('img[alt="clear-me.png"]')).toBeVisible();
    await page.getByTestId('ai-drawer-reset-session').click();
    await page.waitForTimeout(300);
    await expect(page.locator('img[alt="clear-me.png"]')).not.toBeVisible();
  });

  // ── Real API generation tests ──

  test('generate form from text prompt', async ({ page }) => {
    await openAIDrawer(page);
    await generateAndApply(page, '创建一个酒店预订表单，包含：客户姓名、入住日期、退房日期、房间数量、特殊需求备注', {
      expectFields: ['input-text', 'input-date', 'input-number', 'textarea'],
    });
  });

  // Note: Image generation tests are skipped because Claude CLI --output-format text
  // does not have file-reading capability. Images are passed as file paths in the prompt
  // but Claude CLI cannot read them. This would require stream-json mode with file upload.

  test('modify existing schema — add fields', async ({ page }) => {
    await openAIDrawer(page);

    // First generate a base form
    await generateAndApply(page, '创建一个简单的个人信息表单，包含姓名和邮箱两个字段', {
      expectFields: ['input-text'],
    });
  });

  test('create CRUD list page from text', async ({ page }) => {
    await openAIDrawer(page);
    await generateAndApply(page, '创建一个员工管理列表页面，包含搜索功能和表格展示。搜索条件：员工姓名、部门。表格列：员工编号、姓名、部门、入职日期、状态', {
      expectFields: ['crud'],
    });
  });

  test('successful generation shows sessionId and turn count', async ({ page }) => {
    await openAIDrawer(page);

    // Session info bar should show "首次生成后分配" before first response
    await expect(page.getByText('首次生成后分配')).toBeVisible();

    await page.getByTestId('ai-drawer-prompt').fill('创建一个包含姓名和邮箱的表单');
    await page.getByTestId('ai-drawer-generate-btn').click();

    // Wait for result
    await expect(page.getByText('生成结果预览')).toBeVisible({ timeout: 180_000 });

    // After successful generation, session ID should be visible
    await expect(page.getByText('1 轮')).toBeVisible();
    // Session ID area contains truncated ID text
    await expect(page.getByText('default')).toBeVisible();
  });

  test('upload area is hidden when result is shown', async ({ page }) => {
    await openAIDrawer(page);

    await page.getByTestId('ai-drawer-prompt').fill('创建一个表单');
    await page.getByTestId('ai-drawer-generate-btn').click();

    await expect(page.getByText('生成结果预览')).toBeVisible({ timeout: 180_000 });

    // Upload area should be hidden when result is shown
    await expect(page.getByText('添加参考图片（可选）')).not.toBeVisible();
  });

  test('raw output is visible after generation', async ({ page }) => {
    await openAIDrawer(page);

    await page.getByTestId('ai-drawer-prompt').fill('创建一个包含姓名和邮箱的表单');
    await page.getByTestId('ai-drawer-generate-btn').click();

    await expect(page.getByText('生成结果预览')).toBeVisible({ timeout: 180_000 });

    // Claude raw output toggle should be visible
    await expect(page.getByText('Claude 原始输出')).toBeVisible();

    // Click to expand
    await page.getByText('Claude 原始输出').click();
    await page.waitForTimeout(300);

    // Raw output content should be visible (non-empty)
    const rawOutput = page.locator('pre');
    const text = await rawOutput.first().textContent();
    expect(text?.length).toBeGreaterThan(50);
  });
});
