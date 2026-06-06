# 多语言（i18n）测试场景文档

## 核心抽象

所有支持 multiLang 的组件，本质上都是**一个可保存的语言状态**：

```
{ "fieldName": { "zh": <中文值>, "en": <英文值> } }
```

全部测试场景围绕这个状态的 5 种行为展开：

```
S1 切换器可见性  →  工具本身的存在条件
S2 状态回显      →  状态 → UI 渲染
S3 语言切换      →  状态键切换 (zh↔en)
S4 编辑后保留    →  UI 编辑 → 状态持久化（跨语言切换不变）
S5 提交/清空     →  状态 → 持久层
```

组件类型的差异**只决定**如何从 DOM 读写这个状态（即 `readDomValue` 策略），不影响行为分类。

## 基线保护（重要）

一个字段若 `multiLang: false`（或未设置），则**不应受 multiLang 机制的任何影响**。这是 multiLang 功能的**回归底线**：无论表单中其他字段是否开启 multiLang，非 multiLang 字段的行为必须和原生 Amis 组件完全一致。

全部的 S1~S5 场景只适用于 `multiLang: true` 的字段。对于非 multiLang 字段，需要额外验证以下条目：

---

## 组件取值策略（readDomValue）

| 策略 | 读取方式 | 适用组件 |
|------|---------|---------|
| **V1: 标准 input** | `input[name]` / `textarea[name]` .value | text, textarea, email, url, password, number |
| **V2: 选项映射** | radio .checked → label→value 映射；checkboxes .checked 标签集合；select .cxd-Select-value 文本 → options 反向映射 | select, radios, checkboxes, chained-select, tree-select, transfer |
| **V3: placeholder 定位** | `.cxd-DatePicker-input[placeholder*="关键词"]` value | input-date, input-time, input-month, input-datetime |
| **V4: 区间拼接** | `.cxd-DateRangePicker-input` value × 2 拼接 | input-date-range |
| **V5: 状态 class** | `.cxd-Switch.is-checked` | switch |
| **V6: 子元素计数** | `.is-active` 子元素数量 | rating |
| **V7: 颜色 input** | `.cxd-ColorPicker input` .value | color |
| **V8: 富文本 API** | TinyMCE `getContent()` / `setContent()` | rich-text |
| **V9: 标签/数组** | 已选项 DOM 状态/标签列表 | tag, transfer, cascader |
| **V10: 文件上传/图片** | 上传成功后从 DOM 读取图片 URL / 文件名，本质同 V1 字符串 | image, file |
| **V11: 数据属性** | `div[data-field-data]` JSON 解析 | field-with-exclude（复合结构） |

> **新增组件时**：先确定它属于哪个取值策略，只需补充策略中没有的 DOM 读取方式即可。

---

## 行为场景（S1~S5）

### B: `multiLang=false` —— 基线保护

验证：`multiLang: false`（或未设置）的字段不受 multiLang 机制影响。

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| B1 | 与非 multiLang 字段共存在同一表单 | 加载同时包含 `multiLang: true` 和 `multiLang: false` 字段的 schema | 非 multiLang 字段正常渲染，值正常显示 |
| B2 | 非 multiLang 字段不受语言切换影响 | 加载 mixed schema → 切换语言 (zh↔en) | 非 multiLang 字段值始终不变 |
| B3 | 非 multiLang 字段提交为纯值 | 编辑非 multiLang 字段 → 提交 | body 中该字段为纯字符串/数值/数组，**不是** `{zh, en}` 格式 |
| B4 | 初始数据含 `{zh, en}` 时后备 | 非 multiLang 字段的初始数据为 `{zh, en}` 对象（异常情况） | 组件不崩溃，取当前语言对应值或显示原始 JSON |
| B5 | 编辑非 multiLang 字段 → 切换到 multiLang 字段编辑 | 编辑非 multiLang 字段 → 切语言 → 编辑 multiLang 字段 | 非 multiLang 字段值不受影响，multiLang 字段正常工作 |

> **场景用例生成**：对各取值策略 V1~V11，选取至少一个非 multiLang 字段，执行 B1~B5。

### S1: 语言切换器可见性

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 1.1 | 表单含 multiLang 字段 | 加载多语言表单 | `.language-switcher` 可见 |
| 1.2 | 表单无 multiLang 字段 | 加载单语言表单（基线对照） | `.language-switcher` 不可见 |

---

### S2: 状态回显

验证：可保存状态中的 `{zh}` 值正确渲染到 UI。

| # | 场景 |
|---|------|
| 2.1 | 中文状态下，状态值正确显示到对应组件 |
| 2.2 | 空值/空字符串不导致组件报错或崩溃 |
| 2.3 | null/undefined 字段组件正常渲染 |

**对各取值策略的校验方式**：

| 策略 | 校验方式 |
|------|---------|
| V1 标准 input | `toHaveValue(String(zh值))` |
| V2 选项映射 | 选中项文本匹配 zh 对应的 label |
| V3 placeholder 定位 | 输入框显示 zh 格式值 |
| V4 区间拼接 | 两个输入框值拼接 = zh 值（如 `2026-06-01,2026-06-15`） |
| V5 状态 class | `.is-checked` = zh 值 |
| V6 子元素计数 | `.is-active` 数量 = zh 值 |
| V7 颜色 input | `toHaveValue(zh值)` |
| V8 富文本 API | `getContent()` = zh 值 |
| V9 标签/数组 | 已选项列表匹配 zh 值 |
| V10 文件上传/图片 | 上传后图片 URL 匹配 zh 值；空值时显示占位/空状态 |
| V11 数据属性 | 解析 JSON → zh 值匹配 |

---

### S3: 语言切换

验证：切换语言时，状态键从 `zh` 切换到 `en`。

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 3.1 | 异值字段切换 | zh→en | `zh≠en` 的字段切换为 en 值 |
| 3.2 | 同值字段不变 | zh→en | `zh=en` 的字段值不变（如 number） |
| 3.3 | 多次来回切换 | zh→en→zh→en→zh | 每次切换后所有字段值与当前语言一致 |

---

### S4: 编辑后保留（Persist）

验证：编辑当前语言的值 → 切换语言 → 切回 → 编辑内容保留。

这是 multiLang 最核心的行为：**编辑操作写入可保存状态，切换语言只是切换读取的键，不丢失已编辑的数据。**

| # | 场景 | 步骤 |
|---|------|------|
| 4.1 | 文本/数值编辑后保留 | 中文下编辑 → 切英文 → 切回中文 → 编辑值保留 |
| 4.2 | 选项选择后保留 | 中文下选择新选项 → 切英文 → 切回中文 → 选择保留 |
| 4.3 | 日期选择后保留 | 中文下选新日期 → 切英文 → 切回中文 → 日期保留 |
| 4.4 | 开关/评分后保留 | 中文下改变状态 → 切英文 → 切回中文 → 状态保留 |
| 4.5 | 富文本编辑后保留 | 中文下编辑富文本 → 切英文 → 切回中文 → 内容保留 |
| 4.6 | 文件上传后保留 | 中文上传图片 → 切英文 → 切回中文 → 图片 URL 保留 |

---

### ABA: 跨语言操作验证

ABA 是 multiLang 最核心的完整性验证模式，确保 **两个语言的值在交替操作后各自独立、互不污染**。

**ABA 操作链**：

```text
A: 语言A下操作（编辑/清空/上传）
B: 切到语言B下操作（编辑/清空/上传，不同于A）
A: 切回语言A，验证 A 的值独立保留，B 的值仅在 B 中生效
```

| # | 场景 | A操作 | B操作 | A验证 |
|---|------|-------|-------|-------|
| ABA.0 | **A→修改→B→A**（B 仅过路） | zh 修改值 | en 仅切换，不做操作 | 回 zh → 修改值保留（A→B→A 途中无丢失） |
| ABA.00 | **A→清理→B→A**（B 仅过路） | zh 清空 | en 仅切换，不做操作 | 回 zh → 仍为空（空值已持久化到 lookup） |
| ABA.1 | **同字段值独立**（V1~V10） | zh 设值A | en 设值B（与A不同） | 回 zh → 值A 保留；en → 值B 保留；提交 → `{zh: 值A, en: 值B}` |
| ABA.2 | **同值字段**（number/同值date） | zh 设值A | en 设值B（覆盖同值） | 回 zh → 值A 保留（同值字段同步规则） |
| ABA.3 | **数组/布尔字段** | zh 选状态A | en 选状态B | 回 zh → 状态A 保留；同步规则：zh=en 共享 |
| ABA.4 | **跨字段混合 ABA** | zh 编辑文本 + 上传图片A | en 编辑文本 + 上传图片B | 回 zh → 文本值A 保留，图片 URL A 保留；en → 文本值B，图片 B |
| ABA.5 | **多轮 ABA** | zh 值V1 | en 值V2 | zh 值V1 → en 值V2 → zh 值V1 → en 值V2（3轮以上） |
| ABA.6 | **ABA + 清空** | zh 清空 | en 设值B | 回 zh → 空；切 en → 值B 保留 |
| ABA.7 | **ABA + 富文本** | zh 编辑内容A | en 编辑内容B | 回 zh → 内容A；en → 内容B |
| ABA.8 | **ABA + 图片上传** | zh 上传图片A | en 上传图片B | 回 zh → 图片A；en → 图片B |
| ABA.9 | **ABA + 提交** | zh 编辑 + 提交 | en 编辑 + 提交 | 回 zh 提交 → 数据合并为 `{zh: 全A, en: 全B}` |
| ABA.10 | **ABA + 浏览器刷新** | zh 编辑 + 提交 | en 编辑 + 提交 | **关闭页面 → 重新加载** → 数据为 `{zh: 值A, en: 值B}` |
| ABA.11 | **A→B→A→B 配置完整性** | zh 下检查：表单标题、字段标签、占位提示、提交按钮 | 切 en 检查同上 | 第2轮回 zh + 再切 en，每轮检查**配置内容不丢失、控件不崩溃** |

> **ABA.11 检查清单**：
> - 表单标题、字段 label、placeholder 文字不因切换而消失或乱码
> - 语言切换器自身可见且可选
> - 提交/重置按钮正常渲染
> - 所有组件类型（text/select/date/image/…）wrapper 完整
> - 浏览器控制台无 JS 异常

> **ABA 价值**：它验证的不只是"值保留了"，而是"两个语言的值在交替操作后没有被对方覆盖或污染"。V1 字符串字段在持续操作中保持 zh/en 独立能力。

---

### S5: 提交与清空

验证：可保存状态正确提交到持久层。

#### S5a: 提交

| # | 场景 | 预期 |
|---|------|------|
| 5a.1 | multiLang 字段提交 | body 中字段 = `{ "zh": "...", "en": "..." }` |
| 5a.2 | 无 multiLang 字段提交 | body 中字段为纯字符串（基线对照） |
| 5a.3 | 多语言分别编辑后提交 | zh 值 + en 值合并提交为 `{zh, en}` |
| 5a.4 | 元数据剥离 | `dataId` / `dataType` 不写入文件 |

#### S5b: 清空

| # | 场景 | 步骤 | 预期 |
|---|------|------|------|
| 5b.1 | 中文清空 → 切英文 | zh 下清空字段 → 切 en | en 原值保留 |
| 5b.2 | 清空后切回 | 接上 → 切回 zh | zh 仍为空（空值已写入状态） |
| 5b.3 | 另一语言清空 | en 清空 → 切 zh | zh 原值保留 |
| 5b.4 | 双语言均清空 | zh 清空 → en 清空 → 来回切换 | 空值保持 |
| 5b.5 | 同值字段清空（zh=en） | zh 清空 → 切 en | en 也为空（状态共享） |
| 5b.6 | 数组/布尔清空 | zh 清空 → 切 en | 组件正常切换，不崩溃（⚠️ persist 仅对有 `input[name]` 的字段有效；switch/checkboxes 无 DOM 写入能力，切换后以 Amis 原始数据为准） |
| 5b.7 | 清空后提交 | 清空一个语言 → 提交 | 保存为 `{zh: "", en: "原值"}` |

> **同步规则**：字符串类型 zh/en 独立；boolean/数字/数组类型 zh=en 状态共享。

---

## 测试覆盖矩阵

| 取值策略 \ 场景 | S1 切换器 | S2 回显 | S3 切换 | S4 编辑保留 | S5a 提交 | S5b 清空 |
|----------------|:---------:|:-------:|:-------:|:----------:|:-------:|:--------:|
| V1 标准 input | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V2 选项映射 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V3 placeholder | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V4 区间拼接 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V5 状态 class | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V6 子元素计数 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| V7 颜色 input | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| V8 富文本 API | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| V9 标签/数组 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V10 文件上传/图片 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| V11 数据属性 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

> **基线保护**：不论取值策略，每个组件类型至少选取一个 `multiLang: false` 字段验证 B1~B5。

## 测试用例生成规则

**新增组件时**：
1. **确定取值策略** → 对照 V1~V11，看该组件如何从 DOM 读写值；没有现成的就新增一个
2. **按矩阵生成用例** → 套用 S1~S5b 模板，用实际字段替换
3. **关注可保存状态** → 所有用例都围绕 `{zh, en}` 这同一个状态模型展开

**修改组件时**：
- 取值策略不变 → 仅更新预期值
- 取值策略变化 → 更新策略定义，重新按矩阵生成

---

## 数据流

```
    可保存状态: { "field": { "zh": "...", "en": "..." } }
                      ↓
buildLookup  →  lookup = { field: { zh, en } }
                      ↓
flattenData  →  displayData = { field: currentLangValue }
                      ↓
        AmisPage → renderAmis(schema, { data: displayData })
                      ↓  用户编辑 → 切换语言 → ...
persistToLookup  →  readDomValue → updated[field][lang] = domVal
                      ↓
mergeI18nData  →  merged = { ...existing, [currentLang]: domVal }
                  ↓ 字符串 = 仅 currentLang
                  ↓ boolean/数组/数字 = zh+en 同步
POST /api/page/save  →  data/{id}-data.json
```
