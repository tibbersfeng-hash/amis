import { test, expect } from '@playwright/test';

test('debug: check API response and schema', async ({ page }) => {
  // First check the API directly
  const apiResponse = await page.evaluate(async () => {
    const r = await fetch('/api/page/list?dataType=restaurant-basic');
    return r.json();
  });
  console.log('API response keys:', Object.keys(apiResponse));
  console.log('API items count:', apiResponse.items?.length || 0);

  // Now check if ListPage component is receiving data
  // Inject a console log to check React state
  await page.addInitScript(() => {
    // Not useful for React state, just proceed
  });

  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check if the page has any content at all
  const allDivs = await page.locator('div').count();
  console.log('Total divs:', allDivs);

  // Check for amis-list-page class
  const listPageDiv = page.locator('.amis-list-page');
  console.log('amis-list-page exists:', await listPageDiv.count() > 0);

  // Check innerHTML of amis-scope
  const scopeContent = await page.locator('.amis-scope').evaluate(el => el.innerHTML.length);
  console.log('Scope innerHTML length:', scopeContent);

  // Check if there are any children
  const childCount = await page.locator('.amis-scope > *').count();
  console.log('Direct children of scope:', childCount);

  await page.screenshot({
    path: 'tests/e2e/screenshots/debug-list-page3.png',
    fullPage: true,
  });
});
