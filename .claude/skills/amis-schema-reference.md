---
name: amis-schema-reference
description: Amis JSON Schema 完整参考 — 组件类型、通用属性、API/Action 规范
---

# Amis JSON Schema 参考

amis 页面完全由 JSON 配置驱动。核心规则：**每个组件对象必须包含 `type` 字段**，`type` 值决定使用哪个渲染器。

## 1. 通用属性（所有组件继承自 BaseSchema）

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | string | **必填**。组件类型名 |
| `className` | string/object | CSS 类名，对象形式可配合表达式 `{"red": "data.progress > 80"}` |
| `style` | object | 内联样式 |
| `visible` / `visibleOn` | boolean / expression | 是否显示（推荐） |
| `hidden` / `hiddenOn` | boolean / expression | 是否隐藏（已废弃，推荐用 visible） |
| `disabled` / `disabledOn` | boolean / expression | 是否禁用 |
| `id` | string | 组件唯一 ID（日志采集） |
| `onEvent` | object | 事件动作配置 |
| `static` / `staticOn` | boolean / expression | 是否静态展示（表单字段只读模式） |
| `useMobileUI` | boolean | 关闭移动端样式 |

## 2. 模板语法

**`${xxx}` 或 `${xxx|upperCase}`** — 数据模板，支持过滤器管道  
**`<%= data.xxx %>`** — ejs 模板语法

️ 两种语法**不能混用**。

## 3. 页面入口：`page` 类型

```json
{
  "type": "page",
  "title": "页面标题",
  "body": [...],
  "aside": [...],
  "toolbar": [...],
  "initApi": { "method": "get", "url": "/api/data" },
  "initFetch": true,
  "data": {}
}
```

- `body` — 内容区域（数组或单个 schema）
- `aside` — 边栏区域
- `toolbar` — 顶部操作栏
- `initApi` — 页面初始化拉取数据的 API
- `interval` — 配置后 `initApi` 会轮询

## 4. 布局容器

| type | 说明 | 关键属性 |
|------|------|----------|
| `page` | 页面根容器 | body, aside, toolbar, initApi |
| `flex` | Flex 布局 | direction, justify, alignContent, alignItems, items[] |
| `grid` | 格子布局（列式） | columns[], gap, align |
| `hbox` | 水平盒子 | columns[]（每项可设 columnRatio） |
| `vbox` | 垂直盒子 | body[] |
| `wrapper` | 通用容器 | body, size |
| `panel` | 面板（header+body+footer） | header, body, footer, actions, collapsible |
| `tabs` | 选项卡 | tabs[{title, tab: {...}}], activeKey, addable, closable |
| `collapse-group` | 折叠面板组 | body[], accordion, activeKey |
| `carousel` | 轮播图 | items[], auto, interval, animation |
| `dialog` | 弹框 | body, title, actions, size, closeOnEsc |
| `drawer` | 抽屉 | body, title, actions, position, size, closeOnEsc |

## 5. 数据展示

| type | 说明 | 关键属性 |
|------|------|----------|
| `table` / `table2` | 表格 | columns[], data, api, sortable |
| `crud` / `crud2` | 增删改查（表格+分页+操作） | api, columns, headerToolbar, footerToolbar, filter |
| `card` / `card2` | 卡片 | header, body, media, actions, secondary |
| `cards` | 卡片列表 | source, card, perPage |
| `list` | 列表 | source, listItem, header, footer |
| `chart` | ECharts 图表 | config, api, clickAction |
| `log` | 日志（实时流） | source, autoScroll |
| `json` | JSON 展示 | source, levelExpand, enableClipboard |
| `markdown` | Markdown 渲染 | value, name |
| `tpl` | 模板渲染 | tpl, inline, html |
| `html` | HTML 渲染 | html |
| `plain` / `text` | 纯文本 | value, placeholder |
| `mapping` | 值映射展示 | map, source, labelField |
| `status` | 状态展示 | map, source, labelMap |
| `progress` | 进度条 | value, mode, map, showLabel |
| `property` | 属性列表 | items[{label, content}] |
| `divider` | 分割线 | lineStyle, title, titlePosition |
| `icon` | 图标 | icon（iconfont 类名） |
| `avatar` | 头像 | src, icon, text, shape, size |
| `tag` / `tags` | 标签 | label, color, closable |
| `link` | 链接 | href, body, icon, blank |
| `image` / `images` | 图片/图集 | src, enlargeAble, originalSrc |
| `video` | 视频 | src, autoPlay, poster, loop |
| `audio` | 音频 | src, autoPlay, rates |
| `iframe` | 内嵌网页 | src, height, sandbox |
| `pagination` | 分页 | perPage, activePage, mode |
| `search-box` | 搜索框 | mini, mode, filter |

## 6. 表单组件（Form 内使用）

表单根组件：`type: "form"`，关键属性 `body[]`（表单项列表）、`api`（提交地址）、`actions[]`（操作按钮）、`mode`（表单布局）、`title`。

### 输入类

| type | 说明 |
|------|------|
| `input-text` | 文本输入 |
| `input-password` | 密码输入 |
| `input-email` | 邮箱输入 |
| `input-url` | URL 输入 |
| `input-number` | 数字输入 |
| `textarea` | 多行文本 |
| `input-range` | 范围滑块 |
| `input-color` | 颜色选择 |
| `input-rating` | 评分 |
| `slider` | 滑块 |

### 选择类

| type | 说明 |
|------|------|
| `select` | 下拉选择 |
| `multi-select` | 多选下拉 |
| `radios` | 单选组 |
| `checkboxes` | 多选组 |
| `switch` | 开关 |
| `chained-select` | 级联选择 |
| `tree-select` / `input-tree` | 树选择 |
| `transfer` / `tabs-transfer` | 穿梭选择 |
| `picker` | 弹窗选择 |

### 日期时间类

| type | 说明 |
|------|------|
| `input-date` / `input-date-range` | 日期/范围 |
| `input-time` / `input-time-range` | 时间/范围 |
| `input-datetime` / `input-datetime-range` | 日期时间/范围 |
| `input-month` / `input-year` / `input-quarter` | 月/年/季度 |

### 文件类

| type | 说明 |
|------|------|
| `input-file` | 文件上传 |
| `input-image` | 图片上传 |

### 高级表单组件

| type | 说明 |
|------|------|
| `combo` | 组合输入（可增减行） |
| `input-table` | 表格输入 |
| `input-sub-form` | 子表单（弹出编辑） |
| `input-array` | 数组输入 |
| `condition-builder` | 条件构建器 |
| `diff-editor` | 代码对比 |
| `input-rich-text` | 富文本 |
| `editor` | 代码编辑器 |
| `input-city` | 城市选择 |
| `input-signature` | 手写签名 |

### 布局/辅助

| type | 说明 |
|------|------|
| `group` | 表单项分组（一行多列） |
| `fieldSet` | 字段集（带标题的分块） |
| `hidden` | 隐藏字段 |
| `static` | 静态展示（只读） |
| `uuid` | 自动生成 UUID |
| `formula` | 公式计算字段 |

## 7. 动作系统（Action）

所有按钮/操作都通过 Action 定义：

```json
{
  "type": "button",
  "actionType": "dialog",
  "label": "弹出",
  "dialog": { "title": "...", "body": "..." }
}
```

| actionType | 用途 | 额外属性 |
|-----------|------|----------|
| `ajax` | 发送 AJAX 请求 | api, confirmText, feedback, reload |
| `url` | 跳转链接 | url, blank |
| `link` | 内部页面跳转 | link, blank |
| `dialog` | 弹出对话框 | dialog, title |
| `drawer` | 弹出抽屉 | drawer, title |
| `toast` | 提示消息 | toast, position |
| `copy` | 复制内容 | content |
| `reload` | 刷新组件 | target |
| `email` | 发送邮件 | email, subject, body |
| `close` | 关闭弹框/抽屉 | - |
| `submit` | 提交表单 | - |
| `reset` | 重置表单 | - |

## 8. API 配置

所有涉及数据请求的地方使用统一 API 结构：

```json
{
  "method": "get|post|put|delete|patch",
  "url": "/api/path",
  "data": {},
  "headers": {},
  "sendOn": "表达式条件",
  "cache": 5000,
  "responseData": {}
}
```

**简写**：API 可以直接写字符串 `"/api/path"`（默认 GET）或 `"get:/api/path"` / `"post:/api/path"`。

## 9. 数据映射

amis 的数据通过 `data` 对象在各组件间流转：

- **`${xxx}`** — 模板中引用当前数据域的值
- **`name` 属性** — 表单字段通过 name 从 data 中取值/回写
- **`source` 属性** — 从数据域指定路径取值（如 `"source": "$rows"`）
- **API `data`** — 发送请求时携带的数据，`"&": "$$"` 表示所有原始数据

## 10. 核心模式总结

1. **页面 = JSON**：整个页面是一个 JSON 对象，`type: "page"` 为根
2. **`type` 决定一切**：每个组件的 `type` 字段指定渲染器
3. **`body` 是容器**：大多数容器组件用 `body` 属性接收子组件（数组或单个 schema）
4. **API 统一**：所有数据请求统一用 `method + url` 或简写字符串
5. **表达式驱动**：`visibleOn`, `disabledOn` 等用表达式控制行为
6. **表单 = body[]**：表单的 `body` 是表单项数组，每个项有 `type` 和 `name`
7. **Action = 交互**：所有按钮和交互通过 `actionType` 定义行为
