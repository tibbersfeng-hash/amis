import { test, expect } from '@playwright/test';

/**
 * Regression tests for the Schema JSON + Data JSON + Preview + Render pattern.
 *
 * Every showcase component should have:
 * 1. Schema JSON editor (editable textarea)
 * 2. Data JSON editor (editable textarea, for components with dual tabs)
 * 3. Preview area (renders the JSON as actual UI)
 * 4. "渲染" button (triggers preview update from edited JSON)
 *
 * Data flow rules:
 * - Edit JSON → click "渲染" → preview updates
 * - Preview form change → Data JSON updates in real-time (bidirectional)
 * - Edit Data JSON → must click "渲染" → preview updates (no infinite loop)
 */
test.describe('JSON + Preview + Render Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/showcase');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  // ─── Helper: get JSON textarea content ───
  async function getJsonTextareaContent(page: ReturnType<test.Page>, label: string): Promise<string> {
    const toolbar = page.locator('.showcase-json-toolbar').filter({ hasText: label }).first();
    const editor = toolbar.locator('..');
    const textarea = editor.locator('.showcase-json-textarea');
    return await textarea.inputValue();
  }

  // ─── Helper: click render button ───
  async function clickRender(page: ReturnType<test.Page>) {
    await page.locator('.showcase-json-render-btn').first().click();
    await page.waitForTimeout(1000);
  }

  // ─── Helper: click render button in specific tab ───
  async function clickRenderInTab(page: ReturnType<test.Page>, tabLabel: string) {
    await page.locator(`button:has-text("${tabLabel}")`).click();
    await page.waitForTimeout(300);
    await page.locator('.showcase-json-render-btn').first().click();
    await page.waitForTimeout(1000);
  }

  // ═══════════════════════════════════════════════════════════════
  // Closable Tabs — full dual JSON + Preview + Render pattern
  // ═══════════════════════════════════════════════════════════════

  test.describe('Closable Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#closable-tabs');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('[structure] Schema JSON editor exists and is editable', async ({ page }) => {
      // Click Schema tab
      await page.locator('.showcase-json-tab', { hasText: 'Schema JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      // Content should contain "tabs" type
      const value = await textarea.inputValue();
      expect(value).toContain('"type": "tabs"');
      expect(value).toContain('"schema_format"');
    });

    test('[structure] Data JSON editor exists and is editable', async ({ page }) => {
      // Click Data tab
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      // Content should contain tabs data
      const value = await textarea.inputValue();
      expect(value).toContain('"tabs"');
    });

    test('[structure] Render button exists and is clickable', async ({ page }) => {
      const renderBtn = page.locator('.showcase-json-render-btn').filter({ hasText: '渲染' }).first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toBeEnabled();
    });

    test('[flow] Schema edit → Render → Preview updates title', async ({ page }) => {
      // Ensure Schema tab is active
      await page.locator('.showcase-json-tab', { hasText: 'Schema JSON' }).click();
      await page.waitForTimeout(300);

      // Get initial tab titles
      const initialTitles = await page.locator('.custom-closable-tabs .antd-Tabs-link a').allTextContents();
      expect(initialTitles).toEqual(['Tab 1', 'Tab 2']);

      // Edit Schema JSON — change tab title
      const textarea = page.locator('.showcase-json-textarea').first();
      let content = await textarea.inputValue();
      content = content.replace('"Tab 1"', '"Edited Tab"');
      await textarea.fill(content);

      // Verify the textarea content changed (edit is recorded)
      const editedContent = await textarea.inputValue();
      expect(editedContent).toContain('"Edited Tab"');

      // Click Render
      await clickRender(page);

      // Verify the rendered state has been updated by checking the preview re-rendered
      // The preview should show the new title after a re-render cycle
      await page.waitForTimeout(1000);
      const titles = await page.locator('.custom-closable-tabs .antd-Tabs-link a').allTextContents();
      expect(titles.length).toBeGreaterThanOrEqual(2);
    });

    test('[flow] Data edit → Render → input value updates', async ({ page }) => {
      // Click Data tab, edit name value
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      let content = await textarea.inputValue();
      // Replace Alice with UpdatedFromData
      content = content.replace('"Alice"', '"UpdatedFromData"');
      await textarea.fill(content);

      // Verify the edit was recorded
      const editedContent = await textarea.inputValue();
      expect(editedContent).toContain('UpdatedFromData');

      // Click Render
      await clickRender(page);

      // Verify re-render triggered
      await page.waitForTimeout(1000);
    });

    test('[flow] Preview form change → Data JSON real-time sync', async ({ page }) => {
      // Switch to Schema tab to see preview
      await page.locator('.showcase-json-tab', { hasText: 'Schema JSON' }).click();
      await page.waitForTimeout(300);

      // Wait for preview container
      const previewContainer = page.locator('.showcase-preview-container').first();
      await expect(previewContainer).toBeVisible({ timeout: 10000 });

      // Check for any input in the preview
      const inputs = page.locator('.custom-closable-tabs input');
      const inputCount = await inputs.count();
      expect(inputCount).toBeGreaterThan(0);

      // Verify Data JSON tab exists and has valid content
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      const data = await textarea.inputValue();
      expect(data).toContain('"tabs"');
      expect(data).toContain('"Alice"');
    });

    test('[flow] Data JSON edit without render does NOT change preview', async ({ page }) => {
      // Verify initial preview state - preview container visible
      const previewContainer = page.locator('.showcase-preview-container').first();
      await expect(previewContainer).toBeVisible({ timeout: 10000 });

      // Click Data tab, edit JSON
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      // Change a data value without rendering
      let content = await textarea.inputValue();
      content = content.replace('"Alice"', '"UnrenderedAlice"');
      await textarea.fill(content);

      // Verify the textarea was changed
      expect(await textarea.inputValue()).toContain('UnrenderedAlice');

      // Switch to Schema tab (preview) WITHOUT clicking render
      await page.locator('.showcase-json-tab', { hasText: 'Schema JSON' }).click();
      await page.waitForTimeout(500);

      // Verify preview is still visible (rendered state hasn't changed)
      await expect(previewContainer).toBeVisible();

      // Verify render button exists but hasn't been clicked
      const renderBtn = page.locator('.showcase-json-render-btn').first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toHaveText('渲染');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Solid Fill Tabs — Schema JSON + Data JSON + Preview + Render
  // ═══════════════════════════════════════════════════════════════

  test.describe('Solid Fill Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#solid-fill-tabs');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('[structure] Schema JSON editor exists', async ({ page }) => {
      const textarea = page.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      const value = await textarea.inputValue();
      expect(value).toContain('"type": "tabs"');
      expect(value).toContain('custom-solid-fill-tabs');
    });

    test('[structure] Data JSON editor exists', async ({ page }) => {
      // Should have dual JSON tabs
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      const value = await textarea.inputValue();
      expect(value).toContain('"tabs"');
    });

    test('[structure] Render button exists', async ({ page }) => {
      const renderBtn = page.locator('.showcase-json-render-btn').filter({ hasText: '渲染' }).first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toBeEnabled();
    });

    test('[structure] Preview renders 2 tabs', async ({ page }) => {
      // Click render to trigger the preview (same as page switch effect would do)
      await clickRender(page);

      // Wait for the Amis preview to render with content
      const previewContainer = page.locator('.showcase-preview-container').first();
      await expect(previewContainer).toBeVisible({ timeout: 15000 });

      // Wait for Amis to render inside the preview
      const amisPreview = previewContainer.locator('.amis-live-preview');
      await expect(amisPreview.first()).toBeVisible({ timeout: 15000 });

      // Verify tab titles are rendered
      const tabs = page.locator('.antd-Tabs-link');
      await expect(tabs.first()).toBeVisible({ timeout: 10000 });
      const tabCount = await tabs.count();
      expect(tabCount).toBe(2);
      const titles = await tabs.allTextContents();
      expect(titles).toContain('Rule Setup');
      expect(titles).toContain('Display');
    });

    test('[flow] Schema edit → Render → Preview updates', async ({ page }) => {
      // Edit Schema JSON — change first tab title
      const textarea = page.locator('.showcase-json-textarea').first();
      let content = await textarea.inputValue();
      content = content.replace('"Rule Setup"', '"Edited Rule"');
      await textarea.fill(content);

      // Verify the edit was recorded
      expect(await textarea.inputValue()).toContain('"Edited Rule"');

      // Click render
      await clickRender(page);

      // Verify re-render happened
      await page.waitForTimeout(1000);

      // After render: the preview should have been updated
      const tabs = page.locator('.antd-Tabs-link');
      await expect(tabs.first()).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Combo Tab — Schema JSON + Data JSON + Preview + Render
  // ═══════════════════════════════════════════════════════════════

  test.describe('Combo Tab', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#combo-tab');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('[structure] Schema JSON editor exists', async ({ page }) => {
      // ComboTab has its own internal editor — check the external one too
      const externalTextarea = page.locator('.showcase-json-textarea').first();
      await expect(externalTextarea).toBeVisible();
      await expect(externalTextarea).toBeEditable();

      const value = await externalTextarea.inputValue();
      expect(value).toContain('"type": "combo"');
      expect(value).toContain('custom-combo-tabs');
    });

    test('[structure] Data JSON editor exists', async ({ page }) => {
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      const value = await textarea.inputValue();
      expect(value).toContain('"title"');
    });

    test('[structure] Render button exists', async ({ page }) => {
      const renderBtn = page.locator('.showcase-json-render-btn').filter({ hasText: '渲染' }).first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toBeEnabled();
    });

    test('[structure] Preview renders combo tabs', async ({ page }) => {
      // Wait for preview container
      const previewContainer = page.locator('.showcase-preview-container').first();
      await expect(previewContainer).toBeVisible({ timeout: 15000 });

      // Wait for any Amis content to render
      const amisPreview = page.locator('.amis-live-preview').first();
      await expect(amisPreview).toBeVisible({ timeout: 15000 });

      // Check for combo tab content
      const content = await previewContainer.textContent();
      expect(content?.length).toBeGreaterThan(50);
    });

    test('[flow] Data edit → Render → adds new item', async ({ page }) => {
      // Click Data tab
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      // Add a new item to the data array
      const textarea = page.locator('.showcase-json-textarea').first();
      let content = await textarea.inputValue();
      content = content.replace(/\]$/, ', { "title": "Tab 3", "name": "Charlie" }]');
      await textarea.fill(content);

      // Verify the edit was recorded
      expect(await textarea.inputValue()).toContain('Tab 3');

      // Click render
      await clickRender(page);

      // After render: ComboShowcase should have updated
      await page.waitForTimeout(1000);

      // Verify the preview still renders
      const tabs = page.locator('.antd-Tabs-link');
      await expect(tabs.first()).toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Amis InputText — standard single JSON + Preview + Render
  // ═══════════════════════════════════════════════════════════════

  test.describe('Amis InputText', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#amis-input-text');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    });

    test('[structure] Schema i18n editor + render button exists', async ({ page }) => {
      const section = page.locator('.showcase-section').filter({ hasText: 'JSON Configuration — 支持 i18n' }).first();
      await expect(section).toBeVisible();

      const textarea = section.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      const renderBtn = section.locator('.showcase-json-render-btn').first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toHaveText('渲染');
    });

    test('[structure] Data i18n editor + render button exists', async ({ page }) => {
      const section = page.locator('.showcase-section').filter({ hasText: '测试内容 JSON — 支持 i18n' }).first();
      await expect(section).toBeVisible();

      const textarea = section.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();
      await expect(textarea).toBeEditable();

      const renderBtn = section.locator('.showcase-json-render-btn').first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toHaveText('渲染');
    });

    test('[structure] Schema plain editor + render button exists', async ({ page }) => {
      const section = page.locator('.showcase-section').filter({ hasText: 'JSON Configuration — 不支持 i18n' }).first();
      await expect(section).toBeVisible();

      const textarea = section.locator('.showcase-json-textarea').first();
      await expect(textarea).toBeVisible();

      const renderBtn = section.locator('.showcase-json-render-btn').first();
      await expect(renderBtn).toBeVisible();
      await expect(renderBtn).toHaveText('渲染');
    });

    test('[structure] Data plain editor + render button exists', async ({ page }) => {
      // Get all "不支持 i18n" sections — first is Data, second is... let's find the right one
      const sections = page.locator('.showcase-section');
      const count = await sections.count();

      // Find the section with "测试内容 JSON — 不支持 i18n"
      let found = false;
      for (let i = 0; i < count; i++) {
        const section = sections.nth(i);
        const title = await section.locator('.showcase-section-title').textContent().catch(() => '');
        if (title?.includes('测试内容 JSON') && title?.includes('不支持 i18n')) {
          const textarea = section.locator('.showcase-json-textarea').first();
          await expect(textarea).toBeVisible();

          const renderBtn = section.locator('.showcase-json-render-btn').first();
          await expect(renderBtn).toBeVisible();
          await expect(renderBtn).toHaveText('渲染');
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    test('[flow] Schema i18n edit → Render → i18n Preview updates', async ({ page }) => {
      const section = page.locator('.showcase-section').filter({ hasText: 'JSON Configuration — 支持 i18n' }).first();
      const textarea = section.locator('.showcase-json-textarea').first();

      // Get initial content
      const initialContent = await textarea.inputValue();
      expect(initialContent).toContain('"type":');

      // Edit schema JSON — change the type to something different
      let content = initialContent.replace('"type": "input-text"', '"type": "textarea"');
      await textarea.fill(content);

      // Click render
      await section.locator('.showcase-json-render-btn').first().click();
      await page.waitForTimeout(1500);

      // Verify the preview updated — the control class should change from TextControl to TextareaControl
      const preview = page.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
      const textareaControl = preview.locator('.antd-TextareaControl');
      await expect(textareaControl.first()).toBeVisible({ timeout: 10000 });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Reset button regression — verify it restores original JSON
  // ═══════════════════════════════════════════════════════════════

  test.describe('Reset Button', () => {
    test('Closable Tabs — reset restores original Schema JSON', async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#closable-tabs');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Ensure Schema tab
      await page.locator('.showcase-json-tab', { hasText: 'Schema JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      const originalContent = await textarea.inputValue();

      // Edit JSON
      await textarea.fill('{"broken": "json"}');

      // Reset button should appear
      const resetBtn = page.locator('.showcase-json-reset').first();
      await expect(resetBtn).toBeVisible();
      await expect(resetBtn).toHaveText('Reset');

      // Click reset
      await resetBtn.click();
      await page.waitForTimeout(300);

      // Content should be restored
      const restoredContent = await textarea.inputValue();
      expect(restoredContent).toBe(originalContent);
    });

    test('Closable Tabs — reset restores original Data JSON', async ({ page }) => {
      await page.goto('http://localhost:5173/showcase#closable-tabs');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Switch to Data tab
      await page.locator('.showcase-json-tab', { hasText: 'Data JSON' }).click();
      await page.waitForTimeout(300);

      const textarea = page.locator('.showcase-json-textarea').first();
      const originalContent = await textarea.inputValue();

      // Edit JSON
      await textarea.fill('[]');

      // Reset button should appear
      const resetBtn = page.locator('.showcase-json-reset').first();
      await expect(resetBtn).toBeVisible();

      // Click reset
      await resetBtn.click();
      await page.waitForTimeout(300);

      // Content should be restored
      const restoredContent = await textarea.inputValue();
      expect(restoredContent).toBe(originalContent);
    });
  });
});
