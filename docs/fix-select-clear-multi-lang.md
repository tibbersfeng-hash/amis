# 下拉选择/多选组件清除后切换语言恢复问题修复

## 问题描述

下拉选择（select）和多选（multi-select）组件清空数据后，切换语言再切换回来，已清除的数据又被恢复了。

**复现路径：**
1. 中文模式下拉选择"北京" → 显示北京
2. 点击清除按钮 → 选择清空
3. 切换到英文 → 英文选项显示
4. 切换回中文 →  中文选项"北京"又出现了（应该保持清除状态）

## 根因分析

**两个连锁缺陷**导致：

| 环节 | 缺陷 | 影响 |
|------|------|------|
| **① 读取** | `readDomValue` 中 select 代码块：当 `.cxd-Select-value` 为空时（已清空），不返回任何值，fall through 到后续逻辑 | 最终返回 `undefined` |
| **② 持久化** | `persistToLookup` 中 `if (currentVal !== undefined)` 跳过了 `undefined` 值的持久化 | lookup 中 `select.zh` 仍保留旧值 |

**与图片上传组件的关联：**
图片上传修复已解决了第 ③ 环节（`applyFromLookup` 中 `||` → `??`），本次修复补全第 ① ② 环节。

## 修复内容

**文件：** `src/components/AmisPage/index.tsx`

### 1. 清空 select 后返回空字符串

**位置：** 第 170-181 行（select 读取逻辑末尾）

```typescript
// ❌ 旧代码 — select 清空后 fall through，最终返回 undefined
const selValues = Array.from(document.querySelectorAll('.cxd-Select-value'))
    .filter(el => !el.closest('.field-with-exclude-v2'));
if (selValues.length > 0) {
  // ...matched logic...
  if (matched.length > 0) return matched.join(',');
}
// → 没有返回值，fall through 到 return undefined

// ✅ 新代码 — select 存在但无值时返回 ''
const selValues = Array.from(document.querySelectorAll('.cxd-Select-value'))
    .filter(el => !el.closest('.field-with-exclude-v2'));
if (selValues.length > 0) {
  // ...matched logic...
  if (matched.length > 0) return matched.join(',');
}

// Select exists but no value visible (cleared or placeholder only) — return empty string
// so lookup gets updated with "" instead of skipping persistence
const hasSelectControl = document.querySelector('.cxd-SelectControl');
if (hasSelectControl) return '';
```

**原因：** 让 `persistToLookup` 能正确持久化空值到 lookup

## 修复链路

### 单选场景

| 步骤 | 旧行为 | 新行为 |
|------|--------|--------|
| 中文选择"北京" → 清空 | lookup: `select: {zh: "beijing", en: "Beijing"}` | 同上 |
| 切换英文（persistToLookup） | `readDomValue` 返回 `undefined` → **跳过持久化** | `readDomValue` 返回 `''` → `select.zh = ''` |
| 切回中文（applyFromLookup） | `vals['zh']` = `"beijing"` → **恢复旧值 ❌** | `vals['zh']` = `''` → 保持清除 ✅ |

### 多选场景

| 步骤 | 旧行为 | 新行为 |
|------|--------|--------|
| 中文选择"阅读,旅行" → 清空 | lookup: `hobby: {zh: ['阅读','旅行'], en: ['reading','travel']}` | 同上 |
| 切换英文（persistToLookup） | `readDomValue` 返回 `undefined` → **跳过持久化** | `readDomValue` 返回 `''` → `split(',')` → `hobby.zh = []` |
| 切回中文（applyFromLookup） | `vals['zh']` = `['阅读','旅行']` → **恢复旧值 ❌** | `vals['zh']` = `[]` → 保持清除 ✅ |

## 已确认的现有修复

本次修复依赖以下已有改动（图片上传修复时已完成）：

| 修复 | 位置 | 说明 |
|------|------|------|
| `||` → `??` | `applyFromLookup` 第 325 行 | 空字符串 `''` 不再被当作 falsy 回退到 `zh` 旧值 |
| 空值 split 处理 | `persistToLookup` 第 306 行 | `currentVal.split(',')` 当 `currentVal` 为 `''` 时返回 `[]` |

## 影响范围

| 组件类型 | 影响 |
|----------|------|
| select（单选） | 清空后切换语言保持清除状态 |
| select multiple（多选） | 清空后切换语言保持清除状态 |
| radio | 不受影响（有独立的 checked 检测逻辑） |
| checkbox | 不受影响（有独立的 checked 检测逻辑） |
| input-text/textarea | 不受影响（native input[name] 优先读取） |
