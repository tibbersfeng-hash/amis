import { test, expect } from '@playwright/test';

const ADD_BTN = '.custom-closable-tabs .closable-custom-add';
const TAB_LINKS = '.custom-closable-tabs .cxd-Tabs-link:not(.closable-custom-add) a';

async function setupSchemaPreview(page: ReturnType<typeof test>, schema: Record<string, unknown>) {
  await page.goto('http://localhost:5173/showcase#schema-preview');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.fill('.schema-preview-textarea', JSON.stringify(schema, null, 2));
  await page.waitForTimeout(500);
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(2000);
}

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
    await expect(page.locator('.closable-tab-wrapper')).toBeVisible();
    await expect(page.locator('.custom-closable-tabs')).toBeVisible();
    await expect(page.locator(TAB_LINKS)).toHaveCount(2);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-basic.png', fullPage: true });
  });

  test('add button is positioned tightly after existing tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const addBtn = page.locator(ADD_BTN);
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Tab');

    const wrapperEl = page.locator('.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper').first();
    const wrapperPadding = await wrapperEl.evaluate(el => window.getComputedStyle(el).paddingRight);
    expect(parseInt(wrapperPadding, 10)).toBeLessThan(50);

    const addBtnMargin = await addBtn.evaluate(el => window.getComputedStyle(el).marginLeft);
    expect(parseInt(addBtnMargin, 10)).toBeLessThan(5);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-add-button.png', fullPage: true });
  });

  test('add button text is customizable via schema', async ({ page }) => {
    const customSchema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ New Sub Mission',
      schema_format: { type: 'input-text', name: 'name', label: 'Name' },
      tabs: [
        { title: 'Tab 1', body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };
    await setupSchemaPreview(page, customSchema);
    const addBtn = page.locator(ADD_BTN);
    await expect(addBtn).toContainText('New Sub Mission');
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-custom-add-text.png', fullPage: true });
  });

  test('+ button creates new tab with schema_format template', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const initialTabs = page.locator(TAB_LINKS);
    await expect(initialTabs).toHaveCount(2);
    await page.locator(ADD_BTN).click();
    await page.waitForTimeout(1000);
    await expect(initialTabs).toHaveCount(3);
    const titles = await initialTabs.allTextContents();
    expect(titles[2]).toBe('Tab 3');
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-new-tab.png', fullPage: true });
  });

  test('deleted tabs do not reappear when adding new tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const tabLinks = page.locator(TAB_LINKS);
    await expect(tabLinks).toHaveCount(2);
    await page.locator(ADD_BTN).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-before-delete.png', fullPage: true });

    const closeBtns = page.locator('.custom-closable-tabs .cxd-Tabs-link-close');
    await closeBtns.nth(1).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(2);
    const titlesAfterDelete = await tabLinks.allTextContents();
    expect(titlesAfterDelete).toEqual(['Tab 1', 'Tab 3']);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-after-delete.png', fullPage: true });

    await page.locator(ADD_BTN).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    const titlesAfterAdd = await tabLinks.allTextContents();
    expect(titlesAfterAdd).toEqual(['Tab 1', 'Tab 3', 'Tab 4']);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-deleted-tabs-fix.png', fullPage: true });
  });

  test('add button respects max limit', async ({ page }) => {
    const maxSchema = {
      type: 'closable-tab',
      addable: true,
      max: 3,
      addBtnText: '+ Add',
      schema_format: { type: 'input-text', name: 'name', label: 'Name' },
      tabs: [
        { title: 'Tab 1', body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };
    await setupSchemaPreview(page, maxSchema);
    const tabLinks = page.locator(TAB_LINKS);
    await expect(tabLinks).toHaveCount(1);
    const addBtn = page.locator(ADD_BTN);
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(2);
    await addBtn.click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(3);
    await expect(addBtn).toHaveCount(0);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-max-limit.png', fullPage: true });
  });

  test('custom-closable-tabs CSS styles are applied', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const tabLinks = page.locator('.custom-closable-tabs .cxd-Tabs-link');
    const firstTab = tabLinks.first();
    const tabStyle = await firstTab.getAttribute('class');
    expect(tabStyle).toContain('cxd-Tabs-link');
    const activeTab = page.locator('.custom-closable-tabs .cxd-Tabs-link.is-active');
    await expect(activeTab).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-css-styles.png', fullPage: true });
  });
});
