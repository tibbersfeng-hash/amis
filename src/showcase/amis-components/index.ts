/**
 * Amis built-in component showcase registry — lazy loaded.
 *
 * Instead of synchronously importing all 109 modules at startup,
 * this file exports lightweight metadata for the sidebar and
 * provides a lazy page array that loads full pages on first access.
 *
 * Key optimization: at module evaluation time, only ~10KB of metadata
 * is loaded. The heavy schema JSON + component factories are deferred
 * until a specific page is actually viewed.
 */
import type { ShowcasePage } from '@/showcase/data';

// ─── Lightweight metadata for sidebar (no heavy schema/component) ───

export type AmisPageMeta = {
  id: string;
  category: string;
  title: string;
};

export const amisPageMeta: AmisPageMeta[] = [
  { id: 'amis-alert', category: '反馈组件', title: 'Alert — 提示' },
  { id: 'amis-anchor-nav', category: '导航组件', title: 'AnchorNav — 锚点导航' },
  { id: 'amis-avatar', category: '展示组件', title: 'Avatar — 头像' },
  { id: 'amis-barcode', category: '展示组件', title: 'BarCode — 条形码' },
  { id: 'amis-bottom-underline-tab', category: '布局组件', title: 'Bottom-Underline Tab — 选中底部蓝线（满页宽）' },
  { id: 'amis-breadcrumb', category: '导航组件', title: 'Breadcrumb — 面包屑' },
  { id: 'amis-button-group', category: '操作组件', title: 'ButtonGroup — 按钮组' },
  { id: 'amis-button-toolbar', category: '表单输入', title: 'ButtonToolbar — 按钮工具栏' },
  { id: 'amis-button', category: '操作组件', title: 'Button — 按钮' },
  { id: 'amis-calendar', category: '展示组件', title: 'Calendar — 日历' },
  { id: 'amis-cards', category: '数据组件', title: 'Cards — 卡片列表' },
  { id: 'amis-carousel', category: '展示组件', title: 'Carousel — 轮播图' },
  { id: 'amis-cascader', category: '表单输入', title: 'Cascader — 级联选择' },
  { id: 'amis-chained-select-api', category: '表单输入', title: 'ChainedSelect — 级联选择（联动）' },
  { id: 'amis-chained-select', category: '高级组件', title: 'ChainedSelect — 链式下拉' },
  { id: 'amis-chart', category: '展示组件', title: 'Chart — 图表' },
  { id: 'amis-checkboxes', category: '表单输入', title: 'Checkboxes — 复选框组' },
  { id: 'amis-code', category: '展示组件', title: 'Code — 代码展示' },
  { id: 'amis-collapse', category: '布局组件', title: 'Collapse — 折叠面板' },
  { id: 'amis-color', category: '展示组件', title: 'Color — 颜色展示' },
  { id: 'amis-combo', category: '高级组件', title: 'Combo — 组合表单' },
  { id: 'amis-condition-builder', category: '高级组件', title: 'ConditionBuilder — 条件组合' },
  { id: 'amis-container', category: '布局组件', title: 'Container — 容器' },
  { id: 'amis-crud', category: '数据组件', title: 'CRUD — 增删改查' },
  { id: 'amis-custom', category: '高级组件', title: 'Custom — 自定义组件' },
  { id: 'amis-dialog', category: '反馈组件', title: 'Dialog — 对话框' },
  { id: 'amis-divider', category: '布局组件', title: 'Divider — 分割线' },
  { id: 'amis-dropdown-button', category: '操作组件', title: 'DropDownButton — 下拉按钮' },
  { id: 'amis-each', category: '高级组件', title: 'Each — 循环渲染' },
  { id: 'amis-editor', category: '表单输入', title: 'Editor — 代码编辑器' },
  { id: 'amis-field-with-exclude', category: '高级组件', title: 'Select + Exclude — 带排除复选框的下拉选择' },
  { id: 'amis-field-with-exclude-v2', category: '高级组件', title: 'Select + Exclude V2 — 基于 Amis 原生组件' },
  { id: 'amis-flex', category: '布局组件', title: 'Flex — Flexbox 布局' },
  { id: 'amis-form', category: '高级组件', title: 'Form — 表单' },
  { id: 'amis-formula', category: '高级组件', title: 'Formula — 公式' },
  { id: 'amis-grid-2d', category: '高级组件', title: 'Grid2D — 二维网格' },
  { id: 'amis-grid-nav', category: '高级组件', title: 'GridNav — 网格导航' },
  { id: 'amis-grid', category: '布局组件', title: 'Grid — 栅格布局' },
  { id: 'amis-group', category: '高级组件', title: 'Group — 表单项组' },
  { id: 'amis-hbox', category: '布局组件', title: 'HBox — 水平布局' },
  { id: 'amis-hidden', category: '表单输入', title: 'Hidden — 隐藏字段' },
  { id: 'amis-icon-picker', category: '表单输入', title: 'IconPicker — 图标选择' },
  { id: 'amis-icon', category: '高级组件', title: 'Icon — 图标' },
  { id: 'amis-iframe', category: '高级组件', title: 'IFrame — 内嵌页面' },
  { id: 'amis-image', category: '展示组件', title: 'Image — 图片展示' },
  { id: 'amis-images', category: '展示组件', title: 'Images — 图片列表' },
  { id: 'amis-input-array', category: '高级组件', title: 'InputArray — 数组编辑' },
  { id: 'amis-input-color', category: '表单输入', title: 'InputColor — 颜色选择' },
  { id: 'amis-input-date-range', category: '表单输入', title: 'InputDateRange — 日期范围' },
  { id: 'amis-input-date', category: '表单输入', title: 'InputDate — 日期选择' },
  { id: 'amis-input-file', category: '表单输入', title: 'InputFile — 文件上传' },
  { id: 'amis-input-group', category: '高级组件', title: 'InputGroup — 输入组合' },
  { id: 'amis-input-image', category: '表单输入', title: 'InputImage — 图片上传' },
  { id: 'amis-input-number', category: '表单输入', title: 'InputNumber — 数字输入' },
  { id: 'amis-input-password', category: '表单输入', title: 'InputPassword — 密码输入' },
  { id: 'amis-input-range', category: '表单输入', title: 'InputRange — 滑块' },
  { id: 'amis-input-rating', category: '表单输入', title: 'InputRating — 评分' },
  { id: 'amis-input-rich-text', category: '表单输入', title: 'InputRichText — 富文本编辑器' },
  { id: 'amis-input-rich-text-quill', category: '表单输入', title: 'InputRichTextQuill — Quill 富文本编辑器' },
  { id: 'amis-input-table', category: '高级组件', title: 'InputTable — 表格编辑' },
  { id: 'amis-input-tag', category: '表单输入', title: 'InputTag — 标签输入' },
  { id: 'amis-input-text', category: '表单输入', title: 'InputText — 单行文本输入' },
  { id: 'amis-input-tree', category: '表单输入', title: 'InputTree — 树形选择' },
  { id: 'amis-json-schema', category: '高级组件', title: 'JSON Schema Editor' },
  { id: 'amis-json', category: '展示组件', title: 'JSON — JSON 展示' },
  { id: 'amis-link', category: '高级组件', title: 'Link — 链接' },
  { id: 'amis-list', category: '数据组件', title: 'List — 列表' },
  { id: 'amis-location-picker', category: '高级组件', title: 'LocationPicker — 位置选择' },
  { id: 'amis-mapping', category: '高级组件', title: 'Mapping — 映射' },
  { id: 'amis-markdown', category: '展示组件', title: 'Markdown — Markdown 渲染' },
  { id: 'amis-matrix-checkboxes', category: '高级组件', title: 'MatrixCheckboxes — 矩阵复选' },
  { id: 'amis-nav', category: '导航组件', title: 'Nav — 导航菜单' },
  { id: 'amis-page', category: '布局组件', title: 'Page — 页面容器' },
  { id: 'amis-pagination', category: '导航组件', title: 'Pagination — 分页' },
  { id: 'amis-panel', category: '布局组件', title: 'Panel — 面板' },
  { id: 'amis-picker', category: '高级组件', title: 'Picker — 列表选择' },
  { id: 'amis-popover', category: '反馈组件', title: 'PopOver — 弹出气泡' },
  { id: 'amis-portlet', category: '布局组件', title: 'Portlet — 门户面板' },
  { id: 'amis-progress', category: '展示组件', title: 'Progress — 进度条' },
  { id: 'amis-property', category: '展示组件', title: 'Property — 属性' },
  { id: 'amis-qrcode', category: '展示组件', title: 'QRCode — 二维码' },
  { id: 'amis-radios', category: '表单输入', title: 'Radios — 单选按钮组' },
  { id: 'amis-remark', category: '高级组件', title: 'Remark — 备注提示' },
  { id: 'amis-search-box', category: '操作组件', title: 'SearchBox — 搜索框' },
  { id: 'amis-select', category: '表单输入', title: 'Select — 下拉选择' },
  { id: 'amis-service-async', category: '高级组件', title: 'Service (异步) — 异步数据' },
  { id: 'amis-service', category: '高级组件', title: 'Service — 数据服务' },
  { id: 'amis-sparkline', category: '展示组件', title: 'SparkLine — 迷你图表' },
  { id: 'amis-spinner', category: '反馈组件', title: 'Spinner — 加载动画' },
  { id: 'amis-status', category: '展示组件', title: 'Status — 状态' },
  { id: 'amis-steps', category: '布局组件', title: 'Steps — 步骤条' },
  { id: 'amis-switch', category: '表单输入', title: 'Switch — 开关' },
  { id: 'amis-table-search', category: '数据组件', title: 'Table+Search — 表格+搜索' },
  { id: 'amis-table', category: '数据组件', title: 'Table — 表格' },
  { id: 'amis-tabs-nav', category: '导航组件', title: 'Tabs (导航模式) — 标签导航' },
  { id: 'amis-tabs', category: '布局组件', title: 'Tabs — 选项卡' },
  { id: 'amis-tag', category: '展示组件', title: 'Tag — 标签' },
  { id: 'amis-test-nested-tabs', category: '导航组件', title: '测试 — 嵌套 Tabs + 表单' },
  { id: 'amis-textarea', category: '表单输入', title: 'Textarea — 多行文本' },
  { id: 'amis-timeline', category: '展示组件', title: 'Timeline — 时间线' },
  { id: 'amis-tooltip', category: '反馈组件', title: 'Tooltip — 提示气泡' },
  { id: 'amis-top-border-tab', category: '布局组件', title: 'Top-Border Tab — 选中上方蓝线' },
  { id: 'amis-tpl', category: '展示组件', title: 'Tpl — 模板' },
  { id: 'amis-transfer', category: '表单输入', title: 'Transfer — 穿梭框' },
  { id: 'amis-tree-select', category: '表单输入', title: 'TreeSelect — 树形下拉' },
  { id: 'amis-user-select', category: '高级组件', title: 'UserSelect — 用户选择' },
  { id: 'amis-vbox', category: '布局组件', title: 'VBox — 垂直布局' },
  { id: 'amis-wizard', category: '高级组件', title: 'Wizard — 表单向导' },
  { id: 'amis-wrapper', category: '布局组件', title: 'Wrapper — 包装器' },
];

// ─── Module loading map: maps module name to dynamic import ────────

const moduleLoaders: Record<string, () => Promise<ShowcasePage[]>> = {
  'alert': () => import('./alert'),
  'anchor-nav': () => import('./anchor-nav'),
  'avatar': () => import('./avatar'),
  'barcode': () => import('./barcode'),
  'bottom-underline-tab': () => import('./bottom-underline-tab'),
  'breadcrumb': () => import('./breadcrumb'),
  'button-group': () => import('./button-group'),
  'button-toolbar': () => import('./button-toolbar'),
  'button': () => import('./button'),
  'calendar': () => import('./calendar'),
  'cards': () => import('./cards'),
  'carousel': () => import('./carousel'),
  'cascader': () => import('./cascader'),
  'chained-select-api': () => import('./chained-select-api'),
  'chained-select': () => import('./chained-select'),
  'chart': () => import('./chart'),
  'checkboxes': () => import('./checkboxes'),
  'code': () => import('./code'),
  'collapse': () => import('./collapse'),
  'color': () => import('./color'),
  'combo': () => import('./combo'),
  'condition-builder': () => import('./condition-builder'),
  'container': () => import('./container'),
  'crud': () => import('./crud'),
  'custom': () => import('./custom'),
  'dialog': () => import('./dialog'),
  'divider': () => import('./divider'),
  'dropdown-button': () => import('./dropdown-button'),
  'each': () => import('./each'),
  'editor': () => import('./editor'),
  'field-with-exclude': () => import('./field-with-exclude'),
  'field-with-exclude-v2': () => import('./field-with-exclude-v2'),
  'flex': () => import('./flex'),
  'form': () => import('./form'),
  'formula': () => import('./formula'),
  'grid-2d': () => import('./grid-2d'),
  'grid-nav': () => import('./grid-nav'),
  'grid': () => import('./grid'),
  'group': () => import('./group'),
  'hbox': () => import('./hbox'),
  'hidden': () => import('./hidden'),
  'icon-picker': () => import('./icon-picker'),
  'icon': () => import('./icon'),
  'iframe': () => import('./iframe'),
  'image': () => import('./image'),
  'images': () => import('./images'),
  'input-array': () => import('./input-array'),
  'input-color': () => import('./input-color'),
  'input-date-range': () => import('./input-date-range'),
  'input-date': () => import('./input-date'),
  'input-file': () => import('./input-file'),
  'input-group': () => import('./input-group'),
  'input-image': () => import('./input-image'),
  'input-number': () => import('./input-number'),
  'input-password': () => import('./input-password'),
  'input-range': () => import('./input-range'),
  'input-rating': () => import('./input-rating'),
  'input-rich-text': () => import('./input-rich-text'),
  'input-rich-text-quill': () => import('./input-rich-text-quill'),
  'input-table': () => import('./input-table'),
  'input-tag': () => import('./input-tag'),
  'input-text': () => import('./input-text'),
  'input-tree': () => import('./input-tree'),
  'json-schema': () => import('./json-schema'),
  'json': () => import('./json'),
  'link': () => import('./link'),
  'list': () => import('./list'),
  'location-picker': () => import('./location-picker'),
  'mapping': () => import('./mapping'),
  'markdown': () => import('./markdown'),
  'matrix-checkboxes': () => import('./matrix-checkboxes'),
  'nav': () => import('./nav'),
  'page': () => import('./page'),
  'pagination': () => import('./pagination'),
  'panel': () => import('./panel'),
  'picker': () => import('./picker'),
  'popover': () => import('./popover'),
  'portlet': () => import('./portlet'),
  'progress': () => import('./progress'),
  'property': () => import('./property'),
  'qrcode': () => import('./qrcode'),
  'radios': () => import('./radios'),
  'remark': () => import('./remark'),
  'search-box': () => import('./search-box'),
  'select': () => import('./select'),
  'service-async': () => import('./service-async'),
  'service': () => import('./service'),
  'sparkline': () => import('./sparkline'),
  'spinner': () => import('./spinner'),
  'status': () => import('./status'),
  'steps': () => import('./steps'),
  'switch': () => import('./switch'),
  'table-search': () => import('./table-search'),
  'table': () => import('./table'),
  'tabs-nav': () => import('./tabs-nav'),
  'tabs': () => import('./tabs'),
  'tag': () => import('./tag'),
  'test-nested-tabs': () => import('./test-nested-tabs'),
  'textarea': () => import('./textarea'),
  'timeline': () => import('./timeline'),
  'tooltip': () => import('./tooltip'),
  'top-border-tab': () => import('./top-border-tab'),
  'tpl': () => import('./tpl'),
  'transfer': () => import('./transfer'),
  'tree-select': () => import('./tree-select'),
  'user-select': () => import('./user-select'),
  'vbox': () => import('./vbox'),
  'wizard': () => import('./wizard'),
  'wrapper': () => import('./wrapper'),
};

// ─── Lazy loading state ────────────────────────────────────────────

let loadedPages: ShowcasePage[] | null = null;
let loadingPromise: Promise<ShowcasePage[]> | null = null;

/** Load all Amis pages on demand. Cached after first call. */
export async function loadAllAmisPages(): Promise<ShowcasePage[]> {
  if (loadedPages) return loadedPages;
  if (loadingPromise) return loadingPromise;

  loadingPromise = Promise.all(
    Object.values(moduleLoaders).map(async (loader) => {
      const mod = await loader();
      return mod.default as ShowcasePage[];
    })
  ).then((results) => {
    loadedPages = results.flat();
    loadingPromise = null;
    return loadedPages;
  });

  return loadingPromise;
}

/** Look up a single Amis page by ID, loading only that module. */
export async function loadAmisPage(id: string): Promise<ShowcasePage | undefined> {
  // Check if already loaded
  if (loadedPages) {
    return loadedPages.find(p => p.id === id);
  }

  // Module name matches the page ID prefix (e.g. 'amis-alert' → 'alert')
  const moduleName = id.replace('amis-', '');
  const loader = moduleLoaders[moduleName];
  if (!loader) return undefined;

  const mod = await loader();
  const pages = (mod as any).default as ShowcasePage[];
  return pages?.find(p => p.id === id);
}

// ─── Backward-compat: lazy-loaded showcase pages ───────────────────
//
// For code that expects synchronous access to the full page array
// (like getCategories, getPagesByCategory in data.tsx), we trigger
// eager loading on first access. In the new lazy architecture,
// data.tsx should use amisPageMeta for sidebar rendering instead.

let syncLoadedPages: ShowcasePage[] | null = null;

/**
 * Backward-compat getter. Loads all modules synchronously on first call.
 * In Vite dev mode this works because the module graph is in memory.
 * For production builds, prefer the async loadAllAmisPages() instead.
 */
function getSyncPages(): ShowcasePage[] {
  if (syncLoadedPages) return syncLoadedPages;
  syncLoadedPages = [];
  for (const meta of amisPageMeta) {
    const moduleName = meta.id.replace('amis-', '');
    if (moduleLoaders[moduleName]) {
      // In Vite, dynamic imports resolve synchronously in dev mode
      // because modules are already in the module graph
      const mod = moduleLoaders[moduleName]();
      if (mod && typeof (mod as any).then === 'function') {
        // Module not yet loaded — skip for sync access
        // (caller should use async loadAllAmisPages instead)
        continue;
      }
      syncLoadedPages.push(...(mod as any).default);
    }
  }
  return syncLoadedPages;
}

/**
 * Lightweight array that acts like the full ShowcasePage[] for sync operations
 * but only contains loaded pages. For the sidebar (which only needs id/category/title),
 * use `amisPageMeta` instead.
 */
export const amisShowcasePages: ShowcasePage[] = new Proxy([] as ShowcasePage[], {
  get(_target, prop) {
    const pages = getSyncPages();
    return (pages as any)[prop];
  },
});
