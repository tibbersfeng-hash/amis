import { test, expect } from '@playwright/test';

test('debug: check browser console', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text().slice(0, 200)}`);
  });

  const pageErrors: string[] = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message.slice(0, 500));
  });

  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  console.log('=== Console logs ===');
  for (const log of logs) {
    console.log(log);
  }

  console.log('\n=== Page errors ===');
  for (const err of pageErrors) {
    console.log(err);
  }

  // Check #root content
  const rootHTML = await page.locator('#root').evaluate(el => {
    return {
      childCount: el.children.length,
      firstChildClass: el.children[0]?.className || 'none',
    };
  });
  console.log('Root:', JSON.stringify(rootHTML));
});
