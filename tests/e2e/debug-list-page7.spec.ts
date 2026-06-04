import { test, expect } from '@playwright/test';

test('debug: evaluate React state', async ({ page }) => {
  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check if there are any Amis-rendered elements
  const anyAmis = await page.locator('[class*="cxd-"]').count();
  console.log('cxd- elements:', anyAmis);

  // Check for any Amis-generated DOM
  const hasAmisForm = await page.locator('.cxd-Form').count();
  console.log('cxd-Form:', hasAmisForm);
  const hasAmisTable = await page.locator('.cxd-Table').count();
  console.log('cxd-Table:', hasAmisTable);
  const hasAmisCRUD = await page.locator('.cxd-CRUD').count();
  console.log('cxd-CRUD:', hasAmisCRUD);

  // Check scope innerHTML length
  const scopeLen = await page.locator('.amis-scope').evaluate(el => el.innerHTML.length);
  console.log('Scope innerHTML length:', scopeLen);

  // Full page screenshot
  await page.screenshot({ path: 'tests/e2e/screenshots/debug-list-page7.png', fullPage: true });
});
