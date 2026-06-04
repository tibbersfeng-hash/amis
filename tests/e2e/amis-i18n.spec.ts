import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');
const MULTI_DID = 'form-test-multi-lang';
const SINGLE_DID = 'form-test-single-lang';

function del(id: string) {
  const f = path.join(DATA_DIR, `${id}-data.json`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
function readData(id: string) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${id}-data.json`), 'utf-8'));
}

// ── 1. 语言切换器 ──────────────────────────────────────────

test.describe('语言切换器', () => {
  test('multiLang schema 显示切换器', async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('.language-switcher')).toBeVisible();
  });

  test('无 multiLang schema 不显示切换器', async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-single-lang&dataId=${SINGLE_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('.language-switcher')).not.toBeVisible();
  });
});

// ── 2. 全部组件中文回显 ──────────────────────────────────────

test.describe('全部组件中文回显（所有字段 multiLang）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('input-text 中文', async ({ page }) => {
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
  });
  test('textarea 中文', async ({ page }) => {
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/多行中文内容/);
  });
  test('input-email 中文', async ({ page }) => {
    await expect(page.locator('input[name="email"]')).toHaveValue('zhongwen@test.com');
  });
  test('input-url 中文', async ({ page }) => {
    await expect(page.locator('input[name="url"]')).toHaveValue('https://zhongwen.example.com');
  });
  test('input-password 中文', async ({ page }) => {
    await expect(page.locator('input[name="password"]')).toHaveValue('zhongwen-pwd');
  });
  test('input-number 数字 multiLang', async ({ page }) => {
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
  });
  test('input-rich-text 富文本', async ({ page }) => {
    await expect(page.locator('.cxd-RichText, .tox-tinymce, [class*="editor"]').first()).toBeVisible();
  });
  test('select 下拉', async ({ page }) => {
    await expect(page.locator('.cxd-Select')).toBeVisible();
  });
  test('input-date 日期', async ({ page }) => {
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
  });
  // input-time 的渲染结构因 Amis 版本而异, 跳过可视化断言
  test('input-month 月份', async ({ page }) => {
    await expect(page.getByPlaceholder('请选择月份')).toHaveValue('2026-06');
  });
  test('input-rating 评分', async ({ page }) => {
    await expect(page.locator('.cxd-Rating')).toBeVisible();
  });
  test('input-tag 标签', async ({ page }) => {
    await expect(page.locator('input[name="tag"]')).toBeVisible();
  });
  test('input-image 图片上传', async ({ page }) => {
    await expect(page.locator('.cxd-ImageControl, .cxd-InputImage, [accept="image/*"]').first()).toBeVisible();
  });
});

// ── 3. 多语言切换（所有字段统一 multiLang）────────────────────

test.describe('多语言切换（全部字段 multiLang）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('切换英文 → 文本字段值变化，同值字段不变', async ({ page }) => {
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(2000);

    // 文本字段 zh≠en → 值变化
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/Multi-line English/);
    await expect(page.locator('input[name="email"]')).toHaveValue('english@test.com');

    // 同值字段（zh=en） → 值不变
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
    await expect(page.getByPlaceholder('请选择日期')).toHaveValue('2026-06-04');
  });

  test('中英来回多次切换，值一致', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.locator('.language-switcher select').selectOption('en');
      await page.waitForTimeout(500);
      await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
      await page.locator('.language-switcher select').selectOption('zh');
      await page.waitForTimeout(500);
      await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
    }
  });
});

// ── 4. 编辑保留 ────────────────────────────────────────────

test.describe('编辑后切换保留', () => {
  test('中文编辑 → 切英文 → 回中文 → 编辑值保留', async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('编辑后的值');
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('编辑后的值');
  });

  test('多字段编辑全部保留', async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('新文本');
    await page.locator('textarea[name="textArea"]').fill('新多行');
    await page.locator('input[name="email"]').fill('new@test.com');

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);

    await expect(page.locator('input[name="textField"]')).toHaveValue('新文本');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('新多行');
    await expect(page.locator('input[name="email"]')).toHaveValue('new@test.com');
  });

  test('英文编辑 → 回英文 → 英文编辑值保留', async ({ page }) => {
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${MULTI_DID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('Modified EN');
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('Modified EN');
  });
});

// ── 5. 提交保存验证 ────────────────────────────────────────

test.describe('提交保存完整验证', () => {
  const SID = 'e2e-i18n-submit';
  test.afterEach(() => del(SID));

  test('全部字段提交后存为 {zh, en} 对象', async ({ page }) => {
    del(SID);
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${SID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('中文文本');
    await page.getByPlaceholder('请输入数字').fill('88');
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('English Text');

    const r = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;

    const d = readData(SID);
    expect(d.textField).toEqual({ zh: '中文文本', en: 'English Text' });
    expect(d.number).toEqual({ zh: '88', en: '88' });
    expect(d.dataId).toBeUndefined();
    expect(d.dataType).toBeUndefined();
    del(SID);
  });

  test('单语言 schema 提交值不变', async ({ page }) => {
    del('single-test');
    await page.goto(`/remote?dataType=form-test-single-lang&dataId=single-test`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('单语');
    const r = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;

    const d = readData('single-test');
    expect(d.textField).toBe('单语');
    del('single-test');
  });

  test('多次提交 → 数据合并正确', async ({ page }) => {
    del(SID);
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${SID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 第1次
    await page.locator('input[name="textField"]').fill('第1次');
    await page.getByPlaceholder('请输入数字').fill('11');
    const r1 = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r1;
    expect(readData(SID).textField).toEqual({ zh: '第1次', en: '第1次' });

    // 第2次（切英文）
    await page.goto(`/remote?dataType=form-test-multi-lang&dataId=${SID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('Second');

    const r2 = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r2;

    const d = readData(SID);
    expect(d.textField).toEqual({ zh: '第1次', en: 'Second' });
    expect(d.number).toEqual({ zh: '11', en: '11' });
    del(SID);
  });
});
