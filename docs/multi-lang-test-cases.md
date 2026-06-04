# 多语言（i18n）测试场景文档

## 测试类型定义

### 测试 Schema

| Schema | 文件 | 说明 |
|--------|------|------|
| 多语言测试表单 | `public/api/schema/form-test-multi-lang-schema.json` | 21 种组件，全部 `multiLang: true` |
| 单语言测试表单 | `public/api/schema/form-test-single-lang-schema.json` | 同结构，无 `multiLang`（基线对照） |

### 测试数据

```json
public/api/data/form-test-multi-lang-data.json
{
  "textField": { "zh": "中文文本", "en": "English Text" },
  "textArea":  { "zh": "多行中文内容", "en": "Multi-line English content" },
  "email":     { "zh": "zhongwen@test.com", "en": "english@test.com" },
  "url":       { "zh": "https://zhongwen.example.com", "en": "https://english.example.com" },
  "password":  { "zh": "zhongwen-pwd", "en": "english-pwd" },
  "number":    { "zh": 42, "en": 42 },
  "richText":  { "zh": "<p>中文富文本</p>", "en": "<p>English rich text</p>" },
  "select":    { "zh": "opt1", "en": "opt1" },
  "radio":     { "zh": "yes", "en": "yes" },
  "checkbox":  { "zh": "a", "en": "a" },
  "switch":    { "zh": true, "en": true },
  "date":      { "zh": "2026-06-04", "en": "2026-06-04" },
  "time":      { "zh": "14:30", "en": "14:30" },
  "month":     { "zh": "2026-06", "en": "2026-06" },
  "datetime":  { "zh": "2026-06-04 14:30:00", "en": "2026-06-04 14:30:00" },
  "dateRange": { "zh": "2026-06-01,2026-06-15", "en": "2026-06-01,2026-06-15" },
  "color":     { "zh": "#4A5CBF", "en": "#4A5CBF" },
  "rating":    { "zh": 2, "en": 2 },
  "tag":       { "zh": "", "en": "Tag One" },
  "image":     { "zh": "", "en": "" },
  "excludeField":          { "zh": ["x", "y"], "en": ["x", "y"] },
  "excludeFieldExclude":   { "zh": false, "en": false },
  "excludeFieldCheckbox":  { "zh": false, "en": false }
}
```

---

## 测试文件清单

| 文件 | 覆盖 | 数量 |
|------|------|------|
| `tests/e2e/amis-i18n.spec.ts` | 基础回显、语言切换、提交保存 | 25 |
| `tests/e2e/amis-i18n-persist.spec.ts` | 编辑后切换保留 | 16 |
| `tests/e2e/field-with-exclude-v2.spec.ts` | FieldWithExcludeV2 全流程 | 5 |
| **合计** | | **46** |

---

## 1. 语言切换器

测试目标：判断语言切换器在有无 `multiLang` 字段时的显示/隐藏。

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 1.1 | multiLang schema 显示切换器 | 加载 multi-lang 表单 | `.language-switcher` 可见 |
| 1.2 | 无 multiLang schema 隐藏切换器 | 加载 single-lang 表单 | `.language-switcher` 不可见 |

---

## 2. 各组件中文回显

测试目标：所有组件在中文状态下正确显示 `{zh}` 值。

| # | 组件 | 断言 | 初始值 |
|---|------|------|--------|
| 2.1 | input-text | `toHaveValue('中文文本')` | `{zh: "中文文本"}` |
| 2.2 | textarea | `toHaveValue(/多行中文内容/)` | `{zh: "多行中文内容"}` |
| 2.3 | input-email | `toHaveValue('zhongwen@test.com')` | `{zh: "zhongwen@test.com"}` |
| 2.4 | input-url | `toHaveValue('https://zhongwen.example.com')` | `{zh: "https://zhongwen.example.com"}` |
| 2.5 | input-password | `toHaveValue('zhongwen-pwd')` | `{zh: "zhongwen-pwd"}` |
| 2.6 | input-number | `toHaveValue('42')` | `{zh: 42}` |
| 2.7 | select | `.cxd-Select-valueWrap` 可见 | `{zh: "opt1"}` |
| 2.8 | input-date | 日期框显示 `2026-06-04` | `{zh: "2026-06-04"}` |
| 2.9 | input-time | 时间框可见 | `{zh: "14:30"}` |
| 2.10 | input-month | 月份框显示 `2026-06` | `{zh: "2026-06"}` |
| 2.11 | input-datetime | 日期时间框显示 `2026-06-04 14:30:00` | `{zh: "2026-06-04 14:30:00"}` |
| 2.12 | input-rating | `.cxd-Rating` 可见 | `{zh: 2}` |
| 2.13 | input-tag | `input[name="tag"]` 可见 | `{zh: ""}` |
| 2.14 | input-image | 图片上传组件可见 | `{zh: ""}` |
| 2.15 | switch | `.cxd-Switch` 可见 | `{zh: true}` |
| 2.16 | radios | radio 组可见 | `{zh: "yes"}` |
| 2.17 | checkboxes | checkbox 组可见 | `{zh: "a"}` |
| 2.18 | input-color | 颜色选择器可见 | `{zh: "#4A5CBF"}` |

---

## 3. 多语言切换

测试目标：切换语言时，`zh≠en` 的字段值正确变化，`zh=en` 的字段值不变。

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 3.1 | 切英文 → 文本字段变化 | zh→en | textField 显示 English Text，email 显示 english@test.com |
| 3.2 | 同值字段不变 | zh→en | number 显示 42，date 显示 2026-06-04 |
| 3.3 | 中英来回 3 次切换 | zh→en→zh→en→zh | 每次值都正确 |

---

## 4. 编辑后切换保留（persist）

测试目标：中文下编辑字段 → 切换英文 → 切换回中文 → 编辑值保留。

### 4.1 有 `input[name]` 属性的组件（persist 通过 DOM 读取）

| # | 组件 | 编辑操作 | persist |
|---|------|---------|---------|
| 4.1.1 | input-text | `.fill('编辑文本')` | ✅ 切回中文显示"编辑文本" |
| 4.1.2 | textarea | `.fill('编辑多行')` | ✅ 切回中文显示"编辑多行" |
| 4.1.3 | input-email | `.fill('edit@t.com')` | ✅ |
| 4.1.4 | input-url | `.fill('https://edit.com')` | ✅ |
| 4.1.5 | input-password | `.fill('edit-pwd')` | ✅ |
| 4.1.6 | input-number | `.fill('777')` | ✅（6.13 新增 name）|

### 4.2 通过 options label→value 映射的组件

| # | 组件 | 编辑操作 | persist |
|---|------|---------|---------|
| 4.2.1 | select | 点开下拉 → 选"选项二" | ✅ `readDomValue` 读取 `.cxd-Select-value` → options 匹配 |
| 4.2.2 | radios | 点击"否" | ✅ `.checked` label → options 匹配 |
| 4.2.3 | checkboxes | 点击"选项B" | ✅ 同上 |

### 4.3 通过 placeholder 匹配的组件

| # | 组件 | 编辑操作 | persist |
|---|------|---------|---------|
| 4.3.1 | input-date | evaluate 设值 `2026-12-25` | ✅ `.cxd-DatePicker-input[placeholder*="日期"]` |
| 4.3.2 | input-month | evaluate 设值 `2027-03` | ✅ `.cxd-DatePicker-input[placeholder*="月份"]` |
| 4.3.3 | input-datetime | evaluate 设值 `2026-07-15 10:00:00` | ✅ `.cxd-DatePicker-input[placeholder*="日期以及时间"]` |

### 4.4 其他

| # | 组件 | 编辑操作 | persist |
|---|------|---------|---------|
| 4.4.1 | switch | 点击切换 | ✅ `.cxd-Switch.is-checked` |
| 4.4.2 | input-rating | 点击第 4 颗星 | ✅ `.is-active` 计数 |
| 4.4.3 | input-color | evaluate 设值 | ✅ `.cxd-ColorPicker input` |
| 4.4.4 | input-tag | 渲染验证 | ⚠️ 仅验证切换不崩溃 |

### 4.5 不在 DOM 中的字段

| # | 组件 | 说明 |
|---|------|------|
| 4.5.1 | richText | TinyMCE 内容不在标准 input 中，跳过 |
| 4.5.2 | image | 上传组件，无文本值 |

---

## 5. 提交保存验证

测试目标：提交时 multiLang 字段正确保存为 `{zh, en}`，元数据被剥离，无 multiLang 字段不变。

### 5.1 multiLang 字段存为 `{zh, en}`

```json
// 编辑 textField (zh) → 切英文 → 编辑 textField (en) → 提交
→ { "textField": { "zh": "中文提交", "en": "EN Submit" },
    "number":   { "zh": "99", "en": "99" } }
```

### 5.2 无 multiLang schema 提交不变

```json
// 编辑 textField → 提交（single-lang schema）
→ { "textField": "单语文", ... }
```

### 5.3 多次提交合并

```json
// 第 1 次 (zh): textField = "第1次"
// 第 2 次 (en): textField = "Second"
→ { "textField": { "zh": "第1次", "en": "Second" } }
```

### 5.4 元数据剥离

```json
// dataId / dataType 不写入文件
→ { dataId: undefined, dataType: undefined }
```

---

## 6. FieldWithExcludeV2

### 6.1 初始渲染

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 6.1.1 | Exclude 未勾选 | 加载表单 | 组件可见，复选框未勾选 |
| 6.1.2 | 显示已选项 | 检查 `.cxd-Select-valueWrap` | 显示"选项X, 选项Y" |

### 6.2 Exclude 复选框交互

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 6.2.1 | 勾选 Exclude | 点击 Exclude 复选框 | 复选框勾选，红色警告文字出现 |
| 6.2.2 | 取消 Exclude | 再次点击 | 复选框未勾选，警告消失 |
| 6.2.3 | 不影响已选值 | 勾选 → 取消整个过程 | 选项 X/Y 保持不变 |

### 6.3 数据提交

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 6.3.1 | 未勾 Exclude 提交 | 提交 | `excludeField` = {zh, en} 数组 |
| 6.3.2 | 勾选 Exclude 提交 | 勾选 → 提交 | `excludeFieldExclude` 同步到 zh+en |
| 6.3.3 | 勾选 Exclude 提交 | 勾选 → 提交 | `excludeFieldCheckbox` = {zh: true, en: true} |
| 6.3.4 | 提交元数据剥离 | 勾选 → 提交 | dataId/dataType 不写入 |

### 6.4 多语言数据

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 6.4.1 | 中文显示 | 加载表单 | 选项 X/Y 显示 |
| 6.4.2 | 切换英文 | zh→en | 选项 X/Y 仍然显示（值相同） |
| 6.4.3 | 切回中文 | en→zh | 选项 X/Y 仍然显示 |

---

## 7. readDomValue 取值策略

`readDomValue(field, fieldOptions)` 的 7 级回退：

```
① input[name]、textarea[name]          ← 标准文本输入
② isRichText → TinyMCE API            ← 富文本编辑器
③ 选项映射: radio .checked → label→value
   checkboxes .checked 标签→值
   select .cxd-Select-value 标签→值    ← select/radio/checkbox
④ .cxd-DatePicker-input + placeholder  ← date/month/time/datetime
⑤ .cxd-DateRangePicker-input x2 拼接  ← dateRange
⑥ .cxd-ColorPicker input              ← color
⑦ .cxd-Switch.is-checked              ← switch
⑧ div[data-field-data] JSON 解析      ← field-with-exclude
```

## 8. 数据流

```
data 文件: { "field": { "zh": "...", "en": "..." } }
                ↓
buildLookup → lookup = { field: { zh, en } }
                ↓
flattenData → displayData = { field: displayedLangValue }
                ↓
AmisPage → renderAmis(schema, { data: displayData })
                ↓ 用户编辑 → 切换语言 → ...
persistToLookup → readDomValue → updated[field][lang] = domVal
                ↓
mergeI18nData → merged = { ...existing, [currentLang]: domVal }
                ↓ 字符串 = 仅 currentLang
                ↓ boolean/数组 = zh + en 同步
POST /api/page/save → data/{id}-data.json
```
