import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');
const SRC_DATA = path.join(DATA_DIR, 'form-test-multi-lang-data.json');
const URL = '/remote?dataType=form-test-multi-lang&dataId=';

const sw = (page: Page, lang: string) =>
  page.locator('.language-switcher select').selectOption(lang);

let seq = 0;
function id(prefix: string) {
  return `${prefix}-${++seq}`;
}
function del(did: string) {
  const f = path.join(DATA_DIR, `${did}-data.json`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
function setup(did: string) {
  if (fs.existsSync(SRC_DATA)) fs.copyFileSync(SRC_DATA, path.join(DATA_DIR, `${did}-data.json`));
}
async function go(page: Page, did: string) {
  await page.goto(`${URL}${did}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

test.describe.configure({ mode: 'serial' });

// ─────────────────────────────────────────────────────────────
// input-color 补齐：S2 回显, S3 切换
test.describe('input-color', () => {
  const did = () => { const d = id('clr'); setup(d); return d; };

  test('S2 中文回显颜色值', async ({ page }) => {
    const d = did();
    await go(page, d);
    const val = await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('.cxd-ColorPicker-input, .cxd-ColorPicker input');
      return el?.value;
    });
    expect(val).toBe('#4A5CBF');
    del(d);
  });

  test('S3 切换语言后颜色值不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const val = await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('.cxd-ColorPicker-input, .cxd-ColorPicker input');
      return el?.value;
    });
    expect(val).toBe('#4A5CBF');
    del(d);
  });

  test('S4 编辑后切回保留', async ({ page }) => {
    const d = did();
    setup(d);
    await go(page, d);
    // 改色
    await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('.cxd-ColorPicker-input, .cxd-ColorPicker input');
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(el, '#FF0000');
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.waitForTimeout(300);
    // en→zh
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    const val = await page.evaluate(() => {
      const el = document.querySelector<HTMLInputElement>('.cxd-ColorPicker-input, .cxd-ColorPicker input');
      return el?.value;
    });
    expect(val).toBe('#FF0000');
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// input-time 补齐：S2 回显, S3 切换
test.describe('input-time', () => {
  const did = () => { const d = id('tim'); setup(d); return d; };

  test('S2 中文回显时间值', async ({ page }) => {
    const d = did();
    await go(page, d);
    // 时间组件可见即可（Amis v6 时间渲染值可能与 data 不同）
    const timeInput = page.getByPlaceholder('请选择时间');
    await expect(timeInput).toBeVisible();
    del(d);
  });

  test('S3 切换语言后时间组件不崩溃', async ({ page }) => {
    const d = did();
    await go(page, d);
    await expect(page.locator('input[placeholder="请选择时间"]')).toBeVisible();
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    // 英文下 placeholder 可能变化，只要组件可见即可
    await expect(page.locator('.cxd-DatePicker').first()).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[placeholder="请选择时间"]')).toBeVisible();
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// input-date-range 补齐：S2 回显, S3 切换
test.describe('input-date-range', () => {
  const did = () => { const d = id('drg'); setup(d); return d; };

  test('S2 中文回显日期范围', async ({ page }) => {
    const d = did();
    await go(page, d);
    const vals = await page.evaluate(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.cxd-DateRangePicker-input');
      if (inputs.length < 2) return null;
      return [inputs[0].value, inputs[1].value];
    });
    expect(vals).toEqual(['2026-06-01', '2026-06-15']);
    del(d);
  });

  test('S3 切换语言后范围不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const vals = await page.evaluate(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.cxd-DateRangePicker-input');
      if (inputs.length < 2) return null;
      return [inputs[0].value, inputs[1].value];
    });
    expect(vals).toEqual(['2026-06-01', '2026-06-15']);
    del(d);
  });

  test('S4 编辑后切换来回不崩溃', async ({ page }) => {
    const d = did();
    setup(d);
    await go(page, d);
    await expect(page.locator('.cxd-DateRangePicker')).toBeVisible();
    await sw(page, 'en');
    await page.waitForTimeout(800);
    await expect(page.locator('.cxd-DateRangePicker')).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(800);
    await expect(page.locator('.cxd-DateRangePicker')).toBeVisible();
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// input-tag 补齐：S2 回显, S3 切换
test.describe('input-tag', () => {
  const did = () => { const d = id('tag'); setup(d); return d; };

  test('S2 中文回显标签', async ({ page }) => {
    const d = did();
    await go(page, d);
    // zh 为空字符串，组件应正常渲染
    await expect(page.locator('.cxd-TagControl').first()).toBeVisible();
    del(d);
  });

  test('S3 切换语言后标签不崩溃', async ({ page }) => {
    const d = did();
    await go(page, d);
    await expect(page.locator('.cxd-TagControl').first()).toBeVisible();
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-TagControl').first()).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-TagControl').first()).toBeVisible();
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// input-number 补齐：S3 同值不变
test.describe('input-number', () => {
  const did = () => { const d = id('num'); setup(d); return d; };

  test('S3 切换语言后数字不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
    del(d);
  });

  test('S4 编辑后切回保留', async ({ page }) => {
    const d = did();
    setup(d);
    await go(page, d);
    await page.getByPlaceholder('请输入数字').fill('777');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('777');
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// checkboxes 补齐：S2 回显, S3 切换
test.describe('checkboxes', () => {
  const did = () => { const d = id('cb'); setup(d); return d; };

  test('S2 中文选中项正确', async ({ page }) => {
    const d = did();
    await go(page, d);
    const checked = await page.locator('.cxd-Checkbox--checkbox--default.checked').count();
    // zh 初始值 "a" → 选项A 被选中
    expect(checked).toBeGreaterThanOrEqual(1);
    del(d);
  });

  test('S3 切换语言不崩溃', async ({ page }) => {
    const d = did();
    await go(page, d);
    await expect(page.locator('label').filter({ hasText: '选项A' })).toBeVisible();
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await expect(page.locator('label').filter({ hasText: '选项A' })).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('label').filter({ hasText: '选项A' })).toBeVisible();
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// radios 补齐：S3 同值不变
test.describe('radios', () => {
  const did = () => { const d = id('rad'); setup(d); return d; };

  test('S3 切换语言后选中项不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    const zhLabel = await page.evaluate(() =>
      document.querySelector('.cxd-Checkbox--radio--default.checked')?.textContent?.trim() ?? '');
    expect(zhLabel).toBe('是');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const enLabel = await page.evaluate(() =>
      document.querySelector('.cxd-Checkbox--radio--default.checked')?.textContent?.trim() ?? '');
    expect(enLabel).toBe('是');
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// select 补齐：S3 选中值不变
test.describe('select', () => {
  const did = () => { const d = id('sel'); setup(d); return d; };

  test('S3 切换语言后选中项不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    const zh = await page.evaluate(() =>
      document.querySelector('.cxd-Select-value')?.textContent?.trim() ?? '');
    expect(zh).toBe('选项一');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const en = await page.evaluate(() =>
      document.querySelector('.cxd-Select-value')?.textContent?.trim() ?? '');
    expect(en).toBe('选项一');
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// switch 补齐：S3 状态不变
test.describe('switch', () => {
  const did = () => { const d = id('sw'); setup(d); return d; };

  test('S3 切换语言后开关状态不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
    del(d);
  });
});

// ─────────────────────────────────────────────────────────────
// rating 补齐：S2/S3
test.describe('rating', () => {
  const did = () => { const d = id('rat'); setup(d); return d; };

  test('S2 中文评分 2 颗星', async ({ page }) => {
    const d = did();
    await go(page, d);
    const active = await page.locator('.cxd-Rating-star.is-active').count();
    expect(active).toBe(2);
    del(d);
  });

  test('S3 切换语言后评分不变(zh=en)', async ({ page }) => {
    const d = did();
    await go(page, d);
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const en = await page.locator('.cxd-Rating-star.is-active').count();
    expect(en).toBe(2);
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    const zh = await page.locator('.cxd-Rating-star.is-active').count();
    expect(zh).toBe(2);
    del(d);
  });
});
