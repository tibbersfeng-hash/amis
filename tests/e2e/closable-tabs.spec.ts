import { test, expect } from '@playwright/test';

/** Navigate to schema preview and enter a schema JSON. */
async function setupSchemaPreview(page: ReturnType<typeof test>, schema: Record<string, unknown>) {
  await page.goto('http://localhost:5173/showcase#schema-preview');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  await page.fill('.schema-preview-textarea', JSON.stringify(schema, null, 2));
  await page.waitForTimeout(500);
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(2000);
}

/** Default schema used by multiple tests. */
const DEFAULT_SCHEMA = {
  type: 'closable-tab',
  addable: true,
  addBtnText: '+ Add Tab',
  schema_format: {
    type: 'form',
    wrapWithPanel: false,
    data: {},
    body: [
      { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
    ],
    actions: [{ type: 'submit', label: '提交', level: 'primary' }],
  },
  tabs: [
    { title: 'Tab 1', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
    { title: 'Tab 2', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
  ],
};

test.describe('Closable Tabs Component', () => {
  test('renders closable-tab component with correct type', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);

    // Check that the custom wrapper is rendered
    const wrapper = page.locator('.closable-tab-wrapper');
    await expect(wrapper).toBeVisible();

    // Check custom-closable-tabs class is applied
    const tabs = page.locator('.custom-closable-tabs');
    await expect(tabs).toBeVisible();

    // Verify two initial tabs
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link:not(.cxd-Tabs-addable) a');
    await expect(tabLinks).toHaveCount(2);

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-basic.png',
      fullPage: true,
    });
  });

  test('add button is positioned tightly after existing tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);

    // The add button should be inside the tabs list, not below it
    const tabList = page.locator('.custom-closable-tabs .cxd-Tabs-links');
    const addBtn = tabList.locator('.cxd-Tabs-addable');

    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Tab');

    // Verify add button is in the same row as tabs
    const tabListChildren = await tabList.locator('> *').count();
    expect(tabListChildren).toBe(3); // 2 tabs + 1 add button

    // Verify wrapper has no excessive right padding (button should be tight)
    const wrapperEl = page.locator('.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper').first();
    const wrapperPadding = await wrapperEl.evaluate(el => {
      return window.getComputedStyle(el).paddingRight;
    });
    // Should not have the old 170px padding
    expect(parseInt(wrapperPadding, 10)).toBeLessThan(50);

    // Verify add button has no left margin
    const addBtnMargin = await addBtn.evaluate(el => {
      return window.getComputedStyle(el).marginLeft;
    });
    expect(parseInt(addBtnMargin, 10)).toBeLessThan(5);

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-add-button.png',
      fullPage: true,
    });
  });

  test('add button text is customizable via schema', async ({ page }) => {
    const customSchema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ New Sub Mission',
      schema_format: {
        type: 'input-text',
        name: 'name',
        label: 'Name'
      },
      tabs: [
        { title: 'Tab 1', body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };

    await setupSchemaPreview(page, customSchema);

    // Check custom add button text
    const addBtn = page.locator('.cxd-Tabs-addable');
    await expect(addBtn).toContainText('New Sub Mission');

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-custom-add-text.png',
      fullPage: true,
    });
  });

  test('+ button creates new tab with schema_format template', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);

    // Verify initial tab count
    const initialTabs = page.locator('.custom-closable-tabs .cxd-Tabs-link:not(.cxd-Tabs-addable) a');
    await expect(initialTabs).toHaveCount(2);

    // Click add button
    const addBtn = page.locator('.cxd-Tabs-addable');
    await addBtn.click();
    await page.waitForTimeout(1000);

    // Should have 3 tabs now
    await expect(initialTabs).toHaveCount(3);

    // New tab should have correct title
    const titles = await initialTabs.allTextContents();
    expect(titles[2]).toBe('Tab 3');

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-new-tab.png',
      fullPage: true,
    });
  });

  test('deleted tabs do not reappear when adding new tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);

    // Start with 2 tabs
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link:not(.cxd-Tabs-addable) a');
    await expect(tabLinks).toHaveCount(2);

    // Add a third tab
    await page.locator('.cxd-Tabs-addable').click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);

    // Screenshot after adding third tab
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-before-delete.png',
      fullPage: true,
    });

    // Delete the second tab (Tab 2)
    const closeBtns = page.locator('.custom-closable-tabs .cxd-Tabs-link-close');
    await closeBtns.nth(1).click(); // Close Tab 2
    await page.waitForTimeout(1000);

    // Should have 2 tabs now (Tab 1 and Tab 3)
    await expect(tabLinks).toHaveCount(2);
    const titlesAfterDelete = await tabLinks.allTextContents();
    expect(titlesAfterDelete).toEqual(['Tab 1', 'Tab 3']);

    // Screenshot after deletion
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-after-delete.png',
      fullPage: true,
    });

    // Add a new tab - should create Tab 4, not Tab 2
    await page.locator('.cxd-Tabs-addable').click();
    await page.waitForTimeout(1000);

    await expect(tabLinks).toHaveCount(3);
    const titlesAfterAdd = await tabLinks.allTextContents();
    // Tab 2 should not reappear, should be Tab 4 instead
    expect(titlesAfterAdd).toEqual(['Tab 1', 'Tab 3', 'Tab 4']);

    // Take screenshot verifying final state
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-deleted-tabs-fix.png',
      fullPage: true,
    });
  });

  test('add button respects max limit', async ({ page }) => {
    const maxSchema = {
      type: 'closable-tab',
      addable: true,
      max: 3,
      addBtnText: '+ Add',
      schema_format: {
        type: 'input-text',
        name: 'name',
        label: 'Name'
      },
      tabs: [
        { title: 'Tab 1', body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };

    await setupSchemaPreview(page, maxSchema);

    // Should have 1 tab initially
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link:not(.cxd-Tabs-addable) a');
    await expect(tabLinks).toHaveCount(1);

    // Add button should be visible
    const addBtn = page.locator('.cxd-Tabs-addable');
    await expect(addBtn).toBeVisible();

    // Add second tab
    await addBtn.click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(2);

    // Add third tab
    await addBtn.click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(3);

    // Add button should be removed at max limit
    await expect(addBtn).toHaveCount(0);

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-max-limit.png',
      fullPage: true,
    });
  });

  test('custom-closable-tabs CSS styles are applied', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);

    // Check that custom styles are applied
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link');

    // Check first tab has custom styling
    const firstTab = tabLinks.first();
    const tabStyle = await firstTab.getAttribute('class');
    expect(tabStyle).toContain('cxd-Tabs-link');

    // Check active tab has blue top border
    const activeTab = page.locator('.custom-closable-tabs .cxd-Tabs-link.is-active');
    await expect(activeTab).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/closable-tabs-css-styles.png',
      fullPage: true,
    });
  });
});
