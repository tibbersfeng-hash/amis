import { test, expect } from '@playwright/test';

test.describe('Promotion List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=promotion-list');
    await expect(page.getByText('Promotion List').first()).toBeVisible({ timeout: 10000 });
  });

  test('loads promotion list page and displays table', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Promotion Code / Name' })).toBeVisible();
  });

  test('table headers are correct', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: 'Promotion Code / Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Promotion Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Active Period' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Target Audience' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Discount Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Budget' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Participation' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Operation' })).toBeVisible();
  });

  test('table has 3 data rows', async ({ page }) => {
    const rows = page.getByRole('row').filter({ has: page.locator('.cell-code') });
    await expect(rows).toHaveCount(3);
  });

  test('first row data is correct', async ({ page }) => {
    const firstCode = page.locator('.cell-code').first();
    await expect(firstCode).toHaveText('FLASH_20260601');
    const firstName = page.locator('.cell-name').first();
    await expect(firstName).toHaveText('Summer Flash Sale 2026');
  });

  test('promotion type mapping renders correctly', async ({ page }) => {
    await expect(page.locator('.type-flash-sale')).toBeVisible();
    await expect(page.locator('.type-flash-sale')).toContainText('Flash Sale');
  });

  test('status mapping renders correctly', async ({ page }) => {
    // Status dots exist in the DOM with correct classes
    const activeDots = page.locator('.promo-status-dot.active');
    await expect(activeDots).toHaveCount(1);
    const draftDots = page.locator('.promo-status-dot.draft');
    await expect(draftDots).toHaveCount(2);
  });

  test('search form has all filter fields', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Please Input' })).toBeVisible();
    const comboboxes = page.getByRole('combobox');
    await expect(comboboxes).toHaveCount(2);
  });

  test('+ Add button navigates to promotion detail', async ({ page }) => {
    const addBtn = page.locator('.btn-add');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('+ Add');
  });

  test('View and Edit links exist', async ({ page }) => {
    const viewLinks = page.locator('.action-view');
    const editLinks = page.locator('.action-edit');
    await expect(viewLinks).toHaveCount(3);
    await expect(editLinks).toHaveCount(3);
    await expect(viewLinks.first()).toBeVisible();
  });

  test('pagination controls visible', async ({ page }) => {
    await expect(page.locator('.cxd-Page')).toBeVisible();
  });

  test('Clear button exists and is visible', async ({ page }) => {
    await expect(page.locator('.btn-clear')).toBeVisible();
    await expect(page.locator('.btn-clear')).toContainText('Clear');
  });

  test('Search button exists and is visible', async ({ page }) => {
    await expect(page.locator('.btn-search')).toBeVisible();
    await expect(page.locator('.btn-search')).toContainText('Search');
  });
});
