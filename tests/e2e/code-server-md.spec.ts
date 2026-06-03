import { test, expect } from '@playwright/test';

const CODE_SERVER_URL = 'http://172.25.0.100:8888/?folder=/var/www/amis-mission';

test.describe('code-server Markdown Preview E2E', () => {
  test('should open CLAUDE.md and render preview', async ({ page }) => {
    // 1. 打开 code-server
    await page.goto(CODE_SERVER_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 2. 处理信任对话框（Trust Dialog）
    const trustDialog = page.locator('.monaco-dialog-box:has-text("trust")');
    const trustBtn = page.locator('button:has-text("Yes, I trust the authors")');
    if (await trustBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trustBtn.click();
      await page.waitForTimeout(1000);
    }

    // 3. 截图记录初始状态
    await page.screenshot({ path: '/tmp/e2e-01-initial.png', fullPage: false });

    // 4. 点击打开 CLAUDE.md（Explorer 中的文件）
    const fileItem = page.locator('[title="CLAUDE.md"], .monaco-icon-label:has-text("CLAUDE.md")').first();
    await expect(fileItem).toBeVisible({ timeout: 10000 });
    await fileItem.click();
    await page.waitForTimeout(2000);

    // 4. 截图记录打开文件后
    await page.screenshot({ path: '/tmp/e2e-02-file-opened.png', fullPage: false });

    // 5. 点击 Markdown 预览按钮（右上角预览图标）
    const previewBtn = page.locator('[title="Open Preview to the Side"], [aria-label*="Open Preview"]').first();
    if (await previewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await previewBtn.click();
    } else {
      // 备用：用快捷键
      await page.keyboard.press('Control+Shift+V');
    }
    await page.waitForTimeout(3000);

    // 6. 截图记录预览打开后
    await page.screenshot({ path: '/tmp/e2e-03-preview-opened.png', fullPage: false });

    // 7. 检查 Webview iframe 是否存在
    const webviewFrames = page.locator('iframe.webview');
    const webviewCount = await webviewFrames.count();
    console.log(`Webview iframe count: ${webviewCount}`);

    // 8. 如果 webview 存在，检查其内容是否渲染
    if (webviewCount > 0) {
      const frame = webviewFrames.first();
      const box = await frame.boundingBox();
      console.log(`Webview iframe boundingBox:`, box);

      // 尝试进入 iframe 检查内容
      const contentFrame = await frame.contentFrame();
      if (contentFrame) {
        const bodyText = await contentFrame.locator('body').textContent().catch(() => '');
        console.log(`Webview body text length: ${bodyText.length}`);
        console.log(`Webview body text preview: ${bodyText.substring(0, 200)}`);

        // 断言：内容不应为空（渲染成功）
        expect(bodyText.length).toBeGreaterThan(50);
      } else {
        // iframe 无法进入，可能是跨域限制，记录问题
        console.log('Cannot enter webview iframe - possible CSP/cross-origin issue');
      }
    } else {
      console.log('No webview iframe found - preview may not have opened');
    }

    // 9. 检查页面是否有空白预览区域的特征
    const pageContent = await page.content();
    const hasWebview = pageContent.includes('webview');
    const hasCspError = pageContent.includes('Content Security Policy');
    console.log(`Page has webview element: ${hasWebview}`);
    console.log(`Page has CSP error: ${hasCspError}`);
  });

  test('should verify webview endpoint accessibility', async ({ page }) => {
    const response = await page.goto('http://172.25.0.100:8888/static/out/vs/workbench/contrib/webview/browser/pre/index.html');
    expect(response?.status()).toBe(200);
  });
});
