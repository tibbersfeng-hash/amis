/**
 * Showcase page registry.
 * Each entry defines a component's showcase page with metadata, JSON config, and live preview.
 * Includes both custom components and all Amis built-in components.
 *
 * Amis components have FOUR JSON blocks (only for "表单输入" category):
 *   - jsonSchemaI18n: Schema with `multiLang: true`
 *   - jsonSchema: Plain Schema (no multiLang)
 *   - dataI18n: Test data with `{zh, en}` values
 *   - data: Test data with plain values
 * Custom components and other Amis categories only have jsonSchema.
 */
import React from 'react';
import { amisShowcasePages } from './amis-components';
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
  component: React.FC;
}

/**
 * Custom component showcase pages (our own components).
 */
const customShowcasePages: ShowcasePage[] = [
  // === 工具 ===
  {
    id: 'schema-preview',
    category: '工具',
    title: 'Schema Preview',
    description: '输入任意 Amis JSON Schema，实时渲染预览。支持所有 Amis 表单组件。',
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
    description: '基础设施组件 i18n 文本配置。管理 StickyFooter、Loading、DateRangePicker 等组件的静态 UI 文本，支持 zh/en 双语。',
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
    id: 'sticky-footer',
    category: '基础设施',
    title: 'StickyFooter',
    description: '吸底操作栏，提供 Cancel / Save Draft / Save 三个按钮。文本通过 i18n-config 切换语言。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `onCancel` | `() => void` | - | 取消回调 |\n| `onSaveDraft` | `() => void` | - | 保存草稿回调 |\n| `onSave` | `() => void` | - | 保存回调 |\n| `disabled` | `boolean` | `false` | 是否禁用按钮 |',
    jsonSchema: JSON.stringify({
      type: 'sticky-footer',
      props: {
        onCancel: '() => void',
        onSaveDraft: '() => void',
        onSave: '() => void',
        disabled: 'boolean',
      },
      i18n: '使用 getComponentI18n() 获取按钮文本',
    }, null, 2),
    component: () => {
      const StickyFooterShowcase = React.lazy(() => import('../components/StickyFooter/showcase'));
      return <StickyFooterShowcase />;
    },
  },
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
  {
    id: 'i18n-config-panel',
    category: '基础设施',
    title: 'I18nConfigPanel',
    description: 'i18n 配置面板，包含 LanguageSwitcher + 可自定义标签。标签文本通过 i18n-config 本地化。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `language` | `\'zh\' \| \'en\'` | `\'zh\'` | 当前语言 |\n| `onLanguageChange` | `(lang: Language) => void` | - | 语言切换回调 |\n| `label` | `string` | `i18n-config.languageLabel` | 标签文本 |',
    jsonSchema: JSON.stringify({
      type: 'i18n-config-panel',
      props: {
        language: "'zh' | 'en'",
        onLanguageChange: '(lang: Language) => void',
        label: 'string (optional) — defaults to i18n-config languageLabel',
      },
    }, null, 2),
    component: () => {
      const I18nConfigPanelShowcase = React.lazy(() => import('../components/I18nConfigPanel/showcase'));
      return <I18nConfigPanelShowcase />;
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
  {
    id: 'preview-panel',
    category: '预览组件',
    title: 'PreviewPanel',
    description: '预览面板容器，包含 LanguageSwitcher + PhoneMockup。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `language` | `\'zh\' \| \'en\'` | `\'zh\'` | 当前语言 |\n| `onLanguageChange` | `(lang: Language) => void` | - | 语言切换回调 |\n| `children` | `ReactNode` | - | 预览内容 |',
    jsonSchema: JSON.stringify({
      type: 'preview-panel',
      props: {
        language: "'zh' | 'en'",
        onLanguageChange: '(lang: Language) => void',
        children: 'ReactNode',
      },
    }, null, 2),
    component: () => {
      const PreviewPanelShowcase = React.lazy(() => import('../components/PreviewPanel/showcase'));
      return <PreviewPanelShowcase />;
    },
  },
  {
    id: 'amis-drawer',
    category: '反馈组件',
    title: 'Drawer — 抽屉',
    description: '从边缘滑出的抽屉面板。通过 setValue 将抽屉内选择的值回写到父表单字段，无需 HTTP 请求。触发按钮放在录入区域。',
    props: '| 参数 | 类型 | 默认值 | 说明 |\n|------|------|--------|------|\n| `title` | `string` | - | 抽屉标题 |\n| `position` | `\'left\' \| \'right\' \| \'top\' \| \'bottom\'` | `\'right\'` | 抽屉位置 |\n| `width` | `number \| string` | `500` | 抽屉宽度 |\n| `body` | `Schema` | - | 抽屉内容 |\n| `closeOnEsc` | `boolean` | `true` | ESC 关闭 |\n| `closeOnOutside` | `boolean` | `true` | 点击外部关闭 |',
    jsonSchema: JSON.stringify({
      type: 'input-group',
      label: '选中人员',
      body: [
        { type: 'input-text', name: 'selectedName', readOnly: true, placeholder: '请从抽屉选择' },
        {
          type: 'button',
          label: '选择',
          level: 'primary',
          actionType: 'drawer',
          drawer: {
            title: '选择人员',
            position: 'right',
            width: 500,
            body: {
              type: 'form',
              body: [{ type: 'radios', name: 'pickedName', label: '人员列表', options: [{ label: '张三', value: '张三' }, { label: '李四', value: '李四' }] }],
              actions: [
                { type: 'button', label: '确认', level: 'primary', onEvent: { click: { actions: [{ actionType: 'setValue', componentId: 'selectedName', args: { value: '${pickedName}' } }, { actionType: 'close' }] } } },
                { type: 'button', label: '取消', actionType: 'close' },
              ],
            },
          },
        },
      ],
    }, null, 2),
    component: () => {
      const DrawerShowcase = React.lazy(() => import('../components/DrawerShowcase'));
      return <DrawerShowcase />;
    },
  },

  // === 布局组件 ===
  {
    id: 'solid-fill-tabs',
    category: '布局组件',
    title: 'Solid Fill Tabs',
    description: '实心填充型 Tab 样式。选中=蓝底白字，未选中=白底蓝字+实线外框。无 hover 效果，无下划线。',
    jsonSchema: JSON.stringify({
      type: 'tabs',
      className: 'custom-solid-fill-tabs',
      tabs: [
        { title: 'Rule Setup', body: '规则配置内容区域' },
        { title: 'Display', body: '显示设置内容区域' },
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
    description: '可关闭 Tab + 添加按钮。选中=顶部蓝条+蓝字粗体+白底，未选中=灰字+浅灰底。支持滚动、最大数量限制（MAX_TABS=10）。',
    jsonSchema: JSON.stringify({
      type: 'tabs',
      className: 'custom-closable-tabs',
      maxTabs: 10,
      addBtn: { label: '+ Add' },
      tabs: [
        { title: 'Sub Mission 1', closable: true, body: '内容区域 1' },
        { title: 'Sub Mission 2', closable: true, body: '内容区域 2' },
      ],
    }, null, 2),
    component: () => {
      const ClosableTabsShowcase = React.lazy(() => import('./ClosableTabsShowcase'));
      return <ClosableTabsShowcase />;
    },
  },
];

/**
 * Merge custom pages with Amis built-in component pages.
 * Custom pages come first, then Amis pages grouped by category.
 */
export const showcasePages: ShowcasePage[] = [...customShowcasePages, ...amisShowcasePages];

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
