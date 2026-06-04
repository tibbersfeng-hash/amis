import { test, expect } from '@playwright/test';

test.describe('Rich Text multiLang — modified content persists', () => {
  test('modified rich text content persists after language switch and back', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find rich text field by label
    const richTextLabel = page.getByText('富文本').first();
    await expect(richTextLabel).toBeVisible();

    // Get initial Chinese content
    const initialContent = await page.evaluate(() => {
      const editor = (window as any).tinymce?.activeEditor;
      return editor ? editor.getContent() : null;
    });
    console.log('Initial Chinese content:', initialContent);
    expect(initialContent).toContain('中文');

    // Modify content using TinyMCE API
    await page.evaluate(() => {
      const editor = (window as any).tinymce?.activeEditor;
      if (editor) {
        editor.undoManager.transact(() => {
          editor.setContent('<p>修改后的中文内容</p>');
        });
        editor.nodeChanged();
        editor.fire('change');
      }
    });
    await page.waitForTimeout(1000);

    // Verify modification
    const modifiedContent = await page.evaluate(() => {
      const editor = (window as any).tinymce?.activeEditor;
      return editor ? editor.getContent() : null;
    });
    console.log('Modified Chinese content:', modifiedContent);
    expect(modifiedContent).toContain('修改后的中文内容');

    // Switch to English
    await page.locator('.language-select').first().selectOption('en');
    await page.waitForTimeout(2000);

    // Check English content (should be original English)
    const enContent = await page.evaluate(() => {
      const editor = (window as any).tinymce?.activeEditor;
      return editor ? editor.getContent() : null;
    });
    console.log('English content:', enContent);
    expect(enContent).toContain('English');

    // Switch back to Chinese
    await page.locator('.language-select').first().selectOption('zh');
    await page.waitForTimeout(2000);

    // Verify modified Chinese content is restored
    const zhContentAfter = await page.evaluate(() => {
      const editor = (window as any).tinymce?.activeEditor;
      return editor ? editor.getContent() : null;
    });
    console.log('Chinese content after switch back:', zhContentAfter);

    // This is the bug: modification was lost because persistToLookup doesn't read from TinyMCE
    expect(zhContentAfter).toContain('修改后的中文内容');

    await page.screenshot({
      path: 'tests/e2e/screenshots/rich-text-modified-persist.png',
      fullPage: true,
    });
  });
});
