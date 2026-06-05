# 多语言 E2E 测试模板

## 通用测试模式

每个组件覆盖以下 5 个维度：

```
① 初始渲染     →  组件可见，中文值正确
② 内容回显     →  {zh, en} 数据正确拍平成当前语言
③ 语言切换     →  zh→en 值变化，en→zh 值恢复
④ 编辑保留     →  编辑 → 切换 → 回切 → 编辑值保留（persist）
⑤ 提交完整性   →  DOM 值 = 文件保存值
```

---

## 模板 A：标准文本输入（有 input[name] 属性）

适用于：input-text, textarea, input-email, input-url, input-password, input-number

```typescript
test('组件名: 编辑→切英→回中保留', async ({ page }) => {
  const loc = () => page.locator('input[name="fieldName"]');
  const init = await loc().inputValue();
  await loc().fill('编辑值');
  await sw(page, 'en');
  await sw(page, 'zh');
  await expect(loc()).toHaveValue('编辑值');
  expect(await loc().inputValue()).not.toBe(init);
});
```

```typescript
test('组件名: DOM 值 = 提交值', async ({ page }) => {
  await page.locator('input[name="fieldName"]').fill('DOM一致值');
  const r = page.waitForResponse(r => r.url().includes('/api/page/save'));
  await page.locator('button[type="submit"]').click();
  await r;
  const saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  expect(saved.fieldName?.zh || saved.fieldName).toBe('DOM一致值');
});
```

## 模板 B：选项类（select/radio/checkbox）

适用于：select, radios, checkboxes

依赖 `collectFieldOptions` 提取的 label→value 映射。

```typescript
test('radios: 切换选项→切英→回中保留', async ({ page }) => {
  await page.locator('.cxd-Checkbox--radio--default').filter({ hasText: '选项二' }).click();
  const val = await readField(page, 'radio');
  await sw(page, 'en');
  await sw(page, 'zh');
  await expect(readField(page, 'radio')).toEqual(val);
});
```

## 模板 C：日期/时间类

适用于：input-date, input-time, input-month, input-datetime, input-date-range

依赖 placeholder 匹配 `.cxd-DatePicker-input`。

```typescript
test('input-date: 编辑→切英→回中保留', async ({ page }) => {
  await assertPersist(page,
    () => page.evaluate(() => /* 查找 placeholder 匹配的 input */),
    async () => {
      await page.evaluate(() => {
        const el = document.querySelector('.cxd-DatePicker-input');
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (setter) setter.call(el, '2026-12-25');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    },
    '2026-12-25');
});
```

## 模板 D：状态类（switch/color/rating）

适用于：switch, input-color, input-rating

```typescript
test('switch: 切换→切英→回中保留', async ({ page }) => {
  await assertPersist(page,
    () => page.evaluate(() => document.querySelector('.cxd-Switch.is-checked') ? '开' : '关'),
    async () => { await page.locator('.cxd-Switch').click({ force: true }); },
    '关');
});
```

## 模板 E：图片上传

适用于：input-image

需要 mock upload 端点：

```typescript
await page.route('**/api/upload**', async (route) => {
  await route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ status: 0, data: { value: '/uploads/test.png' } }),
  });
});

const fileInput = page.locator('.cxd-ImageControl input[type="file"]');
await fileInput.setInputFiles('/tmp/test-image.png');
await expect(page.locator('.cxd-ImageControl img')).toBeVisible();
await sw(page, 'en');
await sw(page, 'zh');
await expect(page.locator('.cxd-ImageControl img')).toBeVisible();
```

## 模板 F：FieldWithExcludeV2

适用于：field-with-exclude-v2

```typescript
// Exclude 复选框点需要通过 ReactProps 触发
await page.evaluate(() => {
  const el = document.querySelector('.field-with-exclude-v2-checkbox-wrap');
  const key = Object.keys(el).find(k => k.startsWith('__reactProps'));
  if (key && typeof el[key]?.onClick === 'function')
    el[key].onClick({ preventDefault: () => {}, stopPropagation: () => {} });
});
```

## 通用断言工具

```typescript
import * as fs from 'fs';
const DATA_FILE = 'public/api/data/form-test-multi-lang-data.json';

function sw(page, lang) {
  return page.locator('.language-switcher select').selectOption(lang);
}

async function readField(page, field) {
  return page.evaluate((f) => {
    const scope = document.querySelector('.amis-scope');
    if (!scope) return undefined;
    const ck = Object.keys(scope).find(k => k.startsWith('__reactContainer'));
    if (!ck) return undefined;
    const walk = (fiber) => {
      if (!fiber) return undefined;
      if (fiber.stateNode?.store?.data?.[f] !== undefined)
        return fiber.stateNode.store.data[f];
      return walk(fiber.child) ?? walk(fiber.sibling);
    };
    return walk((scope as any)[ck]);
  }, field);
}
```

## 测试覆盖矩阵

| 组件 | 模板 | 初始值 | 语言切换 | 编辑保留 | 提交完整性 |
|------|------|--------|---------|---------|----------|
| input-text | A | ✅ | ✅ | ✅ | ✅ |
| textarea | A | ✅ | ✅ | ✅ | ✅ |
| input-email | A | ✅ | ✅ | ✅ | ✅ |
| input-url | A | ✅ | ✅ | ✅ | ✅ |
| input-password | A | ✅ | ✅ | ✅ | ✅ |
| input-number | A | ✅ | ✅ | ✅ | ✅ |
| select | B | ✅ | ✅ | ✅ | ✅ |
| radios | B | ✅ | ✅ | ⚠️ | ✅ |
| checkboxes | B | ✅ | ✅ | ⚠️ | ✅ |
| input-date | C | ✅ | ✅ | ✅ | ✅ |
| input-time | C | ✅ | ❌ | ❌ | ❌ |
| input-month | C | ✅ | ✅ | ✅ | ✅ |
| input-datetime | C | ✅ | ✅ | ✅ | ✅ |
| input-date-range | C | ✅ | ❌ | ❌ | ❌ |
| input-color | D | ✅ | ✅ | ✅ | ✅ |
| input-rating | D | ✅ | ✅ | ✅ | ✅ |
| switch | D | ✅ | ✅ | ⚠️ | ✅ |
| input-image | E | ❌ | ✅ | ✅ | ✅ |
| field-with-exclude-v2 | F | ✅ | ✅ | ✅ | ✅ |
| richText | — | ✅ | ❌ | ❌ | ❌ |
| tag | — | ✅ | ❌ | ❌ | ❌ |
