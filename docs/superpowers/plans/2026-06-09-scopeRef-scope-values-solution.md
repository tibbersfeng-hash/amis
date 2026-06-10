# scopeRef + getValues() 替代 DOM 选择器实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 amis 官方 API（scopeRef + getValues/setValues）替换现有的 DOM 选择器方案（readDomValue/writeDomValue），实现 multiLang 表单字段值的可靠读写。

**Architecture:** 在 renderAmis 时通过 scopeRef 回调获取 amis Scoped 实例，后续从 amis store 读取表单值（getValues）而非 DOM 选择器，删除 ~200 行脆弱的 DOM 选择器代码。

**Tech Stack:** React 17 + TypeScript + Vite 8 + Amis 6.13 + Playwright (E2E)

---

## 文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/components/AmisPage/index.tsx` | 核心改动：注入 form name、添加 scopeRef、替换 persistToLookup、简化 mergeI18nData |
| 测试 | `tests/e2e/amis-i18n.spec.ts` | 现有测试，回归验证 |
| 测试 | `tests/e2e/amis-i18n-persist.spec.ts` | 现有测试，回归验证 |
| 测试 | `tests/e2e/amis-i18n-data-integrity.spec.ts` | 现有测试，回归验证 |
| 测试 | `tests/e2e/amis-i18n-per-component.spec.ts` | 现有测试，回归验证 |
| 测试 | `tests/e2e/rich-text-multilang.spec.ts` | 现有测试，回归验证 |
| 测试 | `tests/e2e/amis-i18n-image.spec.ts` | 现有测试，回归验证 |

---

### Task 1: 注入 form name 到 schema

**Files:**
- Modify: `src/components/AmisPage/index.tsx`

- [ ] **Step 1: 添加 FORM_NAME 常量和 injectFormName 函数**

在 `src/components/AmisPage/index.tsx` 的 `// ── i18n helpers ──` 注释之后、`isI18nValue` 函数之前，添加：

```typescript
// ── Form name injection ─────────────────────────────────────

const FORM_NAME = 'multiLangForm';

/** 给 schema 中的 form 注入 name 属性，以便 scopeRef + getComponentByName 能定位到表单 */
function injectFormName(schema: Record<string, unknown>): Record<string, unknown> {
  if (schema.type === 'form' && !schema.name) {
    return { ...schema, name: FORM_NAME };
  }
  if (schema.type === 'page' && Array.isArray(schema.body)) {
    return {
      ...schema,
      body: schema.body.map(item => {
        if (typeof item === 'object' && item?.type === 'form' && !item.name) {
          return { ...(item as Record<string, unknown>), name: FORM_NAME };
        }
        return item;
      }),
    };
  }
  return schema;
}
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "feat: inject form name into schema for scopeRef support"
```

---

### Task 2: 添加 scopeRef 回调获取 amisScoped 实例

**Files:**
- Modify: `src/components/AmisPage/index.tsx`

- [ ] **Step 1: 在 AmisPage 组件中添加 scopedRef**

在 `containerRef` 声明之后，添加 scopedRef：

```typescript
const scopedRef = useRef<any>(null);
```

- [ ] **Step 2: 在 renderAmis 调用中添加 scopeRef**

将 `useEffect` 中的 `renderAmis` 调用从：

```typescript
const amisElement = renderAmis(
  schema,
  {
    data: {
      ...displayData,
      previewLanguage: currentLang,
    },
    locale,
    theme: 'antd',
  },
  {
```

改为：

```typescript
const amisElement = renderAmis(
  injectFormName(schema),
  {
    data: {
      ...displayData,
      previewLanguage: currentLang,
    },
    locale,
    theme: 'antd',
    scopeRef: (ref: any) => { scopedRef.current = ref; },
  },
  {
```

关键改动：
1. `schema` → `injectFormName(schema)` — 注入 form name
2. 在 render props 中添加 `scopeRef: (ref: any) => { scopedRef.current = ref; }`

- [ ] **Step 3: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "feat: add scopeRef callback to capture amisScoped instance"
```

---

### Task 3: 替换 persistToLookup — 用 getValues() 替代 readDomValue

**Files:**
- Modify: `src/components/AmisPage/index.tsx`

- [ ] **Step 1: 删除 readDomValue 函数（~120 行）**

完全删除 `readDomValue` 函数（从 `function readDomValue(` 到最后的 `return undefined;` 和 `}`）。

- [ ] **Step 2: 重写 persistToLookup**

将现有的 `persistToLookup` 函数（接受 `fieldOptions` 参数、调用 `readDomValue`）替换为：

```typescript
/** 从隐藏的 data-field-name div 中读取 FieldWithExclude 值 */
function readExcludeFieldData(field: string): unknown | undefined {
  const excludeData = document.querySelector(`div[data-field-name="${field}"]`);
  if (excludeData) {
    try {
      const parsed = JSON.parse(excludeData.textContent || '{}');
      if (parsed && typeof parsed === 'object' && field in parsed) {
        return parsed[field];
      }
    } catch { /* ignore */ }
  }
  return undefined;
}

/** 持久化当前语言的值到 lookup — 优先从 amis store 读取，fallback 保留特殊处理 */
function persistToLookup(
  scoped: any,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string,
  richTextFields?: string[]
): Record<string, Record<string, unknown>> {
  const form = scoped?.getComponentByName(FORM_NAME);
  const storeValues = form?.getValues() || {};
  const updated = { ...lookup };

  for (const field of fields) {
    // tag 字段跳过（input-tag 的 store 值可能包含未确认的新标签）
    if (field === 'tag') continue;

    // ① 优先从 amis store 读取
    let currentVal: unknown | undefined;
    if (field in storeValues) {
      currentVal = storeValues[field];
    }

    // ② fallback: 自定义组件的隐藏数据 div（FieldWithExcludeV2 excludeName）
    if (currentVal === undefined) {
      currentVal = readExcludeFieldData(field);
    }

    // ③ fallback: TinyMCE 富文本
    if (currentVal === undefined && richTextFields?.includes(field)) {
      currentVal = (window as any).tinymce?.activeEditor?.getContent();
    }

    // ④ fallback: Image 组件（从 DOM 读）
    if (currentVal === undefined) {
      const imgControl = document.querySelector(
        `[data-amis-name="${field}"] .antd-ImageControl`
      );
      if (imgControl) {
        const img = imgControl.querySelector('img') as HTMLImageElement | null;
        if (img?.src && img.src !== window.location.href) currentVal = img.src;
      }
    }

    // 只有成功获取到值才更新 lookup
    if (currentVal !== undefined) {
      const prev = updated[field] || { zh: '', en: '' };
      updated[field] = { ...prev, [lang]: currentVal };
    }
    // 如果所有方式都没获取到值，保持 lookup 中旧值不变
  }
  return updated;
}
```

- [ ] **Step 3: 更新 handleLanguageChange 调用**

将 `handleLanguageChange` 中的 `persistToLookup` 调用从：

```typescript
const updated = persistToLookup(lookupRef.current, i18nFields, langRef.current, fieldOptions, richTextFields);
```

改为：

```typescript
const updated = persistToLookup(scopedRef.current, lookupRef.current, i18nFields, langRef.current, richTextFields);
```

- [ ] **Step 4: 删除 writeDomValue 函数（~40 行）**

完全删除 `writeDomValue` 函数。

- [ ] **Step 5: 删除 applyFromLookup 函数（~12 行）**

完全删除 `applyFromLookup` 函数（因为语言切换通过整树重渲染实现）。

- [ ] **Step 6: 删除 collectFieldOptions 函数（~25 行）及其引用**

删除 `collectFieldOptions` 函数定义，以及组件中所有对它的引用：

```typescript
// 删除这行：
const fieldOptions = useMemo(() => collectFieldOptions(schema), [schema]);
```

同时在 `fetcher` 回调的 `mergeI18nData` 调用中删除 `fieldOptions` 参数（见 Task 4）。

- [ ] **Step 7: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "refactor: replace readDomValue/writeDomValue with getValues() from amis store"
```

---

### Task 4: 简化 mergeI18nData — 改用 api.data

**Files:**
- Modify: `src/components/AmisPage/index.tsx`

- [ ] **Step 1: 重写 mergeI18nData**

将现有的 `mergeI18nData` 函数替换为：

```typescript
/** Merge current values into {zh, en} for all multiLang fields */
function mergeI18nData(
  rawData: Record<string, unknown>,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  currentLang: string,
): Record<string, unknown> {
  const merged = { ...rawData };
  for (const field of fields) {
    let rawVal = rawData[field];

    // 已经是 {zh, en} 结构，跳过
    if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal)) {
      if ('zh' in (rawVal as object) || 'en' in (rawVal as object)) continue;
    }

    let storeVal: unknown;
    if (Array.isArray(rawVal)) {
      // 数组值直接使用
      storeVal = rawVal;
    } else if (rawVal === undefined || rawVal === null) {
      // 未设置值，fallback 到 api.data 中的原始值（可能是 boolean）
      storeVal = typeof rawVal === 'boolean' ? rawVal : undefined;
    } else {
      storeVal = rawVal;
    }

    if (storeVal === undefined) continue;

    const existing = lookup[field];
    // boolean/array 值不随语言变化，双写
    if (typeof storeVal === 'boolean' || Array.isArray(storeVal)) {
      merged[field] = { zh: storeVal, en: storeVal };
    } else if (existing) {
      // 用当前语言的值覆盖，保留另一语言
      merged[field] = { ...existing, [currentLang]: storeVal };
    } else {
      merged[field] = { zh: storeVal, en: storeVal };
    }
  }
  return merged;
}
```

关键变化：
- 删除 `fieldOptions` 参数
- 不再调用 `readDomValue`，直接使用 `rawData` 中的值（即 amis 提交时从 store 中取的值）
- 保留 `typeof storeVal === 'boolean'` 和 `Array.isArray(storeVal)` 判断（boolean/array 双写逻辑）

- [ ] **Step 2: 更新 fetcher 中的 mergeI18nData 调用**

将 `fetcher` 回调中的调用从：

```typescript
const merged = mergeI18nData(
  api.data as Record<string, unknown>,
  lookupRef.current,
  i18nFields,
  langRef.current,
  fieldOptions,
);
```

改为：

```typescript
const merged = mergeI18nData(
  api.data as Record<string, unknown>,
  lookupRef.current,
  i18nFields,
  langRef.current,
);
```

同时删除 `fetcher` 的 `useCallback` 依赖数组中的 `fieldOptions`：

从 `[i18nFields, fieldOptions]` 改为 `[i18nFields]`。

- [ ] **Step 3: 更新 handleLanguageChange 的依赖数组**

由于 `fieldOptions` 不再存在，将 `handleLanguageChange` 的 `useCallback` 依赖从：

```typescript
[i18nFields, fieldOptions, richTextFields]
```

改为：

```typescript
[i18nFields, richTextFields]
```

- [ ] **Step 4: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "refactor: simplify mergeI18nData to use api.data instead of DOM values"
```

---

### Task 5: TypeScript 编译 + 运行 E2E 回归

**Files:**
- Modified: `src/components/AmisPage/index.tsx`（所有改动集中在这一文件）
- Test: 全部 i18n 相关 E2E 测试

- [ ] **Step 1: TypeScript 编译检查**

```bash
cd /var/www/amis-mission
npx tsc --noEmit 2>&1 | head -30
```

Expected: 无错误。如果有类型错误，修复后重新编译。

- [ ] **Step 2: 运行 E2E 测试**

```bash
cd /var/www/amis-mission
npx playwright test tests/e2e/amis-i18n.spec.ts tests/e2e/amis-i18n-persist.spec.ts tests/e2e/amis-i18n-data-integrity.spec.ts tests/e2e/amis-i18n-per-component.spec.ts tests/e2e/rich-text-multilang.spec.ts tests/e2e/amis-i18n-image.spec.ts --reporter=line
```

Expected: 全部通过。重点关注：
- 语言切换后值是否正确
- 编辑后切换语言是否保留值
- 提交保存是否存为 `{zh, en}` 格式
- 富文本多语言
- 图片上传多语言

- [ ] **Step 3: 如果测试失败，调试修复**

失败的测试通常意味着：
- `scopeRef` 未在正确时机触发 → 用 `setTimeout` 延迟 getValues 调用
- 某个特殊组件类型的 store 值不在预期格式 → 添加 fallback
- `getValues()` 返回时机问题 → 用 `requestAnimationFrame` 包裹

- [ ] **Step 4: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "fix: address E2E test failures for scopeRef migration"
```

---

### Task 6: 运行完整 E2E 测试套件

**Files:**
- 无代码改动，仅验证

- [ ] **Step 1: 运行全部 E2E 测试**

```bash
cd /var/www/amis-mission
npx playwright test --reporter=line
```

Expected: 全部通过。确保改动没有影响到非 i18n 功能。

- [ ] **Step 2: 确认代码量减少**

```bash
cd /var/www/amis-mission
git diff --stat HEAD~5
```

Expected: 净删除 ~200 行代码（删除 readDomValue/writeDomValue/applyFromLookup/collectFieldOptions + 简化 persistToLookup/mergeI18nData）。

- [ ] **Step 3: Final commit（如果有修复）**

```bash
cd /var/www/amis-mission
git add -A
git commit -m "chore: verify full E2E suite passes after scopeRef migration"
```

---

## 风险与缓解

| # | 风险 | 缓解 |
|---|------|------|
| 1 | `scopeRef` 在 amis 6.13 中 API 不同 | Task 1+2 后立即验证，如不兼容则回退 |
| 2 | `getValues()` 返回时机（渲染延迟） | 用 `setTimeout` 或 `requestAnimationFrame` 延迟调用 |
| 3 | 自定义组件值不在 store | 保留 fallback 到 `[data-field-name]` div 和 DOM 读取 |
| 4 | boolean/array 值被当作语言相关值处理 | `mergeI18nData` 中保留 `typeof boolean`/`Array.isArray` 判断 |
| 5 | `getValues()` 不包含未编辑字段 | 保持 lookup 旧值不变，不覆盖 |
| 6 | tag 字段读到未确认的新标签值 | `persistToLookup` 中 `if (field === 'tag') continue;` |
