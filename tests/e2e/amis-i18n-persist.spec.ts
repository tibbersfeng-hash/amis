import { test, expect, Page } from '@playwright/test';

const URL = '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang';

async function sw(page: Page, lang: string) {
  await page.locator('.language-switcher select').selectOption(lang);
  await page.waitForTimeout(1000);
}

/**
 * 核心测试模板：记录初始值 → 编辑 → 断言编辑生效 → 切英回中 → persist 保留
 * 返回值: 初始值（可用于 assert after !== init）
 */
async function assertPersist(
  page: Page,
  getValue: () => Promise<string>,
  editAction: () => Promise<void>,
  editedValue: string | RegExp,
) {
  const init = await getValue();
  await editAction();
  await expect(async () => {
    const v = await getValue();
    if (editedValue instanceof RegExp) expect(v).toMatch(editedValue);
    else expect(v).toBe(editedValue);
  }).toPass({ timeout: 5000 });
  await sw(page, 'en');
  await sw(page, 'zh');
  await expect(async () => {
    const v = await getValue();
    if (editedValue instanceof RegExp) expect(v).toMatch(editedValue);
    else expect(v).toBe(editedValue);
  }).toPass({ timeout: 5000 });
  expect(await getValue()).not.toBe(init);
}

test.describe('全部组件：编辑→切英→回中→ persist 保留', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('input-text', async ({ page }) => {
    const loc = () => page.locator('input[name="textField"]');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('编辑文本'),
      '编辑文本');
  });
  test('textarea', async ({ page }) => {
    const loc = () => page.locator('textarea[name="textArea"]');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('编辑多行'),
      '编辑多行');
  });
  test('input-email', async ({ page }) => {
    const loc = () => page.locator('input[name="email"]');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('edit@t.com'),
      'edit@t.com');
  });
  test('input-url', async ({ page }) => {
    const loc = () => page.locator('input[name="url"]');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('https://edit.com'),
      'https://edit.com');
  });
  test('input-password', async ({ page }) => {
    const loc = () => page.locator('input[name="password"]');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('edit-pwd'),
      'edit-pwd');
  });
  test('input-number', async ({ page }) => {
    const loc = () => page.getByPlaceholder('请输入数字');
    await assertPersist(page,
      () => loc().inputValue(),
      () => loc().fill('777'),
      '777');
  });
  test('select 渲染正常', async ({ page }) => {
    await expect(page.locator('.cxd-Select')).toBeVisible();
    await sw(page, 'en'); await sw(page, 'zh');
    await expect(page.locator('.cxd-Select')).toBeVisible();
  });
  test('radios', async ({ page }) => {
    await assertPersist(page,
      () => page.evaluate(() => document.querySelector('.cxd-Checkbox--radio--default.checked')?.textContent?.trim() ?? ''),
      async () => {
        await page.locator('.cxd-Checkbox--radio--default').filter({ hasText: '否' }).click();
        await page.waitForTimeout(300);
      },
      '否');
  });
  test('switch', async ({ page }) => {
    await assertPersist(page,
      () => page.evaluate(() => document.querySelector('.cxd-Switch.is-checked') ? '开' : '关'),
      async () => {
        await page.locator('.cxd-Switch').click();
        await page.waitForTimeout(300);
      },
      '关');
  });
  test('input-date / month 渲染正常', async ({ page }) => {
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
    await expect(page.getByPlaceholder('请选择月份')).toHaveValue('2026-06');
    await sw(page, 'en'); await sw(page, 'zh');
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
    await expect(page.getByPlaceholder('请选择月份')).toHaveValue('2026-06');
  });
  test('input-rating', async ({ page }) => {
    const init = String(await page.evaluate(() => document.querySelectorAll('.cxd-Rating-star.is-active').length));
    expect(init).toBe('2');
    await page.locator('.cxd-Rating-star').nth(3).click();
    await page.waitForTimeout(500);
    await sw(page, 'en'); await sw(page, 'zh');
    const after = String(await page.evaluate(() => document.querySelectorAll('.cxd-Rating-star.is-active').length));
    expect(after).toBe('4');
    expect(after).not.toBe(init);
  });
  test('input-tag', async ({ page }) => {
    await expect(page.locator('input[name="tag"]')).toBeVisible();
    await sw(page, 'en'); await sw(page, 'zh');
    await expect(page.locator('input[name="tag"]')).toBeVisible();
  });
});
