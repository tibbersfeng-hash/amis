# Amis Mission CMS - 项目宪法

> 本文件为项目最高指导原则，所有开发决策以此为权威依据。

## 架构核心：JSON 驱动页面渲染

### 设计哲学

项目是一个**通用 CMS 后台配置系统**，通过 JSON 配置驱动页面功能，而非硬编码。

**核心原则：配置即页面，零代码改动即可支持新数据类型**。新增任意业务类型（酒店、餐厅、会议室等），只需添加 JSON 文件，不修改任何 TypeScript/React 代码。

```
新增类型 = 2个 Schema 文件 + N个 Data 文件
├── schema/{type}-schema.json   ← 详情页表单定义（必须）
├── schema/{type}-list.json     ← 列表页展示配置（可选）
└── data/{id}-data.json         ← 业务数据（0到N个）
```

**无需：** 新建组件、注册路由、修改后端、加 TypeScript 类型。

### 双路由架构

**React + Vite 项目，通过 `pathname` + 参数确定加载哪个页面**。支持两套渲染路径：

```
/list?dataType=xxx          → ListPage（通用列表页，纯 React）
/remote?dataType=xxx&id=xxx → RemotePage → AmisPage（详情/编辑页，Amis 引擎）
```

**Detail 流：**
```
/remote?dataType=hotel-basic&dataId=hotel-beijing-shangrila
    ↓
GET /api/page?dataType=xxx&dataId=xxx
    ↓
服务端读取 schema/{type}-schema.json + data/{id}-data.json
    ↓
RemotePage → enhancedFormData（注入 dataId/dataType）
    ↓
AmisPage → amis.render(schema, { data }) → 自动回显
```

**List 流：**
```
/list?dataType=hotel-basic
    ↓
GET /api/page/list?dataType=xxx
    ↓
服务端读取 schema/{type}-list.json（定义列+搜索字段）
    ↓
按 dataIdPrefix 扫描 data/ 目录匹配数据文件
    ↓
ListPage 渲染表格（搜索/排序/分页/跳转详情）
```

### 一行代码不动，加新类型

只需在 `public/api/` 下创建文件：

```
public/api/
├── schema/
│   ├── {type}-schema.json    ← Amis 表单 schema（定义字段、校验、布局）
│   └── {type}-list.json      ← 列表配置（定义列、搜索字段、dataId 前缀）
└── data/
    └── {dataId}-data.json    ← 业务数据（提交保存自动创建/合并）
```

| 文件 | 必须？ | 说明 |
|------|--------|------|
| `schema/{type}-schema.json` | ✅ 是 | 表单结构，api 必须含 `${dataId}` 和 `${dataType}` 模板 |
| `schema/{type}-list.json` | ❌ 否 | 列表配置，缺省则列表页 404 |
| `data/{id}-data.json` | ❌ 否 | 业务数据，不存在时表单为空（新建），提交后自动创建 |

**Schema API 约定：**
```json
{
  "type": "form",
  "api": "post:/api/page/save?dataId=${dataId}&dataType=${dataType}",
  ...
}
```

**List schema 格式：**
```json
{
  "title": "列表标题",
  "dataIdPrefix": "type-",
  "linkTemplate": "/remote?dataType=xxx&dataId=${dataId}",
  "columns": [
    { "name": "fieldName", "label": "列名", "sortable": true }
  ],
  "searchFields": [
    { "name": "keyword", "label": "搜索", "type": "text" },
    { "name": "fieldName", "label": "过滤", "type": "select", "options": [...] }
  ]
}
```

### 后端 API

所有接口在 `vite.config.js` 中间件中定义，读写 JSON 文件：

| 接口 | 方法 | 用途 |
|------|------|------|
| `/api/page?dataType=xxx&dataId=xxx` | GET | 读取 schema + data，返回 `{schema, data}` |
| `/api/page/save?dataId=xxx` | POST | 保存到 `data/{id}.json`，合并模式 |
| `/api/page/list?dataType=xxx` | GET | 返回 `{listSchema, items, total}` |

- 文件每请求读取，修改 JSON 后刷新即生效
- POST save 自动剔除 `dataId`/`dataType` 元数据字段
- 列表按 `dataIdPrefix` 前缀匹配数据文件

## 多语言（multiLang）设计原则

### 本质

**multiLang 的核心是让表单字段值在每个语言环境下独立存储和编辑。** 同一个字段在不同语言下可以有完全不同的内容值，语言切换时内容和编辑状态互不干扰。

```
数据存储:
  "hotelName": {
    "zh": "北京香格里拉饭店",    ← 中文编辑，独立维护
    "en": "Beijing Shangri-La"   ← 英文编辑，独立维护
  }

语言切换:
  中文模式编辑 → 切英文 → 中文编辑值 persist 保留
  英文模式编辑 → 切中文 → 英文编辑值 persist 保留
  清除"hotelName" → 仅清除当前语言的字段值，其他语言不受影响
```

### 适用范围

| 类型 | multiLang | 行为 | 示例 |
|------|-----------|------|------|
| 文本内容 | ✅ 适用 | 各语言独立存储、独立编辑 | `hotelName`, `description` |
| 选择类 | ✅ 适用 | 各语言可独立选择不同选项 | `select`, `radio` |
| 开关/颜色/评分 | ✅ 适用（同步） | 值非语言内容，切换时 `zh=en` 同步 | `switch`, `color` |
| 图片上传 | ✅ 适用（同步） | URL 非语言内容，上传后 `zh=en` 同步 | `image` |
| 日期/时间 | ✅ 适用（同步） | 日期值是唯一的，各语言一致 | `date`, `datetime` |

### 清除场景

```
中文模式: 清空 hotelName → ""     ← 仅影响 zh
英文模式: 查看 hotelName → "English Text"  ← en 不受影响
切回中文: hotelName → ""         ← zh 保持清除状态
```

- **清除（空字符串）** 只影响当前语言，其他语言值完整保留
- **重置按钮** 将当前语言的字段恢复为初始值（该值来自 `{zh, en}` 数据）
- **提交时** 清除的值以 `""` 写入文件，其他语言值不变

### 实现要点

- 字段加 `"multiLang": true` 即可启用，零代码改动
- 文本值通过 `persistToLookup`（DOM 读取）在切换时暂存编辑
- 非语言内容（boolean/array/image/date）配置为 `zh=en` 同步
- `readDomValue` 7 级回退覆盖所有组件类型
- 数据文件始终保持 `{zh, en}` 格式一致

## 样式策略：统一 CSS 覆盖系统

### 原则

**CSS 只写一次，JSON 只配结构**。

- 项目维护一套统一的 CSS 覆盖系统（在 `index.html` 中），覆盖 Amis 所有内置组件样式
- 编写 schema.json 时，**绝不编写内联样式**，不指定 className（除非必要）
- 所有设计变量通过 CSS Variables 管理
- Figma 设计稿是唯一样式来源

### CSS 变量（来自 Figma）

```css
--primary: #4A5CBF          /* 主色 */
--primary-hover: #3d4fb0
--primary-light: #F0F1FF
--page-bg: #F5F6FA          /* 页面背景 */
--card-bg: #FFFFFF          /* 卡片背景 */
--form-bg: #F8F9FC          /* 表单区域背景 */
--input-border: #D9DDE6     /* 输入框边框 */
--input-border-focus: #4A5CBF
--input-height: 36px        /* 输入框统一高度 */
--text-primary: #333333
--text-secondary: #666666
--text-placeholder: #9CA3AF
--text-label: #2D3348       /* 表单标签色 */
--divider: #E8E8E8
--danger: #E84545           /* 错误/必填标记 */
--success: #52c41a
--shadow-card: 0 1px 4px rgba(0,0,0,0.04)
--shadow-footer: 0 -2px 8px rgba(0,0,0,0.06)
--radius-sm: 4px
--radius-md: 6px
--radius-lg: 8px
```

### 组件级 CSS 类（已覆盖）

| CSS 类 | 用途 |
|--------|------|
| `.page-breadcrumb` | 面包屑导航 |
| `.page-header-bar` | 页头（标题 + 操作按钮） |
| `.page-title` | 页面标题 |
| `.return-link` | 返回列表链接 |
| `.search-card` | 列表页搜索卡片 |
| `.btn-add` / `.btn-search` / `.btn-clear` | 按钮样式 |
| `.form-card` | 白色卡片容器，带阴影 |
| `.sub-form-card` | 子表单卡片（较窄内边距） |
| `.sub-tab-bar` / `.sub-tab-btn` | 内嵌子tab（Rule Setup/Display） |
| `.section-title` / `.section-title-sm` | 段落标题 |
| `.hint-text` | 提示文字 |
| `.award-panel` | 奖励区域（浅灰背景） |
| `.radio-group` / `.radio-item` | 单选按钮组 |
| `.phone-card` / `.phone-frame` | 手机预览模型 |
| `.progress-panel` / `.progress-timeline` | 进度时间线面板 |
| `.sticky-footer` / `.footer-btn` | 吸底操作栏 |
| `.tab-body` / `.tab-left` / `.tab-right` | Tab 内两栏布局 |
| `.sub-mission-layout` | 子任务左右布局 |
| `.cell-code` / `.cell-name` / `.cell-yes` / `.cell-continue` | 列表页单元格样式 |
| `.rule-status-dot` | 规则状态圆点 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 17.0.2 | UI 框架 |
| TypeScript | 5.x | 类型检查 |
| Vite | 8.x | 构建工具 |
| Amis | 3.6.0 (npm) | 低代码页面渲染引擎 |
| Amis Theme | cxd | 基础主题 |
| CSS Variables | - | 设计令牌系统 |

## 启动与服务

### 启动命令

```bash
./start.sh          # 启动开发服务器（0.0.0.0:5173，支持外部访问）
npm run dev         # 等价于 start.sh，但不会检查服务存活
npm run build       # 构建生产版本 → dist/
npm run preview     # 预览生产构建
npm run test        # 运行 E2E 测试 (Playwright)
npm run test:ui     # 运行 E2E 测试（UI 模式）
npm run test:unit   # 运行单元测试 (Vitest)
npm run test:unit:watch  # 运行单元测试（监听模式）
```

### start.sh 脚本行为

1. **检查服务存活** — `curl localhost:5173` 返回 200 则直接退出（避免重复启动）
2. **清理旧进程** — 端口被占用但无响应时 kill 旧进程
3. **检查依赖** — 无 node_modules 时自动 `npm install`
4. **启动服务** — `npm run dev`（vite.config.js 已配置 `host: '0.0.0.0'`）

**监听地址**：`0.0.0.0:5173`（允许局域网和外部访问）
**内部访问**：http://localhost:5173/
**外部访问**：http://0.0.0.0:5173/

> ⚠️ **必须通过 `./start.sh` 启动服务**，不要直接用 `npm run dev`，以确保服务监听 `0.0.0.0` 而非仅 `localhost`。

## 数据流

```
URL 参数 → 确定页面名称 (?page=xxx)
    ↓
fetch {name}-schema.json + {name}-config.json
    ↓
extractFormData 按 schema 的 sourcePath 从嵌套 config 提取 formData
    ↓
AmisPage 调用 render() from amis 渲染 schema + data
    ↓
CustomEvent 'mission-lang-change' → 语言切换
    ↓
Save 按钮 → 输出 zh/en 双版本 JSON
```

## 多语言策略

### 核心区分：内容多语言 vs 展示多语言

项目存在 **三层独立的多语言机制**，互不干扰：

| 层级 | 机制 | 管理对象 | 文件 |
|------|------|----------|------|
| **① 业务内容多语言** | multiLang | 表单字段的数据值 | `multiLang: true` |
| **② 组件静态文本** | i18n-config | 按钮/标签/提示等 UI 文字 | `src/utils/i18n-config.ts` |
| **③ 展示语言切换** | LanguageSwitcher | 当前页面展示语言 | `src/components/LanguageSwitcher/` |

### ① 业务内容多语言（multiLang）

**multiLang 管理的是"配置内容"的多语言，不是"展示内容"的多语言。**

**含义**：声明某个表单字段的**数据值**使用 `{zh, en, jp}` 多语言对象格式存储。

**典型场景**：活动名称"夏季推广"，中文和英文各自存储一份：
```json
// 提交保存后 data.json 中的格式
{
  "missionName": { "zh": "夏季推广", "en": "Summer Campaign" }
}
```

**不是**翻译 Amis 的 label/placeholder/button 等 UI 文字——那些属于 **i18n-config** 管理的范围。

**工作原理**：
- **触发条件**：Schema 中字段配置 `multiLang: true`
- **数据格式**：字段值为 `{zh: '中文值', en: '英文值', ...}` 对象
- **渲染**：`src/utils/multiLang.ts` 的 `processSchemaMultiLang` 按当前语言将 `{zh,en} → 单语言值` 扁平化传入 Amis
- **切换语言**：App.tsx 通过 DOM 操作直接修改输入框值（避免重新渲染 Amis 丢失用户输入）
- **保存**：fetcher 拦截 POST → `mergeI18nData()` 将当前值合并回 `{zh, en}` 结构
- **isI18nValue 判定**：`keys.includes('zh') && keys.length >= 2` — 自动支持任意语言数量
- **语言扩展**：新增语言只需在 `LANGUAGES` 数组中添加一项

**示例**：
```json
{
  "type": "input-text",
  "name": "missionName",
  "multiLang": true,
  "label": "活动名称"
}
// 对应数据：{ "missionName": { "zh": "夏季推广", "en": "Summer Campaign" } }
```

**multiLang 处理的属性列表**（schema 中的这些字段值会被多语言扁平化）：
`value`, `label`, `placeholder`, `title`, `description`, `remark`, `text`, `content`，以及 `options` 中的 `label`。

### ② 组件静态文本（i18n-config）

管理**基础设施组件的 UI 文字**（非业务内容），与 multiLang 完全独立。

- 定义在 `src/utils/i18n-config.ts`
- 支持语言：`zh`（中文）、`en`（English）、`jp`（日本語）
- 适用范围：Loading 加载提示、DateRangePicker 月份/星期标签、LanguageSwitcher 标签等
- 切换时通过 `setComponentLanguage(lang)` + `previewLanguageChange` 事件同步
- 组件通过 `getComponentI18n()` 读取当前语言字符串

## Showcase 系统

访问 `/showcase` 路由进入组件展示页。左侧菜单按分类列出所有组件，点击后右侧展示：
- **JSON 配置**：组件的使用方式和 props 说明
- **Live Preview**：实时可交互的组件预览
- 顶部语言切换器控制所有预览的 i18n 语言

### 组件分类
- **配置系统**：i18n-config
- **基础设施**：Loading, LanguageSwitcher
- **预览组件**：PhoneMockup, DateRangePicker

### Showcase 自定义组件

| 组件 | ID | 分类 | 说明 |
|------|----|------|------|
| SchemaPreview | `schema-preview` | 工具 | 输入任意 Amis JSON Schema，实时渲染预览 |
| ClosableTabs | `closable-tabs` | 布局组件 | 可关闭 Tab + 添加按钮，每个 tab 内嵌表单，支持表单提交并记录 |
| **ComboTab** | `combo-tab` | 布局组件 | **使用 Amis combo 组件，通过纯 CSS 实现与 Closable Tabs 一致的 Tab 栏效果。支持动态增减、每个 tab 内嵌表单。必须使用 `type: 'combo'`，不能用 tabs 替代，只通过 CSS 改造外观，添加新 item 时不影响已有 item 的表单数据（combo 自带状态管理，不需要 React state 驱动）** |

### AI Generator（AI 生成器）

在 Schema Preview 页面提供 AI 生成功能，通过侧边抽屉与用户交互。

#### API 接口

- **POST `/api/ai/generate`** — 发送用户 prompt + 当前 schema/data 到后端，返回生成的 schema 和 data JSON

**请求体格式：**
```json
{
  "prompt": "描述你的修改需求",
  "currentSchema": "...",
  "currentData": "...",
  "sessionId": "可选的会话 ID",
  "images": [
    {
      "mimeType": "image/png",
      "data": "base64-encoded-image-data",
      "fileName": "screenshot.png"
    }
  ]
}
```

**响应体格式：**
```json
{
  "schema": "{ ...生成的 schema JSON... }",
  "data": "{ ...生成的 data JSON... }",
  "sessionId": "会话 ID（首次生成时返回）"
}
```

#### 图片上传（参考 cc-connect 实现）

AI Generator 支持上传图片作为参考，实现方式参考 cc-connect 的图片传输机制：

- **cc-connect 原理**：`cc-connect send --image /path/to/image.png` 读取图片文件，通过 JSON 发送给 Claude Code。Claude Code 的 `session.go:Send()` 方法将图片转为 base64，构建 multimodal content array：
  ```json
  {
    "type": "user",
    "message": {
      "role": "user",
      "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": "..."}},
        {"type": "text", "text": "prompt text"}
      ]
    }
  }
  ```
- **前端实现**：`AIGeneratorDrawer.tsx` 通过拖拽或文件选择器上传图片，转为 base64 后随 JSON 请求体发送给后端
- **限制**：最多 4 张图片，单张最大 5MB，支持 PNG/JPG/GIF/WebP
- **后端处理**：后端收到 base64 图片后，应保存到 `.cc-connect/attachments/` 目录，并通过 cc-connect 的 Send API 转发给 Claude Code（含 base64 图片数据）

#### 组件文件

- `src/showcase/AIGeneratorDrawer.tsx` — AI 生成器抽屉组件（含图片上传）
- `src/server/ai-generator.ts` — 服务端 AI 生成逻辑（调用 Claude CLI）
- `tests/e2e/ai-generator.spec.ts` — E2E 测试

#### 提示词与组件参考

- `docs/ai-generator-prompt.md` — AI 生成器的系统提示词模板（输出格式、Schema/Data 规范）
- `docs/amis-components.md` — Amis 可用组件列表知识库（组件属性、布局、CSS 类约定）

### Amis 组件多语言展示
Amis 内置组件（如 InputText, Select, Form 等）每个展示 6 个区块：

| 区块 | 说明 |
|------|------|
| JSON Configuration — 支持 i18n | Schema 含 `multiLang: true` 标记 |
| 测试内容 JSON — 支持 i18n | 数据含 `{zh, en, jp}` 多语言对象 |
| Live Preview — 支持 i18n | 自动按当前语言扁平化内容值 |
| JSON Configuration — 不支持 i18n | 纯 Schema 无 `multiLang` 标记 |
| 测试内容 JSON — 不支持 i18n | 纯中文数据 |
| Live Preview — 不支持 i18n | 固定中文渲染 |

用户修改的值在语言切换后保留（通过 `onChange` 回调 + `ref` 缓存）。

新增组件时，在 `src/showcase/data.tsx` 中添加注册项即可。

## JSON 配置页面指南

### 概述

每个功能页面由一对 JSON 文件定义，放在 `public/api/` 目录下：

| 文件 | 用途 |
|------|------|
| `<name>-schema.json` | 页面结构（Amis JSON Schema），定义字段类型、布局、验证 |
| `<name>-config.json` | 页面数据（表单初始值、业务数据） |

访问 `?page=<name>` 时，系统自动加载这两个文件。

### Schema 结构

Schema 是 Amis 的标准 JSON Schema，顶层为 `type: "page"`，通过 `body` 嵌套组件构建页面。

#### 常用组件类型

| 类型 | 用途 | 关键字段 |
|------|------|----------|
| `page` | 页面容器 | `body`, `className`, `data` |
| `wrapper` | 布局容器 | `body`, `className` |
| `form` | 表单容器 | `body`（字段数组）, `mode`, `wrapWithPanel` |
| `tabs` | Tab 导航 | `tabs`（数组）, `tabsMode` |
| `input-text` | 单行文本 | `name`, `label`, `placeholder`, `required` |
| `input-number` | 数字输入 | `name`, `label`, `placeholder` |
| `input-date` | 日期选择 | `name`, `label`, `format`, `inputFormat` |
| `date-range-picker` | 自定义日期范围 | `startName`, `endName`, `format`, `required` |
| `select` | 下拉选择 | `name`, `label`, `options`（`[{label, value}]`） |
| `editor` | 富文本编辑器 | `name`, `label`, `language` |
| `input-image` | 图片上传 | `name`, `label`, `multiple` |
| `input-url` | URL 输入 | `name`, `label`, `placeholder` |
| `input-color` | 颜色选择 | `name`, `label` |
| `field-with-exclude` | 带排除复选框的下拉 | `name`, `label`, `options`, `excludeName`, `excludeCheckboxName`, `multiple` |
| `phone-mockup` | 手机预览 | 无 |
| `divider` | 分割线 | `lineStyle` |
| `group` | 水平分组 | `body`（子字段数组） |
| `button` | 按钮 | `label`, `className`, `actionType`, `link` |
| `tpl` | 自定义 HTML | `tpl`（HTML 字符串） |

#### 布局模式

**左右分栏（表单 + 手机预览）：**
```json
{
  "type": "wrapper",
  "className": "mission-body-split",
  "body": [
    { "type": "wrapper", "className": "mission-left", "body": { /* 表单内容 */ } },
    { "type": "wrapper", "className": "mission-right", "body": { /* 预览面板 */ } }
  ]
}
```

**多 Tab 表单：**
```json
{
  "type": "tabs",
  "tabsMode": "line",
  "tabs": [
    { "title": "Tab 1", "hash": "tab-1", "body": { /* 表单内容 */ } },
    { "title": "Tab 2", "hash": "tab-2", "body": { /* 表单内容 */ } }
  ]
}
```

**水平排列字段组：**
```json
{
  "type": "group",
  "body": [
    { "type": "input-text", "name": "fieldA", "label": "A" },
    { "type": "input-text", "name": "fieldB", "label": "B" }
  ]
}
```

### sourcePath 数据映射机制

Config 是嵌套的业务数据结构。schema 中的每个表单字段通过 `sourcePath` 属性定义它在 config JSON 中的嵌套路径。运行时 `extractFormData` 自动按路径取值，扁平化为 Amis 表单的 `formData`。

#### sourcePath 工作原理

在 schema 字段定义中添加 `sourcePath`：
```json
{
  "type": "input-text",
  "name": "missionCode",
  "sourcePath": "missionRule.ruleSetup.missionCode"
}
```

运行时自动从 config 提取：
```
config.missionRule.ruleSetup.missionCode → formData.missionCode
```

**嵌套路径支持**：
- 点分路径：`missionRule.ruleSetup.registrationPeriod.startTime`
- 数组索引：`subMissionRules[0].ruleSetup.stayPeriod.startTime`

#### 示例

**config.json（保持业务嵌套结构）：**
```json
{
  "missionRule": {
    "ruleSetup": {
      "missionCode": "MISSION_20260601_001",
      "registrationPeriod": {
        "startTime": "2026-06-01 12:00:00",
        "endTime": "2026-06-15 23:59:59"
      }
    }
  }
}
```

**schema.json（字段通过 sourcePath 指定来源）：**
```json
{
  "type": "input-text",
  "name": "missionCode",
  "sourcePath": "missionRule.ruleSetup.missionCode"
},
{
  "type": "date-range-picker",
  "startName": "regStartTime",
  "endName": "regEndTime",
  "sourcePath": "missionRule.ruleSetup.registrationPeriod"
}
```

**date-range-picker 特殊处理**：当 `sourcePath` 指向一个嵌套对象（如 `{startTime, endTime}`），提取器自动将其展平为 `startName` 和 `endName` 对应的键。

#### 多语言字段

业务 i18n 字段使用 `{zh, en}` 对象格式，sourcePath 原样提取到 formData。App.tsx 通过 DOM 操作切换语言值。

```json
{
  "missionName": {
    "zh": "夏季任务",
    "en": "Summer Mission"
  }
}
```

### 新增页面步骤

1. **创建文件**：在 `public/api/` 下创建 `<name>-schema.json` 和 `<name>-config.json`
2. **定义 Schema**：使用 Amis 组件构建页面结构，每个需要填充数据的字段添加 `sourcePath` 指向 config 中的对应路径
3. **定义 Config**：填写嵌套的业务数据，字段路径与 schema 的 `sourcePath` 对应
4. **访问页面**：`?page=<name>` 即可加载

**无需编写 mapper 文件**。映射规则完全由 schema 中的 `sourcePath` 定义。

### 现有页面

| 页面名称 | Schema | Config | 描述 |
|---------|--------|--------|------|
| `list` | `list-schema.json` | `list-config.json` | 任务列表页 |
| `mission` | `mission-schema.json` | `mission-config.json` | 任务规则配置页 |
| `promotion` | `promotion-schema.json` | `promotion-config.json` | 促销活动配置页 |
| `promotion-list` | `promotion-list-schema.json` | `promotion-list-config.json` | 促销活动列表页 |

## 文件结构

```
/var/www/amis-mission/
├── index.html                  # Vite 入口（最小化）
├── package.json
├── vite.config.js              # Vite 构建配置（含 Vitest）
├── tsconfig.json               # TypeScript 配置
├── .env                        # 默认环境变量 (VITE_API_BASE_URL)
├── CLAUDE.md                   # 项目宪法
├── public/
│   └── api/                    # 静态 JSON 配置（构建时复制到 dist/）
│       ├── list-schema.json
│       ├── list-config.json
│       ├── mission-schema.json
│       └── mission-config.json
└── src/
    ├── main.tsx                # ReactDOM 入口
    ├── App.tsx                 # 根组件（URL 路由 + 页面加载 + i18n 管理 + /showcase 路由）
    ├── index.css               # 全局 CSS（含 Amis SDK 导入 + CSS 覆盖系统 + showcase 样式）
    ├── test-setup.ts           # Vitest 测试设置（jest-dom）
    ├── showcase/
    │   ├── ShowcaseApp.tsx     # Showcase 根组件（侧边栏 + 内容区 + 语言切换）
    │   ├── Sidebar.tsx         # 左侧分类菜单导航
    │   ├── data.tsx            # Showcase 页面注册表
    │   ├── AmisLivePreview.tsx # Amis 实时预览组件（支持 multiLang 内容值 + 修改值持久化）
    │   └── amis-components.tsx # Amis 内置组件 Showcase 注册表
    ├── components/
    │   ├── AmisPage/
    │   │   ├── index.tsx       # Amis 渲染器（调用 render() from amis）
    │   │   ├── test.tsx        # 单元测试
    │   │   └── showcase.tsx    # Showcase 展示页
    │   ├── PhoneMockup/
    │   │   ├── index.tsx       # 手机预览（registerRenderer 注册，支持 i18n）
    │   │   ├── test.tsx
    │   │   └── showcase.tsx
    │   ├── Loading/
    │   │   ├── index.tsx       # 加载/错误状态（支持 i18n-config）
    │   │   ├── test.tsx
    │   │   └── showcase.tsx
    │   ├── LanguageSwitcher/
    │   │   ├── index.tsx       # 语言切换下拉框
    │   │   ├── test.tsx
    │   │   └── showcase.tsx
    │   ├── DateRangePicker/
    │   │   ├── index.tsx       # 自定义日期范围选择器（支持 i18n-config）
    │   │   ├── test.tsx
    │   │   └── showcase.tsx
    │   └── i18n-config/
    │       ├── index.tsx       # i18n-config 工具组件展示
    │       ├── test.tsx
    │       └── showcase.tsx
    ├── hooks/
    │   └── usePageLoader.ts    # 加载 schema + config，经 extractFormData 按 sourcePath 提取 formData
    ├── utils/
    │   ├── schemaDataExtractor.ts  # 通用提取器：按 schema 的 sourcePath 从嵌套 config 提取 formData
    │   ├── i18n-config.ts      # 基础设施组件 i18n 文本（zh/en/jp 对照表）
    │   ├── multiLang.ts        # 内容值多语言处理（{zh,en,jp} → 单语言扁平化）
    │   ├── pageRegistry.ts     # 页面元数据注册（i18n 字段、sticky footer、mockup 等）
    │   └── locale.ts           # 多语言切换 + 日期选择器修复
    └── types/
        └── dateFields.ts       # 日期字段类型定义
```

## 测试策略

### E2E 测试（Playwright）

**默认只跑修改组件相关的测试**，不跑全部测试：

- 修改 `combo-tab` showcase → 只跑 `npx playwright test tests/e2e/combo-tab.spec.ts`
- 修改某个 Amis 内置组件 showcase → 只跑 `npx playwright test --grep "<组件名>"`
- 修改 `ShowcaseApp` / `Sidebar` / 全局结构 → 跑全量 `npx playwright test`
- 只有在 CI 或用户明确要求时才跑全量测试

### 单元测试（Vitest）

- 修改某个组件 → 只跑 `npx vitest run src/components/<组件名>/test.tsx`
- 修改 utils/hooks → 只跑对应文件测试

## Superpowers 工作流

本项目使用 Superpowers 技能体系驱动开发流程。技能文件位于 `.claude/skills/`，通过 `Skill` 工具触发。

### 技能触发一览

| 阶段 | 技能 | 触发条件 |
|------|------|---------|
| 🧠 需求 | `brainstorming` | 新功能/新组件/新行为，创建任何东西之前自动触发 |
| 📋 规划 | `writing-plans` | 有明确需求后，需要制定实施计划 |
| 🚀 执行 | `executing-plans` | 已有书面计划，需要在独立会话中执行 |
| 🔧 开发 | `test-driven-development` | 需要写代码时—红(测试)→绿(实现)→重构 |
| 👥 并行 | `dispatching-parallel-agents` | 2个以上独立任务，无共享状态或顺序依赖 |
| 🔍 审查 | `receiving-code-review` | 收到外部代码审查反馈时 |
| 📤 提交 | `requesting-code-review` | 代码完成需要提交审查时 |
| ✅ 完成 | `verification-before-completion` | 实现完成、测试通过后 |
| 🏁 收尾 | `finishing-a-development-branch` | 分支开发完成，决定合并/PR/清理 |
| 🐛 调试 | `systematic-debugging` | 遇到 Bug 需要系统化排查 |
| ✍️ 编写 | `writing-skills` | 需要创建或修改技能文件时 |

### 调用方式

```bash
/skill-name               # 在对话中直接输入斜杠命令
Skill({ name: "..." })    # 通过工具调用
```

核心规则：**只要你觉得有 1% 可能某个技能适用，就先触发它再说。** 如果触发了但发现不适用，忽略即可。

### 全流程示例

```
用户说"加一个用户管理功能"
  ↓ 自动触发 brainstorming
需求明确
  ↓ 触发 writing-plans
生成实施计划
  ↓ TDD 开发 → 测试通过
  ↓ 触发 verification-before-completion
确认完成
  ↓ 触发 finishing-a-development-branch
选择合并策略或创建 PR
```

## 开发规则

1. **零代码改动约束**：所有优化、功能扩展不得要求新增类型时修改 TypeScript/React 代码。方案如不满足此约束，必须重新设计。例外：新增底层渲染能力（新组件类型、新交互模式）可改代码，但必须确保已有类型的 JSON 配置继续零代码工作。
2. **新增类型**：在 `public/api/schema/` 下创建 `{type}-schema.json`（+ 可选 `{type}-list.json`），在 `public/api/data/` 下创建 `{id}-data.json`，无需新建组件
3. **样式修改**：只修改 `src/index.css`，不改动 JSON 中的样式属性
4. **字段增删**：只修改 schema.json，无需改代码
5. **测试优先**：所有改动先更新 E2E 测试，再改代码
6. **Figma 对齐**：所有视觉变更以 Figma 导出文件为唯一标准
7. **禁止新建 HTML 页面**：所有页面功能都在 React 中通过路由 + JSON 驱动
8. **构建注意**：`public/` 下的文件会自动复制到 `dist/`，`api/` 目录保持静态服务
