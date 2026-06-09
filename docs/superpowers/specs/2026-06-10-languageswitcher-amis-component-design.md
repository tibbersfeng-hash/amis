# LanguageSwitcher Amis 组件化设计

> 日期: 2026-06-10
> 状态: Approved

## 目标

将 LanguageSwitcher 从 React 直接调用改造为 Amis 自定义渲染器，通过 schema JSON 声明使用，渲染在 Amis scope 内部。

## 现状

- LanguageSwitcher 是一个独立 React 组件，在 `AmisPage` 和 `PreviewPanel` 中通过 React import 直接渲染
- `AmisPage` 内的 LanguageSwitcher 渲染在 Amis scope 外部
- 语言切换的联动逻辑（persist + 重渲染）在 `AmisPage` 的 React 层处理
- 多个工具文件导入 `Language` 类型、`LANGUAGE_KEYS`、`isI18nValue` 等导出符号

## 架构设计

### 通信链路

```
用户切换语言
  ↓
LanguageSwitcherRenderer (Amis scope 内)
  ├─ dispatchEvent('change', { value }) → 其他 Amis 组件通过 onEvent 监听
  └─ window.dispatchEvent('amis-language-change') → AmisPage (React 层) 监听
  ↓
AmisPage 收到事件
  ├─ handler.persist() 保存当前语言的值
  ├─ 更新 currentLang state → displayData 重算
  └─ useEffect 重新 renderAmis
```

### 为什么用 window 事件桥接

Amis scope 是独立的 React root，其 dispatchEvent 走 Amis 内部事件系统，外层 React 组件无法直接捕获。window CustomEvent 是最简单的桥接方式，耦合度低。

## 文件变更

### 1. `src/components/LanguageSwitcher/index.tsx` — 保留

导出项不变：
- `LanguageSwitcher` (React 组件)
- `Language` (类型)
- `LanguageKey`, `LANGUAGE_KEYS` (常量)
- `LANGUAGES` (下拉选项)
- `isI18nValue` (工具函数)

新增可选 props（向后兼容，现有调用方无需改动）：
- `variant?: 'select' | 'button' | 'tab'` — 外观模式，默认 `'select'`
- `showLabel?: boolean` — 是否显示标签，默认 `true`
- `languages?: typeof LANGUAGES` — 自定义语言列表

### 2. `src/components/LanguageSwitcher/amis-renderer.tsx` — 新增

```
@Renderer({ type: 'language-switcher', autoVar: true })
```

职责：
- 将 LanguageSwitcher 注册为 Amis 组件类型 `language-switcher`
- 通过 `ScopedContext.registerComponent(this)` 注册到 scope
- 接收 schema props：`variant`, `showLabel`, `languages`, `value`
- `handleChange` 中同时调用 `dispatchEvent` 和 `window.dispatchEvent`
- 提供 `doAction` 方法供 Amis 事件系统调用

### 3. `src/components/AmisPage/index.tsx` — 修改

删除：
- `import { LanguageSwitcher } from '../LanguageSwitcher'`
- 直接渲染 LanguageSwitcher 的 JSX
- `handleLanguageChange` 函数

新增：
- useEffect 监听 `window` 上的 `amis-language-change` 事件
- 事件回调中执行 persist + state 更新（复用现有逻辑）

导入注册文件：
- `import '../components/LanguageSwitcher/amis-renderer'`（确保 Renderer 注册生效）

### 4. `src/index.css` — 修改

调整 `.language-switcher` 样式，使其在 Amis scope 内渲染时外观正确：
- 增加 `.amis-scope .language-switcher` 选择器
- 确保 z-index、margin 等在 scope 内与原有表现一致

### 5. showcase / test — 修改

- `showcase.tsx`：增加 variant 切换演示
- `test.tsx`：增加 variant prop 的测试用例

## Schema 用法

```json
{
  "type": "form",
  "body": [
    {
      "type": "language-switcher",
      "variant": "select",
      "showLabel": true,
      "onEvent": {
        "change": {
          "actions": [
            { "actionType": "toast", "args": { "msg": "切换到 ${event.data.value}" } }
          ]
        }
      }
    },
    { "type": "input-text", "name": "title", "label": "标题", "multiLang": true }
  ]
}
```

## 向后兼容

| 消费者 | 变更 |
|--------|------|
| PreviewPanel | **不变** — 仍用 React 组件导入，API 不变 |
| I18nConfigPanel | **不变** — 只导入类型和常量 |
| utils/locale.ts | **不变** — 只导入类型和常量 |
| utils/multiLang.ts | **不变** — 只导入类型和工具函数 |
| utils/MultiLangHandler.ts | **不变** — 只导入类型和工具函数 |
| AmisLivePreview | **不变** — 只导入类型 |
| App.tsx | **不变** — 只导入类型 |

**只有 AmisPage 需要改动**，其他消费者完全不受影响。

## 风险与缓解

| 风险 | 缓解 |
|------|------|
| window 事件与 Amis 内部事件不同步 | dispatchEvent 和 window.dispatchEvent 在同一调用栈中同步触发 |
| 多次切换导致重复 persist | AmisPage 中保留 `if (newLang === langRef.current) return;` 守卫 |
| Renderer 注册时机 | 在 AmisPage 的 imports 中显式引入 amis-renderer 确保注册生效 |
