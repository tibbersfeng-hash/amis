import { test, expect } from '@playwright/test';

test('debug: check JS errors on list page', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('  PAGEERROR:', err.message.slice(0, 200));
  });

  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('Total JS errors:', errors.length);
  
  // Check DOM content of amis-scope
  const scopeContent = await page.locator('.amis-scope').innerHTML();
  console.log('Scope HTML (first 300):', scopeContent.slice(0, 300));

  // Check loading overlay
  const loading = page.locator('.loading-overlay');
  console.log('Loading visible:', await loading.isVisible());
  const loadingText = await loading.textContent();
  console.log('Loading text:', loadingText?.slice(0, 100));
});
