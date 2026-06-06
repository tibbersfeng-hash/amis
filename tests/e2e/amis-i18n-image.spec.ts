import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe.configure({ mode: 'serial' });

const DATA_DIR = path.resolve(__dirname, '../../public/api/data');
const SRC_DATA = path.join(DATA_DIR, 'form-test-multi-lang-data.json');
const URL = '/remote?dataType=form-test-multi-lang&dataId=';

const sw = (page: Page, lang: string) =>
  page.locator('.language-switcher select').selectOption(lang);

const getImgSrc = (page: Page) =>
  page.evaluate(() => {
    const img = document.querySelector('.cxd-ImageControl img') as HTMLImageElement | null;
    return img?.src || null;
  });

let seq = 0;
function uniq(prefix: string) {
  return `${prefix}-${++seq}`;
}

function del(id: string) {
  const f = path.join(DATA_DIR, `${id}-data.json`);
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
function readData(id: string) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${id}-data.json`), 'utf-8'));
}

/** Copy source data to a dedicated test data file */
function setup(id: string) {
  if (fs.existsSync(SRC_DATA)) fs.copyFileSync(SRC_DATA, path.join(DATA_DIR, `${id}-data.json`));
}

/** Create test data with custom image values */
function setupWithImage(id: string, image: Record<string, string>) {
  if (!fs.existsSync(SRC_DATA)) return;
  const data = JSON.parse(fs.readFileSync(SRC_DATA, 'utf-8'));
  data.image = image;
  fs.writeFileSync(path.join(DATA_DIR, `${id}-data.json`), JSON.stringify(data, null, 2));
}

async function go(page: Page, dataId: string) {
  await page.goto(`${URL}${dataId}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — S2 状态回显', () => {
  test('中文模式显示中文图片', async ({ page }) => {
    const id = uniq('s2');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });
    expect(await getImgSrc(page)).toContain('/uploads/test-zh.svg');
    del(id);
  });

  test('切换英文后显示英文图片', async ({ page }) => {
    const id = uniq('s2');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('/uploads/test-en.svg');
    del(id);
  });

  test('空值不崩溃', async ({ page }) => {
    const id = uniq('s2');
    setupWithImage(id, { zh: '', en: '' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible();
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — S3 语言切换', () => {
  test('切换语言后图片 URL 变化', async ({ page }) => {
    const id = uniq('s3');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    expect(await getImgSrc(page)).toContain('test-zh.svg');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const enSrc = await getImgSrc(page);
    expect(enSrc).toContain('test-en.svg');
    expect(enSrc).not.toContain('test-zh');
    del(id);
  });

  test('多次来回切换始终匹配当前语言', async ({ page }) => {
    const id = uniq('s3');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    for (let i = 0; i < 3; i++) {
      await sw(page, 'en');
      await page.waitForTimeout(800);
      expect(await getImgSrc(page)).toContain('test-en.svg');
      await sw(page, 'zh');
      await page.waitForTimeout(800);
      expect(await getImgSrc(page)).toContain('test-zh.svg');
    }
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — S4 编辑后切换保留', () => {
  test('中文设新值 → 切英文 → 回中文保留', async ({ page }) => {
    const id = uniq('s4');
    setupWithImage(id, { zh: '/uploads/zh-uploaded.png', en: '/uploads/test-en.svg' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    expect(await getImgSrc(page)).toContain('zh-uploaded.png');
    await sw(page, 'en');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('test-en.svg');
    await sw(page, 'zh');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('zh-uploaded.png');
    del(id);
  });

  test('英文设新值 → 切中文 → 回英文保留', async ({ page }) => {
    const id = uniq('s4');
    setupWithImage(id, { zh: '/uploads/test-zh.svg', en: '/uploads/en-uploaded.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await sw(page, 'en');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('en-uploaded.png');
    await sw(page, 'zh');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('test-zh.svg');
    await sw(page, 'en');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('en-uploaded.png');
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — S5a 提交保存', () => {
  test('提交时 image 字段存为 {zh, en}', async ({ page }) => {
    const id = uniq('s5a');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    const d = readData(id);
    expect(d.image).toEqual({ zh: '/uploads/test-zh.svg', en: '/uploads/test-en.svg' });
    del(id);
  });

  test('中文设值后提交 → zh 更新, en 保留', async ({ page }) => {
    const id = uniq('s5a');
    setupWithImage(id, { zh: '/uploads/zh-custom.png', en: '/uploads/test-en.svg' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    const d = readData(id);
    expect(d.image.zh).toBe('/uploads/zh-custom.png');
    expect(d.image.en).toBe('/uploads/test-en.svg');
    del(id);
  });

  test('中英文各自设值后提交 → 互不覆盖', async ({ page }) => {
    const id = uniq('s5a');
    setupWithImage(id, { zh: '/uploads/zh-only.png', en: '/uploads/en-only.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    const d = readData(id);
    expect(d.image.zh).toBe('/uploads/zh-only.png');
    expect(d.image.en).toBe('/uploads/en-only.png');
    expect(d.image.zh).not.toBe(d.image.en);
    del(id);
  });

  test('元数据剥离', async ({ page }) => {
    const id = uniq('s5a');
    setup(id);
    await go(page, id);
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    const d = readData(id);
    expect(d.dataId).toBeUndefined();
    expect(d.dataType).toBeUndefined();
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — S5b 清空后切换', () => {
  test('中文空值 → 切英文 en 保留', async ({ page }) => {
    const id = uniq('s5b');
    setupWithImage(id, { zh: '', en: '/uploads/test-en.svg' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await sw(page, 'en');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('test-en.svg');
    del(id);
  });

  test('英文空值 → 切中文 zh 保留', async ({ page }) => {
    const id = uniq('s5b');
    setupWithImage(id, { zh: '/uploads/test-zh.svg', en: '' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await sw(page, 'zh');
    await page.waitForTimeout(1500);
    expect(await getImgSrc(page)).toContain('test-zh.svg');
    del(id);
  });

  test('双语空值不崩溃', async ({ page }) => {
    const id = uniq('s5b');
    setupWithImage(id, { zh: '', en: '' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });
    del(id);
  });

  test('切换来回不崩溃', async ({ page }) => {
    const id = uniq('s5b');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await sw(page, 'en');
    await page.waitForTimeout(800);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible();
    await sw(page, 'zh');
    await page.waitForTimeout(800);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible();
    del(id);
  });

  test('中文空值 → 提交 → en 保留', async ({ page }) => {
    const id = uniq('s5b');
    setupWithImage(id, { zh: '', en: '/uploads/test-en.svg' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    const d = readData(id);
    expect(d.image.en).toBe('/uploads/test-en.svg');
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
test.describe('图片 multiLang — B 基线保护', () => {
  test('multiLang 图片字段与其他字段共存', async ({ page }) => {
    const id = uniq('b');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[name="textField"]')).toBeVisible();
    del(id);
  });

  test('编辑文本 → 切语言 → 图片切换正常', async ({ page }) => {
    const id = uniq('b');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    await page.locator('input[name="textField"]').fill('临时编辑');
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('test-en.svg');
    await expect(page.locator('input[name="textField"]')).toHaveValue('English Text');

    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('test-zh.svg');
    await expect(page.locator('input[name="textField"]')).toHaveValue('临时编辑');
    del(id);
  });
});

// ─────────────────────────────────────────────────────────────────
// ABA: 跨语言操作验证
test.describe('图片 multiLang — ABA 操作验证', () => {
  test('ABA.0 A→修改→B→A: zh编辑 → 切en(不做操作) → 回zh值保留', async ({ page }) => {
    const id = uniq('aba');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A: 修改
    await page.locator('input[name="textField"]').fill('修改值A');
    await page.waitForTimeout(300);

    // B: 仅过路切换，不做任何编辑
    await sw(page, 'en');
    await page.waitForTimeout(1000);

    // A: 切回验证修改保留
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('修改值A');
    // 同时验证图片也切换回zh
    expect(await getImgSrc(page)).toContain('test-zh.svg');
    del(id);
  });

  test('ABA.00 A→清理→B→A: zh清空 → 切en(不做操作) → 回zh仍为空', async ({ page }) => {
    const id = uniq('aba');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A: 清空
    await page.locator('input[name="textField"]').fill('');
    await page.waitForTimeout(300);

    // B: 仅过路切换
    await sw(page, 'en');
    await page.waitForTimeout(1000);

    // A: 切回验证空值持久化
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('');
    del(id);
  });

  test('ABA.1 图片同字段: zh设值A / en设值B / 回zh验证A', async ({ page }) => {
    const id = uniq('aba');
    // A: 数据预设 zh=值A, en=值B
    setupWithImage(id, { zh: '/uploads/aba-zh.png', en: '/uploads/aba-en.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A验证: zh显示值A
    expect(await getImgSrc(page)).toContain('aba-zh.png');
    // B操作: 切en
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    // B验证: en显示值B
    expect(await getImgSrc(page)).toContain('aba-en.png');
    // A操作: 切回zh
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    // A验证: 值A保留
    expect(await getImgSrc(page)).toContain('aba-zh.png');
    // 再切en确认值B仍在
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('aba-en.png');
    del(id);
  });

  test('ABA.4 跨字段混合: zh文本+图片 / en文本+图片 / 回zh验证', async ({ page }) => {
    const id = uniq('aba');
    setupWithImage(id, { zh: '/uploads/aba-zh.png', en: '/uploads/aba-en.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A: zh下编辑文本 + 确认图片
    await page.locator('input[name="textField"]').fill('zh文本A');
    expect(await getImgSrc(page)).toContain('aba-zh.png');
    await page.waitForTimeout(300);

    // B: 切en, 编辑文本 + 确认图片
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('en文本B');
    expect(await getImgSrc(page)).toContain('aba-en.png');
    await page.waitForTimeout(300);

    // A: 切回zh
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    // A验证: 文本保留zh编辑值, 图片为zh值
    await expect(page.locator('input[name="textField"]')).toHaveValue('zh文本A');
    expect(await getImgSrc(page)).toContain('aba-zh.png');

    // 再切en: 文本保留en编辑值, 图片为en值
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await expect(page.locator('input[name="textField"]')).toHaveValue('en文本B');
    expect(await getImgSrc(page)).toContain('aba-en.png');
    del(id);
  });

  test('ABA.8 图片ABA: zh上传 / en上传 / 回zh不同URL', async ({ page }) => {
    const id = uniq('aba');
    setupWithImage(id, { zh: '/uploads/aba-zh.png', en: '/uploads/aba-en.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A: zh是aba-zh.png
    expect(await getImgSrc(page)).toContain('aba-zh.png');
    // B: en是aba-en.png（完全不同）
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    expect(await getImgSrc(page)).toContain('aba-en.png');
    // A: 再回zh
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    // 验证: zh/en值独立且URL不同
    const zhUrl = await getImgSrc(page);
    expect(zhUrl).toContain('aba-zh.png');

    await sw(page, 'en');
    await page.waitForTimeout(1000);
    const enUrl = await getImgSrc(page);
    expect(enUrl).toContain('aba-en.png');

    // zh和en的URL不同（独立）
    expect(zhUrl).not.toBe(enUrl);
    del(id);
  });

  test('ABA.9 ABA + 提交: 数据合并为{zh: 值A, en: 值B}', async ({ page }) => {
    const id = uniq('aba');
    setupWithImage(id, { zh: '/uploads/aba-zh.png', en: '/uploads/aba-en.png' });
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // A: zh设值 → 提交
    await page.locator('input[name="textField"]').fill('zh文本A');
    await page.waitForTimeout(300);
    let r = page.waitForResponse(u => u.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    await page.waitForTimeout(500);

    // B: en设值 → 提交
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await page.locator('input[name="textField"]').fill('en文本B');
    await page.waitForTimeout(300);
    r = page.waitForResponse(u => u.url().includes('/api/page/save'));
    await page.locator('button[type="submit"]').click();
    await r;
    await page.waitForTimeout(500);

    // 验证: 数据文件合并正确
    const d = readData(id);
    expect(d.textField).toEqual({ zh: 'zh文本A', en: 'en文本B' });
    expect(d.image).toEqual({ zh: '/uploads/aba-zh.png', en: '/uploads/aba-en.png' });
    del(id);
  });

  test('ABA.11 A→B→A→B 配置完整性: 每轮检查控件与内容', async ({ page }) => {
    const id = uniq('aba');
    setup(id);
    await go(page, id);
    await expect(page.locator('.cxd-ImageControl').first()).toBeVisible({ timeout: 8000 });

    // 检查清单: 表单标题、字段label、占位提示、语言切换器、提交按钮、组件wrapper
    const checks = async (label: string) => {
      await expect(page.locator('.cxd-Panel-title')).toBeVisible();
      await expect(page.locator('.cxd-ImageControl')).toBeVisible();
      await expect(page.locator('.language-switcher')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.locator('input[name="textField"]')).toBeVisible();
      await expect(page.locator('textarea[name="textArea"]')).toBeVisible();
      await expect(page.locator('.cxd-Select').first()).toBeVisible();
      await expect(page.locator('.cxd-Switch').first()).toBeVisible();
      await expect(page.locator('.cxd-DatePicker').first()).toBeVisible();
      // 控件内容完整
      await expect(page.locator('.cxd-Panel-title')).toContainText('多语言测试');
      await expect(page.locator('button[type="submit"]')).toContainText('提交');
    };

    // A: zh
    await checks('zh-1');
    // B: en
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await checks('en-1');
    // A: 回zh
    await sw(page, 'zh');
    await page.waitForTimeout(1000);
    await checks('zh-2');
    // B: 再切en
    await sw(page, 'en');
    await page.waitForTimeout(1000);
    await checks('en-2');

    del(id);
  });
});
