import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');
const SRC = path.join(DATA_DIR, 'form-test-multi-lang-data.json');
const DID = 'e2e-clear-switch';
const DST = path.join(DATA_DIR, `${DID}-data.json`);

function copyData() {
  if (fs.existsSync(SRC)) fs.copyFileSync(SRC, DST);
}
function delData() {
  if (fs.existsSync(DST)) fs.unlinkSync(DST);
}
function readData(id: string) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${id}-data.json`), 'utf-8'));
}

async function sw(page: Page, lang: string) {
  await page.locator('.language-switcher select').selectOption(lang);
  await page.waitForTimeout(1500);
}

async function clearAndVerify(page: Page, selector: string) {
  await page.locator(selector).fill('');
  await page.waitForTimeout(1500);
}

const URL = `/remote?dataType=form-test-multi-lang&dataId=${DID}`;

// ── 1. 单语言清空 → 切换语言 → 另一语言保留 ─────────────

test.describe('清空数据后切换语言 — 单语言清空', () => {
  test.beforeEach(async ({ page }) => {
    copyData();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
  test.afterEach(() => delData());

  test('中文清空 input-text → 切英文显示原值', async ({ page }) => {
    // 初始为中文
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
    // 清空
    await clearAndVerify(page, 'input[name="textField"]');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    // 切换英文 → 应显示英文原值
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
  });

  test('中文清空 input-text → 切英文 → 切回中文仍为空', async ({ page }) => {
    await clearAndVerify(page, 'input[name="textField"]');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    // 切英文
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    // 切回中文 → 空值已持久化到 lookup
    await sw(page, 'zh');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
  });

  test('英文清空 input-text → 切中文显示原值', async ({ page }) => {
    // 先切英文
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    // 清空英文
    await clearAndVerify(page, 'input[name="textField"]');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    // 切中文 → 应显示中文原值
    await sw(page, 'zh');
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
  });

  test('英文清空 input-text → 切中文 → 切回英文仍为空', async ({ page }) => {
    await sw(page, 'en');
    await clearAndVerify(page, 'input[name="textField"]');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    // 切中文
    await sw(page, 'zh');
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
    // 切回英文 → 空值已持久化
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
  });

  test('中文清空 textarea → 切英文保留', async ({ page }) => {
    await clearAndVerify(page, 'textarea[name="textArea"]');
    await sw(page, 'en');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/Multi-line English/);
    await sw(page, 'zh');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('');
  });

  test('中文清空 email → 切英文保留', async ({ page }) => {
    await clearAndVerify(page, 'input[name="email"]');
    await sw(page, 'en');
    await expect(page.locator('input[name="email"]')).toHaveValue('english@test.com');
    await sw(page, 'zh');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
  });

  test('中文清空 url → 切英文保留', async ({ page }) => {
    await clearAndVerify(page, 'input[name="url"]');
    await sw(page, 'en');
    await expect(page.locator('input[name="url"]')).toHaveValue('https://english.example.com');
    await sw(page, 'zh');
    await expect(page.locator('input[name="url"]')).toHaveValue('');
  });

  test('中文清空 password → 切英文保留', async ({ page }) => {
    await clearAndVerify(page, 'input[name="password"]');
    await sw(page, 'en');
    await expect(page.locator('input[name="password"]')).toHaveValue('english-pwd');
    await sw(page, 'zh');
    await expect(page.locator('input[name="password"]')).toHaveValue('');
  });
});

// ── 2. 双语言均清空 → 切换语言两个都空 ──────────────────

test.describe('清空数据后切换语言 — 双语言均清空', () => {
  test.beforeEach(async ({ page }) => {
    copyData();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
  test.afterEach(() => delData());

  test('中文清空 → 切英文清空 → 切回中文为空', async ({ page }) => {
    // 中文清空
    await clearAndVerify(page, 'input[name="textField"]');
    // 切英文
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    // 英文也清空
    await clearAndVerify(page, 'input[name="textField"]');
    // 切回中文 → 为空
    await sw(page, 'zh');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    // 再切英文 → 也为空
    await sw(page, 'en');
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
  });

  test('双语言清空 textarea', async ({ page }) => {
    await clearAndVerify(page, 'textarea[name="textArea"]');
    await sw(page, 'en');
    await clearAndVerify(page, 'textarea[name="textArea"]');
    await sw(page, 'zh');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('');
    await sw(page, 'en');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('');
  });
});

// ── 3. 特殊类型字段：清空后的语言同步行为 ────────────────

test.describe('清空数据后切换语言 — 特殊字段类型', () => {
  test.beforeEach(async ({ page }) => {
    copyData();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
  test.afterEach(() => delData());

  test('switch 关闭后切换语言不崩溃', async ({ page }) => {
    // 初始为打开状态
    await expect(page.locator('.cxd-Switch.is-checked')).toBeVisible();
    // 关闭 switch
    await page.locator('.cxd-Switch').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('.cxd-Switch.is-checked')).not.toBeVisible();
    // 切英文 → 组件正常渲染，不崩溃
    // 注意: switch 无 input[name]，writeDomValue 无法写入，切换后以 Amis 原始数据为准
    await sw(page, 'en');
    await expect(page.locator('.cxd-Switch')).toBeVisible();
    await sw(page, 'zh');
    await expect(page.locator('.cxd-Switch')).toBeVisible();
  });

  test('checkboxes 取消全部勾选后切换语言不崩溃', async ({ page }) => {
    // 初始有勾选
    const initChecked = await page.locator('.cxd-Checkbox--checkbox--default.checked').count();
    expect(initChecked).toBeGreaterThan(0);
    // 取消所有勾选
    const boxes = await page.locator('.cxd-Checkbox--checkbox--default.checked').all();
    for (const box of boxes) await box.click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('.cxd-Checkbox--checkbox--default.checked')).toHaveCount(0);
    // 切英文 → 组件正常渲染，不崩溃
    // 注意: checkboxes 无 input[name]，persist 无法写入，切换后以 Amis 原始数据为准
    await sw(page, 'en');
    await expect(page.locator('label').filter({ hasText: '选项A' })).toBeVisible();
    await sw(page, 'zh');
    await expect(page.locator('label').filter({ hasText: '选项A' })).toBeVisible();
  });
});

// ── 4. 无 DOM input[name] 的字段：切换语言不崩溃 ─────────

test.describe('清空数据后切换语言 — 无 DOM 字段', () => {
  test.beforeEach(async ({ page }) => {
    copyData();
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });
  test.afterEach(() => delData());

  test('select 切换语言不崩溃', async ({ page }) => {
    await expect(page.locator('.cxd-Select').first()).toBeVisible();
    await sw(page, 'en');
    await expect(page.locator('.cxd-Select').first()).toBeVisible();
    await sw(page, 'zh');
    await expect(page.locator('.cxd-Select').first()).toBeVisible();
  });

  test('radios 切换语言不崩溃', async ({ page }) => {
    await expect(page.locator('.cxd-Checkbox--radio--default').first()).toBeVisible();
    await sw(page, 'en');
    await expect(page.locator('.cxd-Checkbox--radio--default').first()).toBeVisible();
    await sw(page, 'zh');
    await expect(page.locator('.cxd-Checkbox--radio--default').first()).toBeVisible();
  });

  test('input-date 切换语言不崩溃', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: '请选择日期', exact: true })).toBeVisible();
    await sw(page, 'en');
    await expect(page.getByRole('textbox', { name: '请选择日期', exact: true })).toBeVisible();
    await sw(page, 'zh');
    await expect(page.getByRole('textbox', { name: '请选择日期', exact: true })).toBeVisible();
  });
});

// ── 5. 清空后提交 → {zh, en} 正确保存 ───────────────────

test.describe('清空数据后切换语言 — 提交保存', () => {
  const SID = 'e2e-clear-submit';
  const SDST = path.join(DATA_DIR, `${SID}-data.json`);
  test.afterEach(() => { if (fs.existsSync(SDST)) fs.unlinkSync(SDST); });

  test.beforeEach(async ({ page }) => {
    if (fs.existsSync(SRC)) fs.copyFileSync(SRC, SDST);
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${SID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('中文清空 textField → 提交 → POST body zh 为空 en 保留', async ({ page }) => {
    const respPromise = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await clearAndVerify(page, 'input[name="textField"]');
    await page.locator('button[type="submit"]').click();
    const resp = await respPromise;

    const postData = resp.request().postData();
    const body = JSON.parse(postData || '{}');
    // 验证提交数据：zh 被清空，en 保留原值
    expect(body.textField).toEqual({ zh: '', en: 'English Text' });
    if (fs.existsSync(SDST)) fs.unlinkSync(SDST);
  });

  test('中文清空 → 切英文清空 → 提交 → 双语为空', async ({ page }) => {
    await clearAndVerify(page, 'input[name="textField"]');
    await sw(page, 'en');
    await clearAndVerify(page, 'input[name="textField"]');

    const respPromise = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    const resp = await respPromise;

    const postData = resp.request().postData();
    const body = JSON.parse(postData || '{}');
    expect(body.textField).toEqual({ zh: '', en: '' });
    if (fs.existsSync(SDST)) fs.unlinkSync(SDST);
  });

  test('中文清空 textField → 切换来回 → 提交 → 数据正确', async ({ page }) => {
    await clearAndVerify(page, 'input[name="textField"]');
    await sw(page, 'en');
    await sw(page, 'zh');

    const respPromise = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    const resp = await respPromise;

    const postData = resp.request().postData();
    const body = JSON.parse(postData || '{}');
    expect(body.textField).toEqual({ zh: '', en: 'English Text' });
    if (fs.existsSync(SDST)) fs.unlinkSync(SDST);
  });

  test('清空多个字段 → 提交 → 多字段正确', async ({ page }) => {
    await clearAndVerify(page, 'input[name="textField"]');
    await clearAndVerify(page, 'textarea[name="textArea"]');
    await clearAndVerify(page, 'input[name="email"]');

    const respPromise = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    const resp = await respPromise;

    const postData = resp.request().postData();
    const body = JSON.parse(postData || '{}');
    expect(body.textField.zh).toBe('');
    expect(body.textArea.zh).toBe('');
    expect(body.email.zh).toBe('');
    if (fs.existsSync(SDST)) fs.unlinkSync(SDST);
  });
});
