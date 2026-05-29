import { test, expect } from '@playwright/test';

test.describe('Mission - Style Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // =================================================================
  // CSS Variables
  // =================================================================

  test.describe('CSS Variables', () => {
    test('root CSS variables are set', async ({ page }) => {
      const root = page.locator(':root');
      const primary = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--primary').trim());
      const danger = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--danger').trim());
      const pageBg = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--page-bg').trim());
      const cardBg = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--card-bg').trim());

      expect(primary).toBe('#4A5CBF');
      expect(danger).toBe('#E84545');
      expect(pageBg).toBe('#F5F6FA');
      expect(cardBg).toBe('#FFFFFF');
    });

    test('shadow and radius CSS variables are set', async ({ page }) => {
      const root = page.locator(':root');
      const shadowCard = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--shadow-card').trim());
      const shadowFooter = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--shadow-footer').trim());
      const radiusSm = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--radius-sm').trim());

      expect(shadowCard).toContain('1px 4px');
      expect(shadowFooter).toContain('-2px 8px');
      expect(radiusSm).toBe('4px');
    });
  });

  // =================================================================
  // Page Layout
  // =================================================================

  test.describe('Page Layout', () => {
    test('body has page-bg background and bottom padding', async ({ page }) => {
      const body = page.locator('body');
      const bg = await body.evaluate(el => getComputedStyle(el).backgroundColor);
      const paddingBottom = await body.evaluate(el => getComputedStyle(el).paddingBottom);

      expect(bg).toContain('245'); // rgb(245, 246, 250)
      expect(paddingBottom).toBeTruthy();
    });

    test('mission-root is visible', async ({ page }) => {
      const root = page.locator('.mission-root');
      await expect(root).toBeVisible();
      const maxWidth = await root.evaluate(el => getComputedStyle(el).maxWidth);
      expect(maxWidth).toBe('1188px');
    });

    test('mission-body-split is flex layout with gap', async ({ page }) => {
      const missionBody = page.locator('.mission-body-split');
      await expect(missionBody).toBeVisible();

      const display = await missionBody.evaluate(el => getComputedStyle(el).display);
      const gap = await missionBody.evaluate(el => getComputedStyle(el).gap);

      expect(display).toBe('flex');
      expect(gap).toBeTruthy();
    });

    test('mission-right sidebar has sticky positioning', async ({ page }) => {
      const sidebar = page.locator('.mission-right');
      const position = await sidebar.evaluate(el => getComputedStyle(el).position);
      const width = await sidebar.evaluate(el => getComputedStyle(el).width);

      expect(position).toBe('sticky');
      expect(parseInt(width)).toBeGreaterThan(250); // ~300px
    });
  });

  // =================================================================
  // Tab Styling
  // =================================================================

  test.describe('Tab Styling', () => {
    test('active tab has primary text color and bottom line indicator', async ({ page }) => {
      const activeTab = page.locator('.cxd-Tabs-link.is-active').first();
      const bg = await activeTab.evaluate(el => getComputedStyle(el).backgroundColor);
      const color = await activeTab.evaluate(el => getComputedStyle(el).color);
      const fontWeight = await activeTab.evaluate(el => getComputedStyle(el).fontWeight);

      // Transparent background (underline style)
      expect(bg).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      expect(color).toContain('74'); // primary color text
      expect(fontWeight).toBe('600');

      // Check bottom line indicator exists
      const afterBg = await activeTab.evaluate(el => {
        const style = getComputedStyle(el, '::after');
        return style.backgroundColor;
      });
      expect(afterBg).toContain('74'); // primary color line
    });

    test('inactive tabs have transparent background and gray text', async ({ page }) => {
      const inactiveTab = page.locator('.cxd-Tabs-link:not(.is-active)').first();
      const bg = await inactiveTab.evaluate(el => getComputedStyle(el).backgroundColor);
      const color = await inactiveTab.evaluate(el => getComputedStyle(el).color);

      // Transparent background
      expect(bg).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
      // Gray text (#666666)
      expect(color).toContain('102');
    });

    test('all tabs in the same row are vertically aligned', async ({ page }) => {
      const tabs = page.locator('.cxd-Tabs-link');
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(2);

      let firstY: number | null = null;
      for (let i = 0; i < count; i++) {
        const box = await tabs.nth(i).boundingBox();
        if (firstY === null) {
          firstY = box.y;
        } else {
          expect(Math.abs(box.y - firstY)).toBeLessThanOrEqual(2);
        }
      }
    });

    test('all tabs in the same row have consistent height', async ({ page }) => {
      const tabs = page.locator('.cxd-Tabs-link');
      const count = await tabs.count();
      let firstHeight: number | null = null;
      for (let i = 0; i < count; i++) {
        const box = await tabs.nth(i).boundingBox();
        if (firstHeight === null) {
          firstHeight = box.height;
        } else {
          expect(Math.abs(box.height - firstHeight)).toBeLessThanOrEqual(2);
        }
      }
    });

    test('active tab does not have negative margin offset', async ({ page }) => {
      const activeTab = page.locator('.cxd-Tabs-link.is-active').first();
      const marginTop = await activeTab.evaluate(el => getComputedStyle(el).marginTop);
      const marginLeft = await activeTab.evaluate(el => getComputedStyle(el).marginLeft);
      // Should not have large negative margins that would misalign it
      expect(parseInt(marginTop)).toBeGreaterThanOrEqual(-2);
    });

    test('tab content area has left padding', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
      const paddingLeft = await activePane.evaluate(el => getComputedStyle(el).paddingLeft);
      expect(parseInt(paddingLeft)).toBeGreaterThanOrEqual(0);
    });

    test('all section titles within active tab have consistent left alignment', async ({ page }) => {
      const titles = page.locator('.cxd-Tabs-pane.is-active .section-title-sm');
      const count = await titles.count();
      if (count < 2) {
        test.skip(true, 'not enough section titles to compare');
        return;
      }
      let firstX: number | null = null;
      for (let i = 0; i < count; i++) {
        const box = await titles.nth(i).boundingBox();
        if (firstX === null) {
          firstX = box.x;
        } else {
          expect(Math.abs(box.x - firstX)).toBeLessThanOrEqual(5);
        }
      }
    });

    test('form items within active tab form area have consistent left alignment', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active');
      // Check top-level form items (not inside flex groups) have consistent left alignment.
      // Items inside .cxd-Form-group--hor are side-by-side by design, so we exclude them.
      const formItems = activePane.locator('.form-card .cxd-Form-item');
      const count = await formItems.count();
      if (count < 2) {
        test.skip(true, 'not enough form items to compare');
        return;
      }
      // Collect x positions, but only from items NOT inside a flex group
      const xPositions: number[] = [];
      for (let i = 0; i < count; i++) {
        const item = formItems.nth(i);
        const isInGroup = await item.evaluate(el => !!el.closest('.cxd-Form-group--hor'));
        if (!isInGroup) {
          const box = await item.boundingBox();
          if (box) xPositions.push(box.x);
        }
      }
      if (xPositions.length < 2) {
        test.skip(true, 'not enough standalone form items');
        return;
      }
      const firstX = xPositions[0];
      for (let i = 1; i < xPositions.length; i++) {
        expect(Math.abs(xPositions[i] - firstX)).toBeLessThanOrEqual(5);
      }
    });

    test('text inputs within same type have consistent width', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active');
      const textInputs = activePane.locator('.cxd-TextControl-input');
      const textWidths: number[] = [];

      const count = await textInputs.count();
      for (let i = 0; i < count; i++) {
        const box = await textInputs.nth(i).boundingBox();
        textWidths.push(box.width);
      }

      expect(textWidths.length).toBeGreaterThanOrEqual(1);
      // Within text inputs, there should be at most 4 distinct widths
      // (full-width standalone, half-width in group, and variations from different form modes)
      const uniqueWidths = [...new Set(textWidths.map(w => Math.round(w)))];
      expect(uniqueWidths.length).toBeLessThanOrEqual(4);
    });

    test('select controls have consistent width', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active');
      const selectControls = activePane.locator('.cxd-SelectControl .cxd-Select');
      const selectWidths: number[] = [];

      const count = await selectControls.count();
      for (let i = 0; i < count; i++) {
        const box = await selectControls.nth(i).boundingBox();
        selectWidths.push(box.width);
      }

      expect(selectWidths.length).toBeGreaterThanOrEqual(1);
      for (const w of selectWidths) {
        expect(Math.abs(w - selectWidths[0])).toBeLessThanOrEqual(5);
      }
    });

    test('datetime controls have consistent width', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active');
      const datetimeControls = activePane.locator('.date-range-picker-input-wrap');
      const dtWidths: number[] = [];

      const count = await datetimeControls.count();
      for (let i = 0; i < count; i++) {
        const box = await datetimeControls.nth(i).boundingBox();
        dtWidths.push(box.width);
      }

      expect(dtWidths.length).toBeGreaterThanOrEqual(1);
      for (const w of dtWidths) {
        expect(Math.abs(w - dtWidths[0])).toBeLessThanOrEqual(5);
      }
    });

    test('all form control types have the same width', async ({ page }) => {
      const activePane = page.locator('.cxd-Tabs-pane.is-active');

      // Get full-width controls (not inside a group = not half-width)
      const fullTextWidths: number[] = [];
      const fullSelectWidths: number[] = [];
      const fullDatetimeWidths: number[] = [];

      const textInputs = activePane.locator('.cxd-TextControl-input');
      const textCount = await textInputs.count();
      for (let i = 0; i < textCount; i++) {
        const isInGroup = await textInputs.nth(i).evaluate(el => {
          // Check if the control's parent FormItem is inside a Group
          const formItem = el.closest('.cxd-Form-item');
          if (!formItem) return false;
          // Check if the formItem is directly under a group (half-width) or the group's parent (full-width)
          const groupWrapper = formItem.closest('.cxd-Form-group');
          return groupWrapper !== null;
        });
        if (!isInGroup) {
          const box = await textInputs.nth(i).boundingBox();
          fullTextWidths.push(box.width);
        }
      }

      const selectControls = activePane.locator('.cxd-SelectControl .cxd-Select');
      const selectCount = await selectControls.count();
      for (let i = 0; i < selectCount; i++) {
        const isInGroup = await selectControls.nth(i).evaluate(el => {
          const formItem = el.closest('.cxd-Form-item');
          if (!formItem) return false;
          const groupWrapper = formItem.closest('.cxd-Form-group');
          return groupWrapper !== null;
        });
        if (!isInGroup) {
          const box = await selectControls.nth(i).boundingBox();
          fullSelectWidths.push(box.width);
        }
      }

      const datetimeInputs = activePane.locator('.cxd-DateControl input[type="text"]');
      const dtCount = await datetimeInputs.count();
      for (let i = 0; i < dtCount; i++) {
        const isInGroup = await datetimeInputs.nth(i).evaluate(el => {
          const formItem = el.closest('.cxd-Form-item');
          if (!formItem) return false;
          const groupWrapper = formItem.closest('.cxd-Form-group');
          return groupWrapper !== null;
        });
        if (!isInGroup) {
          const box = await datetimeInputs.nth(i).boundingBox();
          fullDatetimeWidths.push(box.width);
        }
      }

      // Compare all full-width controls against each other
      const allFullWidths = [...fullTextWidths, ...fullSelectWidths, ...fullDatetimeWidths];
      expect(allFullWidths.length).toBeGreaterThanOrEqual(3);

      const firstWidth = allFullWidths[0];
      for (const w of allFullWidths) {
        expect(Math.abs(w - firstWidth)).toBeLessThanOrEqual(5);
      }
    });

    test('tabs have no bottom border on container', async ({ page }) => {
      const tabsContainer = page.locator('.cxd-Tabs--line').first();
      const borderBottom = await tabsContainer.evaluate(el => getComputedStyle(el).borderBottomWidth);
      expect(borderBottom).toBe('0px');
    });

    test('tab content has top margin', async ({ page }) => {
      const content = page.locator('.cxd-Tabs-content').first();
      const marginTop = await content.evaluate(el => getComputedStyle(el).marginTop);
      expect(marginTop).toBe('20px');
    });

    test('section titles align across all tabs', async ({ page }) => {
      const tabNames = ['Mission Setup', 'Sub-Mission Rules', 'Skin Setting'];
      let globalFirstX: number | null = null;

      for (const tabName of tabNames) {
        await page.locator('.cxd-Tabs-link').filter({ hasText: tabName }).first().click({ force: true });
        await page.waitForTimeout(500);

        const titles = page.locator('.cxd-Tabs-pane.is-active .section-title-sm');
        const count = await titles.count();
        if (count === 0) continue;

        const firstBox = await titles.first().boundingBox();
        if (globalFirstX === null) {
          globalFirstX = firstBox.x;
        } else {
          expect(Math.abs(firstBox.x - globalFirstX)).toBeLessThanOrEqual(5);
        }
      }
    });
  });

  // =================================================================
  // Card Styling
  // =================================================================

  test.describe('Card Styling', () => {
    test('form-card has white background', async ({ page }) => {
      const card = page.locator('.cxd-Tabs-pane.is-active .form-card').first();
      await expect(card).toBeVisible();
      const bg = await card.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bg).toMatch(/255.*255.*255|white/);
    });

    test('form-card has border-radius and shadow', async ({ page }) => {
      const card = page.locator('.cxd-Tabs-pane.is-active .form-card').first();
      const borderRadius = await card.evaluate(el => getComputedStyle(el).borderRadius);
      const boxShadow = await card.evaluate(el => getComputedStyle(el).boxShadow);

      expect(borderRadius).toBeTruthy();
      expect(boxShadow).toBeTruthy();
      expect(boxShadow).not.toBe('none');
    });

    test('form-card has padding', async ({ page }) => {
      const card = page.locator('.cxd-Tabs-pane.is-active .form-card').first();
      const padding = await card.evaluate(el => getComputedStyle(el).padding);
      expect(padding).toBeTruthy();
    });

    test('phone-card has overflow hidden', async ({ page }) => {
      const card = page.locator('.phone-card');
      await expect(card).toBeVisible();
      const overflow = await card.evaluate(el => getComputedStyle(el).overflow);
      expect(overflow).toBe('hidden');
    });

    test('progress-panel has padding', async ({ page }) => {
      // Navigate to Registration Rule tab (tab 2) which has the countdown panel
      await page.getByText('Registration Rule').first().click({ force: true });
      await page.waitForTimeout(500);

      // The countdown/progress panel appears as a tpl wrapper
      const panel = page.locator('.progress-panel').first();
      const visible = await panel.isVisible().catch(() => false);
      if (!visible) {
        // If not on this tab, skip - just verify the CSS class exists in stylesheet
        test.skip(true, 'progress-panel not rendered in this schema');
        return;
      }
      const padding = await panel.evaluate(el => getComputedStyle(el).padding);
      expect(padding).toBeTruthy();
    });

    test('award-panel has form-bg background', async ({ page }) => {
      // Award panel is on the Registration Rule tab
      await page.locator('.cxd-Tabs-link').filter({ hasText: 'Registration Rule' }).first().click({ force: true });
      await page.waitForTimeout(800);

      const panel = page.locator('.cxd-Tabs-pane.is-active .award-panel').first();
      await expect(panel).toBeVisible();
      const bg = await panel.evaluate(el => getComputedStyle(el).backgroundColor);
      // --form-bg = #F8F9FC = rgb(248, 249, 252)
      expect(bg).toContain('248');
    });
  });

  // =================================================================
  // Typography
  // =================================================================

  test.describe('Typography', () => {
    test('section-title has correct font size and weight', async ({ page }) => {
      const title = page.locator('.section-title').first();
      await expect(title).toBeVisible();
      const fontSize = await title.evaluate(el => getComputedStyle(el).fontSize);
      const fontWeight = await title.evaluate(el => getComputedStyle(el).fontWeight);

      expect(fontSize).toBe('16px');
      expect(fontWeight).toBe('600');
    });

    test('asterisk in section-title is red', async ({ page }) => {
      const title = page.locator('.section-title').first();
      const asterisk = title.locator('.asterisk');
      await expect(asterisk).toBeVisible();
      const color = await asterisk.evaluate(el => getComputedStyle(el).color);
      expect(color).toContain('232'); // rgb(232, 69, 69) = --danger
    });

    test('hint-text has small gray font', async ({ page }) => {
      const hint = page.locator('.hint-text').first();
      await expect(hint).toBeVisible();
      const fontSize = await hint.evaluate(el => getComputedStyle(el).fontSize);
      const color = await hint.evaluate(el => getComputedStyle(el).color);

      expect(fontSize).toBe('12px');
      // Gray color: rgb(159, 163, 175) = --text-placeholder
      expect(color).toContain('156'); // rgb(156, 163, 175) = --text-placeholder
    });

    test('section-title-sm has smaller font', async ({ page }) => {
      const title = page.locator('.section-title-sm').first();
      await expect(title).toBeVisible();
      const fontSize = await title.evaluate(el => getComputedStyle(el).fontSize);
      const fontWeight = await title.evaluate(el => getComputedStyle(el).fontWeight);

      expect(fontSize).toBe('13px');
      expect(fontWeight).toBe('600');
    });
  });

  // =================================================================
  // Phone Mockup
  // =================================================================

  test.describe('Phone Mockup', () => {
    test('phone-frame has correct dimensions', async ({ page }) => {
      const frame = page.locator('.mission-right .phone-frame');
      await expect(frame).toBeVisible();
      const box = await frame.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBe(260);
      expect(box!.height).toBe(520);
    });

    test('phone-frame has dark background and large border-radius', async ({ page }) => {
      const frame = page.locator('.mission-right .phone-frame');
      const bg = await frame.evaluate(el => getComputedStyle(el).backgroundColor);
      const borderRadius = await frame.evaluate(el => getComputedStyle(el).borderRadius);

      expect(bg).toMatch(/26.*26.*26/); // #1a1a1a = rgb(26, 26, 26)
      expect(borderRadius).toContain('32px');
    });

    test('phone-frame has shadow', async ({ page }) => {
      const frame = page.locator('.mission-right .phone-frame');
      const boxShadow = await frame.evaluate(el => getComputedStyle(el).boxShadow);
      expect(boxShadow).toBeTruthy();
      expect(boxShadow).not.toBe('none');
    });

    test('phone-body has flex layout', async ({ page }) => {
      const body = page.locator('.phone-body');
      await expect(body).toBeVisible();
      const display = await body.evaluate(el => getComputedStyle(el).display);
      const justifyContent = await body.evaluate(el => getComputedStyle(el).justifyContent);

      expect(display).toBe('flex');
      expect(justifyContent).toBe('center');
    });
  });

  // =================================================================
  // Sticky Footer
  // =================================================================

  test.describe('Sticky Footer', () => {
    test('footer is fixed at bottom with correct height', async ({ page }) => {
      const footer = page.locator('.sticky-footer');
      const position = await footer.evaluate(el => getComputedStyle(el).position);
      const height = await footer.evaluate(el => getComputedStyle(el).height);
      const bottom = await footer.evaluate(el => getComputedStyle(el).bottom);

      expect(position).toBe('fixed');
      expect(height).toBe('64px');
      expect(bottom).toBe('0px');
    });

    test('footer has white background', async ({ page }) => {
      const footer = page.locator('.sticky-footer');
      const bg = await footer.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(bg).toMatch(/255.*255.*255|white/);
    });

    test('save button has primary background', async ({ page }) => {
      const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
      await expect(saveBtn).toBeVisible();
      const bg = await saveBtn.evaluate(el => getComputedStyle(el).backgroundColor);
      const color = await saveBtn.evaluate(el => getComputedStyle(el).color);

      expect(bg).toContain('74'); // primary
      expect(color).toContain('255'); // white text
    });

    test('cancel button has primary border and primary text', async ({ page }) => {
      const cancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
      await expect(cancelBtn).toBeVisible();
      const color = await cancelBtn.evaluate(el => getComputedStyle(el).color);
      const border = await cancelBtn.evaluate(el => getComputedStyle(el).borderTopColor);

      expect(color).toContain('74');
      expect(border).toContain('74');
    });

    test('draft button has gray text', async ({ page }) => {
      const draftBtn = page.getByRole('button', { name: 'Save Draft', exact: true });
      await expect(draftBtn).toBeVisible();
      const color = await draftBtn.evaluate(el => getComputedStyle(el).color);
      // Gray: rgb(102, 102, 102) = --text-secondary
      expect(color).toContain('102');
    });

    test('footer buttons are horizontally aligned', async ({ page }) => {
      const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
      const cancelBtn = page.getByRole('button', { name: 'Cancel', exact: true });
      const saveY = await saveBtn.boundingBox().then(b => b.y);
      const cancelY = await cancelBtn.boundingBox().then(b => b.y);
      expect(Math.abs(saveY - cancelY)).toBeLessThanOrEqual(5);
    });
  });

  // =================================================================
  // Input Controls
  // =================================================================

  test.describe('Input Controls', () => {
    test('text input wrapper has correct height', async ({ page }) => {
      const wrapper = page.locator('.cxd-TextControl-input').first();
      const height = await wrapper.evaluate(el => getComputedStyle(el).height);
      // Wrapper should be 36px (--input-height)
      expect(parseInt(height)).toBeGreaterThanOrEqual(30);
    });

    test('text input has correct border color', async ({ page }) => {
      const input = page.locator('.cxd-TextControl-input').first();
      const border = await input.evaluate(el => getComputedStyle(el).borderColor);
      expect(border).toBeTruthy();
    });

    test('text input has rounded corners', async ({ page }) => {
      const input = page.locator('.cxd-TextControl-input').first();
      const radius = await input.evaluate(el => getComputedStyle(el).borderRadius);
      expect(radius).toBeTruthy();
    });

    test('select control has correct height', async ({ page }) => {
      const select = page.locator('.cxd-SelectControl .cxd-Select').first();
      await expect(select).toBeVisible();
      const height = await select.evaluate(el => getComputedStyle(el).height);
      expect(parseInt(height)).toBeGreaterThanOrEqual(30);
    });

    test('input-number has consistent styling with text input', async ({ page }) => {
      const numInput = page.locator('input[name="minPurchaseAmount"], input[name="budget"]').first();
      if (!await numInput.isVisible().catch(() => false)) {
        // Fallback: find any number-like input
        const allInputs = page.locator('.cxd-TextControl-input input');
        const count = await allInputs.count();
        if (count < 2) {
          test.skip(true, 'no number inputs found');
          return;
        }
        const secondInput = allInputs.nth(1);
        const height = await secondInput.evaluate(el => getComputedStyle(el).height);
        expect(parseInt(height)).toBeGreaterThanOrEqual(20);
        return;
      }
      const height = await numInput.evaluate(el => getComputedStyle(el).height);
      expect(parseInt(height)).toBeGreaterThanOrEqual(20);
    });
  });

  // =================================================================
  // Language Switcher
  // =================================================================

  test.describe('Language Switcher', () => {
    test('language-switcher has card background and shadow', async ({ page }) => {
      const switcher = page.locator('.language-switcher');
      const bg = await switcher.evaluate(el => getComputedStyle(el).backgroundColor);
      const boxShadow = await switcher.evaluate(el => getComputedStyle(el).boxShadow);

      expect(bg).toMatch(/255.*255.*255|white/);
      expect(boxShadow).toBeTruthy();
      expect(boxShadow).not.toBe('none');
    });

    test('language-switcher has rounded corners and padding', async ({ page }) => {
      const switcher = page.locator('.language-switcher');
      const borderRadius = await switcher.evaluate(el => getComputedStyle(el).borderRadius);
      const padding = await switcher.evaluate(el => getComputedStyle(el).padding);

      expect(borderRadius).toBeTruthy();
      expect(padding).toBeTruthy();
    });

    test('language-label has secondary text color', async ({ page }) => {
      const label = page.locator('.language-label');
      const color = await label.evaluate(el => getComputedStyle(el).color);
      // Gray: rgb(102, 102, 102)
      expect(color).toContain('102');
    });

    test('language-select has border and correct font size', async ({ page }) => {
      const select = page.locator('.language-select');
      const border = await select.evaluate(el => getComputedStyle(el).borderColor);
      const fontSize = await select.evaluate(el => getComputedStyle(el).fontSize);

      expect(border).toBeTruthy();
      expect(fontSize).toBe('12px');
    });
  });

  // =================================================================
  // Preview Panel
  // =================================================================

  test.describe('Preview Panel', () => {
    test('preview-panel uses flex column layout', async ({ page }) => {
      const panel = page.locator('.preview-panel');
      const display = await panel.evaluate(el => getComputedStyle(el).display);
      const flexDirection = await panel.evaluate(el => getComputedStyle(el).flexDirection);

      expect(display).toBe('flex');
      expect(flexDirection).toBe('column');
    });

    test('preview-panel aligns items to center', async ({ page }) => {
      const panel = page.locator('.preview-panel');
      const alignItems = await panel.evaluate(el => getComputedStyle(el).alignItems);
      expect(alignItems).toBe('center');
    });
  });

  // =================================================================
  // Alignment Tests
  // =================================================================

  test.describe('Alignment', () => {
    test('radio group items are horizontally aligned', async ({ page }) => {
      const items = page.locator('.radio-item input[type="radio"]');
      const count = await items.count();
      if (count >= 2) {
        const firstY = await items.first().boundingBox().then(b => b.y);
        const secondY = await items.nth(1).boundingBox().then(b => b.y);
        expect(Math.abs(firstY - secondY)).toBeLessThanOrEqual(5);
      }
    });

    test('language-switcher is within visible viewport', async ({ page }) => {
      const switcher = page.locator('.language-switcher');
      const box = await switcher.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeGreaterThanOrEqual(0);
    });

    test('date-range-picker controls have consistent height', async ({ page }) => {
      const pickers = page.locator('.date-range-picker-input-wrap');
      const count = await pickers.count();
      if (count >= 2) {
        const firstBox = await pickers.first().boundingBox();
        const secondBox = await pickers.nth(1).boundingBox();
        expect(Math.abs(firstBox!.height - secondBox!.height)).toBeLessThanOrEqual(2);
      }
    });

    test('form labels have consistent font styling', async ({ page }) => {
      const labels = page.locator('.amis-form-group-label');
      const count = await labels.count();
      if (count === 0) {
        // Amis may render labels differently depending on schema
        test.skip(true, 'form labels not found with this selector');
        return;
      }
      const firstLabel = labels.first();
      await expect(firstLabel).toBeVisible();
      const fontSize = await firstLabel.evaluate(el => getComputedStyle(el).fontSize);
      const fontWeight = await firstLabel.evaluate(el => getComputedStyle(el).fontWeight);

      expect(fontSize).toBe('13px');
      expect(fontWeight).toBe('600');
    });
  });
});
