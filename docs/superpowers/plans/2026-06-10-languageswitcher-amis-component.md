# LanguageSwitcher Amis 组件化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 LanguageSwitcher 从 React 直接渲染改造为 Amis 自定义渲染器，通过 schema JSON 声明使用，渲染在 Amis scope 内部。

**Architecture:** 使用 `registerRenderer` 将 LanguageSwitcher 注册为 `language-switcher` 类型；组件内部通过 `dispatchEvent` 派发 Amis 事件 + `window.dispatchEvent` 桥接到 React 层；AmisPage 删除直接渲染，改为监听 window 事件触发 persist + 重渲染。

**Tech Stack:** React 17 + TypeScript + Amis 6.13 + registerRenderer API + Playwright (E2E)

---

## 文件清单

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/components/LanguageSwitcher/index.tsx` | 新增 variant/showLabel/languages 可选 props |
| 新增 | `src/components/LanguageSwitcher/amis-renderer.tsx` | registerRenderer 注册为 Amis 组件 |
| 修改 | `src/components/AmisCustomComponents/index.ts` | 添加 LanguageSwitcher/amis-renderer 导入 |
| 修改 | `src/components/AmisPage/index.tsx` | 删除直接渲染，改为监听 window 事件 |
| 修改 | `src/index.css` | 增加 `.amis-scope .language-switcher` 样式适配 |
| 修改 | `src/components/LanguageSwitcher/showcase.tsx` | 增加 variant 切换演示 |
| 修改 | `src/components/LanguageSwitcher/test.tsx` | 增加 variant prop 测试 |

---

## 依赖关系

```
Task 1: 增强 LanguageSwitcher React 组件 (variant/showLabel/languages)
  ↓
Task 2: 新增 amis-renderer.tsx (依赖 Task 1 的新 props)
  ↓
Task 3: 注册到 AmisCustomComponents (依赖 Task 2)
  ↓
Task 4: 修改 AmisPage 通信方式 (依赖 Task 3)
  ↓
Task 5: CSS 适配 (依赖 Task 4，可在 scope 内看到效果)
  ↓
Task 6: Showcase 更新 (依赖 Task 1)
  ↓
Task 7: Unit Test 更新 (依赖 Task 1)
  ↓
Task 8: E2E 回归验证 (依赖 Task 1-7)
```

---

### Task 1: 增强 LanguageSwitcher React 组件

**Files:**
- Modify: `src/components/LanguageSwitcher/index.tsx`

- [ ] **Step 1: 更新类型定义和 props 接口**

在 `export type Language = ...` 之后、`export interface LanguageSwitcherProps` 之前，添加 variant 类型：

```typescript
export type LanguageSwitcherVariant = 'select' | 'button' | 'tab';
```

将 `LanguageSwitcherProps` 替换为：

```typescript
export interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  /** Appearance mode. Default: 'select' */
  variant?: LanguageSwitcherVariant;
  /** Whether to show the "Language:" label. Default: true */
  showLabel?: boolean;
  /** Custom language list. Default: LANGUAGES (zh/en/jp) */
  languages?: typeof LANGUAGES;
  /** Additional CSS class */
  className?: string;
}
```

- [ ] **Step 2: 更新组件实现支持 variant**

将 `LanguageSwitcher` 组件实现替换为：

```typescript
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
  variant = 'select',
  showLabel = true,
  languages = LANGUAGES,
  className,
}) => {
  const baseClass = 'language-switcher';
  const cls = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div className={cls}>
      {showLabel && (
        <label className="language-label">Language:</label>
      )}
      {variant === 'select' && (
        <select
          className="language-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
        >
          {languages.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}
      {variant === 'button' && (
        <div className="language-buttons">
          {languages.map(({ value, label }) => (
            <button
              key={value}
              className={`language-btn ${value === language ? 'is-active' : ''}`}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {variant === 'tab' && (
        <div className="language-tabs">
          {languages.map(({ value, label }) => (
            <div
              key={value}
              className={`language-tab ${value === language ? 'is-active' : ''}`}
              onClick={() => onLanguageChange(value)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
cd /var/www/amis-mission
git add src/components/LanguageSwitcher/index.tsx
git commit -m "feat(LanguageSwitcher): add variant/showLabel/languages props for flexible appearance"
```

---

### Task 2: 新增 amis-renderer.tsx

**Files:**
- Create: `src/components/LanguageSwitcher/amis-renderer.tsx`

- [ ] **Step 1: 创建 Amis Renderer 注册文件**

```typescript
import React from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps } from 'amis';
import { LanguageSwitcher, LANGUAGES } from './index';
import type { Language } from './index';

/**
 * Amis schema props for language-switcher component.
 */
interface LanguageSwitcherSchema {
  type: 'language-switcher';
  /** Appearance mode: 'select' | 'button' | 'tab'. Default: 'select' */
  variant?: 'select' | 'button' | 'tab';
  /** Whether to show the label. Default: true */
  showLabel?: boolean;
  /** Custom language options. Default: LANGUAGES */
  languages?: Array<{ value: Language; label: string }>;
  /** Initial language value. Default: 'zh' */
  value?: Language;
  /** Additional CSS class */
  className?: string;
}

interface LanguageSwitcherRendererProps extends FormControlProps, LanguageSwitcherSchema {}

/**
 * LanguageSwitcherRenderer — Amis custom renderer for language switching.
 *
 * Renders inside the Amis scope. On language change:
 * 1. dispatchEvent('change') → other Amis components can listen via onEvent
 * 2. window.dispatchEvent('amis-language-change') → AmisPage (React layer) listens and handles persist
 *
 * Usage in schema:
 * {
 *   "type": "language-switcher",
 *   "variant": "select",
 *   "showLabel": true,
 *   "onEvent": {
 *     "change": {
 *       "actions": [{ "actionType": "toast", "args": { "msg": "Switched to ${event.data.value}" } }]
 *     }
 *   }
 * }
 */
const LanguageSwitcherRenderer: React.FC<LanguageSwitcherRendererProps> = ({
  variant,
  showLabel,
  languages,
  value,
  className,
  dispatchEvent,
}) => {
  const lang = value || 'zh';
  const langs = languages || LANGUAGES;

  const handleChange = React.useCallback(
    (newLang: Language) => {
      // 1. Amis event system — other Amis components can listen via onEvent
      dispatchEvent?.('change', { value: newLang });

      // 2. Bridge to React layer — AmisPage listens to this for persist + re-render
      window.dispatchEvent(
        new CustomEvent('amis-language-change', { detail: { lang: newLang } })
      );
    },
    [dispatchEvent],
  );

  return (
    <LanguageSwitcher
      language={lang}
      onLanguageChange={handleChange}
      variant={variant || 'select'}
      showLabel={showLabel !== false}
      languages={langs}
      className={className}
    />
  );
};

registerRenderer({
  type: 'language-switcher',
  name: 'language-switcher',
  component: LanguageSwitcherRenderer,
});

export { LanguageSwitcherRenderer };
export default LanguageSwitcherRenderer;
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/components/LanguageSwitcher/amis-renderer.tsx
git commit -m "feat: register LanguageSwitcher as Amis custom renderer (language-switcher)"
```

---

### Task 3: 注册到 AmisCustomComponents

**Files:**
- Modify: `src/components/AmisCustomComponents/index.ts`

- [ ] **Step 1: 添加导入**

在 `src/components/AmisCustomComponents/index.ts` 的末尾添加一行：

```typescript
import '../LanguageSwitcher/amis-renderer';
```

文件最终内容：

```typescript
/**
 * Registry of all custom Amis components.
 * Each import triggers the component's self-registration
 * (registerRenderer / FormItem decorator at module init).
 *
 * Add a new line here when creating a new custom Amis component.
 */
import '../DateRangePicker';
import '../FieldWithExclude';
import '../FieldWithExcludeV2';
import '../ClosableTabs';
import '../InputRichTextQuill';
import '../LanguageSwitcher/amis-renderer';
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisCustomComponents/index.ts
git commit -m "chore: register LanguageSwitcher Amis renderer in component registry"
```

---

### Task 4: 修改 AmisPage 通信方式

**Files:**
- Modify: `src/components/AmisPage/index.tsx`

- [ ] **Step 1: 删除 LanguageSwitcher 相关导入和函数**

删除导入行：
```typescript
import { LanguageSwitcher } from '../LanguageSwitcher';
```
（保留 `import type { Language } from '../LanguageSwitcher';`）

删除 `handleLanguageChange` 回调函数（第 86-95 行）：
```typescript
// 删除整个函数:
// const handleLanguageChange = useCallback(
//   (newLang: Language) => {
//     ...
//   },
//   [handler, richTextFields],
// );
```

- [ ] **Step 2: 添加 window 事件监听**

在 `richTextFields` 的 useMemo 之后、`lookup` state 声明之前，添加：

```typescript
  // Language change listener — handles events dispatched from the Amis-scoped
  // language-switcher component. On language change, persists current values
  // and triggers re-render with the new language's data.
  useEffect(() => {
    const handleLanguageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { lang: Language };
      const newLang = detail.lang;
      if (newLang === langRef.current) return;

      const updated = handler.persist(scopedRef.current, langRef.current, richTextFields);
      setLookup(updated);
      langRef.current = newLang;
      setCurrentLang(newLang);
    };

    window.addEventListener('amis-language-change', handleLanguageChange);
    return () => window.removeEventListener('amis-language-change', handleLanguageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richTextFields]);
```

- [ ] **Step 3: 删除 return 中的 LanguageSwitcher JSX**

将 return 中的：

```tsx
return (
  <>
    {showLangSwitcher && (
      <LanguageSwitcher
        language={currentLang}
        onLanguageChange={handleLanguageChange}
      />
    )}
    <div ref={containerRef} className="amis-scope" />
  </>
);
```

替换为：

```tsx
return <div ref={containerRef} className="amis-scope" />;
```

注意：`showLangSwitcher` 变量不再使用，可以一并删除。

- [ ] **Step 4: 清理未使用的变量**

删除 `showLangSwitcher` 声明：
```typescript
// 删除:
// const showLangSwitcher = hasI18n && ((schema.showLanguageSwitcher as boolean | undefined) !== false);
```

- [ ] **Step 5: Commit**

```bash
cd /var/www/amis-mission
git add src/components/AmisPage/index.tsx
git commit -m "refactor: replace direct LanguageSwitcher render with window event listener for Amis-scoped language switching"
```

---

### Task 5: CSS 适配

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: 增加 Amis scope 内的样式适配**

在现有的 `.language-select:focus` 规则之后、`/* ===== Preview Panel ===== */` 之前，添加：

```css
/* ===== Language Switcher inside Amis scope ===== */
.amis-scope .language-switcher {
  position: static;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: transparent;
  box-shadow: none;
  border-bottom: none;
  border-radius: var(--radius-sm);
}

.amis-scope .language-switcher .language-buttons,
.amis-scope .language-switcher .language-tabs {
  display: inline-flex;
  gap: 4px;
}

.amis-scope .language-switcher .language-btn {
  padding: 4px 10px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.amis-scope .language-switcher .language-btn:hover {
  background: #f5f5f5;
}

.amis-scope .language-switcher .language-btn.is-active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.amis-scope .language-switcher .language-tab {
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.amis-scope .language-switcher .language-tab.is-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/index.css
git commit -m "style: add CSS for LanguageSwitcher variants inside Amis scope"
```

---

### Task 6: Showcase 更新

**Files:**
- Modify: `src/components/LanguageSwitcher/showcase.tsx`

- [ ] **Step 1: 更新 showcase 演示多种 variant**

将 `src/components/LanguageSwitcher/showcase.tsx` 完整替换为：

```typescript
import React from 'react';
import { LanguageSwitcher } from './index';
import type { Language } from './index';

const LanguageSwitcherShowcase: React.FC = () => {
  const [lang, setLang] = React.useState<Language>('zh');

  return (
    <div>
      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Select variant (default)</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            Current: <strong>{lang}</strong>
          </p>
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Button variant</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} variant="button" />
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Tab variant (no label)</div>
          <LanguageSwitcher language={lang} onLanguageChange={setLang} variant="tab" showLabel={false} />
        </div>
      </div>

      <div className="showcase-demo-row">
        <div style={{ width: '100%' }}>
          <div className="showcase-demo-label">Custom languages (zh only)</div>
          <LanguageSwitcher
            language={lang}
            onLanguageChange={setLang}
            languages={[{ value: 'zh' as const, label: '中文' }]}
          />
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcherShowcase;
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/components/LanguageSwitcher/showcase.tsx
git commit -m "feat(showcase): add LanguageSwitcher variant demos (select/button/tab)"
```

---

### Task 7: Unit Test 更新

**Files:**
- Modify: `src/components/LanguageSwitcher/test.tsx`

- [ ] **Step 1: 增加 variant 相关测试**

在现有的 `describe('LanguageSwitcher')` block 末尾添加：

```typescript
  it('renders button variant when variant="button"', () => {
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={() => {}} variant="button" />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3); // zh, en, jp
    expect(buttons[0].classList.contains('is-active')).toBe(true);
  });

  it('renders tab variant when variant="tab"', () => {
    const { container } = render(
      <LanguageSwitcher language="en" onLanguageChange={() => {}} variant="tab" />
    );
    const tabs = container.querySelectorAll('.language-tab');
    expect(tabs.length).toBe(3);
    expect(tabs[1].classList.contains('is-active')).toBe(true);
  });

  it('hides label when showLabel={false}', () => {
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={() => {}} showLabel={false} />
    );
    const label = container.querySelector('.language-label');
    expect(label).toBeNull();
  });

  it('calls onLanguageChange on button click', async () => {
    const handleChange = vi.fn();
    const { container } = render(
      <LanguageSwitcher language="zh" onLanguageChange={handleChange} variant="button" />
    );
    const buttons = container.querySelectorAll('button');
    buttons[1].click(); // click "English"
    expect(handleChange).toHaveBeenCalledWith('en');
  });

  it('uses custom languages when provided', () => {
    const { container } = render(
      <LanguageSwitcher
        language="zh"
        onLanguageChange={() => {}}
        languages={[{ value: 'zh' as const, label: '中文' }]}
      />
    );
    const options = container.querySelectorAll('option');
    expect(options.length).toBe(1);
    expect(options[0].value).toBe('zh');
  });
```

- [ ] **Step 2: Commit**

```bash
cd /var/www/amis-mission
git add src/components/LanguageSwitcher/test.tsx
git commit -m "test(LanguageSwitcher): add unit tests for variant/showLabel/custom-languages props"
```

---

### Task 8: E2E 回归验证

**Files:**
- Read: `tests/e2e/components/language-switcher.spec.ts`
- Verify: 所有现有 E2E 测试通过

- [ ] **Step 1: 理解 E2E 测试范围**

现有 `language-switcher.spec.ts` 中的测试使用以下选择器：
- `.mission-right .language-switcher` — **预览面板**中的 tpl 语言切换器（schema 中的 `tpl` 组件），**不在本次改造范围内**
- `.antd-Tabs-pane.is-active .language-select` — Amis scope 内的 select 元素

本次改造影响的是 AmisPage 组件中直接渲染的 LanguageSwitcher（在 Amis scope 外部）。E2E 测试中 `.mission-right .language-switcher` 指向的是预览面板内的 tpl，不受影响。

需要验证的是：
1. 预览面板的语言切换器（tpl）仍然正常工作 — 通过 `window.__onPreviewLanguageChange` 回调
2. 表单区域的语言切换（如果有通过 schema 渲染的 `language-switcher`）正常工作

- [ ] **Step 2: 运行 E2E 测试**

```bash
cd /var/www/amis-mission
npx playwright test tests/e2e/components/language-switcher.spec.ts --reporter=line
```

预期：所有测试通过。如果有任何失败，分析原因并修复。

- [ ] **Step 3: 运行 showcase 回归**

```bash
cd /var/www/amis-mission
npx playwright test tests/e2e/showcase.spec.ts --reporter=line
```

预期：通过。

- [ ] **Step 4: 运行完整 E2E 套件确认无回归**

```bash
cd /var/www/amis-mission
npx playwright test --reporter=line
```

预期：所有测试通过。

- [ ] **Step 5: Commit（如果有 E2E 修复）**

```bash
cd /var/www/amis-mission
git add tests/
git commit -m "test(e2e): fix language-switcher e2e tests after Amis renderer migration"
```

---

## 自审清单

- [x] **规格覆盖:** 设计文档中的每个文件变更都有对应 Task
- [x] **占位符扫描:** 无 TBD/TODO/类似内容
- [x] **类型一致性:** `Language` 类型从 `index.tsx` 导出，所有文件使用一致
- [x] **registerRenderer API:** 使用 `registerRenderer` 而非 `@Renderer`（与项目现有 DateRangePicker/ClosableTabs 一致）
- [x] **通信链路:** window CustomEvent `'amis-language-change'` 在 renderer 和 AmisPage 之间桥接
- [x] **E2E 影响:** `.mission-right .language-switcher` 是预览面板的 tpl，不受影响；AmisPage 中的 React 组件被移除
