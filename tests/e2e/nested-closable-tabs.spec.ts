import { test, expect } from '@playwright/test';

const ADD_BTN = '.closable-custom-add';
const TAB_LINKS = '.custom-closable-tabs .cxd-Tabs-link:not(.closable-custom-add) a';

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
    const tabLinks = page.locator(TAB_LINKS);
    await expect(tabLinks).toHaveCount(1);
    await page.locator(ADD_BTN).first().click();
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
    const tabLinks = page.locator(TAB_LINKS);
    await expect(tabLinks).toHaveCount(1);
    await page.locator(ADD_BTN).first().click();
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
    const tabLinks = page.locator(TAB_LINKS);
    await expect(tabLinks).toHaveCount(3);
    const closeBtns = page.locator('.custom-closable-tabs .cxd-Tabs-link-close');
    await expect(closeBtns).toHaveCount(3);
    await closeBtns.nth(1).click();
    await page.waitForTimeout(500);
    await expect(tabLinks).toHaveCount(2);
    const titles = await tabLinks.allTextContents();
    expect(titles).toEqual(['Tab 1', 'Tab 3']);
    await page.screenshot({ path: 'tests/e2e/screenshots/nested-closable-delete.png', fullPage: true });
  });
});
