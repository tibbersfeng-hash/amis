/**
 * Component Template Library — pre-written, validated Amis schema JSON snippets.
 *
 * Architecture: LLM selects components + fills params → code engine reads templates → assembles final schema.
 * This eliminates LLM-generated JSON syntax errors and guarantees valid Amis schema output.
 *
 * Each template exports:
 *   - fieldTemplate: the form field JSON (used inside form.body or filter.body)
 *   - formTemplate: a form body array (used when creating a new form)
 *   - pageTemplate: a full page schema (used when creating a new page)
 *   - crudTemplate: a full CRUD schema (used for table pages)
 *   - props: configurable fields the LLM can set
 */

export interface ComponentTemplate {
  /** Single form field template */
  fieldTemplate: Record<string, unknown>;
  /** Form body array template */
  formTemplate?: Record<string, unknown>[];
  /** Full page template */
  pageTemplate?: Record<string, unknown>;
  /** Full CRUD + filter template */
  crudTemplate?: Record<string, unknown>;
  /** Props the LLM can configure */
  props: string[];
  /** Human-readable description */
  description: string;
}

/**
 * All available component templates indexed by amis type name.
 */
export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  'input-text': {
    fieldTemplate: {
      type: 'input-text',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
      required: false,
      clearable: true,
      size: 'md',
    },
    props: ['name', 'label', 'placeholder', 'required', 'clearable'],
    description: '单行文本输入框',
  },

  'textarea': {
    fieldTemplate: {
      type: 'textarea',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
      required: false,
      rows: 3,
      maxLength: 500,
    },
    props: ['name', 'label', 'placeholder', 'required', 'rows', 'maxLength'],
    description: '多行文本输入',
  },

  'input-number': {
    fieldTemplate: {
      type: 'input-number',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
      required: false,
      min: 0,
      precision: 0,
      size: 'md',
    },
    props: ['name', 'label', 'placeholder', 'required', 'min', 'precision'],
    description: '数字输入框',
  },

  'select': {
    fieldTemplate: {
      type: 'select',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
      required: false,
      clearable: true,
      searchable: true,
      size: 'md',
      options: '${options}',
    },
    props: ['name', 'label', 'placeholder', 'required', 'options'],
    description: '下拉选择框，options 格式: [{"label":"文本","value":"值"}]',
  },

  'radios': {
    fieldTemplate: {
      type: 'radios',
      name: '${name}',
      label: '${label}',
      required: false,
      options: '${options}',
    },
    props: ['name', 'label', 'required', 'options'],
    description: '单选按钮组',
  },

  'checkboxes': {
    fieldTemplate: {
      type: 'checkboxes',
      name: '${name}',
      label: '${label}',
      options: '${options}',
    },
    props: ['name', 'label', 'options'],
    description: '复选框组',
  },

  'switch': {
    fieldTemplate: {
      type: 'switch',
      name: '${name}',
      label: '${label}',
      option: ['${option_true}', '${option_false}'],
    },
    props: ['name', 'label', 'option_true', 'option_false'],
    description: '开关控件',
  },

  'input-date': {
    fieldTemplate: {
      type: 'input-date',
      name: '${name}',
      label: '${label}',
      required: false,
      format: 'YYYY-MM-DD',
      inputFormat: 'YYYY-MM-DD',
      clearable: true,
    },
    props: ['name', 'label', 'required', 'format'],
    description: '日期选择器',
  },

  'input-datetime': {
    fieldTemplate: {
      type: 'input-datetime',
      name: '${name}',
      label: '${label}',
      required: false,
      format: 'YYYY-MM-DD HH:mm:ss',
      inputFormat: 'YYYY-MM-DD HH:mm:ss',
      timeFormat: 'HH:mm:ss',
      clearable: true,
    },
    props: ['name', 'label', 'required', 'format'],
    description: '日期时间选择器',
  },

  'input-date-range': {
    fieldTemplate: {
      type: 'input-date-range',
      name: '${name}',
      label: '${label}',
      required: false,
      format: 'YYYY-MM-DD',
      inputFormat: 'YYYY-MM-DD',
      clearable: true,
    },
    props: ['name', 'label', 'required', 'format'],
    description: '日期范围选择器',
  },

  'input-image': {
    fieldTemplate: {
      type: 'input-image',
      name: '${name}',
      label: '${label}',
      multiple: false,
    },
    props: ['name', 'label', 'multiple'],
    description: '图片上传',
  },

  'input-color': {
    fieldTemplate: {
      type: 'input-color',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
    },
    props: ['name', 'label', 'placeholder'],
    description: '颜色选择器',
  },

  'cascader': {
    fieldTemplate: {
      type: 'cascader',
      name: '${name}',
      label: '${label}',
      placeholder: '${placeholder}',
      required: false,
      options: '${options}',
    },
    props: ['name', 'label', 'placeholder', 'required', 'options'],
    description: '级联选择器',
  },

  'transfer': {
    fieldTemplate: {
      type: 'transfer',
      name: '${name}',
      label: '${label}',
      required: false,
      options: '${options}',
      searchable: true,
    },
    props: ['name', 'label', 'required', 'options'],
    description: '穿梭框',
  },

  'editor': {
    fieldTemplate: {
      type: 'editor',
      name: '${name}',
      label: '${label}',
      language: '${language}',
      size: '${size}',
    },
    props: ['name', 'label', 'language', 'size'],
    description: '代码编辑器',
  },

  'tpl': {
    fieldTemplate: {
      type: 'tpl',
      tpl: '<div class="section-title-sm">${content}</div>',
      inline: false,
    },
    props: ['content'],
    description: '模板文本，用于展示 HTML 内容',
  },

  'divider': {
    fieldTemplate: {
      type: 'divider',
      lineStyle: { color: '#E8E8E8' },
    },
    props: ['lineStyle'],
    description: '分隔线',
  },

  'group': {
    fieldTemplate: {
      type: 'group',
      body: '${fields}',
    },
    props: ['fields'],
    description: '表单项组，一行多列布局',
  },

  'wrapper': {
    fieldTemplate: {
      type: 'wrapper',
      className: '${className}',
      body: '${body}',
    },
    props: ['className', 'body'],
    description: '包装器，用于样式分组',
  },
};

/**
 * Page-level templates for common page types.
 */
export const PAGE_TEMPLATES = {
  /** New form page template */
  formPage: {
    type: 'page',
    title: '${title}',
    className: '${className}',
    body: [
      {
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        data: {},
        body: [],
        actions: [
          { type: 'submit', label: '提交', level: 'primary' },
        ],
      },
    ],
  },

  /** Page with header bar */
  pageWithHeader: {
    type: 'page',
    title: '${title}',
    body: [
      {
        type: 'wrapper',
        className: 'page-header-bar',
        body: [
          {
            type: 'tpl',
            tpl: '<h1 class="page-title">${title}</h1>',
            inline: false,
          },
        ],
      },
      {
        type: 'form',
        wrapWithPanel: false,
        mode: 'horizontal',
        data: {},
        body: [],
      },
    ],
  },

  /** CRUD page with search filter */
  crudPage: {
    type: 'page',
    title: '${title}',
    body: [
      {
        type: 'crud',
        mode: 'table',
        syncLocation: false,
        api: '${api}',
        filter: {
          title: '${filter_title}',
          mode: 'normal',
          wrapWithPanel: true,
          className: 'search-form',
          body: [],
          actions: [
            { type: 'submit', label: '查询', level: 'primary', className: 'btn-search' },
            { type: 'reset', label: '重置', className: 'btn-clear' },
          ],
        },
        columns: [],
        headerToolbar: [],
        perPage: 10,
        perPageAvailable: [10, 20, 50],
        footerToolbar: [
          { type: 'statistics', align: 'left' },
          { type: 'pagination', align: 'center', maxButtons: 6, showPageInput: false },
          { type: 'switch-per-page', align: 'right' },
        ],
      },
    ],
  },
};

/**
 * Generate sample data for a given schema.
 * Creates plausible values based on field types and names.
 */
export function generateSampleData(schema: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  const dataByDot: Record<string, unknown> = {};

  function extractFields(node: unknown, prefix = '') {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(item => extractFields(item, prefix));
      return;
    }

    const obj = node as Record<string, unknown>;

    if (obj.type === 'form' || obj.type === 'filter') {
      const body = obj.body as Record<string, unknown>[] | undefined;
      if (Array.isArray(body)) {
        body.forEach(field => extractFields(field, prefix));
      }
      return;
    }

    if (obj.type && !['page', 'wrapper', 'group', 'container', 'flex', 'crud'].includes(obj.type as string)) {
      const name = obj.name as string | undefined;
      if (name) {
        const fullName = prefix ? `${prefix}.${name}` : name;
        const value = getDefaultValue(obj, fullName);
        dataByDot[fullName] = value;
      }
      return;
    }

    for (const key of Object.keys(obj)) {
      extractFields(obj[key], prefix);
    }
  }

  extractFields(schema);

  // Convert dot-notation to nested structure
  for (const [key, value] of Object.entries(dataByDot)) {
    const parts = key.split('.');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  return data;
}

function getDefaultValue(field: Record<string, unknown>, name: string): unknown {
  const lowerName = name.toLowerCase();
  const label = (field.label as string | undefined) || '';

  // Date fields
  if (field.type === 'input-date') return '2026-06-01';
  if (field.type === 'input-datetime') return '2026-06-01 10:00:00';
  if (field.type === 'input-date-range') return '2026-06-01';

  // Number fields
  if (field.type === 'input-number') {
    if (lowerName.includes('quota') || lowerName.includes('amount') || lowerName.includes('price') || lowerName.includes('spending')) return 1000;
    if (lowerName.includes('night') || lowerName.includes('count') || lowerName.includes('num')) return 3;
    return 0;
  }

  // Select/Radios — use first option if available
  if (field.type === 'select' || field.type === 'radios' || field.type === 'checkboxes' || field.type === 'transfer') {
    const options = field.options as { label: string; value: string }[] | undefined;
    if (Array.isArray(options) && options.length > 0) {
      return options[0].value;
    }
  }

  // Boolean
  if (field.type === 'switch') return false;

  // Text — generate based on name/label
  if (lowerName.includes('name') || lowerName.includes('title') || label.includes('名称') || label.includes('Title')) {
    return lowerName.includes('hotel') || lowerName.includes('hotel') ? 'Grand Hotel' : '示例文本';
  }
  if (lowerName.includes('code') || label.includes('Code') || label.includes('代码')) return 'CODE-001';
  if (lowerName.includes('email') || lowerName.includes('mail')) return 'demo@example.com';
  if (lowerName.includes('phone') || lowerName.includes('mobile') || lowerName.includes('tel')) return '13800138000';
  if (lowerName.includes('desc') || lowerName.includes('remark') || lowerName.includes('note') || label.includes('描述') || label.includes('备注')) return '这是一段示例描述文本';
  if (lowerName.includes('url') || lowerName.includes('link') || lowerName.includes('image')) return 'https://example.com/image.jpg';

  return '示例文本';
}
