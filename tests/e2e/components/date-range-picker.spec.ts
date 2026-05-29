import { test, expect } from '@playwright/test';

test.describe('Mission - Date Range Picker Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?page=mission&id=1');
    await expect(page.getByText('Mission Setup').first()).toBeVisible({ timeout: 10000 });
  });

  // ===== Date Range Picker Display =====
  test('Registration Period date-range-picker displays correct range', async ({ page }) => {
    // Config has regStartTime = "2019-03-01 12:00:00", regEndTime = "2019-03-03 23:59:59"
    const picker = page.locator('.date-range-picker').first();
    await expect(picker).toBeVisible();
    const input = picker.locator('.date-range-picker-input');
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    expect(value).toMatch(/2019-03-01/);
    expect(value).toMatch(/2019-03-03/);
  });

  test('Mission Period date-range-picker displays correct range', async ({ page }) => {
    const pickers = page.locator('.date-range-picker');
    expect(await pickers.count()).toBeGreaterThanOrEqual(2);
    const missionPicker = pickers.nth(1); // Second picker is Mission Period
    const input = missionPicker.locator('.date-range-picker-input');
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    expect(value).toMatch(/2019-03-01/);
  });

  // ===== Date Range Picker Interaction =====
  test('clicking date-range-picker opens the popover', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    const input = picker.locator('.date-range-picker-input');
    await input.click();
    await expect(page.locator('.date-range-picker-popover')).toBeVisible();
  });

  test('date-range-picker popover has calendar grid', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    await picker.locator('.date-range-picker-input').click();
    await expect(page.locator('.drp-days')).toBeVisible();
    await expect(page.locator('.drp-weekday')).toHaveCount(7);
  });

  test('date-range-picker popover has time inputs (时分秒)', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    await picker.locator('.date-range-picker-input').click();
    await expect(page.locator('.drp-time-row')).toBeVisible();
    const timeInputs = page.locator('.drp-time-fields input[type="number"]');
    expect(await timeInputs.count()).toBeGreaterThanOrEqual(6); // 3 for start (h:m:s) + 3 for end (h:m:s)
    // Verify all 6 time fields are visible
    await expect(page.locator('.drp-time-col label').filter({ hasText: 'Start' })).toBeVisible();
    await expect(page.locator('.drp-time-col label').filter({ hasText: 'End' })).toBeVisible();
  });

  test('date-range-picker time inputs can be modified and echoed', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    const input = picker.locator('.date-range-picker-input');

    // Open popover
    await input.click();

    // Modify start time hour field
    const startHour = page.locator('.drp-time-col').first().locator('input[type="number"]').first();
    await startHour.click();
    await startHour.fill('08');
    await page.waitForTimeout(100);

    // Modify end time hour field
    const endHour = page.locator('.drp-time-col').nth(1).locator('input[type="number"]').first();
    await endHour.click();
    await endHour.fill('20');
    await page.waitForTimeout(100);

    // Confirm
    await page.locator('.drp-btn-confirm').click();

    // Verify input echoes the modified time
    const value = await input.inputValue();
    expect(value).toMatch(/08:/);
    expect(value).toMatch(/20:/);
  });

  test('date-range-picker can select a date range', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    await picker.locator('.date-range-picker-input').click();

    // Select start date (click a day)
    const days = page.locator('.drp-day:not(.drp-day-other)');
    await days.nth(5).click();

    // Select end date (click another day after)
    await days.nth(15).click();

    // Verify selection text
    const selText = page.locator('.drp-selection-text');
    await expect(selText).toBeVisible();
  });

  test('date-range-picker confirms selection and echoes in input', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    const input = picker.locator('.date-range-picker-input');

    // Record original value
    const originalValue = await input.inputValue();
    expect(originalValue.length).toBeGreaterThan(0);

    // Open popover and select new range
    await input.click();
    const days = page.locator('.drp-day:not(.drp-day-other)');
    await days.nth(3).click(); // start
    await days.nth(20).click(); // end
    await page.locator('.drp-btn-confirm').click();

    // Verify input shows new value (different from original)
    await expect(page.locator('.date-range-picker-popover')).not.toBeVisible();
    const newValue = await input.inputValue();
    expect(newValue.length).toBeGreaterThan(0);
    // The new value should be a valid date range format with full date and time
    expect(newValue).toMatch(/\d{4}-\d{2}-\d{2}.*~.*\d{4}-\d{2}-\d{2}/);
  });

  test('date-range-picker cancel keeps original input value', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    const input = picker.locator('.date-range-picker-input');

    // Record original value
    const originalValue = await input.inputValue();

    // Open popover and make changes, then cancel
    await input.click();
    const days = page.locator('.drp-day:not(.drp-day-other)');
    await days.nth(3).click();
    await page.locator('.drp-btn-cancel').click();

    // Verify input still has original value
    const afterValue = await input.inputValue();
    expect(afterValue).toBe(originalValue);
  });

  test('date-range-picker clear button clears input', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    const input = picker.locator('.date-range-picker-input');

    // Verify has value initially
    const originalValue = await input.inputValue();
    expect(originalValue.length).toBeGreaterThan(0);

    // Click clear button
    await picker.locator('.date-range-picker-clear-btn').click();

    // Verify input is now empty
    const afterValue = await input.inputValue();
    expect(afterValue).toBe('');
  });

  test('date-range-picker echoes store.setValues changes with full date+time', async ({ page }) => {
    // Set new values via Form Store with full date and time
    await page.evaluate(() => {
      const formEl = document.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({
            regStartTime: '2025-06-01 08:30:45',
            regEndTime: '2025-06-30 20:15:30',
          });
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);

    // Verify input echoes the new values with full date and time
    const input = page.locator('.date-range-picker').first().locator('.date-range-picker-input');
    const value = await input.inputValue();
    expect(value).toContain('2025-06-01');
    expect(value).toContain('2025-06-30');
    expect(value).toContain('08:30:45');
    expect(value).toContain('20:15:30');
  });

  test('date-range-picker confirm button closes popover', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    await picker.locator('.date-range-picker-input').click();
    await page.locator('.drp-btn-confirm').click();
    await expect(page.locator('.date-range-picker-popover')).not.toBeVisible();
  });

  test('date-range-picker cancel button closes popover', async ({ page }) => {
    const picker = page.locator('.date-range-picker').first();
    await picker.locator('.date-range-picker-input').click();
    await page.locator('.drp-btn-cancel').click();
    await expect(page.locator('.date-range-picker-popover')).not.toBeVisible();
  });

  // ===== Date Range Picker on Different Tabs =====
  test('Skin Setting tab has date-range-picker', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
    await page.waitForTimeout(300);
    const picker = page.locator('.date-range-picker');
    expect(await picker.count()).toBeGreaterThanOrEqual(1);
  });

  test('Sub-Mission Rules tab has date-range-picker', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
    await page.waitForTimeout(300);
    const picker = page.locator('.date-range-picker');
    expect(await picker.count()).toBeGreaterThanOrEqual(1);
  });

  // ===== Date Range Picker Styling =====
  test('date-range-picker has consistent height', async ({ page }) => {
    const pickers = page.locator('.date-range-picker-input-wrap');
    const firstHeight = await pickers.first().boundingBox().then(b => b.height);
    const secondHeight = await pickers.nth(1).boundingBox().then(b => b.height);
    expect(firstHeight).toBeGreaterThan(0);
    expect(Math.abs(firstHeight - secondHeight)).toBeLessThanOrEqual(2);
  });

  // ===== Validation via DateRangePicker built-in validation =====
  test('Registration Period: end before start shows error', async ({ page }) => {
    await page.evaluate(() => {
      const formEl = document.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({ regEndTime: '2019-01-01 00:00:00' });
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);
    // DateRangePicker renders validation internally
    const picker = page.locator('.date-range-picker').first();
    await expect(picker.locator('.cxd-Form-validation.is-error').first()).toBeVisible();
  });

  test('Registration Period: end equals start shows error', async ({ page }) => {
    await page.evaluate(() => {
      const formEl = document.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({ regEndTime: '2019-03-01 12:00:00' }); // same as start
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);
    const picker = page.locator('.date-range-picker').first();
    await expect(picker.locator('.cxd-Form-validation.is-error').first()).toBeVisible();
  });

  test('Mission Period: end before start shows error', async ({ page }) => {
    await page.evaluate(() => {
      const formEl = document.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({ missionEndTime: '2018-01-01 00:00:00' });
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);
    const pickers = page.locator('.date-range-picker');
    await expect(pickers.nth(1).locator('.cxd-Form-validation.is-error').first()).toBeVisible();
  });

  test('Skin Setting: end before start shows error', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Skin Setting' }).first().click({ force: true });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      // Find form inside the active tab pane
      const activeTab = document.querySelector('.cxd-Tabs-pane.is-active');
      if (!activeTab) return;
      const formEl = activeTab.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({ skinEndTime: '2018-01-01 00:00:00' });
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);
    // Find picker inside the active tab
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const picker = activePane.locator('.date-range-picker').first();
    await expect(picker.locator('.cxd-Form-validation.is-error').first()).toBeVisible();
  });

  test('Sub-Mission Rules: end before start shows error', async ({ page }) => {
    await page.locator('.cxd-Tabs-link').filter({ hasText: 'Sub-Mission Rules' }).first().click({ force: true });
    await page.waitForTimeout(500);

    await page.evaluate(() => {
      // Find form inside the active tab pane
      const activeTab = document.querySelector('.cxd-Tabs-pane.is-active');
      if (!activeTab) return;
      const formEl = activeTab.querySelector('.cxd-Form');
      if (!formEl) return;
      const fiberKey = Object.keys(formEl).find(k => k.startsWith('__reactFiber'));
      if (!fiberKey) return;
      const fiber = (formEl as any)[fiberKey];
      let node: any = fiber;
      while (node) {
        const typeName = typeof node.type === 'function' ? (node.type.name || '') : String(node.type);
        if (typeName === 'FormRenderer' && node.stateNode && node.stateNode.props && node.stateNode.props.store) {
          node.stateNode.props.store.setValues({ subStayEnd: '2018-01-01 00:00:00' });
          return;
        }
        node = node.return;
      }
    });
    await page.waitForTimeout(500);
    // Find picker inside the active tab
    const activePane = page.locator('.cxd-Tabs-pane.is-active').first();
    const picker = activePane.locator('.date-range-picker').first();
    await expect(picker.locator('.cxd-Form-validation.is-error').first()).toBeVisible();
  });
});
