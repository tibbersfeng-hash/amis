import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');
const MULTI_URL = '/remote?dataType=form-test-multi-lang&dataId=form-test-multi-lang';
const SINGLE_URL = '/remote?dataType=form-test-single-lang&dataId=form-test-single-lang';
const DATA_FILE = path.join(DATA_DIR, 'form-test-multi-lang-data.json');
const SINGLE_FILE = path.join(DATA_DIR, 'form-test-single-lang-data.json');

function backupData(file: string) {
  const bak = fs.readFileSync(file, 'utf-8');
  return () => { fs.writeFileSync(file, bak, 'utf-8'); };
}
const restore = backupData(DATA_FILE);

test.describe('表单提交数据完整性 — 页面显示值 = 提交保存值', () => {
  test.afterAll(() => restore());
  test.beforeEach(async ({ page }) => {
    await page.goto(MULTI_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  async function verifySubmit(
    page: any, field: string,
    getDomValue: () => Promise<string>,
    editAction: () => Promise<void>, editedDisplay: string,
  ) {
    await editAction();
    await expect(async () => expect(await getDomValue()).toBe(editedDisplay)).toPass({ timeout: 5000 });
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))[field];
    expect(saved).toBeTruthy();
    expect(Object.values(saved).some((v: any) => String(v) === editedDisplay)).toBeTruthy();
  }

  test('input-text: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'textField',
      () => page.locator('input[name="textField"]').inputValue(),
      () => page.locator('input[name="textField"]').fill('DOM一致文本'),
      'DOM一致文本');
  });
  test('textarea: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'textArea',
      () => page.locator('textarea[name="textArea"]').inputValue(),
      () => page.locator('textarea[name="textArea"]').fill('DOM一致多行'),
      'DOM一致多行');
  });
  test('input-email: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'email',
      () => page.locator('input[name="email"]').inputValue(),
      () => page.locator('input[name="email"]').fill('dom@test.com'),
      'dom@test.com');
  });
  test('input-url: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'url',
      () => page.locator('input[name="url"]').inputValue(),
      () => page.locator('input[name="url"]').fill('https://dom.test.com'),
      'https://dom.test.com');
  });
  test('input-password: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'password',
      () => page.locator('input[name="password"]').inputValue(),
      () => page.locator('input[name="password"]').fill('dom-pwd'),
      'dom-pwd');
  });
  test('input-number: DOM 值 = 提交值', async ({ page }) => {
    await verifySubmit(page, 'number',
      () => page.getByPlaceholder('请输入数字').inputValue(),
      () => page.getByPlaceholder('请输入数字').fill('777'),
      '777');
  });

  test('中文编辑提交 → 值写入 zh', async ({ page }) => {
    await page.locator('input[name="textField"]').fill('仅中文提交');
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    expect(saved.textField?.zh).toBe('仅中文提交');
  });
  test('英文编辑提交 → 值写入 en', async ({ page }) => {
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('EN only submit');
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    expect(saved.textField?.en).toBe('EN only submit');
  });
  test('中英分别编辑 → zh/en 各自独立', async ({ page }) => {
    await page.locator('input[name="textField"]').fill('中文内容');
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('EN content');
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    expect(saved.textField?.zh).toBe('中文内容');
    expect(saved.textField?.en).toBe('EN content');
  });
  test('单语言 schema: DOM 值 = 提交值', async ({ page }) => {
    const restoreSingle = backupData(SINGLE_FILE);
    await page.goto(SINGLE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.locator('input[name="textField"]').fill('单语言DOM值');
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    const saved = JSON.parse(fs.readFileSync(SINGLE_FILE, 'utf-8'));
    expect(saved.textField).toBe('单语言DOM值');
    expect(typeof saved.textField).toBe('string');
    restoreSingle();
  });
});

test.describe('input-image 上传 → 切换 → 保留', () => {
  const TEST_PNG = '/tmp/test-image.png';
  const DATA_BACKUP = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

  test.beforeEach(async ({ page }) => {
    // Mock image upload endpoint
    await page.route('**/api/upload**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 0,
          msg: '上传成功',
          data: { value: '/uploads/test-image.png', filename: 'test-image.png' },
        }),
      });
    });
    await page.goto(MULTI_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test.afterEach(() => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DATA_BACKUP, null, 2) + '\n', 'utf-8');
  });

  test('1. 上传图片后组件显示缩略图', async ({ page }) => {
    // 文件 input 是隐藏的 (display:none), 直接用 setInputFiles
    const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
    await fileInput.setInputFiles(TEST_PNG);
    await page.waitForTimeout(1000);

    // 验证图片已上传（缩略图出现）
    const img = page.locator('.cxd-ImageControl img');
    await expect(img).toBeVisible({ timeout: 5000 });
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('2. 上传后切换语言 → 图片保留', async ({ page }) => {
    const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
    await fileInput.setInputFiles(TEST_PNG);
    await page.waitForTimeout(1000);

    const img = page.locator('.cxd-ImageControl img');
    await expect(img).toBeVisible({ timeout: 5000 });
    const srcBefore = await img.getAttribute('src');

    // 切换英文
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);

    // 切换回中文
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);

    // 图片仍然可见
    await expect(img).toBeVisible({ timeout: 5000 });
    const srcAfter = await img.getAttribute('src');
    expect(srcAfter).toBe(srcBefore);
  });

  test('3. 上传后提交 → URL 保存到文件', async ({ page }) => {
    const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
    await fileInput.setInputFiles(TEST_PNG);
    await page.waitForTimeout(1000);

    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;

    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const sv = saved.image;
    expect(sv).toBeTruthy();
    expect(sv.zh || sv.en).toBeTruthy();
    expect(typeof sv.zh === 'string' || typeof sv.en === 'string').toBeTruthy();
  });

  test('4. 英文下上传 → 切中文 → 图片保留', async ({ page }) => {
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);

    const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
    await fileInput.setInputFiles(TEST_PNG);
    await page.waitForTimeout(1000);

    const img = page.locator('.cxd-ImageControl img');
    await expect(img).toBeVisible({ timeout: 5000 });
    const srcEn = await img.getAttribute('src');

    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);

    await expect(img).toBeVisible({ timeout: 5000 });
    const srcZh = await img.getAttribute('src');
    expect(srcZh).toBe(srcEn);
  });

  test('5. 上传 + 编辑字段 → 提交 → 数据一致', async ({ page }) => {
    // 上传图片
    const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
    await fileInput.setInputFiles(TEST_PNG);
    await page.waitForTimeout(1000);

    // 同时编辑文本字段
    await page.locator('input[name="textField"]').fill('图片+文本提交');

    // 提交
    const r = page.waitForResponse((resp: any) => resp.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;

    const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    // 图片 URL 保存
    expect(saved.image?.zh || saved.image?.en).toBeTruthy();
    // 文本字段正常（互不干扰）
    expect(saved.textField?.zh).toBe('图片+文本提交');
  });
});
