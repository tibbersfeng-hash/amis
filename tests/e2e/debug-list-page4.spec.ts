import { test, expect } from '@playwright/test';

test('debug: check DOM structure', async ({ page }) => {
  await page.goto('http://localhost:5173/list?dataType=restaurant-basic');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Get all text content
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Body text:', bodyText);

  // Check if there are any errors
  const errors = page.locator('.error-display, .loading-overlay, [class*="error"]');
  const errorCount = await errors.count();
  console.log('Error elements found:', errorCount);

  // Check scope children
  const scopeHTML = await page.locator('.amis-scope').evaluate(el => {
    return {
      childCount: el.children.length,
      innerHTML: el.innerHTML.substring(0, 500),
      outerHTML: el.outerHTML.substring(0, 300),
    };
  });
  console.log('Scope info:', JSON.stringify(scopeHTML, null, 2));
});
