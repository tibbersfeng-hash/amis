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
    description: '可关闭 Tab + 添加按钮，每个 tab 内嵌表单。新增 tab 时自动生成相同表单结构。支持表单提交并显示提交数据。',
    jsonSchema: JSON.stringify({
      type: 'form',
      wrapWithPanel: false,
      body: [
        { type: 'select', name: 'subMissionType', label: 'Sub Mission Type', required: true, options: [{ label: 'Room Stay Prepaid Booking', value: 'Room Stay Prepaid Booking' }, { label: 'Direct Booking', value: 'Direct Booking' }] },
        { type: 'select', name: 'businessUnit', label: 'Business Unit', required: true, options: [{ label: 'BU1', value: 'BU1' }, { label: 'BU2', value: 'BU2' }, { label: 'BU3', value: 'BU3' }] },
        { type: 'input-text', name: 'targetSpending', label: 'Target Spending' },
        { type: 'select', name: 'currency', label: 'Currency', options: [{ label: '积分', value: '积分' }, { label: '钻石', value: '钻石' }, { label: '金币', value: '金币' }] },
        { type: 'select', name: 'paymentMethod', label: 'Payment Method', options: [{ label: 'Credit Card', value: 'Credit Card' }, { label: 'Cash', value: 'Cash' }] },
        { type: 'select', name: 'marketCode', label: 'Market Code', options: [{ label: 'Code A', value: 'A' }, { label: 'Code B', value: 'B' }] },
        { type: 'select', name: 'rateCode', label: 'Rate Code', options: [{ label: 'Rate 1', value: 'R1' }, { label: 'Rate 2', value: 'R2' }] },
        { type: 'select', name: 'source', label: 'Source', options: [{ label: 'Web', value: 'Web' }, { label: 'App', value: 'App' }, { label: 'Mini Program', value: 'MiniProgram' }] },
        { type: 'select', name: 'roomType', label: 'Room Type', options: [{ label: 'Standard', value: 'Standard' }, { label: 'Deluxe', value: 'Deluxe' }, { label: 'Suite', value: 'Suite' }] },
        { type: 'select', name: 'roomCategory', label: 'Room Category', options: [{ label: 'Cat A', value: 'A' }, { label: 'Cat B', value: 'B' }] },
        { type: 'radios', name: 'awardType', label: 'Registration Award', options: [{ label: 'Award Points', value: 'points' }, { label: 'Voucher', value: 'voucher' }, { label: 'No Award', value: 'none' }] },
        { type: 'input-text', name: 'awardPoints', label: 'Award Points' },
        { type: 'select', name: 'billingCode', label: 'Billing Code', options: [{ label: 'BC-001', value: 'BC-001' }, { label: 'BC-002', value: 'BC-002' }] },
        { type: 'input-text', name: 'stockQty', label: '库存数' },
        { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
      ],
      actions: [{ type: 'submit', label: '提交', level: 'primary' }],
    }, null, 2),
    jsonData: JSON.stringify({
      tabs: [
        {
          title: 'Sub Mission 1',
          subMissionType: 'Room Stay Prepaid Booking',
          businessUnit: '',
          currency: '',
          paymentMethod: '',
          targetSpending: '',
          marketCode: '',
          rateCode: '',
          source: '',
          roomType: '',
          roomCategory: '',
          awardType: 'points',
          awardPoints: '',
          billingCode: '',
          stockQty: '',
          transactionNote: '',
        },
        {
          title: 'Sub Mission 2',
          subMissionType: 'Direct Booking',
          businessUnit: 'BU2',
          currency: '钻石',
          paymentMethod: 'Credit Card',
          targetSpending: '',
          marketCode: '',
          rateCode: '',
          source: '',
          roomType: '',
          roomCategory: '',
          awardType: 'voucher',
          awardPoints: '',
          billingCode: '',
          stockQty: '',
          transactionNote: '',
        },
      ],
    }, null, 2),
    component: () => {
      const ClosableTabsPreviewLazy = React.lazy(() => import('./ClosableTabsPreview'));
      return <ClosableTabsPreviewLazy />;
    },
  },
  {
    id: 'combo-tab',
    category: '布局组件',
    title: 'Combo Tab',
    description: '使用 Amis combo 组件，通过纯 CSS 样式实现与 Closable Tabs 一致的 Tab 栏效果。支持动态增减、每个 tab 内嵌完整表单。添加/删除 tab 不会影响未删除 tab 的表单内容。',
    jsonSchema: JSON.stringify({
      type: 'combo',
      className: 'custom-combo-tabs',
      labelField: 'title',
      tabsLabelTpl: '${title}',
      multiple: true,
      multiLine: false,
      removable: true,
      tabsMode: true,
      max: 10,
      addButtonText: '+ Add Sub Mission',
      scaffold: {
        title: '', subMissionType: '', businessUnit: '', targetSpending: '',
        currency: '', paymentMethod: '', marketCode: '', rateCode: '',
        source: '', roomType: '', roomCategory: '', noOfNights: '',
        minimumSpending: '', awardType: 'points', awardPoints: '',
        billingCode: '', stockQty: '', transactionNote: '',
      },
      items: [
        { type: 'select', name: 'subMissionType', label: 'Sub Mission Type*', required: true, options: [
          { label: 'F&B Spending', value: 'FNB_SPENDING' },
          { label: 'Room Stay Nights', value: 'ROOM_STAY_NIGHTS' },
          { label: 'Room Spending', value: 'ROOM_SPENDING' },
          { label: 'Direct Booking', value: 'Direct Booking' },
        ]},
        { type: 'select', name: 'businessUnit', label: 'Business Unit*', required: true, options: [
          { label: 'Room', value: 'ROOM' }, { label: 'F&B', value: 'FNB' }, { label: 'Health', value: 'HEALTH' },
        ]},
        { type: 'group', body: [
          { type: 'input-number', name: 'targetSpending', label: 'Target Spending' },
          { type: 'select', name: 'currency', label: 'Currency', options: [
            { label: 'HKD', value: 'HKD' }, { label: 'USD', value: 'USD' }, { label: '积分', value: '积分' }, { label: '钻石', value: '钻石' },
          ]},
        ]},
        { type: 'group', body: [
          { type: 'input-number', name: 'noOfNights', label: 'No. of Nights' },
          { type: 'input-number', name: 'minimumSpending', label: 'Minimum Spending' },
        ]},
        { type: 'group', body: [
          { type: 'select', name: 'paymentMethod', label: 'Payment Method', options: [
            { label: 'Credit Card', value: 'Credit Card' }, { label: 'Cash', value: 'Cash' },
          ]},
          { type: 'select', name: 'source', label: 'Source', options: [
            { label: 'Direct', value: 'DIRECT' }, { label: 'OTA', value: 'OTA' },
          ]},
        ]},
        { type: 'group', body: [
          { type: 'select', name: 'marketCode', label: 'Market Code', options: [
            { label: 'GDS', value: 'GDS' }, { label: 'CORPORATE', value: 'CORPORATE' },
          ]},
          { type: 'select', name: 'rateCode', label: 'Rate Code', options: [
            { label: 'RACK', value: 'RACK' }, { label: 'BAR', value: 'BAR' },
          ]},
        ]},
        { type: 'group', body: [
          { type: 'select', name: 'roomCategory', label: 'Room Category', options: [
            { label: 'Deluxe', value: 'DELUXE' }, { label: 'Premier', value: 'PREMIER' },
          ]},
          { type: 'select', name: 'roomType', label: 'Room Type', options: [
            { label: 'King', value: 'KING' }, { label: 'Twin', value: 'TWIN' },
          ]},
        ]},
        { type: 'radios', name: 'awardType', label: 'Registration Award', options: [
          { label: 'Award Points', value: 'points' }, { label: 'Voucher', value: 'voucher' }, { label: 'No Award', value: 'none' },
        ]},
        { type: 'wrapper', className: 'award-panel', body: [
          { type: 'input-number', name: 'awardPoints', label: 'Award Points' },
          { type: 'select', name: 'billingCode', label: 'Billing Code', options: [
            { label: 'BCODE_ROOM_001', value: 'BCODE_ROOM_001' }, { label: 'BCODE_FNB_001', value: 'BCODE_FNB_001' },
          ]},
          { type: 'input-number', name: 'stockQty', label: '库存数' },
          { type: 'input-text', name: 'transactionNote', label: 'Transaction Note' },
        ]},
      ],
      value: [
        { title: 'Sub Mission 1', subMissionType: '', businessUnit: '', targetSpending: '', currency: '', paymentMethod: '', marketCode: '', rateCode: '', source: '', roomType: '', roomCategory: '', noOfNights: '', minimumSpending: '', awardType: 'points', awardPoints: '', billingCode: '', stockQty: '', transactionNote: '' },
        { title: 'Sub Mission 2', subMissionType: 'Direct Booking', businessUnit: 'BU2', currency: '钻石', paymentMethod: 'Credit Card', marketCode: '', rateCode: '', source: '', roomType: '', roomCategory: '', noOfNights: '', minimumSpending: '', awardType: 'voucher', awardPoints: '', billingCode: '', stockQty: '', transactionNote: '' },
      ],
    }, null, 2),
    component: () => {
      const ComboTabShowcase = React.lazy(() => import('./ComboShowcase'));
      return <ComboTabShowcase />;
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
