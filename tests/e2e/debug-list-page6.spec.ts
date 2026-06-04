import { test, expect } from '@playwright/test';

test('debug: check if API data is loaded', async ({ page }) => {
  // Listen for network responses
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/page/list')) {
      const status = resp.status();
      const body = await resp.body().catch(() => null);
      console.log('API response status:', status);
      console.log('API response body (first 200):', body?.toString().slice(0, 200));
    }
  });

  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // Check if loading-overlay is present (means still loading)
  const loading = await page.locator('.loading-overlay').count();
  console.log('Loading overlay count:', loading);

  // Check if there's an error display
  const errorText = await page.getByText('加载列表失败').count();
  console.log('Error text found:', errorText);

  // Check the amis-list-page div content
  const listPageHTML = await page.locator('.amis-list-page').evaluate(el => {
    return {
      childCount: el.children.length,
      children: Array.from(el.children).map(c => ({ tag: c.tagName, className: c.className })),
    };
  });
  console.log('ListPage children:', JSON.stringify(listPageHTML));
});
