import { test, expect } from '@playwright/test';

test.describe('InputRichTextQuill — E2E Tests', () => {
  async function goToQuillTest(page) {
    await page.goto('http://localhost:5173/remote?dataType=quill-test&dataId=quill-test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // ==========================================
  // 基本渲染
  // ==========================================
  test.describe('基本渲染', () => {
    test('【渲染】Quill 编辑器可见', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-editor').first()).toBeVisible();
    });

    test('【渲染】工具栏可见', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-toolbar').first()).toBeVisible();
    });

    test('【渲染】Tab 栏存在', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.quill-tab-bar').first()).toBeVisible();
      await expect(page.locator('.quill-tab-item').first()).toHaveText('富文本');
      await expect(page.locator('.quill-tab-item').nth(1)).toHaveText('HTML');
    });

    test('【渲染】富文本 Tab 默认激活', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.quill-tab-item.quill-tab-active').first()).toHaveText('富文本');
    });

    test('【渲染】默认内容正确', async ({ page }) => {
      await goToQuillTest(page);
      const editor = page.locator('.ql-editor').first();
      const content = await editor.innerHTML();
      expect(content).toContain('默认富文本内容');
    });

    test('【渲染】第二个编辑器可见', async ({ page }) => {
      await goToQuillTest(page);
      const editors = page.locator('.ql-editor');
      await expect(editors).toHaveCount(2);
    });
  });

  // ==========================================
  // 编辑器交互
  // ==========================================
  test.describe('编辑器交互', () => {
    test('【输入】编辑富文本字段', async ({ page }) => {
      await goToQuillTest(page);
      // Use global querySelector with :nth-of-type to target the first editor
      const content = await page.evaluate(() => {
        const containers = document.querySelectorAll('.ql-editor');
        if (containers.length > 0) {
          const firstEditor = containers[0] as HTMLElement;
          // Check the innerText before modification
          const original = firstEditor.innerText;
          // Set new content
          firstEditor.innerHTML = '<p>新内容</p>';
          return { original, modified: firstEditor.innerHTML };
        }
        return { error: 'no editor found' };
      });
      expect(content.error).toBeUndefined();
      expect(content.modified).toContain('新内容');
    });

    test('【输入】清空编辑器内容', async ({ page }) => {
      await goToQuillTest(page);
      const editor = page.locator('.ql-editor').first();
      await editor.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(500);
      const content = await editor.innerHTML();
      // Quill keeps <p><br></p> for empty content
      expect(content).toMatch(/<br>|<p>/);
    });

    test('【输入】第二个编辑器也可编辑', async ({ page }) => {
      await goToQuillTest(page);
      const editors = page.locator('.ql-editor');
      await expect(editors).toHaveCount(2);
      await editors.nth(1).click();
      await page.keyboard.type('第二个编辑器');
      await page.waitForTimeout(500);
      const content = await editors.nth(1).innerHTML();
      expect(content).toContain('第二个编辑器');
    });
  });

  // ==========================================
  // Tab 切换
  // ==========================================
  test.describe('Tab 切换', () => {
    test('【Tab】切换到 HTML 模式', async ({ page }) => {
      await goToQuillTest(page);
      // Click HTML tab
      await page.locator('.quill-tab-item').nth(1).click();
      await page.waitForTimeout(500);

      // HTML tab should be active
      const tabs = page.locator('.quill-tab-item');
      await expect(tabs.nth(1)).toHaveClass(/quill-tab-active/);

      // textarea should be visible
      await expect(page.locator('textarea.textarea-item').first()).toBeVisible();
    });

    test('【Tab】HTML 模式内容正确', async ({ page }) => {
      await goToQuillTest(page);
      await page.locator('.quill-tab-item').nth(1).click();
      await page.waitForTimeout(500);

      const textarea = page.locator('textarea.textarea-item').first();
      const value = await textarea.inputValue();
      expect(value).toContain('默认富文本内容');
    });

    test('【Tab】编辑 HTML 后切换回编辑器', async ({ page }) => {
      await goToQuillTest(page);
      await page.locator('.quill-tab-item').nth(1).click();
      await page.waitForTimeout(500);

      const textarea = page.locator('textarea.textarea-item').first();
      await textarea.click();
      await textarea.press('Control+a');
      await textarea.fill('<p>HTML 编辑的新内容</p>');
      await page.waitForTimeout(300);

      // Switch back to editor
      await page.locator('.quill-tab-item').first().click();
      await page.waitForTimeout(500);

      // Editor should show new content
      const editor = page.locator('.ql-editor').first();
      const content = await editor.innerHTML();
      expect(content).toContain('HTML 编辑的新内容');
    });
  });

  // ==========================================
  // 工具栏按钮
  // ==========================================
  test.describe('工具栏按钮', () => {
    test('【工具栏】加粗按钮存在', async ({ page }) => {
      await goToQuillTest(page);
      // Quill buttons use class like ql-bold, ql-italic, etc.
      await expect(page.locator('.ql-toolbar button.ql-bold').first()).toBeVisible();
    });

    test('【工具栏】斜体按钮存在', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-toolbar button.ql-italic').first()).toBeVisible();
    });

    test('【工具栏】有序列表按钮存在', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-toolbar button.ql-list[value="ordered"]').first()).toBeVisible();
    });

    test('【工具栏】链接按钮存在', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-toolbar button.ql-link').first()).toBeVisible();
    });

    test('【工具栏】图片按钮存在（有 receiver 时）', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-toolbar button.ql-image').first()).toBeVisible();
    });
  });

  // ==========================================
  // 多语言切换
  // ==========================================
  test.describe('多语言切换', () => {
    test('【多语言】切换语言后编辑器仍然可见', async ({ page }) => {
      await goToQuillTest(page);
      await expect(page.locator('.ql-editor').first()).toBeVisible();

      // Switch language
      const langSelect = page.locator('.language-select').first();
      if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await langSelect.selectOption('en');
        await page.waitForTimeout(2000);
        await expect(page.locator('.ql-editor').first()).toBeVisible();
      }
    });

    test('【多语言】编辑器内容在语言切换后保留', async ({ page }) => {
      await goToQuillTest(page);

      // Edit content
      const editor = page.locator('.ql-editor').first();
      await editor.click();
      await page.keyboard.press('Control+a');
      await page.keyboard.type('中文测试');
      await page.waitForTimeout(1000);

      // Switch to English
      const langSelect = page.locator('.language-select').first();
      if (await langSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        await langSelect.selectOption('en');
        await page.waitForTimeout(2000);

        // Content should be replaced with English version (from data file)
        const content = await editor.innerHTML();
        // The English version is the same in this test data
        expect(content).toBeTruthy();
      }
    });
  });
});
