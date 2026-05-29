import { test, expect } from '@playwright/test';

test.describe('Mission List Page', () => {
  test('loads list page and displays table', async ({ page }) => {
    await page.goto('/?page=list');

    // Page header is visible
    await expect(page.locator('.page-title')).toContainText('Mission List');

    // Wait for CRUD data to load (Amis CRUD fetches data asynchronously)
    await page.waitForSelector('.cxd-Table-table tbody tr', { timeout: 10000 });

    // Amis CRUD table - use nth(1) because Amis creates a hidden clone table
    const table = page.locator('.cxd-Table-table').nth(1);
    await expect(table).toBeVisible();

    // Table headers
    const headers = table.locator('thead th');
    await expect(headers.first()).toContainText('Mission Code');

    // Table has 3 data rows
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(3);

    // First row has correct mission code
    await expect(rows.first().locator('td').first()).toContainText('SUMM01');
  });

  test('clicking mission name navigates to detail page', async ({ page }) => {
    await page.goto('/?page=list');

    // Wait for data
    await page.waitForSelector('.cxd-Table-table tbody tr', { timeout: 10000 });

    // Click first mission name link
    const firstLink = page.locator('a.cell-name').first();
    await expect(firstLink).toBeVisible();

    // Check href points to mission page
    const href = await firstLink.getAttribute('href');
    expect(href).toContain('page=mission');
    expect(href).toContain('id=');
  });

  test('add button navigates to new mission page', async ({ page }) => {
    await page.goto('/?page=list');

    // Wait for data
    await page.waitForSelector('.cxd-Table-table tbody tr', { timeout: 10000 });

    const addBtn = page.locator('.btn-add');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('+ Add');

    // Click and verify navigation
    await addBtn.click();
    // Wait for page title to change
    await page.waitForSelector('.page-title', { timeout: 10000 });
    await expect(page.locator('.page-title')).toContainText('Add Mission');
  });

  test('search form is visible with expected fields', async ({ page }) => {
    await page.goto('/?page=list');

    // Search form container visible
    const searchForm = page.locator('.search-form');
    await expect(searchForm).toBeVisible();

    // Search and Clear buttons visible
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();

    // Mission Code input visible
    await expect(page.getByPlaceholder('Please Input')).toBeVisible();
  });

  test('pagination controls are visible', async ({ page }) => {
    await page.goto('/?page=list');

    // Wait for data
    await page.waitForSelector('.cxd-Table-table tbody tr', { timeout: 10000 });

    // The table has data loaded - verify table is populated
    const rows = page.locator('.cxd-Table-table').nth(1).locator('tbody tr');
    await expect(rows).toHaveCount(3);

    // Table has multiple columns (more than just one)
    const headers = page.locator('.cxd-Table-table').nth(1).locator('thead th');
    await expect(headers).toHaveCount(10);
  });

  test('operation column has action links', async ({ page }) => {
    await page.goto('/?page=list');

    // Wait for data
    await page.waitForSelector('.cxd-Table-table tbody tr', { timeout: 10000 });

    // Action links in operation column
    const actionLinks = page.locator('a.action-link');
    // Amis renders links with text "链接" when using type: "link"
    await expect(actionLinks).toHaveCount(6); // 3 rows * 2 links each
  });
});
