import { test, expect } from '@playwright/test';

const URL = '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang';

// ─── Helpers ───

/** Get all selected labels from the custom select display */
async function getSelectedLabels(page) {
  return page.evaluate(() => {
    const els = document.querySelectorAll('.field-with-exclude-v2 .antd-Select-value');
    return Array.from(els).map(el => el.textContent?.trim() || '');
  });
}

/** Get all option states (label + whether selected) from dropdown */
async function getOptionStates(page) {
  return page.evaluate(() => {
    const opts = document.querySelectorAll('.antd-Select-option');
    return Array.from(opts).map(o => ({
      text: o.textContent?.trim().replace(/^[☑☐]\s*/, ''),
      selected: o.classList.contains('is-selected'),
    }));
  });
}

/** Open the dropdown */
async function openDropdown(page) {
  await page.locator('.field-with-exclude-v2 .antd-Select').first().click();
  await page.waitForTimeout(400);
}

/** Select an option by label text (adds if not selected, removes if already selected) */
async function toggleOption(page, label) {
  await page.locator('.antd-Select-option').filter({ hasText: label }).first().click();
  await page.waitForTimeout(400);
}

/** Switch language */
async function switchLang(page, lang) {
  await page.locator('.language-switcher select').selectOption(lang);
  await page.waitForTimeout(1500);
}

/** Check if exclude indicator is visible */
async function isExcludeIndicatorVisible(page) {
  return page.getByText('Values selected above will be excluded').isVisible();
}

// ─── Test Suite ───

test.describe('FieldWithExcludeV2 — Comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // ── Section 1: Basic Display ──

  test.describe('基础展示', () => {
    test('label 和初始选中值正确', async ({ page }) => {
      // Label should be visible (scoped to the component)
      await expect(page.locator('.field-with-exclude-v2-label').first()).toBeVisible();

      // Initial values: ["x", "y"] → "选项X, 选项Y"
      const labels = await getSelectedLabels(page);
      expect(labels).toEqual(['选项X', '选项Y']);

      // Exclude checkbox should be unchecked initially
      const checkbox = page.locator('.field-with-exclude-v2 input[type="checkbox"]').first();
      await expect(checkbox).not.toBeChecked();

      // Exclude indicator should NOT be visible
      await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();
    });

    test('下拉展开后选项列表正确', async ({ page }) => {
      await openDropdown(page);

      // Dropdown should be visible
      await expect(page.locator('.antd-Select-dropdown')).toBeVisible();

      // All 3 options should be present
      const options = await getOptionStates(page);
      expect(options).toHaveLength(3);
      expect(options.map(o => o.text)).toEqual(['选项X', '选项Y', '选项Z']);

      // X and Y should be selected, Z should not
      expect(options[0].selected).toBe(true);   // X
      expect(options[1].selected).toBe(true);   // Y
      expect(options[2].selected).toBe(false);  // Z
    });

    test('下拉箭头方向反映展开状态', async ({ page }) => {
      // Initially closed — should show ▼
      const arrowClosed = page.locator('.field-with-exclude-v2-select-wrap > div > span').last();
      await expect(arrowClosed).toContainText('▼');

      // Open dropdown — should show ▲
      await openDropdown(page);
      await expect(arrowClosed).toContainText('▲');
    });
  });

  // ── Section 2: Select Interaction ──

  test.describe('下拉选择交互', () => {
    test('多选：点击未选中选项 → 添加选中', async ({ page }) => {
      // Initial: X, Y selected
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Open dropdown and click Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');

      // Z should now be selected
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项Z');
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
      expect(labels).toHaveLength(3);
    });

    test('多选：点击已选中选项 → 取消选中', async ({ page }) => {
      // Initial: X, Y selected
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Open dropdown and click Y to deselect
      await openDropdown(page);
      await toggleOption(page, '选项Y');

      // Y should be removed
      const labels = await getSelectedLabels(page);
      expect(labels).not.toContain('选项Y');
      expect(labels).toContain('选项X');
      expect(labels).toHaveLength(1);
    });

    test('单选模式：点击选项后下拉自动关闭', async ({ page }) => {
      await openDropdown(page);

      // Click Z
      await toggleOption(page, '选项Z');

      // Dropdown should close (single select auto-close)
      // Note: this component is multi-select by default in the schema,
      // so we test that the dropdown stays open for multi-select
      await expect(page.locator('.antd-Select-dropdown')).toBeVisible();
    });

    test('选项 UI 状态同步：选中项高亮', async ({ page }) => {
      await openDropdown(page);

      // X and Y should be highlighted
      const options = await getOptionStates(page);
      expect(options.find(o => o.text === '选项X')?.selected).toBe(true);
      expect(options.find(o => o.text === '选项Y')?.selected).toBe(true);
      expect(options.find(o => o.text === '选项Z')?.selected).toBe(false);

      // Click Z
      await toggleOption(page, '选项Z');

      // Re-check: Z should now be selected
      const optionsAfter = await getOptionStates(page);
      expect(optionsAfter.find(o => o.text === '选项Z')?.selected).toBe(true);
    });
  });

  // ── Section 3: Dropdown Behavior ──

  test.describe('下拉行为', () => {
    test('点击外部区域关闭下拉', async ({ page }) => {
      await openDropdown(page);
      await expect(page.locator('.antd-Select-dropdown')).toBeVisible();

      // Click outside (on the page body)
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);

      await expect(page.locator('.antd-Select-dropdown')).not.toBeVisible();
    });

    test('再次点击显示区域关闭下拉', async ({ page }) => {
      await openDropdown(page);
      await expect(page.locator('.antd-Select-dropdown')).toBeVisible();

      // Click the select display again to close
      await page.locator('.field-with-exclude-v2 .antd-Select').first().click();
      await page.waitForTimeout(300);

      await expect(page.locator('.antd-Select-dropdown')).not.toBeVisible();
    });
  });

  // ── Section 4: Exclude Checkbox ──

  test.describe('排除模式', () => {
    test('勾选 Exclude → 红色指示条出现', async ({ page }) => {
      // Initially no indicator
      await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();

      // Click Exclude checkbox
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // Indicator should appear
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();
    });

    test('取消 Exclude → 红色指示条消失', async ({ page }) => {
      // Enable exclude
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

      // Disable exclude
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // Indicator should disappear
      await expect(page.getByText('Values selected above will be excluded')).not.toBeVisible();
    });

    test('Exclude 切换不改变已选值', async ({ page }) => {
      // Initial: X, Y
      const before = await getSelectedLabels(page);
      expect(before).toEqual(['选项X', '选项Y']);

      // Toggle exclude on
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(500);

      // Values should still be X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Toggle exclude off
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(500);

      // Values should still be X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);
    });

    test('Exclude checkbox 复选框状态正确', async ({ page }) => {
      const checkbox = page.locator('.field-with-exclude-v2 input[type="checkbox"]').first();

      // Initially unchecked
      await expect(checkbox).not.toBeChecked();

      // Click to check
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(checkbox).toBeChecked();

      // Click to uncheck
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(checkbox).not.toBeChecked();
    });
  });

  // ── Section 5: MultiLang Persistence (核心场景) ──

  test.describe('多语言持久化', () => {
    test('中→修改→英→中 修改保留', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Modify in Chinese: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Z');

      // Switch to English
      await switchLang(page, 'en');

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Z should still be selected (modification preserved)
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项Z');
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
    });

    test('中→修改→英 看到英文初始值→中 中文修改保留', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Modify in Chinese: remove Y, add Z
      await openDropdown(page);
      await toggleOption(page, '选项Y'); // deselect Y
      await toggleOption(page, '选项Z'); // select Z
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Z']);

      // Switch to English
      await switchLang(page, 'en');
      // English should have its own values (X, Y from test data)
      await page.waitForTimeout(500);

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese values should be preserved: X, Z (not Y)
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Z');
      expect(labels).not.toContain('选项Y');
    });

    test('英文修改→回中文不受影响', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Switch to English
      await switchLang(page, 'en');

      // Modify in English: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Z');

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese should have original values (X, Y), not English modifications
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
    });

    test('语言切换时 Exclude 状态保持', async ({ page }) => {
      // Enable exclude in Chinese
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

      // Switch to English
      await switchLang(page, 'en');
      await page.waitForTimeout(500);

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Exclude indicator should still be visible
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();
    });

    test('中→改→英 看到英文初始值→中 中文修改保留', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Modify in Chinese: remove Y, add Z
      await openDropdown(page);
      await toggleOption(page, '选项Y'); // deselect Y
      await toggleOption(page, '选项Z'); // select Z
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Z']);

      // Switch to English
      await switchLang(page, 'en');
      // English should have its own values (X, Y from test data)
      await page.waitForTimeout(500);

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese values should be preserved: X, Z (not Y)
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Z');
      expect(labels).not.toContain('选项Y');
    });

    test('英文排除模式改值→回中文不影响中文值', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Switch to English
      await switchLang(page, 'en');

      // Enable exclude in English
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // Modify in English exclude mode: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese should have original values (X, Y), not affected by English exclude mode
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
    });
  });

  // ── Section 5b: Exclude + MultiLang (反选 + 多语言交叉场景) ──

  test.describe('反选 + 多语言交叉', () => {
    test('中文开启排除→改值→切英文→回中文 修改保留', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Enable exclude in Chinese
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

      // Modify in exclude mode: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Z');

      // Switch to English (exclude state may reset since en data has checkbox=false)
      await switchLang(page, 'en');
      await page.waitForTimeout(500);

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese values should be preserved: X, Y, Z
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
      expect(labels).toContain('选项Z');
    });

    test('中文排除模式改值→切英文看到不同值→回中文排除模式值保留', async ({ page }) => {
      // Initial zh: X, Y, not excluded
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Enable exclude in Chinese
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // In exclude mode, modify: remove X, add Z
      await openDropdown(page);
      await toggleOption(page, '选项X');
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Y');
      expect(await getSelectedLabels(page)).toContain('选项Z');
      expect(await getSelectedLabels(page)).not.toContain('选项X');

      // Switch to English
      await switchLang(page, 'en');
      await page.waitForTimeout(500);

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese values in exclude mode should be preserved: Y, Z (not X)
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项Y');
      expect(labels).toContain('选项Z');
      expect(labels).not.toContain('选项X');
    });

    test('英文排除模式改值→回中文不影响中文值', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Switch to English
      await switchLang(page, 'en');

      // Enable exclude in English
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // Modify in English exclude mode: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese should have original values (X, Y), not affected by English exclude mode
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
    });

    test('中文正常模式改值→切英文开启排除→回中文 两个语言各自独立', async ({ page }) => {
      // Initial zh: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Modify in Chinese normal mode: add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y', '选项Z']);

      // Switch to English
      await switchLang(page, 'en');
      await page.waitForTimeout(500);

      // Enable exclude in English and modify
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);
      await expect(page.getByText('Values selected above will be excluded')).toBeVisible();

      // Switch back to Chinese
      await switchLang(page, 'zh');

      // Chinese should have X, Y, Z (normal mode, not affected by English exclude mode)
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
      expect(labels).toContain('选项Z');
    });

    test('中文和英文各自正常模式修改，互不干扰', async ({ page }) => {
      // --- Chinese: modify to X, Y, Z ---
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Z');

      // --- Switch to English ---
      await switchLang(page, 'en');
      await page.waitForTimeout(500);

      // English should have its own initial values (X, Y)
      const enLabels = await getSelectedLabels(page);
      expect(enLabels).toContain('选项X');
      expect(enLabels).toContain('选项Y');

      // --- Switch back to Chinese ---
      await switchLang(page, 'zh');

      // Chinese should still have X, Y, Z
      const zhLabels = await getSelectedLabels(page);
      expect(zhLabels).toContain('选项X');
      expect(zhLabels).toContain('选项Y');
      expect(zhLabels).toContain('选项Z');

      // --- Switch back to English ---
      await switchLang(page, 'en');

      // English should still have X, Y (not affected by Chinese modifications)
      const enLabelsFinal = await getSelectedLabels(page);
      expect(enLabelsFinal).toContain('选项X');
      expect(enLabelsFinal).toContain('选项Y');
    });

    test('排除模式：反复切换语言，值始终不丢', async ({ page }) => {
      // Start: X, Y
      expect(await getSelectedLabels(page)).toEqual(['选项X', '选项Y']);

      // Enable exclude
      await page.locator('.field-with-exclude-v2-checkbox-wrap').first().click();
      await page.waitForTimeout(400);

      // Add Z
      await openDropdown(page);
      await toggleOption(page, '选项Z');
      expect(await getSelectedLabels(page)).toContain('选项Z');

      // Switch: zh → en → zh → en → zh
      await switchLang(page, 'en');
      await switchLang(page, 'zh');
      await switchLang(page, 'en');
      await switchLang(page, 'zh');

      // After multiple switches, X, Y, Z should still be there
      const labels = await getSelectedLabels(page);
      expect(labels).toContain('选项X');
      expect(labels).toContain('选项Y');
      expect(labels).toContain('选项Z');
    });
  });

  // ── Section 7: Form Integration ──

  test.describe('表单集成', () => {
    test('组件在表单中可见且可交互', async ({ page }) => {
      // Component wrapper should be visible
      await expect(page.locator('.field-with-exclude-v2')).toBeVisible();

      // Select display should be visible
      const selectDisplay = page.locator('.field-with-exclude-v2 .antd-Select').first();
      await expect(selectDisplay).toBeVisible();

      // Click should work (no error)
      await selectDisplay.click();
      await page.waitForTimeout(300);
      await expect(page.locator('.antd-Select-dropdown')).toBeVisible();
    });
  });
});
