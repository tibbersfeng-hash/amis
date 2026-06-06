# 图片上传组件清除后切换语言恢复问题修复

## 问题描述

图片上传组件清空数据后，切换语言再切换回来，已清除的图片数据又被恢复了。

**复现路径：**
1. 中文模式上传图片 → 显示图片
2. 点击清除按钮 → 图片消失
3. 切换到英文 → 英文图片正常显示
4. 切换回中文 →  中文图片又出现了（应该保持清除状态）

## 根因分析

**三个连锁缺陷**导致：

| 环节 | 缺陷 | 影响 |
|------|------|------|
| **① 读取** | `readDomValue` 的选择器 `.cxd-ImageControl input[name="${field}"]` 找不到图片上传组件（因为它的 input 没有 `name` 属性） | 清空后读不到正确状态，返回 `undefined` |
| **② 持久化** | `persistToLookup` 中 `if (currentVal !== undefined)` 跳过了 `undefined` 值的持久化 | lookup 中 `image.zh` 仍保留旧值 `/uploads/test-zh.svg` |
| **③ 应用** | `applyFromLookup` 中 `vals[lang] \|\| vals['zh']` 用 `||` 判断，空字符串 `''` 被当作 falsy 回退到 `zh` 的旧值 | 即使 lookup 中有空值，也会被旧值覆盖 |

## 修复内容

**文件：** `src/components/AmisPage/index.tsx`

### 1. 修复图片上传组件查找

**位置：** 第 118-120 行

```typescript
//  旧代码
const imgControl = document.querySelector(
  `.cxd-ImageControl input[name="${field}"]`
)?.closest('.cxd-ImageControl');

// ✅ 新代码
let imgControl: Element | null = document.querySelector(
  `[data-amis-name="${field}"] .cxd-ImageControl`
);
```

**原因：** 图片上传组件的 input 没有 `name` 属性，父元素有 `data-amis-name` 属性

### 2. 清空后返回空字符串

**位置：** 第 127-129 行

```typescript
// ❌ 旧代码
return undefined;

// ✅ 新代码
// Image was cleared — return empty string so lookup gets updated with ""
return '';
```

**原因：** 让 `persistToLookup` 能正确持久化空值

### 3. 修复 applyFromLookup 空值处理

**位置：** 第 320 行

```typescript
// ❌ 旧代码
const value = vals[lang] || vals['zh'];

// ✅ 新代码
// Use ?? instead of || so empty string '' is NOT treated as missing
const value = vals[lang] ?? vals['zh'];
```

**原因：** `||` 会将空字符串当作 falsy 值回退，`??` 只在 null/undefined 时回退

## 测试结果

| 测试集 | 结果 |
|--------|------|
| remote-page (4) | ✅ 全部通过 |
| remote-page-save (8) | ✅ 全部通过 |
| list-page (7) | ✅ 全部通过 |
| clear-and-switch (19) | ✅ 全部通过 |
| amis-i18n-data-integrity (18) | ✅ 全部通过 |
| **核心 E2E 合计** | **56/56 通过** |

## 额外修复：React 渲染错误

同次修复中还解决了 `AmisPage` 组件中的 `unmountComponentAtNode` 错误。

**问题：** `ReactDOM.render()` 渲染到已被 React 管理的 `<div>` 容器上

**修复：** 使用脱离 React 管理树的独立 DOM 节点作为容器

```typescript
// 在 useEffect 中创建独立 DOM 节点
const detachedDiv = document.createElement('div');
detachedDiv.className = 'amis-scope-inner';
ReactDOM.render(amisElement, detachedDiv);
containerRef.current.appendChild(detachedDiv);

return () => {
  ReactDOM.unmountComponentAtNode(detachedDiv);
  detachedDiv.remove();
};
```
