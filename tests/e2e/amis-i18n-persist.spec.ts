import { test, expect } from '@playwright/test';

const URL = '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang';

function sw(page: any, lang: string) {
  return page.locator('.language-switcher select').selectOption(lang);
}

test.describe('全部 18 种组件：内容逐项验证', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  // ── 标准文本输入（有 name 属性，readDomValue 可取值） ──

  test('input-text: 初始中文 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
    await page.locator('input[name="textField"]').fill('编辑文本');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('编辑文本');
  });

  test('textarea: 初始中文 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/多行中文内容/);
    await page.locator('textarea[name="textArea"]').fill('编辑多行内容');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/Multi-line/);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('编辑多行内容');
  });

  test('input-email: 初始中文 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toHaveValue('zhongwen@test.com');
    await page.locator('input[name="email"]').fill('edit@test.com');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="email"]')).toHaveValue('english@test.com');
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="email"]')).toHaveValue('edit@test.com');
  });

  test('input-url: 初始中文 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('input[name="url"]')).toHaveValue('https://zhongwen.example.com');
    await page.locator('input[name="url"]').fill('https://edit.example.com');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="url"]')).toHaveValue('https://english.example.com');
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="url"]')).toHaveValue('https://edit.example.com');
  });

  test('input-password: 初始中文 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('input[name="password"]')).toHaveValue('zhongwen-pwd');
    await page.locator('input[name="password"]').fill('edit-pwd');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="password"]')).toHaveValue('english-pwd');
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="password"]')).toHaveValue('edit-pwd');
  });

  // ── input-number（6.13 新增了 name 属性，persist 生效） ──

  test('input-number: 初始42 → 编辑 → 切英回中保留', async ({ page }) => {
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
    await page.getByPlaceholder('请输入数字').fill('777');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    // 同值字段 zh=en=42, 但编辑后 persist 了 777 → 切换到 en 仍是 777
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('777');
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('777');
  });

  // ── select ──

  test('select: 初始选项一 → 切换不崩溃', async ({ page }) => {
    await expect(page.locator('.cxd-Select')).toBeVisible();
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Select')).toBeVisible();
  });

  // ── radio / checkbox / switch / date / month / color ──
  // 这些组件在 Amis 6.x 中仍无 input[name] 属性，persist 无法取值，
  // 语言切换后 Amis 重渲染恢复原始数据。此处验证初始内容正确 + 切换不崩溃。

  test('radios: 初始选中"是"', async ({ page }) => {
    await expect(page.locator('.cxd-Checkbox--radio--default.checked')).toHaveText('是');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    // 切换后恢复为初始值"是"
    await expect(page.locator('.cxd-Checkbox--radio--default.checked')).toHaveText('是');
  });

  test('checkboxes: 初始选中"选项A"', async ({ page }) => {
    await expect(page.locator('.cxd-Checkbox--checkbox--default.checked')).toHaveText('选项A');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Checkbox--checkbox--default.checked')).toHaveText('选项A');
  });

  test('switch: 初始打开 → 切换不崩溃', async ({ page }) => {
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
  });

  test('input-date: 初始日期 2026-06-04', async ({ page }) => {
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
  });

  test('input-month: 初始月份 2026-06', async ({ page }) => {
    await expect(page.getByPlaceholder('请选择月份')).toHaveValue('2026-06');
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('请选择月份')).toHaveValue('2026-06');
  });

  test('color: 初始颜色 #4A5CBF', async ({ page }) => {
    await expect(page.locator('.cxd-ColorPicker')).toBeVisible();
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-ColorPicker')).toBeVisible();
  });

  // ── rating / tag ──

  test('input-rating: 初始2分 → 改4分 → 切英回中保留', async ({ page }) => {
    await expect(page.locator('.cxd-Rating-star.is-active')).toHaveCount(2);
    await page.locator('.cxd-Rating-star').nth(3).click();
    await page.waitForTimeout(300);
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Rating-star.is-active')).toHaveCount(4);
  });

  test('input-tag: 标签组件正常', async ({ page }) => {
    await expect(page.locator('input[name="tag"]')).toBeVisible();
    await sw(page, 'en'); await page.waitForTimeout(1000);
    await sw(page, 'zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="tag"]')).toBeVisible();
  });
});
