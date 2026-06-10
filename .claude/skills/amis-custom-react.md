---
name: amis-custom-react
description: Amis 自定义 React 组件扩展指南 — Renderer/FormItem 注册、表单项开发、组件通信、验证器
---

# Amis 自定义 React 组件扩展

amis 的配置最终转成 React 组件渲染。自定义组件有三种扩展方式，按使用场景选择：

## 扩展方式选择

| 方式 | 复用性 | 可视化编辑 | 适用场景 |
|------|--------|-----------|---------|
| 临时扩展（children 函数） | ❌ 不可复用 | ❌ | 一次性定制 |
| 注册自定义类型（Renderer） | ✅ 可复用 | ✅ | 通用展示组件 |
| 注册表单项（FormItem） | ✅ 可复用 | ✅ | 表单输入组件 |

## 1. 临时扩展（children 函数）

直接在 JSON 配置中写 React 代码，不可复用。

```jsx
{
  "name": "mycustom",
  "asFormItem": true,
  "children": ({ value, onChange, data }) => (
    <div>
      <p>当前值：{value}</p>
      <a className="btn btn-default" onClick={() => onChange(Math.round(Math.random() * 10000))}>
        随机修改
      </a>
    </div>
  )
}
```

- `value` / `onChange` — 组件值与修改方法（需 `asFormItem: true`）
- `data` — 可获取其他控件的值，如 `data.username`
- 想用 React Hooks → 用 `component` 属性而非 `children`：

```jsx
{
  "asFormItem": true,
  "component": MyHookComponent  // React Component
}
```

## 2. 注册自定义类型（Renderer）

用于非表单类展示组件。

```tsx
import * as React from 'react';
import { Renderer } from 'amis';

@Renderer({
  type: 'my-renderer',
  autoVar: true  // 自动解析 ${xxx} 变量
})
class CustomRenderer extends React.Component<any> {
  render() {
    const { tip, render, body } = this.props;
    return (
      <div>
        <p>这是自定义组件：{tip}</p>
        {body && render('body', body)}
      </div>
    );
  }
}

// 无 Decorator 环境用此写法：
Renderer({ type: 'my-renderer', autoVar: true })(CustomRenderer);
```

### 渲染子节点

如果组件需要接受 `children`，使用 `render` 方法：

```tsx
const { render, body } = this.props;
render('body', body, { /* 可选：传递给子组件的 props */ });
```

- `region` — 区域名称（多容器时不要重复）
- `node` — 子节点 schema
- `props` — 可选，传递给子组件

### 组件间通信（Scoped Context）

非表单类自定义组件默认**不**注册到 Scoped Context，需手动注册才能被其他组件引用：

```tsx
import { Renderer, ScopedContext } from 'amis';

@Renderer({ type: 'my-renderer' })
class CustomRenderer extends React.Component<any> {
  static contextType = ScopedContext;

  constructor(props: any) {
    super(props);
    const scoped = this.context;
    scoped.registerComponent(this);
  }

  componentWillUnmount() {
    const scoped = this.context;
    scoped.unRegisterComponent(this);
  }

  // 获取其他组件实例：scoped.getComponentByName("xxxName")
}
```

## 3. 注册表单项（FormItem）⭐ 最常用

用于表单输入类组件。**FormItem 自动处理**：label 展示、表单验证、三种布局模式（水平/上下/内联）。

```tsx
import * as React from 'react';
import { FormItem } from 'amis-core';

interface MyFormItemProps extends FormControlProps {
  maxLength?: number;
}

@FormItem({
  type: 'custom-input',
  strictMode: false  // 关闭严格模式，任何属性变化都重新渲染
})
class MyFormItem extends React.Component<MyFormItemProps> {
  render() {
    const { value, onChange, data, onBulkChange } = this.props;

    return (
      <div>
        <p>当前值：{value}</p>
        <a className="btn btn-default" onClick={() => onChange('新值')}>
          修改值
        </a>
      </div>
    );
  }
}

// 无 Decorator：
FormItem({ type: 'custom-input' })(MyFormItem);
```

### FormItem 核心 Props

| Props | 类型 | 说明 |
|-------|------|------|
| `value` | any | 当前字段值（由 `name` 关联） |
| `onChange` | (val) => void | 修改当前字段值 |
| `data` | object | 表单域全部数据 |
| `onBulkChange` | (obj) => void | 同时设置多个字段值 |
| `disabled` | boolean | 是否禁用 |
| `classnames` | (cls) => string | 获取 amis 主题类名 |
| `env` | object | 环境工具对象 |
| `render` | (region, node, props?) => ReactNode | 渲染子节点 |

### 获取/设置其他字段

```tsx
// 获取其他字段值
const otherValue = this.props.data.otherField;

// 同时设置多个字段
this.props.onBulkChange({ fieldA: 1, fieldB: 2 });
```

## 4. 自定义验证器

```tsx
@FormItem({ type: 'custom-checkbox' })
class CustomCheckbox extends React.Component<any> {
  validate() {
    // 返回空字符串 = 通过
    // 返回错误信息 = 不通过
    return this.props.value ? '' : '请勾选此项';
  }

  // 异步验证
  async validate() {
    const result = await checkUnique(this.props.value);
    return result.valid ? '' : '该值已存在';
  }
}
```

## 5. OptionsControl（选项类组件）

如果你的组件类似 Select/Checkboxes，需要处理动态 options，使用 `OptionsControl`：

```tsx
import { OptionsControl } from 'amis';

@OptionsControl({ type: 'my-select' })
class MySelect extends React.Component<any> {
  render() {
    const { options, selectedOptions, loading, onToggle, onToggleAll } = this.props;
    // options — 已处理好的选项列表（含 source 拉取结果）
    // selectedOptions — 当前选中的选项数组
    // loading — 是否在加载中
    // onToggle — 切换单个选项
    // onToggleAll — 切换全选
  }
}
```

支持属性：
- `options` — 静态选项，支持 `visibleOn`/`hiddenOn`
- `source` — 动态拉取选项（变量变化时自动重新拉取）

## 6. env 环境工具对象

自定义组件的 `props.env` 提供实用方法：

| 方法 | 说明 | 示例 |
|------|------|------|
| `env.fetcher(url, data)` | 发起 API 请求 | `env.fetcher('/api/data', {id: 1}).then(r => ...)` |
| `env.confirm(msg)` | 确认框，返回 Promise | `env.confirm('确定删除？').then(ok => ...)` |
| `env.alert(msg)` | Alert 弹框 | `env.alert('操作成功')` |
| `env.notify(type, msg)` | Toast 消息 | `env.notify('error', '出错了')` |
| `env.jumpTo(url)` | 页面跳转 | `env.jumpTo('/list')` |

## 本项目已有的自定义组件示例

参考 `src/components/` 下的自定义组件实现：

| 组件 | 类型 | 文件 |
|------|------|------|
| InputRichTextQuill | FormItem | `src/components/InputRichTextQuill/QuillEditor.tsx` |
| FieldWithExcludeV2 | FormItem | `src/components/FieldWithExcludeV2/index.tsx` |

**FieldWithExcludeV2 注册方式参考（FormItem 模式）：**

```tsx
FormItem({
  type: 'field-with-exclude-v2',
  name: 'field-with-exclude-v2',
  strictMode: false,
})(FieldWithExcludeV2Inner);
```

**InputRichTextQuill 注册方式参考：**

```tsx
FormItem({
  type: 'input-rich-text-quill',
  name: 'input-rich-text-quill',
})(InputRichTextQuillInner);
```

## 开发 checklist

开发新的 Amis 自定义组件时：

1. [ ] 确定扩展方式（临时 / Renderer / FormItem / OptionsControl）
2. [ ] 注册 type 名（全局唯一，建议加项目前缀如 `shangri-la-xxx`）
3. [ ] 实现 `render` 方法
4. [ ] FormItem：对接 `value` / `onChange`
5. [ ] Renderer 如有子节点：使用 `render('body', body)`
6. [ ] 如需被其他组件引用：注册到 Scoped Context
7. [ ] 如有验证逻辑：实现 `validate` 方法
8. [ ] 添加到 showcase：`src/showcase/amis-components/` + 注册到 `index.ts`
9. [ ] 更新文档：`docs/amis-components.md` + `vite.config.js` FIELD_TEMPLATES
