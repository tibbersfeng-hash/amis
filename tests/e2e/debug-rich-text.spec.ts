import { test, expect } from '@playwright/test';

test('debug: find rich text DOM structure', async ({ page }) => {
  await page.goto('http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Find all editors
  const editors = await page.locator('.cxd-Editor').count();
  console.log('Number of .cxd-Editor elements:', editors);

  // Find rich text field by label
  const richTextLabel = page.getByText('富文本').first();
  await expect(richTextLabel).toBeVisible();

  // Get the form group
  const formGroup = await richTextLabel.locator('..').evaluate(el => el.outerHTML);
  console.log('Form group HTML:', formGroup?.slice(0, 500));

  // Find iframe
  const iframes = await page.locator('iframe').count();
  console.log('Number of iframes:', iframes);

  // Find contenteditable
  const contentEditables = await page.locator('[contenteditable]').count();
  console.log('Number of contenteditable elements:', contentEditables);

  // Try to find tinymce
  const tinymce = await page.locator('.tox-tinymce').count();
  console.log('Number of tinymce elements:', tinymce);

  await page.screenshot({ path: 'tests/e2e/screenshots/debug-rich-text.png', fullPage: true });
});
