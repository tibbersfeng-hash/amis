import { test, expect } from '@playwright/test';

const URL = '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang';

// Language switch helper — inline the selectOption calls (passing page to helper functions causes Playwright interaction issues)
const langSel = (page: any) => page.locator('.language-switcher select');

test.describe('全部组件：编辑→切英→回中→ persist 保留', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('input-text', async ({ page }) => {
    const loc = () => page.locator('input[name="textField"]');
    const init = await loc().inputValue();
    await loc().fill('编辑文本');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('编辑文本')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('编辑文本');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('textarea', async ({ page }) => {
    const loc = () => page.locator('textarea[name="textArea"]');
    const init = await loc().inputValue();
    await loc().fill('编辑多行');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('编辑多行')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('编辑多行');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('input-email', async ({ page }) => {
    const loc = () => page.locator('input[name="email"]');
    const init = await loc().inputValue();
    await loc().fill('edit@t.com');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('edit@t.com')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('edit@t.com');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('input-url', async ({ page }) => {
    const loc = () => page.locator('input[name="url"]');
    const init = await loc().inputValue();
    await loc().fill('https://edit.com');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('https://edit.com')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('https://edit.com');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('input-password', async ({ page }) => {
    const loc = () => page.locator('input[name="password"]');
    const init = await loc().inputValue();
    await loc().fill('edit-pwd');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('edit-pwd')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('edit-pwd');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('input-number', async ({ page }) => {
    const loc = () => page.getByPlaceholder('请输入数字');
    const init = await loc().inputValue();
    await loc().fill('777');
    await page.waitForTimeout(500);
    await expect(async () => expect(await loc().inputValue()).toBe('777')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await loc().inputValue()).toBe('777');
    expect(await loc().inputValue()).not.toBe(init);
  });

  test('select', async ({ page }) => {
    const getValue = () => page.evaluate(() => document.querySelector('.antd-Select-value')?.textContent?.trim() ?? '');
    const init = await getValue();
    await page.locator('.antd-Select').click();
    await page.waitForTimeout(300);
    await page.locator('.antd-Select-option').filter({ hasText: '选项二' }).click();
    await page.waitForTimeout(300);
    await expect(async () => expect(await getValue()).toBe('选项二')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('选项二');
    expect(await getValue()).not.toBe(init);
  });

  test('radios', async ({ page }) => {
    const getValue = () => page.evaluate(() => document.querySelector('.antd-Checkbox--radio--default.checked')?.textContent?.trim() ?? '');
    const init = await getValue();
    await page.locator('.antd-Checkbox--radio--default').filter({ hasText: '否' }).click();
    await page.waitForTimeout(300);
    await expect(async () => expect(await getValue()).toBe('否')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('否');
    expect(await getValue()).not.toBe(init);
  });

  test('switch', async ({ page }) => {
    const getValue = () => page.evaluate(() => document.querySelector('.antd-Switch.is-checked') ? '开' : '关');
    const init = await getValue();
    await page.locator('.antd-Switch').click({ force: true });
    await page.waitForTimeout(300);
    await expect(async () => expect(await getValue()).toBe('关')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('关');
    expect(await getValue()).not.toBe(init);
  });

  test('input-date', async ({ page }) => {
    const getValue = () => page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (inp.placeholder?.includes('日期')) return inp.value;
      }
      return '';
    });
    const init = await getValue();
    await page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (!inp.placeholder?.includes('日期')) continue;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(inp, '2026-12-25');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);
    await expect(async () => expect(await getValue()).toBe('2026-12-25')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('2026-12-25');
    expect(await getValue()).not.toBe(init);
  });

  test('input-month', async ({ page }) => {
    const getValue = () => page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (inp.placeholder?.includes('月份')) return inp.value;
      }
      return '';
    });
    const init = await getValue();
    await page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (!inp.placeholder?.includes('月份')) continue;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(inp, '2027-03');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);
    await expect(async () => expect(await getValue()).toBe('2027-03')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('2027-03');
    expect(await getValue()).not.toBe(init);
  });

  test('input-rating', async ({ page }) => {
    const init = String(await page.evaluate(() => document.querySelectorAll('.antd-Rating-star.is-active').length));
    expect(init).toBe('2');
    await page.locator('.antd-Rating-star').nth(3).click();
    await page.waitForTimeout(500);
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    const after = String(await page.evaluate(() => document.querySelectorAll('.antd-Rating-star.is-active').length));
    expect(after).toBe('4');
    expect(after).not.toBe(init);
  });

  test('input-tag', async ({ page }) => {
    await expect(page.locator('input[name="tag"]')).toBeVisible();
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    await expect(page.locator('input[name="tag"]')).toBeVisible();
  });

  test('input-datetime', async ({ page }) => {
    const getValue = () => page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (inp.placeholder?.includes('日期以及时间')) return inp.value;
      }
      return '';
    });
    const init = await getValue();
    await page.evaluate(() => {
      const pickers = document.querySelectorAll('.antd-DatePicker-input');
      for (const p of pickers) {
        const inp = p as HTMLInputElement;
        if (!inp.placeholder?.includes('日期以及时间')) continue;
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(inp, '2026-07-15 10:00:00');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await page.waitForTimeout(500);
    await expect(async () => expect(await getValue()).toBe('2026-07-15 10:00:00')).toPass({ timeout: 5000 });
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    expect(await getValue()).toBe('2026-07-15 10:00:00');
    expect(await getValue()).not.toBe(init);
  });

  test('input-date-range', async ({ page }) => {
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.antd-DateRangePicker')).toBeVisible();
  });

  test('field-with-exclude 切换不崩', async ({ page }) => {
    await expect(page.locator('.field-with-exclude-v2')).toBeVisible();
    await langSel(page).selectOption('en'); await page.waitForTimeout(1000);
    await langSel(page).selectOption('zh'); await page.waitForTimeout(1000);
    await expect(page.locator('.field-with-exclude-v2')).toBeVisible();
  });
});
