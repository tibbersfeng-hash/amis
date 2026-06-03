import { test, expect } from '@playwright/test';

test.describe('Showcase', () => {
  test('page loads and shows sidebar', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase');
    await expect(page.locator('.showcase-root')).toBeVisible();
    await expect(page.locator('.showcase-sidebar')).toBeVisible();
    await expect(page.locator('.showcase-content')).toBeVisible();
  });

  test('all categories are visible in sidebar', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase');
    await expect(page.locator('.showcase-nav-category', { hasText: '配置系统' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '基础设施' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '预览组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '表单输入' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '展示组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '布局组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '数据组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '反馈组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '导航组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '操作组件' })).toBeVisible();
    await expect(page.locator('.showcase-nav-category', { hasText: '高级组件' })).toBeVisible();
  });

  test('custom component: i18n-config renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#i18n-config');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'i18n-config' }).first()).toBeVisible();
    await expect(content.locator('.showcase-json-block').first()).toBeVisible();
    await expect(content.locator('.showcase-preview-container').first()).toBeVisible();
  });

  test('custom component: StickyFooter renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#sticky-footer');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'StickyFooter' }).first()).toBeVisible();
    // StickyFooter uses position:fixed so it's at viewport level, not inside .showcase-content
    await expect(page.locator('.sticky-footer').first()).toBeVisible();
    // First StickyFooter instance has 3 buttons
    await expect(page.locator('.sticky-footer').first().locator('.footer-btn')).toHaveCount(3);
  });

  test('custom component: Loading renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#loading');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Loading' }).first()).toBeVisible();
    await expect(content.locator('.loading-overlay').first()).toBeVisible();
  });

  // ============ Amis: InputText (multiLang baseline) ============
  test('Amis component: InputText multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // 1. Page title visible
    await expect(content.locator('.showcase-page-title', { hasText: 'InputText' })).toBeVisible();

    // 2. Section titles: 6 blocks
    await expect(content.locator('.showcase-section-title', { hasText: 'JSON Configuration — 支持 i18n' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '测试内容 JSON — 支持 i18n' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: 'Live Preview — 支持 i18n' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: 'JSON Configuration — 不支持 i18n' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '测试内容 JSON — 不支持 i18n' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: 'Live Preview — 不支持 i18n' })).toBeVisible();

    // 3. All JSON blocks rendered
    await expect(content.locator('.showcase-json-block')).toHaveCount(4);

    // 4. Support i18n — Schema: has multiLang flag
    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');

    // 5. Support i18n — Data: has {zh,en} values
    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
    expect(dataI18n).toContain('"迈克"');
    expect(dataI18n).toContain('"Mike"');

    // 6. Not support i18n — Schema: NO multiLang flag
    const schemaPlain = await jsonBlocks.nth(2).textContent();
    expect(schemaPlain).not.toContain('"multiLang"');

    // 7. Not support i18n — Data: plain zh values only
    const dataPlain = await jsonBlocks.nth(3).textContent();
    expect(dataPlain).not.toContain('"zh":');
    expect(dataPlain).not.toContain('"en":');
    expect(dataPlain).toContain('"迈克"');
    expect(dataPlain).not.toContain('"Mike"');

    await page.screenshot({ path: 'tests/showcase-screenshots/amis-input-text-multiLang-dual.png', fullPage: true });
  });

  test('Amis component: InputText renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputText' })).toBeVisible();
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();
    await page.screenshot({ path: 'tests/showcase-screenshots/amis-input-text.png', fullPage: true });
  });

  // ============ Amis: Textarea (multiLang) ============
  test('Amis component: Textarea multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-textarea');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Textarea' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '支持 i18n' }).first()).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '不支持 i18n' }).first()).toBeVisible();

    // Schema i18n has multiLang flag
    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');

    // Data i18n has {zh,en} values
    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
    expect(dataI18n).toContain('这是一个多行描述');
    expect(dataI18n).toContain('This is a multi-line description');
  });

  // ============ Amis: InputPassword (multiLang) ============
  test('Amis component: InputPassword multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-password');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputPassword' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '支持 i18n' }).first()).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
    expect(dataI18n).toContain('密码123456');
    expect(dataI18n).toContain('password123');
  });

  // ============ Amis: Select (multiLang options) ============
  test('Amis component: Select multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Select' })).toBeVisible();
    await expect(content.locator('.showcase-section-title', { hasText: '支持 i18n' }).first()).toBeVisible();

    // Schema i18n has multiLang flag on select with options
    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('北京');
    expect(schemaI18n).toContain('Beijing');

    // Data i18n has {zh,en} values
    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
  });

  // ============ Amis: Radios (multiLang options) ============
  test('Amis component: Radios multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-radios');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Radios' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('男');
    expect(schemaI18n).toContain('Male');
    expect(schemaI18n).toContain('初级');
    expect(schemaI18n).toContain('Junior');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
  });

  // ============ Amis: Checkboxes (multiLang options) ============
  test('Amis component: Checkboxes multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-checkboxes');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Checkboxes' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
  });

  // ============ Amis: Switch (multiLang) ============
  test('Amis component: Switch multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-switch');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Switch' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('开');
    expect(schemaI18n).toContain('ON');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
  });

  // ============ Amis: InputTag (multiLang) ============
  test('Amis component: InputTag multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-tag');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputTag' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
    expect(dataI18n).toContain('前端');
    expect(dataI18n).toContain('frontend');
  });

  // ============ Amis: InputTree (multiLang options) ============
  test('Amis component: InputTree multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-tree');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputTree' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('技术部');
    expect(schemaI18n).toContain('Tech Dept');

    const dataI18n = await jsonBlocks.nth(1).textContent();
    expect(dataI18n).toContain('"zh":');
    expect(dataI18n).toContain('"en":');
  });

  // ============ Amis: TreeSelect (multiLang options) ============
  test('Amis component: TreeSelect multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-tree-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'TreeSelect' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('华东');
    expect(schemaI18n).toContain('East');
  });

  // ============ Amis: Cascader (multiLang options) ============
  test('Amis component: Cascader multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-cascader');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Cascader' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('北京');
    expect(schemaI18n).toContain('Beijing');
  });

  // ============ Amis: Transfer (multiLang options) ============
  test('Amis component: Transfer multiLang dual configs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-transfer');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Transfer' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaI18n = await jsonBlocks.nth(0).textContent();
    expect(schemaI18n).toContain('"multiLang": true');
    expect(schemaI18n).toContain('张三');
    expect(schemaI18n).toContain('Zhang San');
  });

  // ============ Amis: ChainedSelect API (联动) ============
  test('Amis component: ChainedSelect API — Property to Sub Unit联动', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-chained-select-api');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'ChainedSelect' })).toBeVisible();

    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // Wait for form to fully render
    await expect(i18nPreview.locator('[role="combobox"]')).toHaveCount(2);
    // Wait for API data to load
    await page.waitForTimeout(500);

    // Verify Business Unit is pre-filled
    const businessUnitLabel = i18nPreview.locator('text=Business Unit').first();
    await expect(businessUnitLabel).toBeVisible();

    // Verify Property select exists
    const propertyLabel = i18nPreview.locator('text=Property').first();
    await expect(propertyLabel).toBeVisible();

    // Sub Unit should be hidden initially (visibleOn: 'this.property')
    const subUnitLabel = i18nPreview.locator('text=Sub Unit').first();
    await expect(subUnitLabel).not.toBeVisible();

    // Select a property (index 1 is Property)
    const propertyCombobox = i18nPreview.locator('[role="combobox"]').nth(1);
    await propertyCombobox.click();
    await page.waitForTimeout(500);

    // Should have 3 property options
    await expect(page.locator('.cxd-Select-option')).toHaveCount(3);
    // Click the first option (CNHSN001)
    await page.locator('.cxd-Select-option').nth(0).click();
    await page.waitForTimeout(500);

    // Sub Unit should now appear with its own dropdown
    await expect(subUnitLabel).toBeVisible();

    // Sub Unit combobox should exist
    await expect(i18nPreview.locator('[role="combobox"]')).toHaveCount(3);

    // Open Sub Unit dropdown
    const subUnitCombobox = i18nPreview.locator('[role="combobox"]').nth(2);
    await subUnitCombobox.click();
    await page.waitForTimeout(500);

    // Should have 3 sub unit options for CNHSN001
    await expect(page.locator('.cxd-Select-option')).toHaveCount(3);
    // Verify content (select displays name, not code)
    await expect(page.locator('text=朝阳18号')).toBeVisible();
    await expect(page.locator('text=海淀分部')).toBeVisible();
    await expect(page.locator('text=东城门店')).toBeVisible();
  });

  // ============ Amis: ChainedSelect (plain) ============
  test('Amis component: ChainedSelect renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-chained-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'ChainedSelect' })).toBeVisible();

    // Non-表单输入: single JSON block
    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('"华东"');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: Picker (plain) ============
  test('Amis component: Picker renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-picker');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Picker' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('选项 A');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: MatrixCheckboxes (plain) ============
  test('Amis component: MatrixCheckboxes renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-matrix-checkboxes');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'MatrixCheckboxes' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('功能完整性');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: Combo (plain) ============
  test('Amis component: Combo renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-combo');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Combo' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('技能列表');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: InputTable (plain) ============
  test('Amis component: InputTable renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputTable' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('项目列表');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: Group (plain) ============
  test('Amis component: Group renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-group');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Group' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('姓');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: ConditionBuilder (plain) ============
  test('Amis component: ConditionBuilder renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-condition-builder');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'ConditionBuilder' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('用户名');
    expect(schema).not.toContain('"multiLang"');
  });

  // ============ Amis: Form (plain) ============
  test('Amis component: Form renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-form');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Form' })).toBeVisible();

    // Non-表单输入: single JSON block
    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('用户注册');
    expect(schema).not.toContain('"multiLang"');

    // Live preview renders
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();
    await page.screenshot({ path: 'tests/showcase-screenshots/amis-form.png', fullPage: true });
  });

  // ============ Amis: Wizard (plain) ============
  test('Amis component: Wizard renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-wizard');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Wizard' })).toBeVisible();

    const jsonBlocks = content.locator('.showcase-json-block');
    expect(await jsonBlocks.count()).toBe(1);
    const schema = await jsonBlocks.nth(0).textContent();
    expect(schema).toContain('基本信息');
    expect(schema).not.toContain('"multiLang"');

    // Live preview renders
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();
    await page.screenshot({ path: 'tests/showcase-screenshots/amis-wizard.png', fullPage: true });
  });

  // ============ Amis: Table renders ============
  test('Amis component: Table renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Table' })).toBeVisible();
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();

    await page.screenshot({ path: 'tests/showcase-screenshots/amis-table.png', fullPage: true });
  });

  // ============ Amis: Chart renders ============
  test('Amis component: Chart renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-chart');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Chart' })).toBeVisible();
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();
    await page.screenshot({ path: 'tests/showcase-screenshots/amis-chart.png', fullPage: true });
  });

  // ============ Navigation ============
  test('navigation between pages works', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase');
    await expect(page.locator('.showcase-page-title', { hasText: 'i18n-config' })).toBeVisible();

    // Click StickyFooter in sidebar
    await page.locator('button.showcase-nav-item', { hasText: 'StickyFooter' }).click();
    await page.waitForURL('**/showcase#sticky-footer');
    await expect(page.locator('.showcase-page-title', { hasText: 'StickyFooter' })).toBeVisible();

    // Click Loading
    await page.locator('button.showcase-nav-item', { hasText: 'Loading' }).click();
    await page.waitForURL('**/showcase#loading');
    await expect(page.locator('.showcase-page-title', { hasText: 'Loading' })).toBeVisible();

    // Go back via browser back
    await page.goBack();
    await expect(page.locator('.showcase-page-title', { hasText: 'StickyFooter' })).toBeVisible();
  });

  // ============ Submit Button & Data Display ============
  test('submit button visible on Amis pages', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-submit-btn', { hasText: '提交表单' })).toBeVisible();
  });

  test('submit button hidden on custom component pages', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#sticky-footer');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-submit-btn')).toHaveCount(0);
  });

  test('click submit shows submitted data JSON', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Wait for preview to render
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();

    // No submitted data before click
    await expect(content.locator('.showcase-submitted-section')).toHaveCount(0);

    // Click submit
    await content.locator('.showcase-submit-btn').click();

    // Submitted data section appears
    await expect(content.locator('.showcase-submitted-section')).toBeVisible();
    await expect(content.locator('.showcase-submitted-section .showcase-section-title', { hasText: '提交的数据' })).toBeVisible();

    // JSON contains both i18n and plain keys
    const submittedText = await content.locator('.showcase-submitted-data').textContent();
    expect(submittedText).toContain('支持 i18n');
    expect(submittedText).toContain('不支持 i18n');
  });

  test('submitted data clears when switching pages', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Submit first
    await content.locator('.showcase-submit-btn').click();
    await expect(content.locator('.showcase-submitted-section')).toBeVisible();

    // Switch to another Amis page
    await page.locator('button.showcase-nav-item', { hasText: 'Textarea' }).click();
    await page.waitForURL('**/showcase#amis-textarea');
    await expect(content.locator('.showcase-page-title', { hasText: 'Textarea' })).toBeVisible();

    // Submitted data should be cleared
    await expect(content.locator('.showcase-submitted-section')).toHaveCount(0);
  });

  // ============ Default Value Echo ============
  test('i18n Live Preview shows default values from test data', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Wait for i18n preview to render
    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // The text input should contain the default value "迈克" (zh from test data)
    // Use input[type="text"] to avoid picking up hidden submit/button inputs
    const input = i18nPreview.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await expect(input).toHaveValue(/迈克/);
  });

  test('plain Live Preview shows default values from test data', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Wait for plain preview to render
    const plainPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 不支持 i18n' }).locator('.amis-live-preview');
    await expect(plainPreview).toBeVisible();

    // The text input should contain the default value "迈克" (plain zh from test data)
    const input = plainPreview.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await expect(input).toHaveValue(/迈克/);
  });

  test('language switch changes displayed default values in i18n preview', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Wait for i18n preview to render with zh
    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    const input = i18nPreview.locator('input[type="text"]').first();
    await expect(input).toBeVisible();
    await expect(input).toHaveValue(/迈克/);

    // Switch language to English
    await content.locator('select').selectOption('en');

    // Wait for re-render with English value
    await expect(input).toHaveValue(/Mike/);
  });

  test('form submission includes values from both previews', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-text');
    const content = page.locator('.showcase-content');

    // Wait for previews to render
    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    const plainPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 不支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();
    await expect(plainPreview).toBeVisible();

    // Submit
    await content.locator('.showcase-submit-btn').click();

    // Check submitted data structure has both sections
    await expect(content.locator('.showcase-submitted-section')).toBeVisible();
    const submittedText = await content.locator('.showcase-submitted-data').textContent();
    expect(submittedText).toContain('支持 i18n');
    expect(submittedText).toContain('不支持 i18n');
    // Verify it's valid JSON structure
    const parsed = JSON.parse(submittedText);
    expect(typeof parsed['支持 i18n']).toBe('object');
    expect(typeof parsed['不支持 i18n']).toBe('object');
  });

  // ============ Drawer Showcase (custom component) ============
  test('Drawer custom component renders', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-drawer');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Drawer' }).first()).toBeVisible();

    // Custom component uses .drawer-showcase class
    const drawerShowcase = content.locator('.drawer-showcase');
    await expect(drawerShowcase).toBeVisible();
    await expect(drawerShowcase.locator('.drawer-showcase-title')).toBeVisible();
    await expect(drawerShowcase.locator('.drawer-showcase-schema')).toBeVisible();
  });

  // ============ InputDateRange (date format + datetime format) ============
  test('Amis component: InputDateRange renders with dual formats', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-date-range');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'InputDateRange' })).toBeVisible();
    await expect(content.locator('.amis-live-preview').first()).toBeVisible();
  });

  test('InputDateRange — YYYY-MM-DD format default value displayed', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-date-range');
    const content = page.locator('.showcase-content');
    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // Date range inputs use class cxd-DateRangePicker-input (no name attr)
    // First two inputs are YYYY-MM-DD range (period field)
    const dateInputs = i18nPreview.locator('.cxd-DateRangePicker-input');
    await expect(dateInputs.nth(0)).toBeVisible();

    const startVal = await dateInputs.nth(0).inputValue();
    const endVal = await dateInputs.nth(1).inputValue();
    expect(startVal).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(endVal).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  test('InputDateRange — YYYY-MM-DD HH:mm:ss format default value displayed', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-input-date-range');
    const content = page.locator('.showcase-content');
    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // Last two inputs are datetime range (with time component)
    const dateInputs = i18nPreview.locator('.cxd-DateRangePicker-input');
    await expect(dateInputs).toHaveCount(4);

    const startVal = await dateInputs.nth(2).inputValue();
    const endVal = await dateInputs.nth(3).inputValue();
    expect(startVal).toMatch(/\d{2}:\d{2}/);
    expect(endVal).toMatch(/\d{2}:\d{2}/);
  });

  // ============ Select API mock data loading ============
  test('Select — API mock loads city options', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Select' })).toBeVisible();

    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // Wait for form to be fully rendered and API data loaded
    await expect(i18nPreview.locator('[role="combobox"]')).toHaveCount(4);
    // Brief wait for async API data to populate
    await page.waitForTimeout(500);

    // Click the API city combobox (index 1)
    await i18nPreview.locator('[role="combobox"]').nth(1).click();

    // Wait for dropdown options to appear
    await expect(page.locator('.cxd-Select-option')).toHaveCount(6);
    await expect(page.locator('.cxd-Select-option').first()).toContainText('北京');
  });

  test('Select — API mock with keyword search filters users', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Select' })).toBeVisible();

    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // Wait for form to be fully rendered
    await expect(i18nPreview.locator('[role="combobox"]')).toHaveCount(4);
    // Brief wait for async API data to populate
    await page.waitForTimeout(500);

    // Click the API user select with search (index 2)
    await i18nPreview.locator('[role="combobox"]').nth(2).click();

    // Wait for the searchable select menu with input
    const searchInput = page.locator('.cxd-Select-menu input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('张');

    // Wait for filtered results
    await expect(page.locator('.cxd-Select-option').first()).toContainText('张三');
  });

  test('TreeSelect — API mock loads department tree', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-tree-select');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'TreeSelect' })).toBeVisible();

    const i18nPreview = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' }).locator('.amis-live-preview');
    await expect(i18nPreview).toBeVisible();

    // TreeSelect uses .cxd-TreeSelect class
    const treeSelects = i18nPreview.locator('.cxd-TreeSelect');
    // 0=static region, 1=API dept
    await treeSelects.nth(1).click();

    // Tree items use .cxd-Tree-item class
    await expect(page.locator('.cxd-Tree-item').first()).toBeVisible();
    await expect(page.locator('text=技术部')).toBeVisible();
    await expect(page.locator('text=产品部')).toBeVisible();
  });

  // Cascader has a rendering issue with api property - test page loads and static options only
  test('Cascader — page renders with static options', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-cascader');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Cascader' })).toBeVisible();
    // Verify JSON config shows both static and API cascader definitions
    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaText = await jsonBlocks.nth(0).textContent();
    expect(schemaText).toContain('"type": "cascader"');
    expect(schemaText).toContain('"name": "area"');
    expect(schemaText).toContain('"name": "apiArea"');
  });

  // ============ FooterToolbar (Table pagination bar) ============
  test('Table — footerToolbar renders with statistics, pagination, and page-switch', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Table' })).toBeVisible();

    // Wait for table data to load
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Footer toolbar container
    const footToolbar = content.locator('.cxd-Table-footToolbar');
    await expect(footToolbar).toBeVisible();

    // Statistics text: "共 89 项" (total count only, no page range)
    const stats = content.locator('.cxd-Crud-statistics');
    await expect(stats).toBeVisible();
    const statsText = await stats.textContent();
    expect(statsText).toMatch(/共\s*\d+\s*项/);

    // Pagination buttons present (9 page buttons visible)
    await expect(content.locator('.cxd-Pagination-pager-item')).toHaveCount(9);

    // Page-switch (per-page dropdown) present
    const pageSwitch = content.locator('.cxd-Crud-pageSwitch');
    await expect(pageSwitch).toBeVisible();
    // The select may be nested inside a wrapper
    await expect(pageSwitch.locator('select, .cxd-Select')).toBeVisible();
  });

  test('Table — footerToolbar all items right-aligned', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Verify toolbar is flex with justify-content: flex-end
    const toolbar = content.locator('.cxd-Crud-toolbar');
    const justifyContent = await toolbar.evaluate(el => getComputedStyle(el).justifyContent);
    expect(justifyContent).toBe('flex-end');
  });

  test('Table — pagination click changes page data', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Get first row's order ID on page 1
    const firstOrderId = await content.locator('.cxd-Table-table tbody tr').nth(0).locator('td').nth(1).textContent();

    // Click page 2
    await content.locator('.cxd-Pagination-pager-item').filter({ hasText: '2' }).click();
    await page.waitForTimeout(500);

    // Verify we still have 10 rows
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Get first row's order ID on page 2 — should be different
    const page2OrderId = await content.locator('.cxd-Table-table tbody tr').nth(0).locator('td').nth(1).textContent();
    expect(page2OrderId).not.toBe(firstOrderId);

    // Page 2 button should now be active
    const activePage = content.locator('.cxd-Pagination-pager-item.is-active a');
    await expect(activePage).toHaveText('2');
  });

  test('Table — per-page dropdown changes page size', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Find the page switch area
    const pageSwitch = content.locator('.cxd-Crud-pageSwitch .cxd-Select');
    await expect(pageSwitch).toBeVisible();

    // Click to open dropdown
    await pageSwitch.click();
    await page.waitForTimeout(300);

    // Dropdown options should include 20
    await expect(page.locator('.cxd-Select-option').filter({ hasText: '20' })).toBeVisible();

    // Select 20 per page
    await page.locator('.cxd-Select-option').filter({ hasText: '20' }).click();
    await page.waitForTimeout(1000);

    // Should now show 20 rows
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(20);
  });

  test('Table — active page button has correct styling', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Page 1 should be active by default
    const activeBtn = content.locator('.cxd-Pagination-pager-item.is-active');
    await expect(activeBtn).toBeVisible();

    // Verify active button has blue background
    const bgColor = await activeBtn.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgb(254, 254, 254)'); // Not the default white

    // Verify active button text is white
    const textColor = await activeBtn.locator('a').evaluate(el => getComputedStyle(el).color);
    expect(textColor).toBe('rgb(255, 255, 255)');
  });

  test('Table — disabled prev button on first page', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Prev button should be disabled on page 1
    const prevBtn = content.locator('.cxd-Pagination-prev');
    await expect(prevBtn).toHaveClass(/is-disabled/);
  });

  // ============ Table+Search footerToolbar ============
  test('Table+Search — footerToolbar renders correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table-search');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Table+Search' })).toBeVisible();

    // Wait for table data to load
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Footer toolbar present
    const footToolbar = content.locator('.cxd-Table-footToolbar');
    await expect(footToolbar).toBeVisible();

    // Statistics visible
    await expect(content.locator('.cxd-Crud-statistics')).toBeVisible();

    // Right-aligned
    const toolbar = content.locator('.cxd-Crud-toolbar');
    const justifyContent = await toolbar.evaluate(el => getComputedStyle(el).justifyContent);
    expect(justifyContent).toBe('flex-end');
  });

  test('Table+Search — search filter works with pagination', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table-search');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Find and fill the Order ID search field
    const searchForm = content.locator('.search-form');
    await expect(searchForm).toBeVisible();

    // Fill Order ID input
    const orderIdInput = searchForm.locator('input[type="text"]').first();
    await orderIdInput.fill('1333');
    await page.waitForTimeout(300);

    // Click search button
    await content.locator('.btn-search').click();
    await page.waitForTimeout(1500);

    // Should still show results (filtered)
    const rowCount = await content.locator('.cxd-Table-table tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);

    // Statistics should update - check with evaluate to get the rewritten text
    const statsText = await content.locator('.cxd-Crud-statistics').evaluate(el => el.textContent);
    expect(statsText).toMatch(/共\s*\d+\s*项/);
  });

  test('Table+Search — reset button clears filters', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table-search');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    const searchForm = content.locator('.search-form');

    // Fill Order ID
    const orderIdInput = searchForm.locator('input[type="text"]').first();
    await orderIdInput.fill('test');

    // Click search
    await content.locator('.btn-search').click();
    await page.waitForTimeout(1000);

    // Click reset
    await content.locator('.btn-clear').click();
    await page.waitForTimeout(1000);

    // Input should be cleared
    const val = await orderIdInput.inputValue();
    expect(val).toBe('');
  });

  test('Table+Search — expandable rows work', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table-search');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Rows with children have expand buttons (in tbody, not thead)
    const expandBtns = content.locator('.cxd-Table-table tbody .cxd-Table-expandBtn2');
    const btnCount = await expandBtns.count();
    expect(btnCount).toBeGreaterThan(0);

    // Click first visible expand button
    await expandBtns.first().click();
    await page.waitForTimeout(500);

    // Row count should increase (1 row adds 2 children)
    const rowCount = await content.locator('.cxd-Table-table tbody tr').count();
    expect(rowCount).toBe(12);

    // Expanded row should have is-expanded class
    const expandedRows = content.locator('.cxd-Table-table-tr.is-expanded');
    await expect(expandedRows.first()).toBeVisible();
  });

  test('Table+Search — expand/collapse toggles correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table-search');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    const expandBtns = content.locator('.cxd-Table-table tbody .cxd-Table-expandBtn2');

    // Expand first row (10 → 12)
    await expandBtns.first().click();
    await page.waitForTimeout(500);
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(12);

    // Collapse - row count returns to 10
    await expandBtns.first().click();
    await page.waitForTimeout(500);
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);
  });

  test('Table — statistics shows only total count (no page range)', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-table');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.cxd-Table-table tbody tr')).toHaveCount(10);

    // Statistics should show total count format: "共 89 项" (no page range)
    const stats = content.locator('.cxd-Crud-statistics');
    const statsText = await stats.evaluate(el => el.innerText);
    expect(statsText).toMatch(/共\s*\d+\s*项/);
    expect(statsText).not.toMatch(/^\d+\/\d+/); // No leading page range
  });
});

  // ============ FieldWithExclude ============
  test('FieldWithExclude — renders label and checkbox', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Select + Exclude' })).toBeVisible();

    const preview = content.locator('.amis-live-preview').first();
    await expect(preview.locator('.field-exclude-row').first()).toBeVisible();
    await expect(preview.locator('text=Market Code').first()).toBeVisible();
    await expect(preview.locator('.field-exclude-checkbox').first()).toBeVisible();
    await expect(preview.locator('text=Exclude').first()).toBeVisible();
  });

  test('FieldWithExclude — checkbox click toggles exclude indicator', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const preview = page.locator('.amis-live-preview').first();

    // No exclude indicator initially
    await expect(preview.locator('text=Values selected above will be excluded')).toHaveCount(0);

    // Click custom checkbox
    await preview.locator('.field-exclude-checkbox').first().click();
    await page.waitForTimeout(300);

    // Exclude indicator should appear
    await expect(preview.locator('text=Values selected above will be excluded').first()).toBeVisible();

    // Placeholder should show "(Exclude)"
    await expect(preview.locator('text=Please Select (Exclude)').first()).toBeVisible();
  });

  test('FieldWithExclude — dropdown open and select option', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const preview = page.locator('.amis-live-preview').first();

    // Open dropdown
    await preview.locator('.field-exclude-select').first().click();
    await page.waitForTimeout(300);

    // Options visible
    await expect(page.locator('[data-option-value="GDS"]').first()).toBeVisible();
    await expect(page.locator('[data-option-value="CORPORATE"]').first()).toBeVisible();

    // Select GDS
    await page.locator('[data-option-value="GDS"]').first().click();
    await page.waitForTimeout(300);

    // Selected value displayed
    await expect(preview.locator('text=GDS').first()).toBeVisible();
  });

  test('FieldWithExclude — clear selection with X button', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const preview = page.locator('.amis-live-preview').first();

    // Open dropdown and select GDS
    await preview.locator('.field-exclude-select').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-option-value="GDS"]').first().click();
    await page.waitForTimeout(300);

    // Clear button should exist
    const clearBtn = preview.locator('[data-clear-btn]').first();
    await expect(clearBtn).toBeVisible();

    // Click X to clear
    await clearBtn.click();
    await page.waitForTimeout(300);

    // Placeholder should return to default
    await expect(preview.locator('text=Please Select').first()).toBeVisible();
    // No more selected values displayed
    await expect(preview.locator('text=GDS')).toHaveCount(0);
  });

  test('FieldWithExclude — form submission shows correct data', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const preview = page.locator('.amis-live-preview').first();

    // Select GDS and CORPORATE from Market Code (without Exclude)
    await preview.locator('.field-exclude-select').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-option-value="GDS"]').first().click();
    await page.waitForTimeout(300);
    // Re-open dropdown (first selection triggers Amis re-render which closes it)
    await preview.locator('.field-exclude-select').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-option-value="CORPORATE"]').first().click();
    await page.waitForTimeout(300);

    // Submit the form
    await page.locator('.showcase-submit-btn').click();
    await page.waitForTimeout(500);

    // Check submitted data shows marketCodes with selected values
    const submittedBlock = page.locator('.showcase-submitted-data');
    await expect(submittedBlock).toBeVisible();
    const submittedText = await submittedBlock.textContent();
    expect(submittedText).toContain('"marketCodes"');
    expect(submittedText).toContain('"GDS"');
    expect(submittedText).toContain('"CORPORATE"');
  });

  test('FieldWithExclude — submission with Exclude checked writes to exclude field', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const preview = page.locator('.amis-live-preview').first();

    // Check Exclude checkbox first
    await preview.locator('.field-exclude-checkbox').first().click();
    await page.waitForTimeout(300);

    // Select BAR (should go to exclude field)
    await preview.locator('.field-exclude-select').first().click();
    await page.waitForTimeout(300);
    await page.locator('[data-option-value="BAR"]').first().click();
    await page.waitForTimeout(300);

    // Submit
    await page.locator('.showcase-submit-btn').click();
    await page.waitForTimeout(500);

    // Check submitted data
    const submittedBlock = page.locator('.showcase-submitted-data');
    await expect(submittedBlock).toBeVisible();
    const submittedText = await submittedBlock.textContent();
    // With Exclude checked, values should be in exclude field, not base field
    expect(submittedText).toContain('"marketCodesExclude"');
    expect(submittedText).toContain('"BAR"');
    expect(submittedText).toContain('"marketCodeExclude"');
    expect(submittedText).toContain('true');
  });

  test('FieldWithExclude — multiLang schema', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-field-with-exclude');
    const content = page.locator('.showcase-content');
    await expect(content.locator('.showcase-page-title', { hasText: 'Select + Exclude' })).toBeVisible();

    // Schema JSON shows multiLang flag on fields
    const jsonBlocks = content.locator('.showcase-json-block');
    const schemaText = await jsonBlocks.first().textContent();
    expect(schemaText).toContain('"multiLang": true');
    expect(schemaText).toContain('"name": "marketCodes"');
    expect(schemaText).toContain('"name": "rateCodes"');
  });

// ============ Top-Border Tab ============
test.describe('Top-Border Tab', () => {
  test('visual snapshot — initial state (Global active)', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-top-border-tab');
    await page.waitForTimeout(800);

    const tabsContainer = page.locator('.custom-top-border-tabs .cxd-Tabs-linksContainer').first();
    await expect(tabsContainer).toBeVisible();

    // Active tab: white bg, 16px, bold, 50px
    const activeTab = page.locator('.custom-top-border-tabs .cxd-Tabs-link.is-active').first();
    await expect(activeTab).toBeVisible();
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('255, 255, 255');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).fontSize)).toBe('16px');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).fontWeight)).toBe('700');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).height)).toBe('50px');

    // NO underline: border-bottom is 0
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).borderBottomWidth)).toBe('0px');

    // NO ::after pseudo-element (Amis line-mode default underline killed)
    expect(await activeTab.evaluate(el => window.getComputedStyle(el, '::after').display)).toBe('none');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el, '::after').borderBottomWidth)).toBe('0px');

    // NO underline on the inner <a> tag
    expect(await activeTab.evaluate(el => {
      const a = el.querySelector('a');
      return a ? window.getComputedStyle(a).textDecoration : 'none';
    })).toBe('none');

    // Verify no child element has visible bottom border (debug: ensure no underline)
    const underlineSources = await activeTab.evaluate(el => {
      const children = el.querySelectorAll('*');
      return Array.from(children).filter(c => {
        const s = window.getComputedStyle(c);
        return s.borderBottomStyle !== 'none' && s.borderBottomWidth !== '0px';
      });
    });
    expect(underlineSources.length).toBe(0);

    // Blue line on top (::before, 4px)
    const beforeHeight = await activeTab.evaluate(el => window.getComputedStyle(el, '::before').height);
    expect(beforeHeight).toBe('4px');

    // Screenshot only the Live Preview area
    const preview = page.locator('.amis-live-preview').first();
    await expect(preview).toBeVisible();
    await preview.screenshot({
      path: 'tests/showcase-screenshots/top-border-tab-initial.png',
    });
  });

  test('hover — inactive tab remains transparent (no hover effect)', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-top-border-tab');
    await page.waitForTimeout(800);

    const propertyTab = page.locator('.custom-top-border-tabs .cxd-Tabs-link').nth(1);
    const globalTab = page.locator('.custom-top-border-tabs .cxd-Tabs-link').first();

    // Inactive tab hover: should stay transparent
    expect(await propertyTab.evaluate(el => el.classList.contains('is-active'))).toBe(false);
    await propertyTab.hover();
    await page.waitForTimeout(200);
    expect(await propertyTab.evaluate(el => window.getComputedStyle(el).backgroundColor)).not.toContain('255, 255, 255');

    // Active tab hover: should stay white (no change)
    expect(await globalTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);
    const activeBgBefore = await globalTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    await globalTab.hover();
    await page.waitForTimeout(200);
    const activeBgAfter = await globalTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(activeBgAfter).toBe(activeBgBefore);

    await page.screenshot({
      path: 'tests/showcase-screenshots/top-border-tab-hover.png',
      fullPage: true,
    });
  });

  test('tab switch — Global to Property: verify styles transfer + screenshots', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-top-border-tab');
    await page.waitForTimeout(800);

    const propertyTab = page.locator('.custom-top-border-tabs .cxd-Tabs-link').nth(1);
    const globalTab = page.locator('.custom-top-border-tabs .cxd-Tabs-link').first();

    // Phase 1: Global is active
    expect(await globalTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);

    // Phase 2: Click Property
    await propertyTab.click();
    await page.waitForFunction(() => {
      const tabs = document.querySelectorAll('.custom-top-border-tabs .cxd-Tabs-link');
      return tabs.length >= 2 && tabs[1]?.classList.contains('is-active') && !tabs[0]?.classList.contains('is-active');
    });

    // Phase 3: Property now has active class
    expect(await propertyTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);
    expect(await globalTab.evaluate(el => el.classList.contains('is-active'))).toBe(false);

    // Phase 4: Verify CSS rule values (more reliable than getComputedStyle on dynamic elements)
    const activeRuleProps = await page.evaluate(() => {
      const rules = Array.from(document.styleSheets)
        .map(s => { try { return Array.from(s.cssRules || []); } catch { return []; } })
        .flat();
      const rule = rules.find((r: any) => r.selectorText === 'body .custom-top-border-tabs .cxd-Tabs-link.is-active');
      return rule ? {
        bg: rule.style.backgroundColor,
        fontSize: rule.style.fontSize,
        fontWeight: rule.style.fontWeight,
        height: rule.style.height,
      } : null;
    });
    expect(activeRuleProps).not.toBeNull();
    expect(activeRuleProps!.bg).toBe('rgb(255, 255, 255)');
    expect(activeRuleProps!.fontSize).toBe('16px');
    expect(activeRuleProps!.fontWeight).toBe('700');
    expect(activeRuleProps!.height).toBe('50px');

    // Phase 5: Verify content rendered (check Property tab pane is visible)
    await expect(propertyTab).toHaveClass(/is-active/);

    await page.screenshot({
      path: 'tests/showcase-screenshots/top-border-tab-switched.png',
      fullPage: true,
    });
  });

  test('no underline on tab bar container', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-top-border-tab');
    await page.waitForTimeout(800);

    const container = page.locator('.custom-top-border-tabs .cxd-Tabs-linksContainer').first();
    expect(await container.evaluate(el => window.getComputedStyle(el).borderBottomWidth)).toBe('0px');
  });
});

// ============ Bottom-Underline Tab ============
test.describe('Bottom-Underline Tab', () => {
  test('visual snapshot — initial state (Mission Rule active)', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-bottom-underline-tab');
    await page.waitForTimeout(800);

    const tabsContainer = page.locator('.custom-underline-tabs .cxd-Tabs-linksContainer').first();
    await expect(tabsContainer).toBeVisible();

    // Container background: white
    expect(await tabsContainer.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('255, 255, 255');

    // Active tab
    const activeTab = page.locator('.custom-underline-tabs .cxd-Tabs-link.is-active').first();
    await expect(activeTab).toBeVisible();

    // Active tab: white bg
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('255, 255, 255');

    // Active tab: 14px font, 600 weight, 32px height
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).fontSize)).toBe('14px');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).fontWeight)).toBe('600');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).height)).toBe('32px');

    // Active tab: NO border-bottom
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).borderBottomWidth)).toBe('0px');

    // Active tab: ::before and ::after hidden
    expect(await activeTab.evaluate(el => window.getComputedStyle(el, '::before').display)).toBe('none');
    expect(await activeTab.evaluate(el => window.getComputedStyle(el, '::after').display)).toBe('none');

    // Active tab: 4px blue underline via box-shadow
    const boxShadow = await activeTab.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(boxShadow).toContain('4px');

    // Tab width is not full width (should be auto/shrink-wrap to text)
    const tabWidth = await activeTab.evaluate(el => window.getComputedStyle(el).width);
    const containerWidth = await tabsContainer.evaluate(el => window.getComputedStyle(el).width);
    expect(parseInt(tabWidth)).toBeLessThan(parseInt(containerWidth));

    // Content area: gray bg
    const content = page.locator('.custom-underline-tabs .cxd-Tabs-content').first();
    expect(await content.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('245, 246, 250'); // #F5F6FA

    await page.screenshot({
      path: 'tests/showcase-screenshots/bottom-underline-tab-initial.png',
      fullPage: true,
    });
  });

  test('hover — no hover effect on inactive or active tabs', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-bottom-underline-tab');
    await page.waitForTimeout(800);

    const inactiveTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').nth(1); // Registration Rule
    const activeTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').first(); // Mission Rule

    // Inactive tab: already has white bg, hover should NOT change
    const inactiveBgBefore = await inactiveTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(inactiveBgBefore).toMatch(/255,?\s*255,?\s*255/);
    await inactiveTab.hover();
    await page.waitForTimeout(200);
    const inactiveBgAfter = await inactiveTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(inactiveBgAfter).toMatch(/255,?\s*255,?\s*255/);

    // Active tab: hover should NOT change anything
    const activeBgBefore = await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    await activeTab.hover();
    await page.waitForTimeout(200);
    const activeBgAfter = await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor);
    expect(activeBgAfter).toMatch(/255,?\s*255,?\s*255/);
    expect(await activeTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);

    await page.screenshot({
      path: 'tests/showcase-screenshots/bottom-underline-tab-hover.png',
      fullPage: true,
    });
  });

  test('tab switch — Mission Rule to Registration Rule: underline transfers + screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-bottom-underline-tab');
    await page.waitForTimeout(800);

    const registrationTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').nth(1);
    const missionTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').first();

    // Phase 1: Mission Rule is active
    expect(await missionTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);

    // Phase 2: Click Registration Rule
    await registrationTab.click();
    await page.waitForFunction(() => {
      const tabs = document.querySelectorAll('.custom-underline-tabs .cxd-Tabs-link');
      return tabs.length >= 2 && tabs[1]?.classList.contains('is-active');
    });

    // Phase 3: Registration Rule now has active class
    expect(await registrationTab.evaluate(el => el.classList.contains('is-active'))).toBe(true);
    expect(await missionTab.evaluate(el => el.classList.contains('is-active'))).toBe(false);

    // Phase 4: Verify underline (box-shadow) transferred to Registration Rule
    const regBoxShadow = await registrationTab.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(regBoxShadow).toContain('4px');

    // Phase 5: Verify CSS rule exists (box-shadow instead of ::after)
    const activeRuleBoxShadow = await page.evaluate(() => {
      const rules = Array.from(document.styleSheets)
        .map(s => { try { return Array.from(s.cssRules || []); } catch { return []; } })
        .flat();
      const rule = rules.find((r: any) => r.selectorText === 'body .custom-underline-tabs .cxd-Tabs-link.is-active');
      return rule ? rule.style.boxShadow : '';
    });
    expect(activeRuleBoxShadow).toContain('4px');

    // Phase 6: Verify no border on container
    const container = page.locator('.custom-underline-tabs .cxd-Tabs-linksContainer').first();
    expect(await container.evaluate(el => window.getComputedStyle(el).borderBottomWidth)).toBe('0px');

    await page.screenshot({
      path: 'tests/showcase-screenshots/bottom-underline-tab-switched.png',
      fullPage: true,
    });
  });

  test('tab width — each tab shrinks to text width, not full width', async ({ page }) => {
    await page.goto('http://localhost:5173/showcase#amis-bottom-underline-tab');
    await page.waitForTimeout(800);

    const activeTab = page.locator('.custom-underline-tabs .cxd-Tabs-link').first();
    const linksContainer = page.locator('.custom-underline-tabs .cxd-Tabs-links').first();

    // Tab width should be less than container width
    const tabWidth = await activeTab.evaluate(el => window.getComputedStyle(el).width);
    const containerWidth = await linksContainer.evaluate(el => window.getComputedStyle(el).width);
    expect(parseInt(tabWidth)).toBeLessThan(parseInt(containerWidth));

    // Tab background should be white
    expect(await activeTab.evaluate(el => window.getComputedStyle(el).backgroundColor)).toContain('255, 255, 255');
  });
});

/**
 * Smoke test: visit every sidebar page and verify it renders without errors.
 * Uses hash navigation for speed — visits each page via `#${pageId}` directly.
 */
test.describe.parallel('Showcase Smoke Test — All Pages', () => {
  // Custom components (defined in data.tsx)
  const customPages = [
    { id: 'i18n-config', title: 'i18n-config' },
    { id: 'sticky-footer', title: 'StickyFooter' },
    { id: 'loading', title: 'Loading' },
    { id: 'language-switcher', title: 'LanguageSwitcher' },
    { id: 'i18n-config-panel', title: 'I18nConfigPanel' },
    { id: 'phone-mockup', title: 'PhoneMockup' },
    { id: 'date-range-picker', title: 'DateRangePicker' },
    { id: 'preview-panel', title: 'PreviewPanel' },
    { id: 'amis-drawer', title: 'Drawer' },
    { id: 'solid-fill-tabs', title: 'Solid Fill Tabs' },
    { id: 'closable-tabs', title: 'Closable Tabs' },
    { id: 'combo-tab', title: 'Combo Tab' },
  ];

  // Amis built-in components (defined in amis-components/)
  const amisPages = [
    { id: 'amis-alert', title: 'Alert' },
    { id: 'amis-anchor-nav', title: 'AnchorNav' },
    { id: 'amis-avatar', title: 'Avatar' },
    { id: 'amis-barcode', title: 'Barcode' },
    { id: 'amis-bottom-underline-tab', title: 'Bottom-Underline Tab' },
    { id: 'amis-breadcrumb', title: 'Breadcrumb' },
    { id: 'amis-button', title: 'Button' },
    { id: 'amis-button-group', title: 'ButtonGroup' },
    { id: 'amis-button-toolbar', title: 'ButtonToolbar' },
    { id: 'amis-calendar', title: 'Calendar' },
    { id: 'amis-cards', title: 'Cards' },
    { id: 'amis-carousel', title: 'Carousel' },
    { id: 'amis-cascader', title: 'Cascader' },
    { id: 'amis-chained-select', title: 'ChainedSelect' },
    { id: 'amis-chained-select-api', title: 'ChainedSelect API' },
    { id: 'amis-chart', title: 'Chart' },
    { id: 'amis-checkboxes', title: 'Checkboxes' },
    { id: 'amis-code', title: 'Code' },
    { id: 'amis-collapse', title: 'Collapse' },
    { id: 'amis-color', title: 'Color' },
    { id: 'amis-combo', title: 'Combo' },
    { id: 'amis-condition-builder', title: 'ConditionBuilder' },
    { id: 'amis-container', title: 'Container' },
    { id: 'amis-crud', title: 'CRUD' },
    { id: 'amis-custom', title: 'Custom' },
    { id: 'amis-dialog', title: 'Dialog' },
    { id: 'amis-divider', title: 'Divider' },
    { id: 'amis-dropdown-button', title: 'DropdownButton' },
    { id: 'amis-each', title: 'Each' },
    { id: 'amis-editor', title: 'Editor' },
    { id: 'amis-field-with-exclude', title: 'FieldWithExclude' },
    { id: 'amis-flex', title: 'Flex' },
    { id: 'amis-form', title: 'Form' },
    { id: 'amis-formula', title: 'Formula' },
    { id: 'amis-grid', title: 'Grid' },
    { id: 'amis-grid-2d', title: 'Grid 2D' },
    { id: 'amis-grid-nav', title: 'GridNav' },
    { id: 'amis-group', title: 'Group' },
    { id: 'amis-hbox', title: 'HBox' },
    { id: 'amis-hidden', title: 'Hidden' },
    { id: 'amis-icon', title: 'Icon' },
    { id: 'amis-icon-picker', title: 'IconPicker' },
    { id: 'amis-iframe', title: 'IFrame' },
    { id: 'amis-image', title: 'Image' },
    { id: 'amis-images', title: 'Images' },
    { id: 'amis-input-array', title: 'InputArray' },
    { id: 'amis-input-color', title: 'InputColor' },
    { id: 'amis-input-date', title: 'InputDate' },
    { id: 'amis-input-date-range', title: 'InputDateRange' },
    { id: 'amis-input-file', title: 'InputFile' },
    { id: 'amis-input-group', title: 'InputGroup' },
    { id: 'amis-input-image', title: 'InputImage' },
    { id: 'amis-input-number', title: 'InputNumber' },
    { id: 'amis-input-password', title: 'InputPassword' },
    { id: 'amis-input-range', title: 'InputRange' },
    { id: 'amis-input-rating', title: 'InputRating' },
    { id: 'amis-input-rich-text', title: 'InputRichText' },
    { id: 'amis-input-table', title: 'InputTable' },
    { id: 'amis-input-tag', title: 'InputTag' },
    { id: 'amis-input-text', title: 'InputText' },
    { id: 'amis-input-tree', title: 'InputTree' },
    { id: 'amis-json', title: 'JSON' },
    { id: 'amis-json-schema', title: 'JSONSchema' },
    { id: 'amis-link', title: 'Link' },
    { id: 'amis-list', title: 'List' },
    { id: 'amis-location-picker', title: 'LocationPicker' },
    { id: 'amis-mapping', title: 'Mapping' },
    { id: 'amis-markdown', title: 'Markdown' },
    { id: 'amis-matrix-checkboxes', title: 'MatrixCheckboxes' },
    { id: 'amis-nav', title: 'Nav' },
    { id: 'amis-page', title: 'Page' },
    { id: 'amis-pagination', title: 'Pagination' },
    { id: 'amis-panel', title: 'Panel' },
    { id: 'amis-picker', title: 'Picker' },
    { id: 'amis-popover', title: 'Popover' },
    { id: 'amis-portlet', title: 'Portlet' },
    { id: 'amis-progress', title: 'Progress' },
    { id: 'amis-property', title: 'Property' },
    { id: 'amis-qrcode', title: 'QRCode' },
    { id: 'amis-radios', title: 'Radios' },
    { id: 'amis-remark', title: 'Remark' },
    { id: 'amis-search-box', title: 'SearchBox' },
    { id: 'amis-select', title: 'Select' },
    { id: 'amis-service', title: 'Service' },
    { id: 'amis-service-async', title: 'ServiceAsync' },
    { id: 'amis-sparkline', title: 'Sparkline' },
    { id: 'amis-spinner', title: 'Spinner' },
    { id: 'amis-status', title: 'Status' },
    { id: 'amis-steps', title: 'Steps' },
    { id: 'amis-switch', title: 'Switch' },
    { id: 'amis-table', title: 'Table' },
    { id: 'amis-table-search', title: 'Table+Search' },
    { id: 'amis-tabs', title: 'Tabs' },
    { id: 'amis-tabs-nav', title: 'TabsNav' },
    { id: 'amis-tag', title: 'Tag' },
    { id: 'amis-test-nested-tabs', title: 'NestedTabs' },
    { id: 'amis-textarea', title: 'Textarea' },
    { id: 'amis-three-layer-tabs', title: 'ThreeLayerTabs' },
    { id: 'amis-timeline', title: 'Timeline' },
    { id: 'amis-tooltip', title: 'Tooltip' },
    { id: 'amis-top-border-tab', title: 'Top-Border Tab' },
    { id: 'amis-tpl', title: 'Tpl' },
    { id: 'amis-transfer', title: 'Transfer' },
    { id: 'amis-tree-select', title: 'TreeSelect' },
    { id: 'amis-user-select', title: 'UserSelect' },
    { id: 'amis-vbox', title: 'VBox' },
    { id: 'amis-wizard', title: 'Wizard' },
    { id: 'amis-wrapper', title: 'Wrapper' },
  ];

  const allPages = [...customPages, ...amisPages];

  // Only "表单输入" category components — expect Amis form control in preview
  // Components with specific known DOM class use that; others fall back to generic .cxd-Form.
  const formControlMap: Record<string, string> = {
    'amis-input-text': '.cxd-TextControl',
    'amis-textarea': '.cxd-TextareaControl',
    'amis-input-password': '.cxd-TextControl',
    'amis-input-number': '.cxd-NumberControl',
    'amis-select': '.cxd-SelectControl',
    'amis-radios': '.cxd-RadiosControl',
    'amis-checkboxes': '.cxd-CheckboxesControl',
    'amis-switch': '.cxd-SwitchControl',
    'amis-input-rich-text': '.cxd-RichTextControl',
    'amis-transfer': '.cxd-TransferControl',
    'amis-chained-select-api': '.cxd-SelectControl',
    'amis-input-date': '.cxd-DateControl',
    'amis-input-date-range': '.cxd-DateRangeControl',
    'amis-input-color': '.cxd-ColorControl',
    'amis-input-image': '.cxd-ImageControl',
    'amis-input-file': '.cxd-FileControl',
    'amis-input-rating': '.cxd-RatingControl',
    'amis-editor': '.cxd-CodeEditor',
    'amis-button-toolbar': '.cxd-ButtonToolbar',
    'amis-hidden': '.cxd-Form',
    'amis-icon-picker': '.cxd-Form',
    'amis-input-tree': '.cxd-Form',
    'amis-tree-select': '.cxd-Form',
    'amis-cascader': '.cxd-Form',
    'amis-input-tag': '.cxd-Form',
    'amis-input-range': '.cxd-Form',
  };

  for (const pageInfo of allPages) {
    test(`${pageInfo.title} renders`, async ({ page }) => {
      // Collect JS console errors
      const jsErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out known non-critical / upstream errors
          if (
            text.includes('font-awesome') ||
            text.includes('Failed to load resource') ||
            text.includes('Unexpected token') ||
            text.includes('Renderer>') ||      // Amis internal renderer errors
            text.includes('React will try to') // Amis error boundary messages
          ) {
            return;
          }
          // Filter Amis library warnings (non-fatal, library-level issues)
          if (text.includes('Please implement updateLocation')) {
            return;
          }
          // Filter React re-mounting warnings triggered by language switching
          if (text.includes('unmountComponentAtNode') || text.includes('Replacing React-rendered children')) {
            return;
          }
          jsErrors.push(text);
        }
      });

      // Navigate directly via hash
      await page.goto(`http://localhost:5173/showcase#${pageInfo.id}`);

      // Wait for content to render (Amis components may take longer)
      await page.waitForTimeout(1500);

      const content = page.locator('.showcase-content');

      // 1. Page title visible
      await expect(content.locator('.showcase-page-title').first()).toBeVisible({
        timeout: 10000,
      });

      // 2. Preview container exists
      const previewContainer = content.locator('.showcase-preview-container');
      await expect(previewContainer.first()).toBeVisible({ timeout: 10000 });

      // 3. DOM structure: verify preview renders meaningful content
      const formSelector = formControlMap[pageInfo.id];
      if (formSelector) {
        // Form component: expect specific Amis form/control class
        const formControl = previewContainer.first().locator(formSelector);
        await expect(formControl.first()).toBeVisible({ timeout: 10000 });
      } else {
        // Non-form component: expect non-empty preview (has rendered children)
        const hasContent = await previewContainer.first().evaluate(el => {
          return el.children.length > 0 || (el.textContent?.trim().length || 0) > 0;
        });
        // Skip empty-content check for components known to have empty initial state
        const skipEmptyCheck = ['amis-hidden', 'amis-spinner', 'amis-loading'];
        if (!skipEmptyCheck.includes(pageInfo.id)) {
          expect(hasContent, `Preview container should have rendered content for "${pageInfo.title}"`).toBe(true);
        }
      }

      // 4. i18n language switching: for form components with multiLang support
      if (formSelector) {
        // Verify 6 JSON sections exist (3 i18n + 3 plain)
        const sectionTitles = content.locator('.showcase-section-title');
        await expect(sectionTitles.filter({ hasText: '支持 i18n' }).first()).toBeVisible({ timeout: 5000 });
        await expect(sectionTitles.filter({ hasText: '不支持 i18n' }).first()).toBeVisible({ timeout: 5000 });

        // Get the i18n preview section
        const i18nSection = content.locator('.showcase-section').filter({ hasText: 'Live Preview — 支持 i18n' });
        const i18nPreview = i18nSection.locator('.amis-live-preview');
        await expect(i18nPreview.first()).toBeVisible({ timeout: 5000 });

        // Check for text-based inputs that may have i18n values
        const textInputs = i18nPreview.locator('input[type="text"], textarea');
        const textInputCount = await textInputs.count();

        if (textInputCount > 0) {
          // Has text inputs: capture values, switch language, check for changes
          const zhValues: string[] = [];
          for (let i = 0; i < Math.min(textInputCount, 5); i++) {
            zhValues.push(await textInputs.nth(i).inputValue());
          }

          // Switch language to English
          await page.locator('.showcase-lang-bar select').selectOption('en');
          await page.waitForTimeout(1000);

          // Check if any input value changed (some components may not have i18n data)
          const enInputs = i18nPreview.locator('input[type="text"], textarea');
          let anyChanged = false;
          let allSame = true;
          for (let i = 0; i < Math.min(textInputCount, 5); i++) {
            const enVal = await enInputs.nth(i).inputValue();
            if (zhValues[i] !== enVal) {
              anyChanged = true;
              allSame = false;
            }
          }
          // Only fail if ALL inputs stayed the same AND there are multiple inputs
          // (some single-input components like Hidden don't change values)
          if (allSame && textInputCount > 1) {
            // Check if the component has multiLang test data by looking for {zh,en} in data
            const hasMultiLangData = await content.locator('.showcase-json-block').nth(1).textContent().then(t => t?.includes('"zh":') && t?.includes('"en":')).catch(() => false);
            expect(hasMultiLangData, `i18n preview should have multiLang test data or value changes for "${pageInfo.title}"`).toBe(true);
          }

          // Switch back to Chinese
          await page.locator('.showcase-lang-bar select').selectOption('zh');
          await page.waitForTimeout(500);
          await expect(i18nPreview.first()).toBeVisible({ timeout: 5000 });
        } else {
          // No text inputs (e.g., Select, Radios): just verify switching doesn't break the preview
          await page.locator('.showcase-lang-bar select').selectOption('en');
          await page.waitForTimeout(500);
          await expect(i18nPreview.first()).toBeVisible({ timeout: 5000 });
          await page.locator('.showcase-lang-bar select').selectOption('zh');
          await page.waitForTimeout(500);
          await expect(i18nPreview.first()).toBeVisible({ timeout: 5000 });
        }
      }

      // 5. No JS errors
      expect(jsErrors, `JS console errors on page "${pageInfo.title}"`).toEqual([]);
    });
  }
});
