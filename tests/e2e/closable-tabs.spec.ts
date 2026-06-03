import { test, expect } from '@playwright/test';

// Scoped selectors — find the first closable-tab wrapper, then its add button/tab links
const CLOSABLE_WRAPPER = '.closable-tab-wrapper';
// Add button has auto-generated ID like "add-btn-closable-tab-0"
// Use the data attribute on wrapper to scope: wrapper > ... > [id^="add-btn-"]
const ADD_BTN = `${CLOSABLE_WRAPPER} [id^="add-btn-"]`;
const TAB_LINK = `${CLOSABLE_WRAPPER} > .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)`;
const CLOSE_BTN = `${CLOSABLE_WRAPPER} > .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > .cxd-Tabs-link-close`;

// Helper to get the first closable-tab scope (for simple single-instance tests)
function firstClosable(page: ReturnType<typeof test>['page']) {
  return page.locator(CLOSABLE_WRAPPER).first();
}

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
    await expect(firstClosable(page)).toBeVisible();
    await expect(page.locator('.custom-closable-tabs')).toBeVisible();
    await expect(firstClosable(page).locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)')).toHaveCount(2);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-basic.png', fullPage: true });
  });

  test('add button is positioned tightly after existing tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const addBtn = firstClosable(page).locator('[id^="add-btn-"]');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toContainText('Add Tab');

    const wrapperEl = firstClosable(page).locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper').first();
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
    const addBtn = firstClosable(page).locator('[id^="add-btn-"]');
    await expect(addBtn).toContainText('New Sub Mission');
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-custom-add-text.png', fullPage: true });
  });

  test('+ button creates new tab with schema_format template', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)');
    await expect(tabLinks).toHaveCount(2);
    await wrapper.locator('[id^="add-btn-"]').click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    const titles = await tabLinks.allTextContents();
    expect(titles[2]).toBe('Tab 3');
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-new-tab.png', fullPage: true });
  });

  test('deleted tabs do not reappear when adding new tabs', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)');
    const closeBtns = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > .cxd-Tabs-link-close');
    const addBtn = wrapper.locator('[id^="add-btn-"]');

    await expect(tabLinks).toHaveCount(2);
    await addBtn.click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-before-delete.png', fullPage: true });

    await closeBtns.nth(1).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(2);
    const titlesAfterDelete = await tabLinks.allTextContents();
    expect(titlesAfterDelete).toEqual(['Tab 1', 'Tab 3']);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-after-delete.png', fullPage: true });

    await addBtn.click();
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
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)');
    await expect(tabLinks).toHaveCount(1);
    const addBtn = wrapper.locator('[id^="add-btn-"]');
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
    const wrapper = firstClosable(page);
    const firstTab = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)').first();
    const tabStyle = await firstTab.getAttribute('class');
    expect(tabStyle).toContain('cxd-Tabs-link');
    const activeTab = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link.is-active');
    await expect(activeTab).toBeVisible();
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-css-styles.png', fullPage: true });
  });

  test('add → delete → add results in correct tab count', async ({ page }) => {
    await setupSchemaPreview(page, DEFAULT_SCHEMA);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)');
    const closeBtns = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > .cxd-Tabs-link-close');
    const addBtn = wrapper.locator('[id^="add-btn-"]');

    await expect(tabLinks).toHaveCount(2);
    await addBtn.click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    await closeBtns.nth(1).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(2);
    await addBtn.click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);
    const titles = await tabLinks.allTextContents();
    expect(titles).toEqual(['Tab 1', 'Tab 3', 'Tab 4']);
    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-add-delete-add.png', fullPage: true });
  });

  test('modifying tab content is preserved after adding new tab', async ({ page }) => {
    const schema = {
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
      },
      tabs: [
        { title: 'Tab 1', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
        { title: 'Tab 2', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
      ],
    };

    await setupSchemaPreview(page, schema);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator('> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)');
    await expect(tabLinks).toHaveCount(2);

    const activeInput = page.locator('.cxd-Tabs-pane.is-active input[name="name"]');
    await expect(activeInput).toBeVisible();
    await activeInput.fill('AAA');
    await page.waitForTimeout(500);
    await expect(activeInput).toHaveValue('AAA');

    await wrapper.locator('[id^="add-btn-"]').click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(3);

    await tabLinks.first().evaluate(el => {
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await page.waitForTimeout(1000);

    const inputAfterAdd = page.locator('.cxd-Tabs-pane.is-active input[name="name"]');
    await expect(inputAfterAdd).toBeVisible();
    await expect(inputAfterAdd).toHaveValue('AAA');

    await page.screenshot({ path: 'tests/e2e/screenshots/closable-tabs-content-preserved.png', fullPage: true });
  });
});
