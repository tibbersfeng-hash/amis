import { test, expect } from '@playwright/test';

test.describe('Closable Tabs Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#closable-tabs');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('renders two tabs with form fields', async ({ page }) => {
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link a');
    await expect(tabLinks).toHaveCount(2);
    await expect(tabLinks.first()).toHaveText('Sub Mission 1');
    await expect(tabLinks.last()).toHaveText('Sub Mission 2');

    const activeSelects = page.locator('.cxd-Tabs-pane.is-active .cxd-Select');
    await expect(activeSelects).toHaveCount(10);

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toHaveText('提交');

    // Custom add button should be visible
    const addBtn = page.locator('.closable-tabs-add-btn');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Sub Mission');
  });

  test('+ Add button creates new tab with full form schema', async ({ page }) => {
    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link a')).toHaveCount(2);

    // Click custom + Add button
    await page.locator('.closable-tabs-add-btn').click();
    await page.waitForTimeout(1500);

    // Should have 3 tabs with correct titles (not Amis default "tab3")
    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link a')).toHaveCount(3);
    const titles = await page.locator('.custom-closable-tabs .cxd-Tabs-link a').allTextContents();
    expect(titles).toEqual(['Sub Mission 1', 'Sub Mission 2', 'Sub Mission 3']);

    // New tab should have the same form fields
    const activeSelects = page.locator('.cxd-Tabs-pane.is-active .cxd-Select');
    await expect(activeSelects).toHaveCount(10);

    // Submit button should exist
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('can add multiple tabs up to limit', async ({ page }) => {
    const addBtn = page.locator('.closable-tabs-add-btn');

    // Verify add button is visible initially
    await expect(addBtn).toBeVisible();

    // Add tabs one by one until limit (10 total = 8 clicks from 2)
    for (let i = 0; i < 8; i++) {
      await expect(addBtn).toBeVisible();
      await addBtn.click();
      await page.waitForTimeout(500);
    }

    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link a')).toHaveCount(10);

    // Add button should be removed from DOM when max reached
    await expect(addBtn).toHaveCount(0);

    // Switch to last tab and verify it has form fields
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      const lastTab = tabs[tabs.length - 1];
      if (lastTab) {
        lastTab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        lastTab.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);

    // Only count selects in the active tab pane
    const activeSelects = page.locator('.cxd-Tabs-pane.is-active .cxd-Select');
    await expect(activeSelects).toHaveCount(10);
  });

  test('form submission is captured as array with all tab data', async ({ page }) => {
    const preview = page.locator('.closable-tabs-preview').first();

    // Fill Sub Mission 1
    await preview.locator('.cxd-Select').first().click();
    await page.waitForTimeout(500);
    await page.locator('.cxd-Select-option', { hasText: 'Direct Booking' }).first().click();
    await page.waitForTimeout(500);

    await preview.locator('input[name="targetSpending"]').first().fill('5000');

    // Switch to Sub Mission 2 and fill
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      if (tabs[1]) {
        tabs[1].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabs[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);

    await preview.locator('input[name="targetSpending"]').last().fill('3000');

    // Submit
    await preview.locator('button[type="submit"]').last().click();
    await page.waitForTimeout(2000);

    // Check submission display
    const submissions = page.locator('.closable-tabs-submissions');
    await expect(submissions.locator('h3')).toContainText('表单提交记录 (1)');
    await expect(submissions.locator('pre')).toHaveCount(1);

    // Data should be an array of objects
    const data = await submissions.locator('pre').first().textContent();
    const parsed = JSON.parse(data!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);

    // Each item should have tab-specific data
    expect(parsed[0].targetSpending).toBe('5000');
    expect(parsed[0].subMissionType).toBe('Direct Booking');
    expect(parsed[1].targetSpending).toBe('3000');
    expect(parsed[1].subMissionType).toBe('Room Stay Prepaid Booking');
  });

  test('new tab submission includes all tabs in array', async ({ page }) => {
    const preview = page.locator('.closable-tabs-preview').first();
    const submissions = page.locator('.closable-tabs-submissions');

    // Add a new tab (Sub Mission 3)
    await page.locator('.closable-tabs-add-btn').click();
    await page.waitForTimeout(1500);

    // Switch to Sub Mission 1 and fill
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      if (tabs[0]) {
        tabs[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabs[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);
    await preview.locator('input[name="targetSpending"]').first().fill('1000');

    // Switch to Sub Mission 3 and fill
    await page.evaluate(() => {
      const tabs = document.querySelectorAll('.custom-closable-tabs .cxd-Tabs-link a');
      if (tabs[2]) {
        tabs[2].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        tabs[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    await page.waitForTimeout(1000);
    await preview.locator('input[name="targetSpending"]').last().fill('9999');

    // Submit from Sub Mission 3
    await preview.locator('button[type="submit"]').last().click();
    await page.waitForTimeout(2000);

    await expect(submissions.locator('h3')).toContainText('表单提交记录 (1)');
    const data = await submissions.locator('pre').first().textContent();
    const parsed = JSON.parse(data!);

    // Should have 3 items (all tabs)
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(3);

    // Data from different tabs
    expect(parsed[0].targetSpending).toBe('1000'); // Sub Mission 1
    expect(parsed[2].targetSpending).toBe('9999'); // Sub Mission 3
  });

  test('multiple submissions each contain full array of all tabs', async ({ page }) => {
    const preview = page.locator('.closable-tabs-preview').first();
    const submissions = page.locator('.closable-tabs-submissions');

    // First submission
    await preview.locator('input[name="targetSpending"]').first().fill('1000');
    await preview.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Change data and submit again
    await preview.locator('input[name="targetSpending"]').first().fill('2000');
    await preview.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    await expect(submissions.locator('h3')).toContainText('表单提交记录 (2)');
    await expect(submissions.locator('pre')).toHaveCount(2);

    // Both submissions should be arrays of 2 items
    const data1 = await submissions.locator('pre').first().textContent();
    const data2 = await submissions.locator('pre').last().textContent();

    expect(JSON.parse(data1!).length).toBe(2);
    expect(JSON.parse(data2!).length).toBe(2);

    // Different values between submissions
    expect(JSON.parse(data1!)[0].targetSpending).toBe('1000');
    expect(JSON.parse(data2!)[0].targetSpending).toBe('2000');
  });

  // Regression: + Add button workflow
  test('[regression] + Add button: visible, clickable, creates correct tab, hides at limit', async ({ page }) => {
    const addBtn = page.locator('.closable-tabs-add-btn');

    // 1. Add button should be visible with correct text and icon
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Sub Mission');
    await expect(addBtn.locator('.add-icon')).toContainText('+');

    // 2. Click add → creates new tab with correct title
    await addBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link a')).toHaveCount(3);
    const titles = await page.locator('.custom-closable-tabs .cxd-Tabs-link a').allTextContents();
    expect(titles).toEqual(['Sub Mission 1', 'Sub Mission 2', 'Sub Mission 3']);

    // 3. New tab should have full form schema (10 selects)
    await expect(page.locator('.cxd-Tabs-pane.is-active .cxd-Select')).toHaveCount(10);
    await expect(page.locator('.cxd-Tabs-pane.is-active button[type="submit"]')).toBeVisible();

    // 4. New tab should have close button
    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link.is-active .cxd-Tabs-link-close')).toBeVisible();

    // 5. Add more tabs until limit (10 total)
    await addBtn.click(); // 4
    await page.waitForTimeout(500);
    await addBtn.click(); // 5
    await page.waitForTimeout(500);
    await addBtn.click(); // 6
    await page.waitForTimeout(500);
    await addBtn.click(); // 7
    await page.waitForTimeout(500);
    await addBtn.click(); // 8
    await page.waitForTimeout(500);
    await addBtn.click(); // 9
    await page.waitForTimeout(500);
    await expect(addBtn).toBeVisible(); // still visible at 9 tabs
    await addBtn.click(); // 10 — button removed after this
    await page.waitForTimeout(500);

    await expect(page.locator('.custom-closable-tabs .cxd-Tabs-link a')).toHaveCount(10);
    const allTitles = await page.locator('.custom-closable-tabs .cxd-Tabs-link a').allTextContents();
    expect(allTitles).toEqual(['Sub Mission 1', 'Sub Mission 2', 'Sub Mission 3', 'Sub Mission 4', 'Sub Mission 5', 'Sub Mission 6', 'Sub Mission 7', 'Sub Mission 8', 'Sub Mission 9', 'Sub Mission 10']);

    // 6. Add button should be removed from DOM at max
    await expect(addBtn).toHaveCount(0);
  });
});
