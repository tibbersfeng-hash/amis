# Amis 可用组件列表

> 项目基于百度 Amis v3.6.0 (cxd 主题)，所有字段组件均可在 Schema JSON 中使用。
> 本文档为 AI 生成器的组件知识库。

## 项目信息

| 技术 | 版本 |
|------|------|
| Amis | 3.6.0 (npm, cxd 主题) |
| React | 17.0.2 |
| TypeScript | 5.x |
| Vite | 8.x |

## 输入类组件

### input-text — 单行文本输入框

```json
{
  "type": "input-text",
  "name": "fieldName",
  "label": "字段标签",
  "placeholder": "请输入",
  "required": false,
  "clearable": true,
  "size": "md"
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`, `clearable`, `size`

### textarea — 多行文本输入

```json
{
  "type": "textarea",
  "name": "fieldName",
  "label": "字段标签",
  "placeholder": "请输入",
  "required": false,
  "rows": 3,
  "maxLength": 500
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`, `rows`, `maxLength`

### input-number — 数字输入框

```json
{
  "type": "input-number",
  "name": "fieldName",
  "label": "数量",
  "placeholder": "请输入",
  "required": false,
  "min": 0,
  "max": 999999,
  "precision": 0,
  "size": "md"
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`, `min`, `max`, `precision`

### input-url — URL 输入

```json
{
  "type": "input-url",
  "name": "linkUrl",
  "label": "链接地址",
  "placeholder": "https://..."
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`

### input-color — 颜色选择器

```json
{
  "type": "input-color",
  "name": "bgColor",
  "label": "背景颜色",
  "placeholder": "选择颜色"
}
```

**常用属性：** `name`, `label`, `placeholder`

### editor — 代码编辑器

```json
{
  "type": "editor",
  "name": "htmlContent",
  "label": "HTML 内容",
  "language": "html",
  "size": "lg"
}
```

**常用属性：** `name`, `label`, `language` (`"html"` | `"json"` | `"css"` | `"javascript"`), `size`

## 选择类组件

### select — 下拉选择框

```json
{
  "type": "select",
  "name": "missionType",
  "label": "任务类型",
  "placeholder": "请选择",
  "required": true,
  "clearable": true,
  "searchable": true,
  "size": "md",
  "options": [
    { "label": "每日签到", "value": "DAILY_CHECKIN" },
    { "label": "累计消费", "value": "CUMULATIVE_SPEND" },
    { "label": "连续入住", "value": "CONTINUOUS_STAY" }
  ]
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`, `clearable`, `searchable`, `options`

### radios — 单选按钮组

```json
{
  "type": "radios",
  "name": "status",
  "label": "状态",
  "required": false,
  "options": [
    { "label": "启用", "value": "active" },
    { "label": "禁用", "value": "inactive" }
  ]
}
```

**常用属性：** `name`, `label`, `required`, `options`

### checkboxes — 复选框组

```json
{
  "type": "checkboxes",
  "name": "tags",
  "label": "标签",
  "options": [
    { "label": "热门标签", "value": "hot" },
    { "label": "推荐", "value": "recommended" }
  ]
}
```

**常用属性：** `name`, `label`, `options`

### switch — 开关

```json
{
  "type": "switch",
  "name": "enabled",
  "label": "是否启用",
  "option": ["启用", "禁用"]
}
```

**常用属性：** `name`, `label`, `option` (数组，第一个为开状态文字，第二个为关状态文字)

### cascader — 级联选择器

```json
{
  "type": "cascader",
  "name": "region",
  "label": "地区",
  "placeholder": "请选择",
  "options": [
    {
      "label": "中国",
      "value": "CN",
      "children": [
        { "label": "北京", "value": "BJ" }
      ]
    }
  ]
}
```

**常用属性：** `name`, `label`, `placeholder`, `required`, `options`

### transfer — 穿梭框

```json
{
  "type": "transfer",
  "name": "selectedItems",
  "label": "选择项目",
  "options": [
    { "label": "项目A", "value": "A" },
    { "label": "项目B", "value": "B" }
  ],
  "searchable": true
}
```

**常用属性：** `name`, `label`, `required`, `options`, `searchable`

### input-image — 图片上传

```json
{
  "type": "input-image",
  "name": "bannerImage",
  "label": "横幅图片",
  "multiple": false
}
```

**常用属性：** `name`, `label`, `multiple`

## 日期类组件

### input-date — 日期选择器

```json
{
  "type": "input-date",
  "name": "startDate",
  "label": "开始日期",
  "required": false,
  "format": "YYYY-MM-DD",
  "inputFormat": "YYYY-MM-DD",
  "clearable": true
}
```

**常用属性：** `name`, `label`, `required`, `format`, `inputFormat`, `clearable`

### input-datetime — 日期时间选择器

```json
{
  "type": "input-datetime",
  "name": "startTime",
  "label": "开始时间",
  "required": false,
  "format": "YYYY-MM-DD HH:mm:ss",
  "inputFormat": "YYYY-MM-DD HH:mm:ss",
  "timeFormat": "HH:mm:ss",
  "clearable": true
}
```

**常用属性：** `name`, `label`, `required`, `format`, `inputFormat`, `timeFormat`, `clearable`

### input-date-range — 日期范围选择器

```json
{
  "type": "input-date-range",
  "name": "registrationPeriod",
  "label": "注册时间段",
  "required": false,
  "format": "YYYY-MM-DD",
  "inputFormat": "YYYY-MM-DD",
  "clearable": true
}
```

**常用属性：** `name`, `label`, `required`, `format`, `inputFormat`, `clearable`

## 布局类组件

### page — 页面容器

页面根容器：

```json
{
  "type": "page",
  "className": "mission-root",
  "body": [...]
}
```

**常用属性：** `className`, `body`, `data`

### wrapper — 布局包装器

通用布局容器，可嵌套：

```json
{
  "type": "wrapper",
  "className": "form-card",
  "body": [...]
}
```

**常用属性：** `className`, `body`

### form — 表单容器

```json
{
  "type": "form",
  "mode": "normal",
  "wrapWithPanel": false,
  "data": { "fieldName": "初始值" },
  "body": [...]
}
```

**常用属性：** `mode` (`"normal"` | `"horizontal"`), `wrapWithPanel`, `data`, `body`

### tabs — 标签页

```json
{
  "type": "tabs",
  "tabsMode": "line",
  "mountOnEnter": false,
  "unmountOnExit": false,
  "tabs": [
    {
      "title": "规则设置",
      "hash": "rule-setup",
      "body": { "type": "form", ... }
    },
    {
      "title": "奖励设置",
      "hash": "award-setup",
      "body": { "type": "form", ... }
    }
  ]
}
```

**常用属性：** `tabsMode`, `mountOnEnter`, `unmountOnExit`, `tabs`（数组，每项含 `title`, `hash`, `body`）

### combo — 动态列表（可增减）

```json
{
  "type": "combo",
  "name": "subMissions",
  "label": "子任务列表",
  "multiple": true,
  "removable": true,
  "tabsMode": true,
  "scaffold": { "title": "" },
  "items": [
    { "type": "input-text", "name": "title", "label": "标题", "required": true },
    { "type": "select", "name": "subMissionType", "label": "类型", "options": [...] }
  ]
}
```

**常用属性：** `name`, `label`, `multiple`, `removable`, `tabsMode`, `scaffold`, `items`

**数据格式**：以 `name` 为 key 的数组：

```json
{
  "subMissions": [
    { "title": "连续签到7天", "subMissionType": "ROOM_STAY_NIGHTS" },
    { "title": "连续入住3晚", "subMissionType": "ROOM_STAY_NIGHTS" }
  ]
}
```

### group — 水平排列字段组

```json
{
  "type": "group",
  "body": [
    { "type": "input-text", "name": "field1", "label": "字段1" },
    { "type": "input-text", "name": "field2", "label": "字段2" }
  ]
}
```

**常用属性：** `body`（子字段数组）

### divider — 分隔线

```json
{
  "type": "divider",
  "lineStyle": { "color": "#E8E8E8" }
}
```

### tpl — 自定义 HTML 模板

```json
{
  "type": "tpl",
  "tpl": "<div class=\"section-title\">标题</div>",
  "inline": false
}
```

**常用属性：** `tpl`（HTML 字符串），`inline`

### button — 按钮

```json
{
  "type": "button",
  "label": "返回列表",
  "actionType": "link",
  "link": "index.html?page=list",
  "className": "btn-primary",
  "size": "md"
}
```

**常用属性：** `label`, `actionType` (`"link"` | `"submit"` | `"dialog"` | `"drawer"`), `link`, `className`, `size`

### crud — CRUD 数据表格

```json
{
  "type": "crud",
  "api": "/api/data.json",
  "filter": {
    "type": "form",
    "body": [
      { "type": "input-text", "name": "name", "label": "姓名" },
      { "type": "select", "name": "department", "label": "部门", "options": [...] }
    ]
  },
  "columns": [
    { "name": "id", "label": "编号", "type": "text" },
    { "name": "name", "label": "姓名", "type": "tpl", "tpl": "${name}" },
    { "name": "department", "label": "部门", "type": "text" },
    { "name": "startDate", "label": "入职日期", "type": "date" },
    { "name": "status", "label": "状态", "type": "status" }
  ],
  "headerToolbar": [
    "bulkActions",
    "filter-toggler"
  ],
  "footerToolbar": [
    "switch-per-page",
    "statistics",
    "pagination"
  ]
}
```

**常用属性：** `api`, `filter`, `columns`, `headerToolbar`, `footerToolbar`

## CSS 类约定

项目使用统一的 CSS 变量系统，所有样式通过 CSS 类覆盖。

### 布局类

| CSS 类 | 用途 |
|--------|------|
| `.mission-root` | 页面根容器 |
| `.mission-body-split` | 左右分栏布局（表单 + 预览） |
| `.mission-left` | 左侧表单区域 |
| `.mission-right` | 右侧预览区域 |

### 页头

| CSS 类 | 用途 |
|--------|------|
| `.page-header-bar` | 页头容器（标题 + 操作按钮） |
| `.page-title` | 页面标题 |
| `.return-link` | 返回列表链接 |

### 表单

| CSS 类 | 用途 |
|--------|------|
| `.form-card` | 表单卡片（白色背景，带阴影） |
| `.sub-form-card` | 子表单卡片（较窄内边距） |
| `.section-title` | 段落标题 |
| `.section-title-sm` | 小段落标题 |
| `.hint-text` | 提示文字 |

### Tab

| CSS 类 | 用途 |
|--------|------|
| `.sub-tab-bar` | 内嵌 Tab 栏 |
| `.sub-tab-btn` | 内嵌 Tab 按钮 |

### 列表页

| CSS 类 | 用途 |
|--------|------|
| `.page-breadcrumb` | 面包屑导航 |
| `.search-card` | 搜索卡片 |
| `.btn-add` / `.btn-search` / `.btn-clear` | 操作按钮 |
| `.cell-code` / `.cell-name` / `.cell-yes` / `.cell-continue` | 表格单元格样式 |
| `.rule-status-dot` | 规则状态圆点 |

### 特殊组件

| CSS 类 | 用途 |
|--------|------|
| `.radio-group` / `.radio-item` | 单选按钮组 |
| `.phone-card` / `.phone-frame` | 手机预览模型 |
| `.award-panel` | 奖励区域（浅灰背景） |
| `.progress-panel` / `.progress-timeline` | 进度时间线面板 |
| `.sticky-footer` / `.footer-btn` | 吸底操作栏 |
| `.tab-body` / `.tab-left` / `.tab-right` | Tab 内两栏布局 |
| `.sub-mission-layout` | 子任务左右布局 |

## 数据机制

### sourcePath 数据映射

Schema 中的字段通过 `sourcePath` 属性指定它在 config JSON 中的嵌套路径：

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

支持点分路径 `parent.child.field` 和数组索引 `items[0].field`。

### 多语言字段 (multiLang)

`multiLang: true` 声明该字段的**数据值**使用 `{zh, en, jp}` 多语言对象格式：

```json
{
  "type": "field-with-exclude",
  "name": "marketCodes",
  "multiLang": true,
  "options": [
    { "label": "GDS", "value": "GDS" }
  ]
}
```

对应数据：

```json
{ "marketCodes": { "zh": "GDS,BAR", "en": "GDS,BAR" } }
```

## 完整 Schema + Data 示例

### Schema JSON

```json
{
  "type": "page",
  "className": "mission-root",
  "body": [
    {
      "type": "wrapper",
      "className": "page-header-bar",
      "body": [
        {
          "type": "tpl",
          "tpl": "<h1 class=\"page-title\">Add Mission</h1>",
          "inline": false
        },
        {
          "type": "button",
          "label": "Return to List",
          "className": "return-link",
          "actionType": "link",
          "link": "index.html?page=list"
        }
      ]
    },
    {
      "type": "form",
      "mode": "normal",
      "wrapWithPanel": false,
      "body": [
        {
          "type": "input-text",
          "name": "missionCode",
          "label": "任务编码",
          "required": true,
          "placeholder": "MISSION_YYYYMMDD_XXX"
        },
        {
          "type": "input-text",
          "name": "missionName",
          "label": "任务名称",
          "required": true,
          "placeholder": "请输入任务名称"
        },
        {
          "type": "input-date-range",
          "name": "registrationPeriod",
          "label": "注册时间",
          "format": "YYYY-MM-DD",
          "required": true
        },
        {
          "type": "select",
          "name": "missionType",
          "label": "任务类型",
          "required": true,
          "options": [
            { "label": "每日签到", "value": "DAILY_CHECKIN" },
            { "label": "累计消费", "value": "CUMULATIVE_SPEND" },
            { "label": "连续入住", "value": "CONTINUOUS_STAY" }
          ]
        },
        {
          "type": "input-number",
          "name": "quota",
          "label": "配额数量",
          "placeholder": "请输入",
          "min": 0
        }
      ]
    }
  ]
}
```

### Data JSON

```json
{
  "missionCode": "MISSION_20260601_001",
  "missionName": {
    "zh": "夏季消费任务 2026",
    "en": "Summer Spending Mission 2026"
  },
  "registrationPeriod": "2026-06-01",
  "missionType": "DAILY_CHECKIN",
  "quota": 50000
}
```
