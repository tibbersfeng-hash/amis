# Amis Mission CMS - 项目宪法

> 本文件为项目最高指导原则，所有开发决策以此为权威依据。

## 架构核心：JSON 驱动页面渲染

### 设计哲学

项目是一个**通用 CMS 后台配置系统**，通过 JSON 配置驱动页面功能，而非硬编码。

**核心原则：配置即页面**。任何功能页面的结构、字段、验证规则都由 JSON 配置文件定义，代码层只负责渲染引擎和数据流。

### 统一单页架构

**React + Vite 项目，通过 URL 参数确定加载哪个页面**。所有页面细节由 Amis JSON schema 定义，React 组件负责渲染引擎和数据流。

```
URL 参数 → 确定页面名称 (?page=xxx)
    ↓
动态加载 {name}-schema.json + {name}-config.json
    ↓
App.tsx → usePageLoader → extractFormData → formData
    ↓
AmisPage → render(schema, {data: formData}) from amis
```

### URL 路由规则

通过 URL 参数决定渲染哪个功能页面：

| URL | 功能页面 | 加载配置 |
|-----|---------|---------|
| `?page=list` | 任务列表页 | `api/list-schema.json` + `api/list-config.json` |
| `?page=mission` | 任务规则配置页 | `api/mission-schema.json` + `api/mission-config.json` |
| `?page=<name>` | 任意功能页 | `api/<name>-schema.json` + `api/<name>-config.json` |

```
?mode=view    → 只读查看模式
?mode=edit    → 编辑模式（默认）
?id=<id>      → 记录 ID（详情页用）
```

### 配置命名约定

每个功能页面对应一对 JSON 文件：
- `<name>-schema.json` — 页面结构（Amis JSON Schema），定义字段、布局、验证
- `<name>-config.json` — 页面数据（表单初始值、业务数据）

**文件命名规则**：URL 参数 `?page=<name>` 直接对应 `api/<name>-schema.json` 和 `api/<name>-config.json`。

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

## 构建命令

```bash
npm run dev      # 启动开发服务器 (localhost:5173)
npm run build    # 构建生产版本 → dist/
npm run preview  # 预览生产构建
npm run test     # 运行 E2E 测试 (Playwright)
npm run test:ui  # 运行 E2E 测试（UI 模式）
npm run test:unit  # 运行单元测试 (Vitest)
npm run test:unit:watch  # 运行单元测试（监听模式）
```

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

### 业务 i18n（业务内容）
- 所有可翻译字段在 formData 中存储为 `{zh, en, jp, ...}` 对象
- `pageRegistry` 定义每个页面的 i18n 字段列表
- `App.tsx` 通过 DOM 操作切换语言值（避免重新渲染 Amis）
- 保存时输出完整的多版本 JSON

### 组件内容多语言（multiLang 内容值）

`multiLang: true` 是表单字段级别的标记，用于声明**该字段的数据值**使用 `{zh, en, jp}` 多语言对象格式。

- **触发条件**：Schema 中字段配置 `multiLang: true`，表示该字段的**数据值**（而非 label/options label 等静态文本）支持多语言
- **数据格式**：字段值使用 `{zh: 'GDS,BAR', en: 'GDS,BAR'}` 对象格式
- **渲染逻辑**：`src/utils/multiLang.ts` 的 `processSchemaMultiLang` 递归处理 schema，当字段有 `multiLang: true` 时，自动将其内容字段（`value`, `label`, `placeholder`, `title`, `description`, `remark`, `text`, `content`）及 `options` 中的 `label` 按当前语言扁平化
- **数据扁平化**：`flattenDataMultiLang` 将表单数据中的 `{zh,en} → 单语言值`，传入 Amis 渲染
- **isI18nValue 判定**：`keys.includes('zh') && keys.length >= 2` — 自动支持任意语言数量
- **语言扩展**：新增语言只需在 `src/components/LanguageSwitcher/index.tsx` 的 `LANGUAGES` 数组中添加一项，所有下拉框自动生效

**重要**：`multiLang: true` 控制的是**表单数据值**的多语言，不是 label 本身的国际化。options 的 label 如果是 `{zh, en}` 格式也会在渲染时按语言扁平化，但 options label 本身不需要加 `multiLang` 标记（继承自父字段）。

**示例**：
```json
{
  "type": "field-with-exclude",
  "name": "marketCodes",
  "multiLang": true,
  "options": [
    { "label": "GDS", "value": "GDS" }
  ]
}
// 对应测试数据：
{ "marketCodes": { "zh": "GDS,BAR", "en": "GDS,BAR" } }
```

### i18n-config（基础设施组件文本）
- 定义在 `src/utils/i18n-config.ts`，管理非业务组件的静态 UI 文本
- 支持语言：`zh`（中文）、`en`（English）、`jp`（日本語）
- 适用范围：StickyFooter（按钮文字）、Loading（加载提示）、DateRangePicker（月份/星期/操作按钮）、I18nConfigPanel（标签）、LanguageSwitcher（标签）
- 语言切换时，`App.tsx` 调用 `setComponentLanguage(lang)` 同步
- 组件通过 `getComponentI18n()` 读取当前语言的字符串
- 组件监听 `previewLanguageChange` 事件自动更新显示

## Showcase 系统

访问 `/showcase` 路由进入组件展示页。左侧菜单按分类列出所有组件，点击后右侧展示：
- **JSON 配置**：组件的使用方式和 props 说明
- **Live Preview**：实时可交互的组件预览
- 顶部语言切换器控制所有预览的 i18n 语言

### 组件分类
- **配置系统**：i18n-config
- **基础设施**：StickyFooter, Loading, LanguageSwitcher, I18nConfigPanel
- **预览组件**：PhoneMockup, DateRangePicker, PreviewPanel

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
    │   ├── StickyFooter/
    │   │   ├── index.tsx       # 吸底操作栏（支持 i18n-config）
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
    │   ├── I18nConfigPanel/
    │   │   ├── index.tsx       # i18n-config 面板（支持 i18n-config）
    │   │   ├── test.tsx
    │   │   └── showcase.tsx
    │   ├── PreviewPanel/
    │   │   ├── index.tsx       # 预览面板容器
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

## 开发规则

1. **新增页面**：创建 `{name}-schema.json` + `{name}-config.json` 放在 `public/api/`，无需新建组件
2. **样式修改**：只修改 `src/index.css`，不改动 JSON 中的样式属性
3. **字段增删**：只修改 schema.json，在字段上添加/修改 `sourcePath` 即可，数据自动从 config.json 提取
4. **测试优先**：所有改动先更新 E2E 测试，再改代码
5. **Figma 对齐**：所有视觉变更以 Figma 导出文件为唯一标准
6. **禁止新建 HTML 页面**：所有页面功能都在 React 中通过 Amis JSON schema 驱动
7. **构建注意**：`public/` 下的文件会自动复制到 `dist/`，`api/` 目录保持静态服务
