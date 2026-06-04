import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');

function deleteFile(id: string) {
  const f = path.join(DATA_DIR, `${id}-data.json`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}

const MULTI_DATA_ID = 'form-test-multi-lang';
const SINGLE_DATA_ID = 'form-test-single-lang';

test.describe('AmisPage i18n — 语言切换器', () => {

  test('multiLang schema 显示语言切换器', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('.language-switcher')).toBeVisible();
  });

  test('无 multiLang schema 不显示语言切换器', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-single-lang&dataId=${SINGLE_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('.language-switcher')).not.toBeVisible();
  });
});

test.describe('AmisPage i18n — multiLang 字段值 flatten 回显', () => {

  test('input-text 默认显示中文', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
  });

  test('textarea 默认显示中文', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/多行中文内容/);
  });

  test('input-email 默认显示中文邮箱', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('input[name="email"]')).toHaveValue('zhongwen@test.com');
  });

  test('input-url 默认显示中文网址', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('input[name="url"]')).toHaveValue('https://zhongwen.example.com');
  });

  test('input-password 默认显示中文密码', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('input[name="password"]')).toHaveValue('zhongwen-pwd');
  });

  test('input-number 正常显示数值（非 multiLang）', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
  });

  test('select 正常显示选中项（非 multiLang）', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('.cxd-Select')).toBeVisible();
  });
});

test.describe('AmisPage i18n — 语言切换', () => {

  test('切换英文 → 所有 multiLang 字段显示英文值', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(2000);

    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue(/Multi-line English/);
    await expect(page.locator('input[name="email"]')).toHaveValue('english@test.com');
    await expect(page.locator('input[name="url"]')).toHaveValue('https://english.example.com');
    await expect(page.locator('input[name="password"]')).toHaveValue('english-pwd');

    // 非 multiLang 字段不受影响
    await expect(page.getByPlaceholder('请输入数字')).toHaveValue('42');
  });

  test('切换回中文 → 中文值正确', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(2000);

    await expect(page.locator('input[name="textField"]')).toHaveValue('中文文本');
    await expect(page.locator('input[name="email"]')).toHaveValue('zhongwen@test.com');
  });
});

test.describe('AmisPage i18n — 编辑后切换保留', () => {

  test('编辑 → 切换英文 → 切回中文 → 编辑值保留', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 编辑中文文本
    await page.locator('input[name="textField"]').fill('编辑后的中文值');

    // 切英文 → 显示英文原始值
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');

    // 切回中文 → 编辑值保留
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('编辑后的中文值');
  });

  test('多字段编辑保留', async ({ page }) => {
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${MULTI_DATA_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('新文本');
    await page.locator('textarea[name="textArea"]').fill('新多行内容');
    await page.locator('input[name="email"]').fill('new@test.com');

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('.language-switcher select').selectOption('zh');
    await page.waitForTimeout(1000);

    await expect(page.locator('input[name="textField"]')).toHaveValue('新文本');
    await expect(page.locator('textarea[name="textArea"]')).toHaveValue('新多行内容');
    await expect(page.locator('input[name="email"]')).toHaveValue('new@test.com');
  });
});

test.describe('AmisPage i18n — 提交保存', () => {

  const SAVE_ID = 'e2e-i18n-submit-test';

  test.afterEach(() => deleteFile(SAVE_ID));

  test('multiLang 字段提交为 {zh, en} 对象', async ({ page }) => {
    deleteFile(SAVE_ID);

    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${SAVE_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 填写 multiLang 字段
    await page.locator('input[name="textField"]').fill('中文文本提交测试');
    await page.locator('textarea[name="textArea"]').fill('中文多行提交测试');
    await page.locator('input[name="email"]').fill('zhongwen@submit.com');
    // 非 multiLang 字段
    await page.getByPlaceholder('请输入数字').fill('99');

    // 切换英文编辑部分字段
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('English Text Submit');

    // 提交
    const respPromise = page.waitForResponse(r =>
      r.url().includes('/api/page/save') && r.status() === 200
    );
    await page.locator('button[type="submit"]').click();
    await respPromise;

    const filePath = path.join(DATA_DIR, `${SAVE_ID}-data.json`);
    expect(fs.existsSync(filePath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // multiLang → {zh, en}
    expect(content.textField).toEqual({ zh: '中文文本提交测试', en: 'English Text Submit' });
    expect(content.textArea).toEqual({ zh: '中文多行提交测试', en: '中文多行提交测试' }); // 只改 zh
    expect(content.email).toEqual({ zh: 'zhongwen@submit.com', en: 'zhongwen@submit.com' });
    // 非 multiLang → 普通值
    expect(content.number).toBe(99);
    // 元数据清除
    expect(content.dataId).toBeUndefined();
    expect(content.dataType).toBeUndefined();
  });

  test('无 multiLang 的 schema 提交不受影响', async ({ page }) => {
    deleteFile('single-lang-save');
    await page.goto(`http://localhost:5173/remote?dataType=form-test-single-lang&dataId=single-lang-save`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('普通文本');
    await page.locator('input[name="email"]').fill('test@test.com');

    const respPromise = page.waitForResponse(r =>
      r.url().includes('/api/page/save') && r.status() === 200
    );
    await page.locator('button[type="submit"]').click();
    await respPromise;

    const filePath = path.join(DATA_DIR, `single-lang-save-data.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    expect(content.textField).toBe('普通文本');
    expect(content.email).toBe('test@test.com');

    deleteFile('single-lang-save');
  });

  test('多次修改提交 → 正确合并', async ({ page }) => {
    deleteFile(SAVE_ID);

    // 第一次提交
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${SAVE_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('input[name="textField"]').fill('第一次文本');
    await page.locator('input[name="email"]').fill('first@test.com');

    let resp = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await resp;

    // 第二次提交（修改已有数据）
    await page.goto(`http://localhost:5173/remote?dataType=form-test-multi-lang&dataId=${SAVE_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 切换英文编辑
    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('Second Text');

    resp = page.waitForResponse(r => r.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await resp;

    const filePath = path.join(DATA_DIR, `${SAVE_ID}-data.json`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    expect(content.textField).toEqual({ zh: '第一次文本', en: 'Second Text' });
    expect(content.email).toEqual({ zh: 'first@test.com', en: 'first@test.com' }); // 没改英文

    deleteFile(SAVE_ID);
  });
});

test.describe('AmisPage i18n — hotel-basic 业务表单', () => {

  test('北京香格里拉中文加载', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=hotel-beijing-shangrila');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('input[name="hotelName"]')).toHaveValue('北京香格里拉饭店');
    await expect(page.locator('input[name="city"]')).toHaveValue('北京');
  });

  test('i18n 测试数据多语言切换', async ({ page }) => {
    await page.goto('http://localhost:5173/remote?dataType=hotel-basic&dataId=hotel-i18n-test');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(page.locator('input[name="hotelName"]')).toHaveValue('北京国际饭店');

    await page.locator('.language-switcher select').selectOption('en');
    await page.waitForTimeout(2000);

    await expect(page.locator('input[name="hotelName"]')).toHaveValue('Beijing International Hotel');
    await expect(page.locator('textarea[name="description"]')).toHaveValue(/Beijing International Hotel/);
  });
});
