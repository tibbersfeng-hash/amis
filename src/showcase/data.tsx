/**
 * Showcase page registry.
 * Each entry defines a component's showcase page with metadata, JSON config, and live preview.
 * Includes both custom components and all Amis built-in components.
 *
 * OPTIMIZATION: Amis pages use lazy loading — only metadata (id, category, title)
 * is available synchronously. Heavy jsonSchema/component/data are loaded on demand
 * when a specific page is accessed.
 *
 * Amis components have FOUR JSON blocks (only for "表单输入" category):
 *   - jsonSchemaI18n: Schema with `multiLang: true`
 *   - jsonSchema: Plain Schema (no multiLang)
 *   - dataI18n: Test data with `{zh, en}` values
 *   - data: Test data with plain values
 * Custom components and other Amis categories only have jsonSchema.
 */
import React from 'react';
import { amisPageMeta, loadAllAmisPages, loadAmisPage } from './amis-components';
import type { AmisPageMeta } from './amis-components';
import { SchemaPreview } from './SchemaPreview';

export interface ShowcasePage {
  id: string;
  category: '配置系统' | '基础设施' | '预览组件' | '表单输入' | '展示组件' | '布局组件' | '数据组件' | '反馈组件' | '导航组件' | '操作组件' | '高级组件' | '工具';
  title: string;
  description: string;
  /** Markdown-style props/parameters documentation for the component. */
  props?: string;
  jsonSchema: string;
  /** Schema that supports i18n (has multiLang: true). Only for 表单输入 Amis components. */
  jsonSchemaI18n?: string;
  /** Test data that supports i18n ({zh,en} values). Only for 表单输入 Amis components. */
  dataI18n?: string;
  /** Test data with plain values. Only for 表单输入 Amis components. */
  data?: string;
  /** Second JSON block for dual-config pages (e.g. Closable Tabs: schema vs data). */
  jsonData?: string;
  component: React.FC;
  /** Amis component type for AI prompt (e.g. "tabs", "combo", "form"). */
  type?: string;
  /** Amis component className for AI prompt (e.g. "custom-closable-tabs"). */
  className?: string;
}

/**
 * Lazy page wrapper: provides sync access to id/category/title for the sidebar,
 * but loads jsonSchema/component/data on first access.
 */
function createLazyAmisPage(meta: AmisPageMeta): ShowcasePage {
  let loaded: ShowcasePage | null = null;
  let loading: Promise<ShowcasePage | undefined> | null = null;

  const ensureLoaded = () => {
    if (loaded) return;
    if (!loading) {
      loading = loadAmisPage(meta.id).then(p => { loaded = p || null; loading = null; });
    }
    // For sync access, throw a Promise to trigger React Suspense
    throw loading;
  };

  return {
    get id() { return meta.id; },
    get category() { return meta.category as ShowcasePage['category']; },
    get title() { return meta.title; },
    get description() { ensureLoaded(); return loaded?.description || ''; },
    get props() { ensureLoaded(); return loaded?.props; },
    get jsonSchema() { ensureLoaded(); return loaded?.jsonSchema || '{}'; },
    get jsonSchemaI18n() { ensureLoaded(); return loaded?.jsonSchemaI18n; },
    get dataI18n() { ensureLoaded(); return loaded?.dataI18n; },
    get data() { ensureLoaded(); return loaded?.data; },
    get jsonData() { ensureLoaded(); return loaded?.jsonData; },
    get component() { ensureLoaded(); return loaded?.component || (() => null); },
  };
}

/**
 * Custom component showcase pages (our own components).
 */
const customShowcasePages: ShowcasePage[] = [
  // === 工具 ===
  {
    id: 'schema-preview',
    category: '工具',
    title: 'Schema Design',
    description: '输入任意 Amis JSON Schema，实时渲染设计。支持所有 Amis 表单组件。',
    jsonSchema: JSON.stringify({
      description: 'Paste any Amis schema JSON in the editor, click "渲染预览" to see it rendered live.',
      shortcut: 'Ctrl+Enter to render',
    }, null, 2),
    component: () => {
      return <SchemaPreview />;
    },
  },

  // === 配置系统 ===
  {
    id: 'i18n-config',
    category: '配置系统',
    title: 'i18n-config',
    description: '基础设施组件 i18n 文本配置。管理 Loading、DateRangePicker 等组件的静态 UI 文本，支持 zh/en 双语。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `languages` | `string[]` | `[\'zh\', \'en\']` | 支持的语言列表 |\n| `strings` | `Record<string, Record<string, string>>` | - | 各语言的键值对文本 |',
    jsonSchema: JSON.stringify({
      type: 'i18n-config',
      languages: ['zh', 'en'],
      strings: {
        cancel: { zh: '取消', en: 'Cancel' },
        saveDraft: { zh: '保存草稿', en: 'Save Draft' },
        save: { zh: '保存', en: 'Save' },
        loading: { zh: '加载中...', en: 'Loading...' },
        selectDateRange: { zh: '选择日期范围', en: 'Select date range' },
        confirm: { zh: '确认', en: 'Confirm' },
        months: { zh: ['一月', '二月', '...'], en: ['January', 'February', '...'] },
        weekdays: { zh: ['日', '一', '二', '...'], en: ['Su', 'Mo', 'Tu', '...'] },
      },
    }, null, 2),
    component: () => {
      const I18nConfigShowcase = React.lazy(() => import('../components/i18n-config/showcase'));
      return <I18nConfigShowcase />;
    },
  },

  // === 基础设施 ===
  {
    id: 'loading',
    category: '基础设施',
    title: 'Loading',
    description: '加载状态组件（spinner + 文字）和错误提示组件。文本通过 i18n-config 切换。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `message` | `string` | `getComponentI18n().loading` | 加载提示文本 |\n| `variant` | `\'spinner\' \| \'error\'` | `\'spinner\'` | 变体类型 |',
    jsonSchema: JSON.stringify({
      type: 'loading',
      variants: ['Loading (default)', 'Loading (custom message)', 'ErrorDisplay'],
      props: {
        message: 'string (optional)',
      },
      i18n: 'message 为空时使用 getComponentI18n().loading',
    }, null, 2),
    component: () => {
      const LoadingShowcase = React.lazy(() => import('../components/Loading/showcase'));
      return <LoadingShowcase />;
    },
  },
  {
    id: 'language-switcher',
    category: '基础设施',
    title: 'LanguageSwitcher',
    description: '语言切换下拉框组件，支持 zh/en 切换。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `language` | `\'zh\' \| \'en\'` | `\'zh\'` | 当前语言 |\n| `onLanguageChange` | `(lang: Language) => void` | - | 语言切换回调 |',
    jsonSchema: JSON.stringify({
      type: 'language-switcher',
      props: {
        language: "'zh' | 'en'",
        onLanguageChange: '(lang: Language) => void',
      },
    }, null, 2),
    component: () => {
      const LanguageSwitcherShowcase = React.lazy(() => import('../components/LanguageSwitcher/showcase'));
      return <LanguageSwitcherShowcase />;
    },
  },

  // === 预览组件 ===
  {
    id: 'phone-mockup',
    category: '预览组件',
    title: 'PhoneMockup',
    description: '手机预览自定义组件。通过 registerRenderer 注册到 Amis，支持 i18n 语言切换预览业务内容。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `data` | `Record<string, unknown>` | - | 预览数据 |\n| `previewLanguage` | `\'zh\' \| \'en\'` | `\'zh\'` | 预览语言 |\n| `onLanguageChange` | `(lang: Language) => void` | - | 语言切换回调 |',
    jsonSchema: JSON.stringify({
      type: 'phone-mockup',
      registration: "registerRenderer({ type: 'phone-mockup', name: 'phone-mockup', component: PhoneMockupComponent })",
      props: {
        data: 'Record<string, unknown>',
        previewLanguage: "'zh' | 'en'",
        onLanguageChange: '(lang: Language) => void',
      },
      i18n: '读取 window.__i18nData 获取原始 i18n 对象进行语言切换',
    }, null, 2),
    component: () => {
      const PhoneMockupShowcase = React.lazy(() => import('../components/PhoneMockup/showcase'));
      return <PhoneMockupShowcase />;
    },
  },
  {
    id: 'date-range-picker',
    category: '预览组件',
    title: 'DateRangePicker',
    description: '自定义 Amis 日期范围选择器。内置日历 UI、时间选择、验证。所有文本通过 i18n-config 本地化。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `startName` | `string` | `"startTime"` | 开始日期字段名 |\n| `endName` | `string` | `"endTime"` | 结束日期字段名 |\n| `label` | `string` | - | 标签文本 |\n| `format` | `string` | `"YYYY-MM-DD HH:mm:ss"` | 日期格式 |\n| `required` | `boolean` | `false` | 是否必填 |',
    jsonSchema: JSON.stringify({
      type: 'date-range-picker',
      registration: "registerRenderer({ type: 'date-range-picker', name: 'date-range-picker', component })",
      props: {
        startName: 'string (default: "startTime")',
        endName: 'string (default: "endTime")',
        label: 'string',
        format: 'string (default: "YYYY-MM-DD HH:mm:ss")',
        required: 'boolean',
        placeholder: 'string (i18n: selectDateRange)',
      },
      i18n: '月份名、星期、操作按钮文本全部通过 getComponentI18n() 获取',
    }, null, 2),
    component: () => {
      const DateRangePickerShowcase = React.lazy(() => import('../components/DateRangePicker/showcase'));
      return <DateRangePickerShowcase />;
    },
  },
  // === 布局组件 ===
  {
    id: 'solid-fill-tabs',
    category: '布局组件',
    title: 'Solid Fill Tabs',
    description: '实心填充型 Tab 样式。选中=蓝底白字，未选中=白底蓝字+实线外框。无 hover 效果，无下划线。',
    type: 'tabs',
    className: 'custom-solid-fill-tabs',
    jsonSchema: JSON.stringify({
      type: 'tabs',
      className: 'custom-solid-fill-tabs',
      tabs: [
        { title: 'Rule Setup', body: '规则配置内容区域' },
        { title: 'Display', body: '显示设置内容区域' },
      ],
    }, null, 2),
    jsonData: JSON.stringify({
      tabs: [
        { title: 'Rule Setup' },
        { title: 'Display' },
      ],
    }, null, 2),
    component: () => {
      const SolidFillTabsShowcase = React.lazy(() => import('./SolidFillTabsShowcase'));
      return <SolidFillTabsShowcase />;
    },
  },
  {
    id: 'closable-tabs',
    category: '布局组件',
    title: 'Closable Tabs',
    description: '可关闭 Tab + 添加按钮，每个 tab 内嵌表单。新增 tab 时从 schema_format 自动生成相同表单结构。',
    type: 'closable-tab',
    jsonSchema: JSON.stringify({
      type: 'closable-tab',
      addable: true,
      addBtnText: '+ Add Tab',
      schema_format: [
        {
          type: 'form',
          wrapWithPanel: false,
          data: {},
          body: [
            { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
          ],
          actions: [{ type: 'submit', label: '提交', level: 'primary' }],
        },
      ],
      tabs: [
        {
          title: 'Tab 1',
          closable: true,
          body: {
            type: 'form',
            wrapWithPanel: false,
            data: { name: 'Alice' },
            body: [
              { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
            ],
            actions: [{ type: 'submit', label: '提交', level: 'primary' }],
          },
        },
        {
          title: 'Tab 2',
          closable: true,
          body: {
            type: 'form',
            wrapWithPanel: false,
            data: { name: 'Bob' },
            body: [
              { type: 'input-text', name: 'name', label: 'Name', placeholder: 'Enter name' },
            ],
            actions: [{ type: 'submit', label: '提交', level: 'primary' }],
          },
        },
      ],
    }, null, 2),
    jsonData: JSON.stringify({
      tabs: [
        { title: 'Tab 1', name: 'Alice' },
        { title: 'Tab 2', name: 'Bob' },
      ],
    }, null, 2),
    component: () => {
      const ClosableTabsPreviewLazy = React.lazy(() => import('./ClosableTabsPreview'));
      return <ClosableTabsPreviewLazy />;
    },
  },
];

// ─── Combined page registry ────────────────────────────────────────

/** Lightweight meta objects for Amis pages (used by sidebar) */
const lazyAmisPages: ShowcasePage[] = amisPageMeta.map(createLazyAmisPage);

/**
 * All showcase pages. Custom pages are eagerly loaded; Amis pages
 * use getter-based lazy loading — id/category/title are instant,
 * while jsonSchema/component/data trigger a dynamic import on first access.
 */
export const showcasePages: ShowcasePage[] = [...customShowcasePages, ...lazyAmisPages];

export interface ComponentCatalogEntry {
  id: string;
  category: string;
  title: string;
  description: string;
  /** Amis component type (e.g. "tabs", "combo", "form"). */
  type?: string;
  /** Amis component className (e.g. "custom-closable-tabs"). */
  className?: string;
}

/**
 * Build a lightweight component catalog from all showcase pages.
 * Only includes id, category, title, description — avoids lazy getter evaluation.
 * Used by AI generator to know all available components.
 */
export function getComponentCatalog(): ComponentCatalogEntry[] {
  const catalog: ComponentCatalogEntry[] = [];

  // Custom pages — eagerly available
  for (const page of customShowcasePages) {
    catalog.push({
      id: page.id,
      category: page.category,
      title: page.title,
      description: page.description,
      type: page.type,
      className: page.className,
    });
  }

  // Amis pages — use meta directly (no lazy getter evaluation)
  for (const meta of amisPageMeta) {
    catalog.push({
      id: meta.id,
      category: meta.category,
      title: meta.title,
      description: '',
    });
  }

  return catalog;
}

export function getShowcasePage(id: string): ShowcasePage | undefined {
  return showcasePages.find(p => p.id === id);
}

export function getCategories(): string[] {
  const categories: string[] = [];
  for (const page of showcasePages) {
    if (!categories.includes(page.category)) {
      categories.push(page.category);
    }
  }
  return categories;
}

export function getPagesByCategory(category: string): ShowcasePage[] {
  return showcasePages.filter(p => p.category === category);
}

// ─── Bulk loading utility ──────────────────────────────────────────

/** Preload all Amis pages in the background. Call this opportunistically. */
export function preloadAmisPages(): Promise<void> {
  return loadAllAmisPages().then(() => {});
}
