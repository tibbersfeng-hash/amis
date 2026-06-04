import { test, expect } from '@playwright/test';

test('debug: render minimal Amis schema on list page', async ({ page }) => {
  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Try to render a minimal Amis schema directly
  const result = await page.evaluate(async () => {
    try {
      const { render: renderAmis } = await import('amis');
      const amisScoped = renderAmis(
        { type: 'page', title: 'Test Page', body: 'Hello from Amis!' },
        { data: {}, locale: 'zh-CN', theme: 'cxd' },
        {
          session: 'debug-test',
          theme: 'cxd',
          locale: 'zh-CN',
        }
      );
      
      const container = document.querySelector('.amis-scope');
      if (container) {
        ReactDOM.render(amisScoped, container);
        return {
          success: true,
          scopeHTML: container.innerHTML.substring(0, 200),
          scopedType: typeof amisScoped,
        };
      }
      return { success: false, error: 'No container found' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  console.log('Result:', JSON.stringify(result));

  // Check DOM after evaluation
  await page.waitForTimeout(1000);
  const scopeLen = await page.locator('.amis-scope').evaluate(el => el.innerHTML.length);
  console.log('Scope length after eval:', scopeLen);
  const text = await page.locator('.amis-scope').textContent();
  console.log('Scope text:', text);
});
