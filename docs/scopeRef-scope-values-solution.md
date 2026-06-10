# 方案 A：scopeRef + getValues() / setValues() 替代 DOM 选择器

> 用 amis 官方 API 替代 DOM 选择器，实现 multiLang（表单内容多语言）的值读写。

---

## 1. 背景

### 1.1 问题定义

MultiLang 解决的是**表单字段内容的多语言编辑**：

用户在中文下编辑 `hotelName` 的中文值 → 切换英文 → 编辑英文值 → 最终保存为：

```json
{ "hotelName": { "zh": "北京国际饭店", "en": "Beijing International Hotel" } }
```

### 1.2 当前方案的痛点

当前通过 `readDomValue()` / `writeDomValue()` 用 DOM 选择器模拟值读写：

```typescript
// 每种组件类型都需要单独的 DOM 选择器逻辑
function readDomValue(field, fieldOptions, isRichText) {
  // Select: 从 DOM 中找 .antd-Select-value → 读 label 文本 → 匹配 value
  // Checkbox: 找 .antd-Checkbox--radio--default.checked → 读 label → 匹配 value
  // DatePicker: 找 .antd-DatePicker-input → 按 placeholder 匹配字段名
  // Switch: 找 .antd-Switch.is-checked → 判断是否存在
  // Image: 找 [data-amis-name] .antd-ImageControl → 读 img.src
  // ... 10+ 种选择器
}
```

**问题**：
- 依赖 10+ 种 CSS 类名，主题更换（`cxd` → `antd`）后必须全部修改
- Select/Checkbox/Radio 需要 label→value 映射，复杂且易错
- DOM 读取存在时序问题（amis 渲染延迟、值未同步）
- 新增组件类型需要新增对应的 read/write 逻辑

---

## 2. 核心概念

### 2.1 三个关键 API

| 名称 | 类型 | 作用 |
|------|------|------|
| `renderAmis` | 函数 | 将 JSON schema 渲染为 React 元素（入口） |
| `scopeRef` | 回调函数 | amis 渲染完成后，把内部 Scoped 实例传给你 |
| `amisScoped` | 对象 | amis 渲染实例（"遥控器"），可获取组件、读写值 |

### 2.2 关系图

```
renderAmis(schema, { scopeRef: (ref) => { amisScoped = ref; } }, env)
    │
    │  ① 渲染 JSON schema
    │  ② 构建 Scoped 上下文
    │  ③ 调用 scopeRef 回调，传入 Scoped 实例
    │
    ▼
返回 React Element ──► ReactDOM.render(element, container)
                            │
                            ▼
                     DOM 中渲染出页面
                            │
    scopeRef 回调触发 ◄─────┘
    │
    ▼
amisScoped = ref   ← 拿到了遥控器

后续操作：
  amisScoped.getComponentByName('formName').getValues()  // 读值
  amisScoped.getComponentByName('formName').setValues()  // 写值
```

### 2.3 getComponentByName

```typescript
// 获取已渲染的 form 组件实例
const form = amisScoped.getComponentByName('multiLangForm');
```

**参数**：组件的 `name` 属性（需要在 schema 中设置）。

**注意**：如果 form 嵌套在 page 中，name 路径为 `pageName.formName`。当前项目 schema 顶层就是 `{"type": "form", ...}`，直接设 name 即可。

### 2.4 getValues()

```typescript
const values = form.getValues();
```

**返回值**：表单所有字段的当前值（从 amis store 读取，不依赖 DOM）。

**返回示例**：
```json
{
  "hotelName": "北京国际饭店",
  "hotelBrand": "shangri-la",
  "roomCount": 500,
  "contactPhone": "010-88886666"
}
```

**关键优势**：不同类型组件返回的都是**真实值**，不是 DOM 文本：

| 组件类型　　　　　 | getValues() 返回值　　　| 当前方案的问题　　　　　　　　　　　　　 |
| --------------------| :-----------------------:| :----------------------------------------:|
| `input-text`　　　 | `"文本"`　　　　　　　　| 用 `input[name].value`，勉强可用　　　　 |
| `select`　　　　　 | `"shangri-la"`（value） | 从 DOM 读 label 文本 → 映射 value，易错　|
| `radios`　　　　　 | `"option1"`（value）　　| 同上　　　　　　　　　　　　　　　　　　 |
| `checkboxes`　　　 | `["a", "b"]`（数组）　　| 从 DOM 数 checked 数量 → 映射，极易错　　|
| `switch`　　　　　 | `true` / `false`　　　　| 从 DOM 判断 `.is-checked` 是否存在　　　 |
| `input-date`　　　 | `"2026-06-01"`　　　　　| 从 DOM 读 value，勉强可用　　　　　　　　|
| `input-date-range` | `{start, end}` 或字符串 | 从 DOM 读两个 input，靠 placeholder 匹配 |
| `input-color`　　　| `"#4A5CBF"`　　　　　　 | 从 DOM 读 input value　　　　　　　　　　|
| `input-number`　　 | `500`（number）　　　　 | 从 DOM 读字符串　　　　　　　　　　　　　|
| `input-image`　　　| `"https://..."`　　　　 | 从 DOM 读 img.src　　　　　　　　　　　　|

### 2.5 setValues()

```typescript
form.setValues({ hotelName: "新名称", city: "新城市" });
```

**参数**：一个对象，键为字段名，值为新值。

**行为**：合并写入（不是覆盖），只更新传入的字段。

---

## 3. 当前代码完整数据流

```
┌─────────────────────────────────────────────────────────┐
│                     AmisPage 组件                        │
│                                                         │
│  schema (JSON) ──► collectMultiLangFields()             │
│                    收集 multiLang: true 的字段名         │
│                                                         │
│  formData ──────► buildLookup()                         │
│                   提取 {zh, en} 对象到 lookup             │
│                                                         │
│  lookup + currentLang ──► flattenData()                 │
│                            扁平化 → displayData           │
│                                                         │
│  renderAmis(schema, {data: displayData}, {fetcher})     │
│      │                                                    │
│      ├─ 用户编辑表单 ──► (DOM 更新)                      │
│      │                                                    │
│      └─ 提交 ────────► fetcher 拦截                      │
│                          mergeI18nData()                 │
│                          readDomValue() × N              │
│                          → {zh, en} 合并 ──► POST         │
│                                                         │
│  语言切换 ───────► handleLanguageChange()                │
│                    persistToLookup()                     │
│                    readDomValue() × N (10+ 种组件选择器)  │
│                    → 更新 lookup → 重新 renderAmis        │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 方案 A 实施方案

### 4.1 给 schema 注入 name 属性

当前 schema（如 `hotel-basic-schema.json`）：

```json
{
  "type": "form",
  "title": "酒店基础信息",
  "api": "post:/api/page/save?dataId=${dataId}&dataType=${dataType}",
  "body": [ ... ]
}
```

**没有 name**，需要在渲染时注入：

```typescript
// src/components/AmisPage/index.tsx

const FORM_NAME = 'multiLangForm';

/** 给 schema 中的 form 注入 name 属性 */
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

### 4.2 添加 scopeRef 获取引用

```typescript
const scopedRef = useRef<any>(null);

const amisElement = renderAmis(
  injectFormName(schema),
  {
    data: { ...displayData, previewLanguage: currentLang },
    scopeRef: (ref: any) => { scopedRef.current = ref; },  // ← 新增
    locale,
    theme: 'antd',
  },
  {
    session: 'mission-cms',
    theme: 'antd',
    locale,
    fetcher,
    isCancel: (value: unknown) => (value as Error)?.message === 'cancel',
    confirm: (msg: string) => Promise.resolve(confirm(msg)),
    notify: (type: string, msg: string) => console.log(`[amis] ${type}: ${msg}`),
  },
  ''
);
```

### 4.3 替换 persistToLookup（读值）

**当前实现**（~20 行，调用 `readDomValue` 遍历 10+ 种选择器）：

```typescript
// BEFORE
function persistToLookup(
  lookup, fields, lang, fieldOptions, richTextFields
): Record<string, Record<string, unknown>> {
  const updated = { ...lookup };
  for (const field of fields) {
    const currentVal = readDomValue(field, fieldOptions, richTextFields?.includes(field));
    if (currentVal !== undefined) {
      const prev = updated[field] || { zh: '', en: '' };
      updated[field] = { ...prev, [lang]: currentVal };
    }
  }
  return updated;
}
```

**改为**（优先从 `getValues()` 获取，fallback 保留特殊处理）：

```typescript
const FORM_NAME = 'multiLangForm';

/** 从 amis store 读取当前字段值 */
function getStoreValue(form: any, field: string): unknown | undefined {
  const values = form?.getValues() || {};
  if (field in values) return values[field];
  return undefined;
}

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

/** 持久化当前语言的值到 lookup */
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
      // 如果值是数组（如 checkboxes），保持数组格式
      if (Array.isArray(currentVal)) {
        updated[field] = { ...prev, [lang]: currentVal };
      } else {
        updated[field] = { ...prev, [lang]: currentVal };
      }
    }
    // 如果所有方式都没获取到值，保持 lookup 中旧值不变
    // （字段从未被编辑过，不需要覆盖）
  }
  return updated;
}
```

**语言切换时的调用**：

```typescript
const handleLanguageChange = useCallback(
  (newLang: Language) => {
    if (newLang === langRef.current) return;
    const updated = persistToLookup(
      scopedRef.current,        // ← 传入 scoped 实例
      lookupRef.current,
      i18nFields,
      langRef.current,
      richTextFields,
    );
    setLookup(updated);
    langRef.current = newLang;
    setCurrentLang(newLang);
  },
  [i18nFields, richTextFields]
);
```

### 4.4 applyFromLookup（写值）— 实际上不需要

**关键发现**：当前代码的语言切换机制是通过 `displayData` 变化触发 `useEffect` 重新 `renderAmis` 来完成的：

```typescript
// useEffect 依赖 displayData 和 currentLang
useEffect(() => {
  // ... renderAmis(...)
}, [schema, displayData, locale, currentLang]);
```

当 `lookup` 更新 → `displayData` 变化 → `useEffect` 重新执行 → 销毁旧 amis 实例 → 渲染新实例。

新实例从 `displayData` 拿到新语言的值，直接显示。

**因此 `setValues()` 在这个场景下不需要使用**，因为整棵树本来就是重新渲染的。

如果需要不重新渲染整棵树就切换语言（性能优化场景），可以用：

```typescript
function applyFromLookup(
  scoped: any,
  lookup: Record<string, Record<string, unknown>>,
  fields: string[],
  lang: string,
): void {
  const form = scoped?.getComponentByName(FORM_NAME);
  if (!form) return;

  const updates: Record<string, unknown> = {};
  for (const field of fields) {
    const vals = lookup[field];
    if (vals) {
      updates[field] = vals[lang] ?? vals['zh'];
    }
  }

  if (Object.keys(updates).length > 0) {
    form.setValues(updates);  // 一次批量设置
  }
}
```

### 4.5 fetcher 中 mergeI18nData 简化

**当前**：`mergeI18nData` 中对数组以外的字段调用 `readDomValue`，包含 boolean/array 双写逻辑：

```typescript
// BEFORE（346-365 行）
if (Array.isArray(rawVal)) {
  domVal = rawVal;              // 数组值直接用
} else {
  domVal = readDomValue(field, fieldOptions);
  if (domVal === undefined) {
    domVal = typeof rawVal === 'boolean' ? rawVal : String(rawVal);  // boolean fallback
  }
}

// 关键判断：boolean/array 双写
if (typeof domVal === 'boolean' || Array.isArray(domVal)) {
  merged[field] = { zh: domVal, en: domVal };   // ← 不随语言变化，双写
} else {
  merged[field] = { ...existing, [currentLang]: domVal };  // ← 按语言分开
}
```

**改为**：`api.data` 是 amis 提交时从 store 中取的值，已经包含当前所有表单值。保留 boolean/array 双写逻辑：

```typescript
// AFTER
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


---

## 5. 边界情况分析

### 5.1 标准表单组件

以下组件 `getValues()` / `setValues()` 完全支持，**无需特殊处理**：

| 组件 | getValues 返回值 | setValues 写入值 |
|------|:---:|:---:|
| `input-text` | string | string |
| `textarea` | string | string |
| `input-password` | string | string |
| `input-number` | number | number |
| `select` | value（string/number） | value |
| `radios` | value | value |
| `checkboxes` | value[]（数组） | value[] |
| `switch` | boolean | boolean |
| `input-date` | string | string |
| `input-time` | string | string |
| `input-datetime` | string | string |
| `input-date-range` | 对象或字符串 | 对象或字符串 |
| `input-color` | hex string | hex string |
| `input-tag` | string[] | string[] | **需要跳过**（store 值可能包含未确认的新标签，`persistToLookup` 中 `if (field === 'tag') continue;`） |
| `transfer` | value[] | value[] |
| `cascader` | value[] | value[] |
| `tree-select` | value | value |

### 5.2 自定义组件

#### FieldWithExcludeV2

使用 `onChange({ [checkboxName]: bool })` 和 `onBulkChange()` 写入 store。
`getValues()` 会返回所有字段（`name`、`excludeName`、`checkboxName`）的值。

**处理**：
- 主字段（`name`）：从 `getValues()` 获取
- 排除字段（`excludeName`、`excludeCheckboxName`）：如果 `getValues()` 中不存在，fallback 到 `[data-field-name="${field}"]` 隐藏 div 中读取

#### DateRangePicker

使用 `onChange({ [startName]: val, [endName]: val })` 写入两个独立字段。
`getValues()` 会分别返回 `startName` 和 `endName` 的值。

**处理**：`startName` 和 `endName` 需要在 schema 中标记 `multiLang: true` 才会被收集（如果不需要多语言则不标记）。

### 5.3 Rich Text (TinyMCE)

`input-rich-text` 组件中 TinyMCE 的内容是否实时同步到 store 取决于实现。

**处理方案**：
1. 先尝试从 `getValues()` 获取
2. 如果为空，fallback 到 `window.tinymce?.activeEditor.getContent()`
3. 大多数情况下 `getValues()` 已有值（amis input-rich-text 默认会同步）

### 5.4 Image 上传

`input-image` 组件的值是图片 URL 或 URL 数组。
`getValues()` 应该直接返回 store 中的值。

**处理方案**：先用 `getValues()`，如果返回 undefined 则 fallback 到当前 DOM 方式（读 `img.src`）。

---

## 6. 可以删除的代码

| 文件 | 函数 | 行数 | 状态 |
|------|------|------|------|
| AmisPage | `readDomValue` | ~120 | ✅ 删除（TinyMCE/Image fallback 内联到 persistToLookup） |
| AmisPage | `writeDomValue` | ~40 | ✅ 完全删除（不需要写值，整树重渲染） |
| AmisPage | `collectFieldOptions` | ~25 | ✅ 完全删除（不再需要 label→value 映射） |
| AmisPage | `applyFromLookup` | ~12 | ✅ 删除（整树重渲染切换语言） |
| AmisPage | `persistToLookup` 参数 | - | ✅ 简化（去掉 fieldOptions，保留 richTextFields） |
| AmisPage | `mergeI18nData` DOM 读取 | ~10 | ✅ 改用 api.data（保留 boolean/array 判断） |
| **合计可删除** | | **~200 行** | |

**保留的 fallback 逻辑**（内联到 `persistToLookup`，约 15 行）：
- `[data-field-name]` 隐藏 div 读取（FieldWithExcludeV2）
- `window.tinymce?.activeEditor?.getContent()`（Rich Text）
- `[data-amis-name] .antd-ImageControl img.src`（Image 上传）

---

## 7. 风险与缓解

| # | 风险 | 严重度 | 缓解措施 |
|---|------|:---:|----------|
| 1 | `scopeRef` 在 amis 6.13 中 API 不同 | 高 | 先写最小验证脚本确认（已在源码中验证） |
| 2 | schema 没有 name，需注入 | 中 | AmisPage 中自动注入，不影响原始 schema |
| 3 | `getValues()` 返回时机（渲染延迟） | 中 | 语言切换时用 `setTimeout` 或 `requestAnimationFrame` 延迟 |
| 4 | 自定义组件值不在 store | 低 | fallback 到 `[data-field-name]` div 读取 |
| 5 | Combo/Tabs 嵌套表单的路径 | 低 | 给 form 设唯一 name，路径已知 |
| 6 | boolean/array 值被当作语言相关值处理 | 高 | `mergeI18nData` 中保留 `typeof boolean`/`Array.isArray` 判断，双写 |
| 7 | `getValues()` 不包含未编辑字段 | 中 | 保持 lookup 旧值不变，不覆盖 |
| 8 | tag 字段读到未确认的新标签值 | 中 | `persistToLookup` 中 `if (field === 'tag') continue;` |

---

## 8. 验证方案

### 8.1 最小验证脚本

在浏览器控制台中执行：

```javascript
// 1. 打开 amis-mission 页面，等待渲染完成
// 2. 找到 amisScoped（需要在 renderAmis 中加了 scopeRef 后才能用）

// 手动验证（如果 scopeRef 已经加了）：
const form = window.__amisScoped.getComponentByName('multiLangForm');
console.log('getValues:', form.getValues());
```

### 8.2 E2E 验证

运行现有 E2E 测试：
```bash
npm run test:e2e
```

重点关注语言切换相关测试：
- `tests/e2e/amis-i18n.spec.ts`
- `tests/e2e/amis-i18n-data-integrity.spec.ts`
- `tests/e2e/amis-i18n-persist.spec.ts`

---

## 9. 实施步骤

```
Step 1:  验证 API     ── 写最小脚本确认 scopeRef + getValues 可用
Step 2:  注入 form name ── 在 AmisPage 中自动给 schema 注入 name
Step 3:  添加 scopeRef ── 在 renderAmis props 中获取 amisScoped
Step 4:  替换 persistToLookup ── 用 getValues() + fallback 替代 readDomValue
                              ── 保留 tag 跳过、FieldWithExclude fallback、TinyMCE fallback
Step 5:  简化 mergeI18nData ── 改用 api.data（保留 boolean/array 双写判断）
Step 6:  删除 readDomValue ── 删除 ~120 行 DOM 选择器代码
Step 7:  删除 writeDomValue ── 删除 ~40 行 DOM 写入代码
Step 8:  删除 collectFieldOptions ── 删除 ~25 行 label→value 映射
Step 9:  E2E 回归       ── 运行全部 E2E 测试
```
