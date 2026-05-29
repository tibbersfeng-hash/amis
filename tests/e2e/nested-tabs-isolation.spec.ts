import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCHEMA_PATH = path.join(__dirname, '..', 'schema-nested-tabs.json');

// Use :scope > child chain to select only the DIRECT .cxd-Tabs-links of each tab container,
// excluding nested .cxd-Tabs-links that belong to child tab components.
// Amis DOM: .custom-class > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link
const LEVEL1_LINKS = '.custom-underline-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link';
const LEVEL2_LINKS = '.custom-solid-fill-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link';
const LEVEL2_INACTIVE_A = '.custom-solid-fill-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.is-active) > a';
const LEVEL3_LINKS = '.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link';
const LEVEL3_CLOSE = '.custom-closable-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > .cxd-Tabs-link-close';

test.describe('Nested Tabs - Style Isolation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase#schema-preview');
  });

  test('should render nested tabs without style interference', async ({ page }) => {
    // Load the nested tabs schema into the textarea
    const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf-8'));

    // Click the textarea and type the schema
    const textarea = page.locator('.schema-preview-textarea');
    await textarea.click();

    // Select all and replace
    await textarea.press('ControlOrMeta+A');
    await textarea.press('Backspace');
    await textarea.fill(JSON.stringify(schema, null, 2));

    // Click render button
    await page.locator('.schema-preview-render-btn').click();

    // Wait for rendering
    await page.waitForTimeout(1500);

    // Take full screenshot for visual inspection
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    await page.screenshot({
      path: path.join(screenshotDir, 'nested-tabs-isolation.png'),
      fullPage: true,
    });

    // === Verification 1: Level 1 (underline tabs) has 3 line-style tabs ===
    const level1Links = page.locator(LEVEL1_LINKS);
    await expect(level1Links).toHaveCount(3);

    // === Verification 2: Level 2 (solid fill tabs) has 2 bordered tabs ===
    await page.locator(LEVEL1_LINKS).filter({ hasText: /^Mission Rule$/ }).click();
    await page.waitForTimeout(500);

    const level2Links = page.locator(LEVEL2_LINKS);
    await expect(level2Links).toHaveCount(2);

    // Check that level 2 inactive tab has white background and blue border (solid fill style)
    const level2InactiveA = page.locator(LEVEL2_INACTIVE_A);
    await expect(level2InactiveA.first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    const borderProps = await level2InactiveA.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        borderTopColor: style.borderTopColor,
        borderRightColor: style.borderRightColor,
        borderBottomColor: style.borderBottomColor,
        borderLeftColor: style.borderLeftColor,
      };
    });
    expect(borderProps.borderTopColor).toBe('rgb(57, 77, 185)');
    expect(borderProps.borderRightColor).toBe('rgb(57, 77, 185)');
    expect(borderProps.borderBottomColor).toBe('rgb(57, 77, 185)');
    expect(borderProps.borderLeftColor).toBe('rgb(57, 77, 185)');

    // === Verification 3: Level 3 (closable tabs) has top bar style ===
    await page.locator(LEVEL1_LINKS).filter({ hasText: /^Sub Mission Rule$/ }).click();
    await page.waitForTimeout(500);

    const level3Container = page.locator('.custom-closable-tabs');
    await expect(level3Container).toBeVisible();

    const level3Active = page.locator(LEVEL3_LINKS + '.is-active');
    await expect(level3Active).toHaveCSS('border-top', '4px solid rgb(57, 77, 185)');

    const level3Inactive = page.locator(LEVEL3_LINKS + ':not(.is-active)');
    const level3InactiveBorderTop = await level3Inactive.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.borderTop;
    });
    expect(level3InactiveBorderTop).toMatch(/^4px solid (transparent|rgba\(0, 0, 0, 0\))$/);

    // === Verification 4: Level 4 (nested solid fill inside closable) ===
    // The nested solid fill tabs inside closable tabs should still have their own style
    const nestedSolidLinks = page.locator('.custom-closable-tabs .custom-solid-fill-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link > a');
    await expect(nestedSolidLinks.first()).toBeVisible();

    // Verify nested solid fill tabs have border style (not top-bar style)
    const nestedInactiveBorder = await page.locator('.custom-closable-tabs .custom-solid-fill-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.is-active) > a').first().evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.borderRight;
    });
    expect(nestedInactiveBorder).toContain('rgb(57, 77, 185)');

    // === Verification 5: Solid fill tabs inside closable are NOT affected by closable styles ===
    const nestedSolidFillLi = page.locator('.custom-closable-tabs .custom-solid-fill-tabs > .cxd-Tabs-linksContainer-wrapper > .cxd-Tabs-linksContainer > .cxd-Tabs-linksContainer-main > .cxd-Tabs-links > .cxd-Tabs-link:not(.is-active)');
    const nestedLiBorderTop = await nestedSolidFillLi.first().evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.borderTop;
    });
    expect(nestedLiBorderTop).toMatch(/^0px/);

    // === Verification 6: Add button text is customizable via schema ===
    const addBtn = page.locator('.custom-closable-tabs .cxd-Tabs-addable');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toHaveText('+ Add');

    // === Verification 7: Close buttons exist in closable tabs ===
    const closeBtns = page.locator(LEVEL3_CLOSE);
    await expect(closeBtns).toHaveCount(2);

    // Take final screenshot
    await page.screenshot({
      path: path.join(screenshotDir, 'nested-tabs-verified.png'),
      fullPage: true,
    });
  });
});
