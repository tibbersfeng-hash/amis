import { test, expect } from '@playwright/test';

// Scoped selectors — first closable-tab wrapper, then find elements inside via data attribute
const CLOSABLE_WRAPPER = '.closable-tab-wrapper';
const ADD_BTN = '[data-closable-tab-add]';
const TAB_LINK = '> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.closable-custom-add)';
const CLOSE_BTN = '> .custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > .cxd-Tabs-link-close';

function firstClosable(page: ReturnType<typeof test>['page']) {
  return page.locator(CLOSABLE_WRAPPER).first();
}

test.describe('Nested Closable Tabs - Multi-level', () => {
  async function setupSchemaPreview(page: ReturnType<typeof test>, schema: Record<string, unknown>) {
    await page.goto('http://localhost:5173/showcase#schema-preview');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.fill('.schema-preview-textarea', JSON.stringify(schema, null, 2));
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(2000);
  }

  test('single closable-tab add works (baseline)', async ({ page }) => {
    const schema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Tab',
      schema_format: { type: 'input-text', name: 'name', label: 'Name' },
      tabs: [
        { title: 'Tab 1', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };
    await setupSchemaPreview(page, schema);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator(TAB_LINK);
    await expect(tabLinks).toHaveCount(1);
    await wrapper.locator(ADD_BTN).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(2);
    const titles = await tabLinks.allTextContents();
    expect(titles).toEqual(['Tab 1', 'Tab 2']);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-single-add.png', fullPage: true });
  });

  test('closable-tab inside nested tabs - add creates only one tab', async ({ page }) => {
    const schema = {
      type: 'tabs',
      tabsMode: 'line',
      className: 'custom-underline-tabs',
      tabs: [
        {
          title: 'Mission Rule',
          body: {
            type: 'closable-tab',
            addable: true,
            addBtnText: '+ Add',
            schema_format: { type: 'input-text', name: 'rule', label: 'Rule' },
            tabs: [
              { title: 'Tab 1', closable: true, body: { type: 'input-text', name: 'rule', label: 'Rule' } }
            ]
          }
        },
        { title: 'Other Rule', body: 'Other content' }
      ]
    };
    await setupSchemaPreview(page, schema);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator(TAB_LINK);
    await expect(tabLinks).toHaveCount(1);
    await wrapper.locator(ADD_BTN).click();
    await page.waitForTimeout(1000);
    await expect(tabLinks).toHaveCount(2);
    const titles = await tabLinks.allTextContents();
    expect(titles).toEqual(['Tab 1', 'Tab 2']);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-one-level.png', fullPage: true });
  });

  test('closable-tab inside closable-tab (2-level nested) - add works on both levels', async ({ page }) => {
    const schema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Mission',
      schema_format: {
        type: 'closable-tab',
        addable: true,
        addBtnText: '+ Add Sub',
        schema_format: { type: 'input-text', name: 'item', label: 'Item' },
        tabs: [
          { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
        ]
      },
      tabs: [
        {
          title: 'Mission 1',
          closable: true,
          body: {
            type: 'closable-tab',
            addable: true,
            addBtnText: '+ Add Sub',
            schema_format: { type: 'input-text', name: 'item', label: 'Item' },
            tabs: [
              { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
            ]
          }
        }
      ]
    };
    await setupSchemaPreview(page, schema);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-two-level-before.png', fullPage: true });

    const allAddBtns = page.locator(ADD_BTN);
    await expect(allAddBtns).toHaveCount(2);

    await allAddBtns.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-two-level-after-outer-add.png', fullPage: true });

    const totalAddBtns = await page.locator(ADD_BTN).count();
    expect(totalAddBtns).toBeLessThanOrEqual(5);
  });

  test('delete button works on closable-tab', async ({ page }) => {
    const schema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Tab',
      schema_format: { type: 'input-text', name: 'name', label: 'Name' },
      tabs: [
        { title: 'Tab 1', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
        { title: 'Tab 2', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } },
        { title: 'Tab 3', closable: true, body: { type: 'input-text', name: 'name', label: 'Name' } }
      ]
    };
    await setupSchemaPreview(page, schema);
    const wrapper = firstClosable(page);
    const tabLinks = wrapper.locator(TAB_LINK);
    await expect(tabLinks).toHaveCount(3);
    const closeBtns = wrapper.locator(CLOSE_BTN);
    await expect(closeBtns).toHaveCount(3);
    await closeBtns.nth(1).click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(2);
    const titles = await tabLinks.allTextContents();
    expect(titles).toEqual(['Tab 1', 'Tab 3']);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-delete.png', fullPage: true });
  });

  test('2-level nested: inner add/delete independent of outer', async ({ page }) => {
    const schema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Mission',
      schema_format: {
        type: 'closable-tab',
        addable: true,
        addBtnText: '+ Add Sub',
        schema_format: { type: 'input-text', name: 'item', label: 'Item' },
        tabs: [
          { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
        ]
      },
      tabs: [
        {
          title: 'Mission 1',
          closable: true,
          body: {
            type: 'closable-tab',
            addable: true,
            addBtnText: '+ Add Sub',
            schema_format: { type: 'input-text', name: 'item', label: 'Item' },
            tabs: [
              { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
            ]
          }
        }
      ]
    };

    await setupSchemaPreview(page, schema);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-initial.png', fullPage: true });

    const wrappers = page.locator('.closable-tab-wrapper');
    await expect(wrappers).toHaveCount(2);

    const allAddBtns = page.locator(ADD_BTN);
    await expect(allAddBtns).toHaveCount(2);

    // Add inner sub tab
    await allAddBtns.nth(1).click();
    await page.waitForTimeout(1000);

    const innerWrapper = wrappers.nth(1);
    const innerTabs = innerWrapper.locator(TAB_LINK);
    await expect(innerTabs).toHaveCount(2);
    const innerTitles = await innerTabs.allTextContents();
    expect(innerTitles[0]).toBe('Sub 1');
    expect(innerTitles[1]).toBe('Tab 2');

    const outerWrapper = wrappers.nth(0);
    const outerTabs = outerWrapper.locator(TAB_LINK);
    await expect(outerTabs).toHaveCount(1);

    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-inner-add.png', fullPage: true });

    // Delete inner Sub 1
    const innerCloseBtns = innerWrapper.locator(CLOSE_BTN);
    await expect(innerCloseBtns).toHaveCount(2);
    await innerCloseBtns.nth(0).click();
    await page.waitForTimeout(500);

    await expect(innerTabs).toHaveCount(1);
    const afterDeleteTitles = await innerTabs.allTextContents();
    expect(afterDeleteTitles).toEqual(['Tab 2']);

    // Outer unchanged
    await expect(outerTabs).toHaveCount(1);

    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-inner-delete.png', fullPage: true });

    // Add outer mission
    const outerAddBtn = allAddBtns.first();
    await outerAddBtn.click();
    await page.waitForTimeout(1000);

    await expect(outerTabs).toHaveCount(2);
    const outerTitles = await outerTabs.allTextContents();
    expect(outerTitles).toEqual(['Mission 1', 'Tab 2']);

    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-outer-add.png', fullPage: true });
  });

  test('2-level nested: delete outer tab does not affect remaining outer tab inner', async ({ page }) => {
    const schema = {
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Mission',
      schema_format: {
        type: 'closable-tab',
        addable: true,
        addBtnText: '+ Add Sub',
        schema_format: { type: 'input-text', name: 'item', label: 'Item' },
        tabs: [
          { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
        ]
      },
      tabs: [
        {
          title: 'Mission 1',
          closable: true,
          body: {
            type: 'closable-tab',
            addable: true,
            addBtnText: '+ Add Sub',
            schema_format: { type: 'input-text', name: 'item', label: 'Item' },
            tabs: [
              { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
            ]
          }
        },
        {
          title: 'Mission 2',
          closable: true,
          body: {
            type: 'closable-tab',
            addable: true,
            addBtnText: '+ Add Sub',
            schema_format: { type: 'input-text', name: 'item', label: 'Item' },
            tabs: [
              { title: 'Sub 1', closable: true, body: { type: 'input-text', name: 'item', label: 'Item' } }
            ]
          }
        }
      ]
    };

    await setupSchemaPreview(page, schema);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-delete-outer-before.png', fullPage: true });

    const wrappers = page.locator('.closable-tab-wrapper');
    await expect(wrappers).toHaveCount(2);

    const outerWrapper = wrappers.nth(0);
    const outerTabs = outerWrapper.locator(TAB_LINK);
    const outerCloseBtns = outerWrapper.locator(CLOSE_BTN);

    await expect(outerTabs).toHaveCount(2);

    // Add a sub tab to Mission 1
    const allAddBtns = page.locator(ADD_BTN);
    await expect(allAddBtns).toHaveCount(2);

    await allAddBtns.nth(1).click();
    await page.waitForTimeout(1000);

    const innerTabsBefore = wrappers.nth(1).locator(TAB_LINK);
    await expect(innerTabsBefore).toHaveCount(2);

    // Delete Mission 2
    await outerCloseBtns.nth(1).click();
    await page.waitForTimeout(1000);

    // Outer: 1 mission left
    await expect(outerTabs).toHaveCount(1);
    const outerTitles = await outerTabs.allTextContents();
    expect(outerTitles).toEqual(['Mission 1']);

    // Mission 1's inner tabs still 2 — NOT affected
    const innerTabsAfter = page.locator('.closable-tab-wrapper').nth(1).locator(TAB_LINK);
    await expect(innerTabsAfter).toHaveCount(2);
    const innerTitles = await innerTabsAfter.allTextContents();
    expect(innerTitles).toEqual(['Sub 1', 'Tab 2']);

    await page.screenshot({ path: 'tests/e2e/screenshots/nested-two-level-delete-outer-after.png', fullPage: true });
  });
});
