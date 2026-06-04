import { test, expect } from '@playwright/test';

test('debug: list page renders Amis CRUD', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('  PAGE ERROR:', msg.text());
  });

  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check what's on the page
  const bodyText = await page.locator('body').innerText();
  console.log('Body text (first 500):', bodyText.slice(0, 500));

  // Check for Amis scope
  const amisScope = page.locator('.amis-scope');
  console.log('Amis scope exists:', await amisScope.count() > 0);

  // Check for CRUD
  const crud = page.locator('.cxd-CRUD');
  console.log('CRUD exists:', await crud.count() > 0);

  // Check for any Amis elements
  const cxdElements = await page.locator('[class*="cxd-"]').count();
  console.log('cxd- elements found:', cxdElements);

  await page.screenshot({
    path: 'tests/e2e/screenshots/debug-list-page.png',
    fullPage: true,
  });
});
