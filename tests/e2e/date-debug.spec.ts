import { test, expect } from '@playwright/test';

test('Debug: date range inputs', async ({ page }) => {
  await page.goto('http://localhost:5173/showcase#amis-input-date-range');
  const content = page.locator('.showcase-content');
  const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
  await expect(i18nPreview).toBeVisible();

  // Find all inputs
  const inputs = i18nPreview.locator('input[type="text"]');
  const count = await inputs.count();
  console.log('Text input count:', count);
  for (let i = 0; i < count; i++) {
    const name = await inputs.nth(i).getAttribute('name');
    const val = await inputs.nth(i).inputValue();
    const cls = await inputs.nth(i).getAttribute('class');
    console.log(`  [${i}] name: ${name}, class: ${cls?.substring(0, 50)}, value: "${val}"`);
  }

  // Get all text
  const allText = await i18nPreview.textContent();
  console.log('All text:', allText.substring(0, 200));

  await page.screenshot({ path: 'test-results/date-range-debug.png', fullPage: true });
});
