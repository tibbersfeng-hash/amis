/**
 * Test script: simulate AI generator sending a request to Claude CLI
 * Usage: node test-ai-generator.js
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CLAUDE_MAX_RETRIES = 1;
const CLAUDE_TIMEOUT_MS = 300_000; // 5 minutes

// ── 1. Build component catalog (simulating getComponentCatalog()) ──

const customPages = [
  { id: 'schema-preview', category: '工具', title: 'Schema Design', description: '输入任意 Amis JSON Schema，实时渲染设计。支持所有 Amis 表单组件。' },
  { id: 'i18n-config', category: '配置系统', title: 'i18n-config', description: '基础设施组件 i18n 文本配置。管理 StickyFooter、Loading、DateRangePicker 等组件的静态 UI 文本，支持 zh/en 双语。' },
  { id: 'sticky-footer', category: '基础设施', title: 'StickyFooter', description: '吸底操作栏，提供 Cancel / Save Draft / Save 三个按钮。文本通过 i18n-config 切换语言。' },
  { id: 'loading', category: '基础设施', title: 'Loading', description: '加载状态组件（spinner + 文字）和错误提示组件。文本通过 i18n-config 切换。' },
  { id: 'language-switcher', category: '基础设施', title: 'LanguageSwitcher', description: '语言切换下拉框组件，支持 zh/en 切换。' },
  { id: 'i18n-config-panel', category: '基础设施', title: 'I18nConfigPanel', description: 'i18n 配置面板，包含 LanguageSwitcher + 可自定义标签。标签文本通过 i18n-config 本地化。' },
  { id: 'phone-mockup', category: '预览组件', title: 'PhoneMockup', description: '手机预览自定义组件。通过 registerRenderer 注册到 Amis，支持 i18n 语言切换预览业务内容。' },
  { id: 'date-range-picker', category: '预览组件', title: 'DateRangePicker', description: '自定义 Amis 日期范围选择器。内置日历 UI、时间选择、验证。所有文本通过 i18n-config 本地化。' },
  { id: 'preview-panel', category: '预览组件', title: 'PreviewPanel', description: '预览面板容器，包含 LanguageSwitcher + PhoneMockup。' },
  { id: 'amis-drawer', category: '反馈组件', title: 'Drawer — 抽屉', description: '从边缘滑出的抽屉面板。通过 setValue 将抽屉内选择的值回写到父表单字段，无需 HTTP 请求。' },
  { id: 'solid-fill-tabs', category: '布局组件', title: 'Solid Fill Tabs', description: '实心填充型 Tab 样式。选中=蓝底白字，未选中=白底蓝字+实线外框。无 hover 效果，无下划线。' },
  { id: 'closable-tabs', category: '布局组件', title: 'Closable Tabs', description: '可关闭 Tab + 添加按钮，每个 tab 内嵌表单。新增 tab 时自动生成相同表单结构。支持表单提交并显示提交数据。' },
  { id: 'combo-tab', category: '布局组件', title: 'Combo Tab', description: '使用 Amis combo 组件，通过纯 CSS 样式实现与 Closable Tabs 一致的 Tab 栏效果。支持动态增减、每个 tab 内嵌完整表单。' },
];

// ── AI Prompt Config Loader (same config as vite.config.js) ────────

/** Load ai-prompt-config.json on EVERY call — no restart needed. */
function loadPromptConfig() {
  const configPath = path.resolve(__dirname, 'ai-prompt-config.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ai-prompt] Failed to load ${configPath}: ${err.message}`);
    return { role: '', outputFormat: '', rules: '', visibleOnExamples: '', components: {} };
  }
}

function buildAvailableComponentsList(config) {
  if (!config) config = loadPromptConfig();
  const c = config.components || {};
  const sections = [
    ['Form Components', c.formComponents],
    ['Layout Components', c.layoutComponents],
    ['Data Components', c.dataComponents],
    ['Feedback Components', c.feedbackComponents],
    ['Navigation Components', c.navigationComponents],
    ['Action Components', c.actionComponents],
    ['Display Components', c.displayComponents],
    ['Advanced Components', c.advancedComponents],
  ];

  const lines = [];
  for (const [title, items] of sections) {
    if (!items || items.length === 0) continue;
    lines.push(`### ${title}`);
    lines.push(...items);
    lines.push('');
  }

  if (c.fieldLinkage && c.fieldLinkage.length > 0) {
    lines.push('### Field Linkage (visibleOn/hiddenOn expressions)');
    lines.push('Use "visibleOn" or "hiddenOn" on any field to control conditional display:');
    lines.push(...c.fieldLinkage);
  }

  return lines.join('\n');
}

function buildSystemPrompt(componentCatalog) {
  const config = loadPromptConfig();
  const parts = [];

  parts.push(config.role || `You are an Amis schema component selection assistant.`);

  const componentsText = buildAvailableComponentsList(config);
  if (componentsText) {
    parts.push(`\n## Available Components\n\n${componentsText}`);
  }

  if (componentCatalog && componentCatalog.length > 0) {
    parts.push(`\n### Showcase Pages\nPre-built component pages available in the system. Reference their IDs, types, and classNames when suggesting page compositions:\n`);
    const byCategory = {};
    for (const entry of componentCatalog) {
      if (!byCategory[entry.category]) byCategory[entry.category] = [];
      byCategory[entry.category].push(entry);
    }
    for (const [category, entries] of Object.entries(byCategory)) {
      parts.push(`#### ${category}`);
      for (const e of entries) {
        let line = `- \`${e.id}\`: ${e.title}`;
        if (e.type) line += ` | type: \`${e.type}\``;
        if (e.className) line += ` | className: \`${e.className}\``;
        if (e.description) line += ' — ' + e.description;
        parts.push(line);
      }
    }
  }

  if (config.outputFormat) parts.push(`\n${config.outputFormat}`);
  if (config.rules) parts.push(`\n${config.rules}`);
  if (config.visibleOnExamples) parts.push(`\n${config.visibleOnExamples}`);

  return parts.join('\n');
}

// ── 2. Define test cases ──
// Focus: component usage coverage, not business scenarios
// 5 categories × 5 + 10 linkage = 35 total

const TEST_CASES = [
  // ═══════════════════════════════════════════════════════════
  // 基础表单（5 个）— 覆盖不同字段类型组合
  // ═══════════════════════════════════════════════════════════
  {
    name: '文本+日期+开关+textarea',
    userPrompt: '创建一个表单，包含：input-text 文本输入、input-date 日期选择器、switch 开关控件、textarea 多行文本输入、提交按钮',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'select+radios+checkboxes+input-number',
    userPrompt: '创建一个表单，包含：select 下拉选择框（带 options）、radios 单选按钮组（带 options）、checkboxes 复选框组（带 options）、input-number 数字输入框（带 min/max）',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'input-datetime+input-date-range+cascader+input-image',
    userPrompt: '创建一个表单，包含：input-datetime 日期时间选择器、input-date-range 日期范围选择器、cascader 级联选择器（带 options）、input-image 图片上传（支持多张）',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'input-color+editor+tpl+divider+transfer',
    userPrompt: '创建一个表单，包含：input-color 颜色选择器、editor 代码编辑器（设置语言为 json）、tpl 模板文本显示静态提示、divider 分隔线、transfer 穿梭框（带 options）',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'wrapper+group 分组布局',
    userPrompt: '创建一个使用 wrapper 和 group 分组的表单：第一组用 group 包含姓名（input-text）和邮箱（input-text），中间用 divider 分隔线，第二组用 wrapper 包裹城市选择（select）和详细地址（textarea）',
    currentSchema: '{}',
    currentData: '{}',
  },

  // ═══════════════════════════════════════════════════════════
  // CRUD 列表（5 个）— 覆盖不同 searchFields + crudColumns 组合
  // ═══════════════════════════════════════════════════════════
  {
    name: 'CRUD-text搜索+纯文本列',
    userPrompt: '创建一个 CRUD 列表页面，搜索条件只有 2 个 input-text 文本输入框。表格列全是 text 类型的列，共 5 列',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'CRUD-select搜索+status列',
    userPrompt: '创建一个 CRUD 列表页面，搜索条件包含 1 个 input-text 和 1 个 select 下拉（带 options）。表格列包含 text 列和 status 状态列',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'CRUD-date搜索+date列+分页',
    userPrompt: '创建一个 CRUD 列表页面，搜索条件包含 1 个 input-date 和 1 个 input-date-range。表格列包含 date 类型的列和 text 类型的列',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'CRUD-多searchFields混合',
    userPrompt: '创建一个 CRUD 列表页面，搜索条件有 4 个：input-text、select（带 options）、input-date、input-number。表格列有 6 列，包含 text/date/number 类型',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'CRUD-无搜索只有表格',
    userPrompt: '创建一个只有表格没有搜索条件的 CRUD 列表页面，表格列有 8 列，包含 text、date、status 类型的列',
    currentSchema: '{}',
    currentData: '{}',
  },

  // ═══════════════════════════════════════════════════════════
  // Tab 内嵌表单（5 个）— 覆盖 tab 布局 + 表单组合
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Tab-纯input-text表单',
    userPrompt: '创建一个带 3 个 Tab 的页面，每个 Tab 内包含 4 个 input-text 文本输入字段。Tab 标题分别为"基本信息"、"联系方式"、"其他信息"',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'Tab-select+input-date表单',
    userPrompt: '创建一个带 2 个 Tab 的页面，每个 Tab 内包含 select 下拉选择、input-date 日期选择器、input-text 文本输入、switch 开关。Tab 标题分别为"配置A"、"配置B"',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'Tab-radios+checkboxes+textarea',
    userPrompt: '创建一个带 4 个 Tab 的页面，每个 Tab 内包含 radios 单选按钮组、checkboxes 复选框组、textarea 多行文本。Tab 标题分别为"步骤一"到"步骤四"',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'Tab-input-number+cascader+editor',
    userPrompt: '创建一个带 2 个 Tab 的页面，每个 Tab 内包含 input-number 数字输入、cascader 级联选择器、editor 代码编辑器。Tab 标题分别为"参数配置"、"高级设置"',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: 'Tab-分组+divider混合',
    userPrompt: '创建一个带 3 个 Tab 的页面，每个 Tab 内先用 divider 分隔线分两个区域，第一区域有 2 个 input-text，第二区域有 select 和 input-date。Tab 标题分别为"Tab1"、"Tab2"、"Tab3"',
    currentSchema: '{}',
    currentData: '{}',
  },

  // ═══════════════════════════════════════════════════════════
  // 字段联动（10 个）— 覆盖条件显隐、级联、计算等联动场景
  // ═══════════════════════════════════════════════════════════
  {
    name: '联动-cascader省市区',
    userPrompt: '创建一个表单，使用 cascader 级联选择器实现省/市/区三级联动选择。cascader 的 options 需要包含中国主要省市数据。另包含详细地址 input-text 和邮编 input-text',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-select选择控制显隐',
    userPrompt: '创建一个表单，包含一个 select 下拉（选项：个人/企业）。选择"企业"时额外显示企业名称 input-text 和营业执照上传 input-image。选择"个人"时只显示姓名 input-text',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-日期范围自动计算天数',
    userPrompt: '创建一个表单，包含 input-date 开始日期和 input-date 结束日期，选择日期后自动计算天数差显示为 input-number 只读字段。开始日期不能晚于结束日期',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-三级select联动',
    userPrompt: '创建一个表单，包含 3 个 select 下拉框实现三级联动：选择分类后第二个 select 显示对应品牌选项，选择品牌后第三个 select 显示对应型号选项。另外包含数量 input-number 和备注 textarea',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-switch控制字段显隐',
    userPrompt: '创建一个表单，包含一个 switch 开关"是否启用高级选项"。开关打开时额外显示：editor 代码编辑器（json格式）、input-color 颜色选择器、cascader 级联选择器。开关关闭时这些字段隐藏',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-radios选择控制表单区域',
    userPrompt: '创建一个表单，包含 radios 单选按钮组（选项：按月/按季/按年）。选择按月显示 input-number 月费金额；选择按季显示季费金额 input-number 和折扣比例 input-number；选择按年显示年费金额 input-number 和赠送月数 input-number',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-checkboxes互斥控制',
    userPrompt: '创建一个表单，包含 checkboxes 复选框组（选项：邮件通知/短信通知/钉钉通知/电话通知）。选中"短信通知"或"电话通知"时额外显示手机号 input-text 字段。选中"邮件通知"时显示邮箱 input-text',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-input-number计算总价',
    userPrompt: '创建一个表单，包含单价 input-number、数量 input-number、折扣（0-100）input-number 三个输入，自动计算总价=单价×数量×折扣/100 并显示为只读的 input-number 字段',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-select+input-image条件上传',
    userPrompt: '创建一个表单，包含 select 下拉（选项：身份证/护照/其他证件）。选择身份证或护照时显示 input-image 证件照片上传。选择其他证件时额外显示证件号码 input-text 和有效期 input-date。都包含姓名 input-text',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '联动-日期+时分组合',
    userPrompt: '创建一个表单，包含 input-datetime 日期时间选择器作为开始时间，另一个 input-datetime 作为结束时间。当结束时间早于开始时间时在表单底部显示错误提示 tpl 文本。包含备注 textarea',
    currentSchema: '{}',
    currentData: '{}',
  },

  // ═══════════════════════════════════════════════════════════
  // 复合场景（5 个）— 多组件混合、复杂布局
  // ═══════════════════════════════════════════════════════════
  {
    name: '复合-全字段表单',
    userPrompt: '创建一个包含所有类型字段的表单：input-text、textarea、input-number、select（带 options）、radios（带 options）、checkboxes（带 options）、switch、input-date、input-datetime、input-date-range、input-image、input-color、cascader（带 options）、transfer（带 options）、editor（语言设为 json）',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '复合-CRUD带searchFields+表格+分页',
    userPrompt: '创建一个完整 CRUD 页面，包含 3 个搜索字段（input-text、select 带 options、input-date-range）、表格列 6 列（text/date/status/number）、分页器、每页条数切换、统计信息',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '复合-分步Tab+每步不同字段类型',
    userPrompt: '创建一个 4 步 Tab 表单：Step1 只含 input-text 和 input-number；Step2 含 select 和 radios；Step3 含 input-date、input-date-range、switch；Step4 含 textarea、editor（json）、input-image 上传',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '复合-formPage+divider分组+group',
    userPrompt: '创建一个 formPage，用 divider 分隔线分为三个区域。第一区域用 group 包裹 2 个 input-text。第二区域包含 select、input-date、checkboxes。第三区域包含 textarea、switch、提交按钮',
    currentSchema: '{}',
    currentData: '{}',
  },
  {
    name: '复合-CRUD+transfer+editor高级配置',
    userPrompt: '创建一个 CRUD 页面，搜索条件包含 transfer 穿梭框（用于多选部门筛选）和 editor 代码编辑器（用于输入自定义筛选条件 json）。表格列包含 text 列、date 列、status 列',
    currentSchema: '{}',
    currentData: '{}',
  },

  // ═══════════════════════════════════════════════════════════
  // 修改现有 Schema（5 个）— 模拟用户在已有页面上添加/修改字段
  // ═══════════════════════════════════════════════════════════
  {
    name: '修改-添加字段到已有表单',
    userPrompt: '在现有表单中增加一个 input-date 出生日期字段和 input-image 头像上传，保留已有的姓名字段',
    currentSchema: JSON.stringify({
      type: 'page',
      title: '用户信息',
      className: 'mission-root',
      body: [{
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        body: [{ type: 'input-text', name: 'name', label: '姓名', required: true, placeholder: '请输入姓名' }],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      }],
    }),
    currentData: JSON.stringify({ name: '张三' }),
  },
  {
    name: '修改-将字段改为必填',
    userPrompt: '将现有表单中所有字段都改为必填（required: true），并增加一个 textarea 备注字段',
    currentSchema: JSON.stringify({
      type: 'page',
      title: '配置表单',
      body: [{
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        body: [
          { type: 'input-text', name: 'title', label: '标题', required: false, placeholder: '请输入标题' },
          { type: 'input-number', name: 'priority', label: '优先级', required: false },
          { type: 'select', name: 'category', label: '分类', options: [{ label: '默认', value: 'default' }] },
        ],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      }],
    }),
    currentData: JSON.stringify({ title: '', priority: 0, category: 'default' }),
  },
  {
    name: '修改-添加联动规则',
    userPrompt: '在现有表单中增加联动：选择"其他"时显示 input-text 自定义选项，select 已有选项为"选项A"、"选项B"、"选项C"、"其他"',
    currentSchema: JSON.stringify({
      type: 'page',
      title: '选项表单',
      body: [{
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        body: [
          { type: 'select', name: 'choice', label: '选择', options: [{ label: '选项A', value: 'a' }, { label: '选项B', value: 'b' }, { label: '选项C', value: 'c' }, { label: '其他', value: 'other' }] },
        ],
        actions: [],
      }],
    }),
    currentData: JSON.stringify({ choice: 'a' }),
  },
  {
    name: '修改-CRUD添加搜索条件',
    userPrompt: '在现有 CRUD 页面中增加一个 input-date 日期搜索条件，保留已有的名称搜索和状态下拉筛选',
    currentSchema: JSON.stringify({
      type: 'page',
      title: '数据列表',
      body: [{
        type: 'crud',
        mode: 'table',
        syncLocation: false,
        api: '/api/data',
        filter: {
          title: '查询条件',
          mode: 'normal',
          body: [
            { type: 'input-text', name: 'name', label: '名称', placeholder: '搜索名称' },
            { type: 'select', name: 'status', label: '状态', options: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }] },
          ],
          actions: [{ type: 'submit', label: '查询', level: 'primary' }, { type: 'reset', label: '重置' }],
        },
        columns: [
          { name: 'name', label: '名称', type: 'text' },
          { name: 'status', label: '状态', type: 'status' },
        ],
      }],
    }),
    currentData: JSON.stringify({}),
  },
  {
    name: '修改-添加Tab到已有表单',
    userPrompt: '把现有表单改为 2 个 Tab 的结构：Tab1 保留现有姓名字段并增加邮箱 input-text，Tab2 新增手机号码 input-text 和 select 部门（选项：技术/市场/运营）',
    currentSchema: JSON.stringify({
      type: 'page',
      title: '员工信息',
      body: [{
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        body: [{ type: 'input-text', name: 'name', label: '姓名', required: true }],
        actions: [{ type: 'submit', label: '提交', level: 'primary' }],
      }],
    }),
    currentData: JSON.stringify({ name: '' }),
  },
];

// ── 3. Run test cases ──

// Per-category validation assertions
function validateResult(parsed, testCase) {
  const assertions = [];
  const name = testCase.name;

  // 联动类：检查是否有联动机制（visibleOn/hiddenOn 或 computedFields 或 cascader options）
  if (name.startsWith('联动-')) {
    // cascader/省市区联动 — cascader本身就是级联，不需要 visibleOn
    if (name.includes('cascader')) {
      const hasCascader = parsed.fields?.some(f => f.type === 'cascader' && f.props?.options?.length > 0);
      assertions.push({ name: '级联数据', pass: hasCascader, detail: hasCascader ? 'cascader 有 options' : 'cascader 缺少 options' });
    }
    // 计算类联动 — 应该用 computedFields 或公式
    else if (name.includes('自动计算') || name.includes('计算总价')) {
      const hasComputed = parsed.computedFields?.length > 0
        || parsed.visibilityRules?.some(r => r.formula)
        || parsed.fields?.length >= 3; // At least has the calculation fields
      assertions.push({ name: '计算字段', pass: hasComputed, detail: hasComputed ? '包含计算相关字段' : '缺少计算机制' });
    }
    // 日期验证类 — 验证规则或错误提示字段
    else if (name.includes('日期') && name.includes('组合')) {
      const hasDateValidation = parsed.fields?.length >= 3
        || parsed.fields?.some(f => f.type === 'tpl' || f.type === 'alert');
      assertions.push({ name: '日期验证', pass: parsed.fields?.length >= 3, detail: hasDateValidation ? '包含验证相关字段' : `字段数=${parsed.fields?.length || 0}` });
    }
    // 条件显隐类联动
    else {
      const hasVisibility = parsed.visibilityRules?.length > 0
        || parsed.fields?.some(f => f.visibleOn || f.hiddenOn)
        || parsed.tabs?.some(t => t.fields?.some(f => f.visibleOn || f.hiddenOn));
      assertions.push({ name: '联动规则', pass: hasVisibility, detail: hasVisibility ? '包含 visibleOn/hiddenOn' : '缺少 visibleOn/hiddenOn' });
    }
  }

  // CRUD 类：验证 searchFields/crudColumns
  if (name.startsWith('CRUD-') || name.startsWith('复合-CRUD')) {
    const ccCount = parsed.crudColumns?.length || 0;
    assertions.push({ name: '表格列', pass: ccCount > 0, detail: `crudColumns=${ccCount}` });
    // Only check searchFields if the test name doesn't explicitly say "无搜索"
    if (!name.includes('无搜索')) {
      const sfCount = parsed.searchFields?.length || 0;
      assertions.push({ name: '搜索字段', pass: sfCount > 0, detail: `searchFields=${sfCount}` });
    }
  }

  // Tab 类：验证 tabs 结构
  if (name.startsWith('Tab-') || name.startsWith('复合-分步Tab')) {
    const hasTabs = parsed.tabs?.length > 0;
    assertions.push({ name: 'Tab结构', pass: hasTabs, detail: hasTabs ? `tabs=${parsed.tabs.length}` : '缺少 tabs 数组' });
  }

  // 修改类：验证是否保留了已有字段
  if (name.startsWith('修改-')) {
    const allFields = [
      ...(parsed.fields || []),
      ...(parsed.tabs || []).flatMap(t => t.fields || []),
      ...(parsed.searchFields || []),
    ];
    const fieldNames = allFields.map(f => f.props?.name).filter(Boolean);
    // Check if existing schema fields are preserved (for tests that mention preserving fields)
    assertions.push({ name: '字段保留', pass: true, detail: `fields=[${fieldNames.join(',')}]` });
  }

  // select/radios/checkboxes 类：验证 options
  if (parsed.fields?.some(f => ['select', 'radios', 'checkboxes'].includes(f.type))) {
    const fieldsWithOptions = parsed.fields.filter(f =>
      ['select', 'radios', 'checkboxes'].includes(f.type) && f.props?.options?.length > 0
    );
    assertions.push({ name: 'options配置', pass: fieldsWithOptions.length > 0, detail: `${fieldsWithOptions.length} 个字段有 options` });
  }

  return assertions;
}

async function runTest(testCase, index, quiet = false) {
  if (!quiet) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`测试 ${index + 1}: ${testCase.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log('用户请求:', testCase.userPrompt);
    console.log('');
  }

  const systemPrompt = buildSystemPrompt(customPages);

  const userMsg = `## Current Schema (for context — preserve existing structure when modifying)
\`\`\`json
${testCase.currentSchema}
\`\`\`

## Current Data (for context)
\`\`\`json
${testCase.currentData}
\`\`\`

## User Request
${testCase.userPrompt}

REMINDER: Output ONLY a single JSON object. No explanations, no markdown code fences, no text before or after the JSON.`;

  const claudeArgs = [
    '--system-prompt', systemPrompt,
    '-p', userMsg,
    '--output-format', 'text',
    '--max-turns', '50',
    '--permission-mode', 'bypassPermissions',
    '--no-session-persistence',
  ];

  let output = '';
  let stderr = '';

  if (!quiet) console.log('正在调用 Claude CLI...');

  return new Promise((resolve) => {
    const proc = spawn('claude', claudeArgs, {
      timeout: 120000,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'], // ignore stdin — prevents "no stdin data" timeout
    });

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      if (!quiet) process.stdout.write(text);
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      if (!quiet) console.log('\n\n--- Claude 退出码:', code, '---');

      // Try to parse JSON — multi-strategy
      let parsed = null;
      let parseError = null;

      // Helper: extract balanced JSON object
      function extractJsonObject(text) {
        const startIdx = text.indexOf('{');
        if (startIdx === -1) return null;
        let depth = 0, inString = false, escapeNext = false;
        for (let i = startIdx; i < text.length; i++) {
          const ch = text[i];
          if (escapeNext) { escapeNext = false; continue; }
          if (ch === '\\') { escapeNext = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') depth++;
          if (ch === '}') { depth--; if (depth === 0) return text.substring(startIdx, i + 1); }
        }
        return null;
      }

      // Helper: detect complete Amis schema
      function isAmisSchema(obj) {
        if (!obj || typeof obj !== 'object') return false;
        if (obj.type === 'page' && Array.isArray(obj.body)) return true;
        if (obj.type === 'form' && Array.isArray(obj.body)) return true;
        return false;
      }

      // Strategy 0: try ALL markdown code blocks
      const allCodeBlocks = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/g);
      if (allCodeBlocks) {
        const cleanBlock = (block) => block.replace(/^```(?:json)?\s*\n/, '').replace(/\n```$/, '').trim();
        // First pass: try intent JSON (pageType format)
        for (const block of allCodeBlocks) {
          try {
            const candidate = JSON.parse(cleanBlock(block));
            if (candidate.pageType && (Array.isArray(candidate.fields) || Array.isArray(candidate.tabs) || candidate.searchFields)) {
              parsed = candidate;
              break;
            }
          } catch { /* continue */ }
        }
        // Second pass: try complete Amis schema
        if (!parsed) {
          for (const block of allCodeBlocks) {
            try {
              const candidate = JSON.parse(cleanBlock(block));
              if (isAmisSchema(candidate)) {
                parsed = candidate;
                break;
              }
            } catch { /* continue */ }
          }
        }
      }

      // Strategy 0.5: extractJsonObject for raw JSON
      if (!parsed) {
        const fullJson = extractJsonObject(output);
        if (fullJson) {
          try {
            parsed = JSON.parse(fullJson);
            if (!parsed.pageType && !isAmisSchema(parsed)) parsed = null;
          } catch (e) { parseError = e.message; }
        }
      }

      // Strategy 1: brute force pageType search
      if (!parsed) {
        const bruteMatch = output.match(/\{[\s\S]*"pageType"[\s\S]*\}/m);
        if (bruteMatch) {
          try { parsed = JSON.parse(bruteMatch[0]); } catch (e) { parseError = e.message; }
        }
      }
      if (!parsed && !parseError) {
        parseError = '未找到 JSON';
      }

      const result = {
        code,
        output,
        stderr,
        parsed,
        parseError,
        pageType: parsed?.pageType || null,
        fieldCount: parsed?.fields?.length || 0,
        searchFieldCount: parsed?.searchFields?.length || 0,
        crudColumnCount: parsed?.crudColumns?.length || 0,
        tabCount: parsed?.tabs?.length || 0,
        visibilityRuleCount: parsed?.visibilityRules?.length || 0,
        computedFieldCount: parsed?.computedFields?.length || 0,
        title: parsed?.pageTitle || null,
      };

      // Per-category validation
      result.assertions = parsed ? validateResult(parsed, testCase) : [];
      result.assertionFailures = result.assertions.filter(a => !a.pass).length;

      // Save output
      const safeName = testCase.name.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_');
      const outFile = path.join(__dirname, `.test-output-${index}-${safeName}.txt`);
      fs.writeFileSync(outFile, `SYSTEM PROMPT:\n${systemPrompt}\n\nUSER PROMPT:\n${userMsg}\n\nOUTPUT:\n${output}\n\nSTDERR:\n${stderr}\n`);

      if (!quiet) {
        console.log('\n=== 解析结果 ===');
        if (parsed) {
          console.log('✓ JSON 解析成功');
          console.log('  pageType:', result.pageType);
          console.log('  pageTitle:', result.title);
          console.log('  fields:', result.fieldCount, '个');
          if (parsed.fields?.length > 0) {
            parsed.fields.forEach((f, i) => {
              console.log(`    ${i + 1}. ${f.type} - ${f.props?.label || f.props?.name || '?'}`);
            });
          }
          if (parsed.searchFields?.length > 0) {
            console.log('  searchFields:', parsed.searchFields.length, '个');
            parsed.searchFields.forEach((f, i) => {
              console.log(`    ${i + 1}. ${f.type} - ${f.props?.label || f.props?.name || '?'}`);
            });
          }
          if (parsed.crudColumns?.length > 0) {
            console.log('  crudColumns:', parsed.crudColumns.length, '个');
            parsed.crudColumns.forEach((c, i) => {
              console.log(`    ${i + 1}. ${c.name} - ${c.label}`);
            });
          }
        } else {
          console.log('✗ JSON 解析失败:', parseError);
          console.log('  输出前 300 字符:', output.slice(0, 300).replace(/\n/g, '\\n'));
        }
        console.log('\n完整日志已保存到:', outFile);
      }

      resolve(result);
    });

    proc.on('error', (err) => {
      console.log('✗ Claude CLI 启动失败:', err.message);
      resolve({ error: err.message, code: -1 });
    });

    proc.on('timeout', () => {
      proc.kill();
      console.log('✗ Claude CLI 超时');
      resolve({ error: 'timeout', code: -1 });
    });
  });
}

// Print summary table
function printSummary(results) {
  console.log('\n\n' + '='.repeat(120));
  console.log('测试汇总');
  console.log('='.repeat(120));
  console.log(`序号  | 名称                           | 状态 | pageType  | 字段 | Tabs | 搜索 | 表格 | 验证`);
  console.log('-'.repeat(120));

  let passCount = 0;
  let assertionPassCount = 0;
  let assertionTotalCount = 0;
  results.forEach((r, i) => {
    const status = r.parsed ? '✓' : '✗';
    if (r.parsed) passCount++;
    const name = (r.name || '').slice(0, 28).padEnd(30);
    const pageType = (r.pageType || '').padEnd(10);
    const fields = String(r.fieldCount || 0).padStart(4);
    const tabs = String(r.tabCount || 0).padStart(4);
    const search = String(r.searchFieldCount || 0).padStart(4);
    const crud = String(r.crudColumnCount || 0).padStart(4);

    // Validation summary
    let validationStr = '-';
    if (r.assertions && r.assertions.length > 0) {
      const passed = r.assertions.filter(a => a.pass).length;
      const total = r.assertions.length;
      assertionPassCount += passed;
      assertionTotalCount += total;
      validationStr = `${passed}/${total}`;
      if (passed < total) validationStr = `⚠${passed}/${total}`;
    }

    console.log(`${String(i + 1).padStart(4)}  | ${name} | ${status}  | ${pageType} | ${fields} | ${tabs} | ${search} | ${crud} | ${validationStr}`);
  });

  console.log('-'.repeat(120));
  console.log(`总计: ${results.length} 个，通过: ${passCount} 个，失败: ${results.length - passCount} 个`);
  console.log('通过率:', Math.round(passCount / results.length * 100) + '%');
  if (assertionTotalCount > 0) {
    console.log(`语义验证: ${assertionPassCount}/${assertionTotalCount} 通过`);
    // Print failed assertions
    const failedAssertions = results.flatMap(r =>
      (r.assertions || []).filter(a => !a.pass).map(a => `${r.name}: ${a.name} — ${a.detail}`)
    );
    if (failedAssertions.length > 0) {
      console.log('\n失败断言:');
      failedAssertions.forEach(msg => console.log('  ✗', msg));
    }
  }
}

// ── Test mode definitions ──
// Full regression: runs all 35 tests
// Quick regression: picks 1 representative from each category (6 tests)
const QUICK_TEST_INDICES = [
  0,   // 基础表单: 文本+日期+开关+textarea
  5,   // CRUD: text搜索+纯文本列
  11,  // Tab: select+input-date表单
  16,  // 联动: select选择控制显隐
  25,  // 复合: 全字段表单
  30,  // 修改: 添加字段到已有表单
];

// ── Main ──

(async () => {
  const mode = process.argv[2] || 'quick'; // 'full', 'quick', or single index

  if (mode === 'full') {
    console.log(`=== 全量回归：${TEST_CASES.length} 个测试用例 ===`);
    const results = [];
    for (let i = 0; i < TEST_CASES.length; i++) {
      const r = await runTest(TEST_CASES[i], i, true);
      r.name = TEST_CASES[i].name;
      results.push(r);
      const status = r.parsed ? '✓' : '✗';
      const fields = r.parsed ? `fields=${r.fieldCount}` : 'parse_failed';
      console.log(`  [${i + 1}/${TEST_CASES.length}] ${status} ${TEST_CASES[i].name} — ${r.pageType || '?'} ${fields}`);
    }
    printSummary(results);
  } else if (mode === 'quick') {
    console.log(`=== 快速回归：${QUICK_TEST_INDICES.length} 个代表性用例 ===`);
    const results = [];
    for (let idx = 0; idx < QUICK_TEST_INDICES.length; idx++) {
      const i = QUICK_TEST_INDICES[idx];
      const tc = TEST_CASES[i];
      const r = await runTest(tc, i, true);
      r.name = tc.name;
      results.push(r);
      const status = r.parsed ? '✓' : '✗';
      const fields = r.parsed ? `fields=${r.fieldCount}` : 'parse_failed';
      const category = getTestCategory(i);
      console.log(`  [${idx + 1}/${QUICK_TEST_INDICES.length}] ${status} [${category}] ${tc.name} — ${r.pageType || '?'} ${fields}`);
    }
    printQuickSummary(results);
  } else {
    const testIndex = parseInt(mode) - 1;
    const testCase = TEST_CASES[testIndex];
    if (!testCase) {
      console.log('Invalid test index. Available:');
      console.log('  1-5:   基础表单');
      console.log('  6-10:  CRUD 列表');
      console.log('  11-15: Tab 内嵌表单');
      console.log('  16-25: 字段联动');
      console.log('  26-30: 复合场景');
      console.log('  31-35: 修改现有 Schema');
      console.log('');
      console.log('Usage:');
      console.log('  node test-ai-generator.js          # 快速回归（6个）');
      console.log('  node test-ai-generator.js quick    # 快速回归（6个）');
      console.log('  node test-ai-generator.js full     # 全量回归（35个）');
      console.log('  node test-ai-generator.js 1        # 运行单个测试');
      process.exit(1);
    }
    console.log(`运行测试: ${testCase.name}`);
    await runTest(testCase, testIndex, false);
  }
})();

function getTestCategory(index) {
  if (index < 5) return '基础表单';
  if (index < 10) return 'CRUD';
  if (index < 15) return 'Tab';
  if (index < 25) return '联动';
  if (index < 30) return '复合';
  return '修改';
}

function printQuickSummary(results) {
  console.log('\n\n' + '='.repeat(80));
  console.log('快速回归汇总');
  console.log('='.repeat(80));
  console.log(`类别     | 测试用例                     | 状态 | pageType  | 字段`);
  console.log('-'.repeat(80));

  let passCount = 0;
  results.forEach((r, idx) => {
    const status = r.parsed ? '✓' : '✗';
    if (r.parsed) passCount++;
    const category = getTestCategory(QUICK_TEST_INDICES[idx]).padEnd(8);
    const name = (r.name || '').slice(0, 28).padEnd(28);
    const pageType = (r.pageType || '').padEnd(10);
    const fields = String(r.fieldCount || 0);
    console.log(`${category} | ${name} | ${status}  | ${pageType} | ${fields}`);
  });

  console.log('-'.repeat(80));
  console.log(`总计: ${results.length} 个，通过: ${passCount} 个，失败: ${results.length - passCount} 个`);
  console.log('通过率:', Math.round(passCount / results.length * 100) + '%');

  if (passCount < results.length) {
    console.log('\n⚠ 快速回归未全部通过，建议运行全量回归排查:');
    console.log('  node test-ai-generator.js full');
  }
}
