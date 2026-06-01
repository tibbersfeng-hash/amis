# Amis 组件介绍文档

> 本文档为 AI 生成 Amis Schema JSON 和 Data JSON 提供参考。

## 项目概况

- **Amis 版本**: 3.6.0
- **主题**: cxd
- **React**: 17.0.2
- **构建工具**: Vite 8.x
- **渲染 API**: `render(schema, {data, locale, theme}, {session, theme, locale})`

## Schema JSON 结构规范

### 页面容器 (page)

```json
{
  "type": "page",
  "title": "页面标题",
  "className": "page-class",
  "body": []
}
```

### 表单 (form)

```json
{
  "type": "form",
  "mode": "normal",
  "wrapWithPanel": false,
  "data": { "fieldName": "初始值" },
  "body": [
    { "type": "input-text", "name": "fieldName", "label": "字段标签", "required": false }
  ]
}
```

### 标签页 (tabs)

```json
{
  "type": "tabs",
  "tabsMode": "line",
  "mountOnEnter": false,
  "unmountOnExit": false,
  "tabs": [
    { "title": "Tab 1", "hash": "tab-1", "body": { "type": "form", ... } }
  ]
}
```

### CRUD 表格

```json
{
  "type": "crud",
  "api": "/api/data.json",
  "columns": [
    { "name": "id", "label": "ID", "type": "text" },
    { "name": "name", "label": "名称", "type": "tpl", "tpl": "${name}" }
  ],
  "headerToolbar": [],
  "footerToolbar": ["statistics", "pagination"]
}
```

### 组合表单 (combo)

```json
{
  "type": "combo",
  "name": "items",
  "label": "项目列表",
  "multiple": true,
  "removable": true,
  "tabsMode": true,
  "scaffold": { "title": "", "name": "" },
  "items": [
    { "type": "input-text", "name": "title", "label": "标题", "required": true },
    { "type": "input-text", "name": "name", "label": "名称" }
  ],
  "value": [
    { "title": "默认值1", "name": "default1" }
  ]
}
```

### 分组 (group)

```json
{
  "type": "group",
  "body": [
    { "type": "input-text", "name": "field1", "label": "字段1" },
    { "type": "input-text", "name": "field2", "label": "字段2" }
  ]
}
```

### 分隔线 (divider)

```json
{ "type": "divider", "lineStyle": { "color": "#E8E8E8" } }
```

### 按钮 (button)

```json
{
  "type": "button",
  "label": "按钮文字",
  "actionType": "link",
  "link": "index.html?page=other",
  "className": "btn-primary",
  "size": "md"
}
```

### 模板 (tpl)

```json
{
  "type": "tpl",
  "tpl": "<div class=\"section-title\">标题</div>",
  "inline": false
}
```

## 常用输入组件

| 类型 | 名称 | 用途 | 关键属性 |
|------|------|------|----------|
| input-text | 文本输入 | 单行文本 | placeholder, required, clearable, size |
| textarea | 多行文本 | 长文本输入 | rows, maxLength |
| input-number | 数字输入 | 数值 | min, max, precision, placeholder |
| select | 下拉选择 | 单选 | options, clearable, searchable |
| radios | 单选按钮组 | 选项少 | options |
| switch | 开关 | 布尔值 | option: "启用", "禁用" |
| input-date | 日期选择 | 单日期 | format: "YYYY-MM-DD", inputFormat |
| input-datetime | 日期时间 | 日期+时间 | format: "YYYY-MM-DD HH:mm:ss", timeFormat |
| input-date-range | 日期范围 | 起止日期 | format: "YYYY-MM-DD" |
| input-image | 图片上传 | 图片URL | multiple: false |
| input-url | URL 输入 | 链接地址 | placeholder |
| input-color | 颜色选择 | 颜色 | placeholder |
| editor | 代码编辑器 | HTML/JSON 编辑 | language: "html"/"json", size: "lg" |

### input-text 示例

```json
{
  "type": "input-text",
  "name": "missionName",
  "label": "任务名称",
  "required": true,
  "placeholder": "请输入任务名称",
  "clearable": true,
  "size": "md"
}
```

### select 示例

```json
{
  "type": "select",
  "name": "missionType",
  "label": "任务类型",
  "required": true,
  "options": [
    { "label": "每日签到", "value": "DAILY_CHECKIN" },
    { "label": "累计消费", "value": "CUMULATIVE_SPEND" },
    { "label": "连续入住", "value": "CONTINUOUS_STAY" }
  ],
  "placeholder": "请选择",
  "clearable": true,
  "size": "md"
}
```

### input-datetime 示例

```json
{
  "type": "input-datetime",
  "name": "startTime",
  "label": "开始时间",
  "required": true,
  "timeFormat": "HH:mm:ss",
  "format": "YYYY-MM-DD HH:mm:ss",
  "inputFormat": "YYYY-MM-DD HH:mm:ss",
  "clearable": false
}
```

### input-number 示例

```json
{
  "type": "input-number",
  "name": "quota",
  "label": "配额数量",
  "placeholder": "请输入数量",
  "min": 0,
  "precision": 0
}
```

## Data JSON 结构规范

Data JSON 是 Schema 中表单字段的初始值，结构为**扁平对象**：

```json
{
  "missionCode": "MISSION_20260101_001",
  "missionName": "夏季消费任务",
  "enrollStart": "2026-01-01 00:00:00",
  "enrollEnd": "2026-12-31 23:59:59",
  "quota": 50000,
  "missionType": "DAILY_CHECKIN",
  "showMissionCenter": false
}
```

### 嵌套路径（dot-notation）

当 Schema 使用 `name: "parent.child.field"` 格式时，Data JSON 可以用嵌套结构或扁平结构：

**嵌套结构（推荐）：**
```json
{
  "missionRule": {
    "ruleSetup": {
      "missionName": "夏季任务",
      "missionCode": "SUMMER_001"
    }
  }
}
```

**扁平结构：**
```json
{
  "missionRule.ruleSetup.missionName": "夏季任务",
  "missionRule.ruleSetup.missionCode": "SUMMER_001"
}
```

### Combo 数据

Combo 的 value 对应 Data JSON 中以 name 为 key 的数组：

```json
{
  "subMissions": [
    {
      "title": "连续签到7天",
      "subMissionType": "ROOM_STAY_NIGHTS",
      "noOfNights": 7,
      "awardPoints": 500
    },
    {
      "title": "连续签到30天",
      "subMissionType": "ROOM_STAY_NIGHTS",
      "noOfNights": 30,
      "awardPoints": 2000
    }
  ]
}
```

## 多语言字段规范

可翻译字段在 Data JSON 中使用 `{zh, en}` 对象格式：

```json
{
  "missionLongName": {
    "zh": "夏季消费任务 2025",
    "en": "Summer Spending Mission 2025"
  },
  "missionDescription": {
    "zh": "完成住宿消费任务，赚取丰厚积分奖励",
    "en": "Complete your stay spending mission to earn generous points rewards"
  }
}
```

## CSS 类约定

项目使用统一的 CSS 变量系统，常用类名：

| CSS 类 | 用途 |
|--------|------|
| `.page-header-bar` | 页头容器 |
| `.page-title` | 页面标题 |
| `.form-card` | 表单卡片容器 |
| `.sub-form-card` | 子表单卡片 |
| `.section-title` | 段落标题 |
| `.section-title-sm` | 小段落标题 |
| `.hint-text` | 提示文字 |
| `.radio-group` / `.radio-item` | 单选按钮组 |
| `.phone-card` / `.phone-frame` | 手机预览 |
| `.sticky-footer` | 吸底操作栏 |
| `.award-panel` | 奖励面板 |

## 完整示例

以下是一个完整的 Mission 页面 Schema + Data：

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
          "label": "Mission Code",
          "required": true,
          "placeholder": "MISSION_YYYYMMDD_XXX"
        },
        {
          "type": "input-text",
          "name": "missionName",
          "label": "Mission Name",
          "required": true,
          "placeholder": "Please input"
        },
        {
          "type": "input-date-range",
          "name": "registrationPeriod",
          "label": "Registration Period",
          "format": "YYYY-MM-DD",
          "required": true
        },
        {
          "type": "select",
          "name": "missionType",
          "label": "Mission Type",
          "required": true,
          "options": [
            { "label": "Daily Check-in", "value": "DAILY_CHECKIN" },
            { "label": "Cumulative Spend", "value": "CUMULATIVE_SPEND" },
            { "label": "Room Stay Nights", "value": "ROOM_STAY_NIGHTS" }
          ]
        },
        {
          "type": "input-number",
          "name": "quota",
          "label": "Quota",
          "placeholder": "Please input",
          "min": 0
        },
        {
          "type": "input-number",
          "name": "minRegistration",
          "label": "Minimum Registration",
          "placeholder": "Please input",
          "min": 0
        }
      ]
    }
  ]
}
```

对应 Data JSON：

```json
{
  "missionCode": "MISSION_20260601_001",
  "missionName": "夏季消费任务 2026",
  "registrationPeriod": "2026-06-01",
  "missionType": "DAILY_CHECKIN",
  "quota": 50000,
  "minRegistration": 100
}
```
